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
//for all URI with /index/users use the isAuthenticated function
router.use('/', isAuthenticated);

// User model
var User = Bookshelf.Model.extend({
	tableName: 'users'
});

var Users = Bookshelf.Collection.extend({
	model: User
});

router.route('/')
	// fetch all users
	.get(function (req, res) {
		//Check if session user is authorized
		if(req.user.role == 1){
			Users.forge()
			.fetch()
			.then(function (collection) {
				console.log('Getting all users successful');
				res.json({error: false, data: collection.toJSON()});
			})
			.catch(function (err) {
				console.error('Error while getting all users. Error message:\n' + err);
				res.status(500).json({error: true, data: {message: err.message}});
			});
		} else {
			console.log('User is not authorized to get all user information');
			res.status(401).json({error: true, message: 'Unauthorized'});
		}			
	})

  // no create user function here as we do that in the passport-init.js.js

  router.route('/:id')
	// fetch user
	.get(function (req, res) {
		//check if session user is the requested user
		if(req.params.id == req.user.id || req.user.role == 1){
			User.forge({id: req.params.id})
			.fetch()
			.then(function (user) {
				if (!user) {
					console.error('The user with the ID "' + req.params.id + '" is not in the database.');
					res.status(404).json({error: true, data: {}, message: 'The user with the ID "' + req.params.id + '" is not in the database.'});
				}
				else {
					console.log('Getting specfic user successful');
					res.json({error: false, data: user.toJSON()});
				}
			})
			.catch(function (err) {
				console.error('Error while getting specfic user. Error message:\n' + err);
				res.status(500).json({error: true, data: {message: err.message}});
			});
		} else {
			console.log('User is not authorized to get user information of user with the ID: ' + req.params.id);
			res.status(401).json({error: true, message: 'Unauthorized'});
		}			
	})

	// update user details
	.put(function (req, res) {
		//check if session user is the requested user
		if(req.params.id == req.user.id || req.user.role == 1){
			User.forge({id: req.params.id})
			.fetch({require: true})
			.then(function (user) {
				user.save({
					email: req.body.email,
					name: req.body.name,
					vorname: req.body.vorname,
					gender: req.body.gender
				})
			})
			.then(function () {
				console.log('Updating user successful');
				res.json({error: false, data: {message: 'User details updated'}});
			})
			.catch(function (err) {
				console.error('Error while updating user.');
				res.status(500).json({error: true, data: {message: err.message}});
			})
		} else {
			console.log('User is not authorized to update user information of user with the ID: ' + req.params.id);
			res.status(401).json({error: true, message: 'Unauthorized'});
		}			
	})

	// delete a user
	.delete(function (req, res) {
		//check if session user is the requested user
		if(req.params.id == req.user.id || req.user.role == 1){
			User.forge({id: req.params.id})
			.fetch({require: true})
			.then(function (user) {
				user.destroy()
			})
			.then(function () {
				console.log('Deleting user successful');
				res.json({error: false, data: {message: 'User successfully deleted'}});
			})
			.catch(function (err) {
				console.error('Error while deleting user.');
				res.status(500).json({error: true, data: {message: err.message}});
			});
		} else {
			console.log('User is not authorized to delete user with the ID: ' + req.params.id);
			res.status(401).json({error: true, message: 'Unauthorized'});
		}			
	});

module.exports = router;