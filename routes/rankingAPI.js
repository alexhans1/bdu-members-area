/**
 * Created by alex.hans on 19.07.2017.
 */

let express = require('express');
let router = express.Router();
let _ = require('lodash');
let moment = require('moment');

//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects

	if (req.isAuthenticated()){
		return next();
	}

	// if the user is not authenticated then redirect him to the login page
	console.log('not logged in');
	return res.redirect('/');
}

module.exports = function(Bookshelf){

	//Register the authentication middleware
	//for all URIs use the isAuthenticated function
	// router.use('/', isAuthenticated);

	// --------------------------------------------------------------------------
	// ------------------------------MODELS--------------------------------------
	// --------------------------------------------------------------------------

	let Models = require('../models/bookshelfModels.js')(Bookshelf);

	// --------------------------------------------------------------------------
	// ------------------------------USER REST API-------------------------------
	// --------------------------------------------------------------------------

	router.route('/all')
	// fetch all users
	.get(function (req, res) {
		try {
			Models.Users.forge()
			.fetch({withRelated: ['tournaments']})
			.then(function (users) {
				users = users.toJSON();

				let result = [];

				_.forEach(users, function (user, index) {
					result.push({
						name: user.vorname,
						data: []
					});
					user.totalPoints = 0;
					let a = moment('2016-02-21');
					let b = moment();
					// If you want an exclusive end date (half-open interval)
					for (let m = a; m.isBefore(b); m.add(10, 'days')) {
						let tmpPoints = 0;
						_.each(user.tournaments, (tournament) => {
							if (tournament._pivot_points) {
								start = moment(tournament.startdate);
								if (m.isAfter(start) && m.isBefore(start.clone().add(1, 'year'))) {
									tmpPoints += tournament._pivot_points;
								}
							}
						});
						result[index].data.push([m.unix()*1000, tmpPoints])
					}
				});
				return result
				// res.json({error: false, data: users.toJSON()});
			}).then(function (result) {
				let nowData = _.map(result, function (obj) {
					return {
						name: obj.name,
						currentPoints: obj.data[obj.data.length-1][1]
					}
				});
				let topNames = _.map(_.orderBy(nowData, ['currentPoints'], ['desc']).slice(0,10), function (obj) {
					return obj.name
				});
				topNames = _.union([req.user.vorname], topNames);

				let sendResukt = _.filter(result, function (obj) {
					return _.includes(topNames, obj.name);
				});

				res.send(sendResukt);

			})
		} catch (err) {
			console.error('Error while generating ranking data. Error message:\n' + err);
			res.status(500).json({error: true, message: err.message});
		}
	});

	return router;
};
