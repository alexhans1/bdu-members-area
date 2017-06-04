let dotenv = require('dotenv'); //enables environment variables for development
dotenv.load();
let _ = require('lodash');
let moment = require('moment');

let conn = require('../knexfile.js'); //read out the DB Conn Data
let knex = require('knex')(conn[process.env.NODE_ENV || 'development']); //require knex query binder
let Bookshelf = require('bookshelf')(knex); //require Bookshelf ORM Framework

// DEFINE MODELS
let Models = require('../models/bookshelfModels.js')(Bookshelf);

// GENERATE EMAIL ARRAY
let emailArr = [];

console.log('\n\n ✔✔✔ Sending out Debt Emails ✔✔✔ \n\n');

Models.Tournaments.forge()
.fetch({withRelated: ['users']})
.then(function (tournaments) {
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

	emailArr = _.filter(emailArr, function (entry) {
		return (entry.name === 'Alexander')
	});
	console.log(emailArr);
	return emailArr
})
.then(function (emailArr) {
	console.log('SENDING OUT MAILS\n');

	// SEND OUT EMAILS
	_.each(emailArr, function (obj) {
		let helper = require('sendgrid').mail;
		let fromEmail = new helper.Email('finanzen@debating.de');
		// let toEmail = new helper.Email(obj.email);
		let toEmail = new helper.Email('alexander.hans.mail@gmail.com');
		let subject = 'You owe us!';
		let content = new helper.Content('text/html', '' +
			'Hello ' + obj.name + '<br>' +
			'You have debt to the BDU for the following tournaments:<br><table>'
		);
		obj.tournaments.forEach(function (tournament) {
			content.value = content.value + '<tr><th>' + tournament.name + '</th><td>' + tournament.debt + '€</td></tr>'
		});
		content.value = content.value + '</table><br>Pay up mofo!<br>Deine ' + process.env.finance_board_member;
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
			} else {
				// SET LAST MAIL OF USER TO NOW
				Models.User.forge({email: obj.email}).fetch()
				.then(function (user) {
					user.save({
						last_mail: new Date()
					});
					console.info('\nSent out email to ' + user.vorname + ' ' + user.name + '.\n');
				});
			}
			console.log(response.statusCode);
			console.log(response.body);
			console.log(response.headers);
		});
	});

	console.log('\n\n ✔✔✔ Finished Sending Debt Emails ✔✔✔ \n\n');

});
