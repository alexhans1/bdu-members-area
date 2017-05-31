var dotenv = require('dotenv'); //enables environment variables for development
dotenv.load();
var _ = require('lodash');

emailArr = [
	{
		email: 'alexander.hans.mail@gmail.com',
		tournament: 'BerlinIV',
		debt: 20
	},
	{
		email: 'alexander.hans.mail@gmail.com',
		tournament: 'Brüder Grimm Cup',
		debt: 15
	}
];

_.each(emailArr, function (obj) {
	var helper = require('sendgrid').mail;
	var fromEmail = new helper.Email('finanzen@debating.de');
	var toEmail = new helper.Email(obj.email);
	var subject = 'You owe us!';
	var content = new helper.Content('text/html', 'You owe the BDU <b>' + obj.debt + '€</b> for the <b>' + obj.tournament + '</b>.');
	var mail = new helper.Mail(fromEmail, subject, toEmail, content);

	var sg = require('sendgrid')(process.env.SENDGRID_KEY);
	var request = sg.emptyRequest({
		method: 'POST',
		path: '/v3/mail/send',
		body: mail.toJSON()
	});

	sg.API(request, function (error, response) {
		if (error) {
			console.log('Error response received');
		}
		console.log(response.statusCode);
		console.log(response.body);
		console.log(response.headers);
	});
});