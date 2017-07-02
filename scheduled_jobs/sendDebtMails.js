let dotenv = require('dotenv'); //enables environment variables for development
dotenv.load();
let _ = require('lodash');
let moment = require('moment');

let conn = require('../knexfile.js'); //read out the DB Conn Data
let knex = require('knex')(conn[process.env.NODE_ENV || 'local']); //require knex query binder
let Bookshelf = require('bookshelf')(knex); //require Bookshelf ORM Framework

// DEFINE MODELS
let Models = require('../models/bookshelfModels.js')(Bookshelf);

// GENERATE EMAIL ARRAY
let emailArr = [];
let sentArr = [];

let totalSentMails = 0;
let totalErrors = 0;

async function buildEmailArr() {
	let promise = Models.Tournaments.forge().fetch({withRelated: ['users']});
	await promise.then((tournaments) => {
		tournaments = _.reject(tournaments.toJSON(), function (tournament) {
			return moment(tournament.enddate).add(2, 'weeks').diff(moment()) > 0 //reject if tournament younger than two weeks
		});
		_.each(tournaments, function (tournament) {
			tournament.users = _.reject(tournament.users, function (user) {
				return moment(user.last_mail).add(10, 'days').diff(moment()) > 0 //reject if last mail younger than 10 days
			});
			_.each(tournament.users, function (user) {
				if (user._pivot_price_owed > user._pivot_price_paid) {
					if (!_.find(emailArr, {email: user.email})) {
						emailArr.push({
							name: user.vorname,
							email: user.email,
							tournaments: [],
							total_debt: 0
						});
					}
					_.find(emailArr, {name: user.vorname}).tournaments.push({
						name: tournament.name,
						debt: Math.round((user._pivot_price_owed - user._pivot_price_paid)*100)/100
					});
					_.find(emailArr, {name: user.vorname}).total_debt += Math.round((user._pivot_price_owed - user._pivot_price_paid)*100)/100;
				}
			})
		});

		// emailArr = _.filter(emailArr, function (entry) {
		// 	return (entry.name === 'Alexander')
		// });
		// emailArr.push({
		// 	name: 'Alexander',
		// 	email: 'alexander.hans.mail@gmail.com',
		// 	tournaments: [],
		// 	total_debt: 40
		// });
		// emailArr[0].tournaments.push({
		// 	name: 'Test Turnier',
		// 	debt: 40.00
		// });
		console.log(emailArr);
	});
}

async function sendDebtMails () {

	if (!emailArr.length) {
		console.log('NO EMAILS TO SEND\n');
		return
	}

	console.log('SENDING OUT MAILS\n');

	// SEND OUT EMAILS
	_.each(emailArr, function (obj) {
		let helper = require('sendgrid').mail;
		let fromEmail = new helper.Email('finanzen@debating.de');
		let toEmail = new helper.Email(obj.email);
		let subject = 'BDU Tournament Debts';
		let content = new helper.Content('text/html', '' +
			'Hello ' + obj.name + '<br><br>' +
			'You have debt to the BDU for the following tournaments:<br><br>' +
			'<table>'
		);
		obj.tournaments.forEach(function (tournament) {
			content.value = content.value + '<tr><th align="left">' + tournament.name +
				'</th><td>' + tournament.debt + '€</td></tr>'
		});
		content.value = content.value + '</table>' +
			'<br>BDU Bank Info:<br>' +
			'<table>' +
			'<tr><th align="left">Recipient</th><td>Berlin Debating Union e.V.</td></tr>' +
			'<tr><th align="left">IBAN</th><td>DE36 1203 0000 1020 1051 26</td></tr>' +
			'<tr><th align="left">Institute</th><td>DEUTSCHE KREDITBANK BERLIN</td></tr>' +
			'</table><br><br>' +
			'You can always check your finances at <i href="https://members.debating.de">https://members.debating.de</i>.<br>' +
			'If you have questions regarding your tournaments please talk to the BDU board members.<br>' +
			'Best wishes<br>' + process.env.finance_board_member;
		let mail = new helper.Mail(fromEmail, subject, toEmail, content);

		let sg = require('sendgrid')(process.env.SENDGRID_KEY);
		let request = sg.emptyRequest({
			method: 'POST',
			path: '/v3/mail/send',
			body: mail.toJSON()
		});

		sg.API(request, function (error, response) {
			if (error) {
				console.error('Error response received');
				console.error(error);
				totalErrors++;
			} else {
				// SET LAST MAIL OF USER TO NOW
				Models.User.forge({email: obj.email}).fetch()
				.then(function (user) {
					user.save({
						last_mail: new Date()
					});
					user = user.toJSON();
					console.info('\nSent out email to ' + user.vorname + ' ' + user.name + '.\n');
					sentArr.push(user.vorname + ' ' + user.name + ' (' + user.email + ')');
					totalSentMails++;
				});
			}
			console.log('Mail status code: ' + response.statusCode);
		});
	})
}

async function sendNotification() {

	console.log(sentArr);

	// SENT EMAIL TO FINANZEN TO NOTIFY THEM
	let helper = require('sendgrid').mail;
	let fromEmail = new helper.Email('BDU_DebtMailService@debating.de');
	// let toEmail = new helper.Email('alexander.hans.mail@gmail.com');
	let toEmail = new helper.Email('finanzen@debating.de');
	let subject = 'Folgende Schuldenemails wurden geschrieben!!!';
	let content = new helper.Content('text/html', '' +
		'Hi ' + process.env.finance_board_member + '<br><br>' +
		'An folgende Personen wurden automatisch Schuldenerinnerungen versendet:<br>' +
		'<ul>'
	);
	sentArr.forEach(function (user) {
		content.value += '<li>' + user + '</li>'
	});
	content.value += '</ul>';

	let mail = new helper.Mail(fromEmail, subject, toEmail, content);
	let sg = require('sendgrid')(process.env.SENDGRID_KEY);
	let request = sg.emptyRequest({
		method: 'POST',
		path: '/v3/mail/send',
		body: mail.toJSON()
	});

	sg.API(request, function (error, response) {
		if (error) {
			console.error('Error response received in notification mail.');
			console.error(error);
		} else {
			console.log('Notification mail sent.');
		}
		console.log('Notification mail status code: ' + response.statusCode);
	});

	await new Promise((resolve, reject) => setTimeout(() => resolve(), 2000));

	console.log('\n ✔✔✔ Finished Sending Debt Emails ✔✔✔ \n');
	console.log('Tried to send ' + emailArr.length + ' emails');
	console.log('Success: ' + totalSentMails);
	console.log('Errors: ' + totalErrors);
}

console.log('\n\n ✔✔✔ Sending out Debt Emails ✔✔✔ \n\n');
async function execute() {
	buildEmailArr();
	await new Promise((resolve, reject) => setTimeout(() => resolve(), 3000));
	sendDebtMails();
	await new Promise((resolve, reject) => setTimeout(() => resolve(), 3000));
	sendNotification();
}
execute();
