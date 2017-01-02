var express = require('express');
var router = express.Router();
var _ = require('lodash');
var knex = require('knex')({
	client: 'mysql',
	connection: {
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'BDUDBdev',
		charset: 'utf8'
	}
});
var Bookshelf = require('bookshelf')(knex);

//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects

	if (req.isAuthenticated()){
		return next();
	}

	// if the user is not authenticated then redirect him to the login page
	return res.redirect('/#login');
};

//Register the authentication middleware
//for all URI with /index/posts use the isAuthenticated function
router.use('/', isAuthenticated);

// Post model
var Tournament = Bookshelf.Model.extend({
	tableName: 'tournaments'
});

var Tournaments = Bookshelf.Collection.extend({
	model: Tournament
});

router.route('/')
	// fetch all tournaments
	.get(function (req, res) {
		Tournaments.forge()
		.fetch()
		.then(function (collection) {
			console.log('Getting all tournaments successful');
			res.render('pages/tournaments.ejs', { tournaments: collection });
		})
		.catch(function (err) {
			console.error('Error while getting all tournaments. Error message:\n' + err);
		});
	})

	// create a tournament
	.post(function (req, res) {
		//Check if session user is authorized
		if(req.user.role == 1){
			Tournament.forge({
				name: req.body.name,
				ort: req.body.ort,
				startdate: req.body.startdate,
				enddate: req.body.enddate,
				deadline: req.body.deadline,
				format: req.body.format,
				league: req.body.league,
				accommodation: req.body.accommodation,
				speakerprice: req.body.speakerprice,
				judgeprice: req.body.judgeprice,
				rankingvalue: req.body.rankingvalue,
				link: req.body.link,
				teamspots: req.body.teamspots,
				judgespots: req.body.judgespots,
				comments: req.body.comments
			})
			.save()
			.then(function (tournament) {
				res.json({error: false, data: {id: tournament.get('id')}});
			})
			.catch(function (err) {
				res.status(500).json({error: true, data: {message: err.message}});
			});
		} else {
			console.log('User is not authorized to create a new tournament');
			res.status(401).json({error: true, message: 'Unauthorized'});
		}			
	});

router.route('/:id')
	// fetch tournament
	.get(function (req, res) {
		Tournament.forge({id: req.params.id})
		.fetch()
		.then(function (tournament) {
			if (!tournament) {
				console.error('The tournament with the ID "' + req.params.id + '" is not in the database.');
				res.status(404).json({error: true, data: {}, message: 'The tournament with the ID "' + req.params.id + '" is not in the database.'});
			}
			else {
				console.log('Getting specfic tournament successful');
				res.json({error: false, data: tournament.toJSON()});
			}
		})
		.catch(function (err) {
			console.error('Error while getting specfic tournament. Error message:\n' + err);
			res.status(500).json({error: true, data: {message: err.message}});
		});
	})

	// update tournament details
	.put(function (req, res) {
		//Check if session user is authorized
		if(req.user.role == 1){
			Tournament.forge({id: req.params.id})
			.fetch({require: true})
			.then(function (tournament) {
				tournament.save({
					name: req.body.name,
					ort: req.body.ort,
					startdate: req.body.startdate,
					enddate: req.body.enddate,
					deadline: req.body.deadline,
					format: req.body.format,
					league: req.body.league,
					accommodation: req.body.accommodation,
					speakerprice: req.body.speakerprice,
					judgeprice: req.body.judgeprice,
					rankingvalue: req.body.rankingvalue,
					link: req.body.link,
					teamspots: req.body.teamspots,
					judgespots: req.body.judgespots,
					comments: req.body.comments
				})
			})
			.then(function () {
				console.log('Updating tournament successful');
				res.json({error: false, data: {message: 'Tournament details updated'}});
			})
			.catch(function (err) {
				console.error('Error while updating tournament.');
				res.status(500).json({error: true, data: {message: err.message}});
			})
		} else {
			console.log('User is not authorized to update tournament');
			res.status(401).json({error: true, message: 'Unauthorized'});
		}			
	})

	// delete a tournament
	.delete(function (req, res) {
		//Check if session user is authorized
		if(req.user.role == 1){
			Tournament.forge({id: req.params.id})
			.fetch({require: true})
			.then(function (tournament) {
				tournament.destroy()
			})
			.then(function () {
				console.log('Deleting tournament successful');
				res.json({error: false, data: {message: 'Tournament successfully deleted'}});
			})
			.catch(function (err) {
				console.error('Error while deleting tournament.');
				res.status(500).json({error: true, data: {message: err.message}});
			})
		} else {
			console.log('User is not authorized to delete tournament');
			res.status(401).json({error: true, message: 'Unauthorized'});
		}			
	});

module.exports = router;