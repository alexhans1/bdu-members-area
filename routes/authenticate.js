var express = require('express');
var router = express.Router();

module.exports = function(passport){

	//sends successful login state back to angular
	router.get('/successLogin', function(req, res){
		res.send(req.flash('loginMessage'));
		// res.send({state: 'success', user: req.user ? req.user : null, message: "Login successful"});
	});

	//placeholder for insert user date route
	router.get('/insertUserData', function(req, res) {
		res.send({state: 'success', user: req.user ? req.user : null, message: "signup successful"});
	});

	//sends failure login state back to angular
	router.get('/failure', function(req, res){
		res.send(req.flash());
		// res.send({state: 'failure', user: null, message: "Invalid username or password"});
	});

	//log in
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/auth/successLogin',
		failureRedirect: '/',
		failureFlash : true // allow flash messages
	}));

	//sign up
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/profile',
		failureRedirect: '/signup',
		failureFlash : true // allow flash messages
	}));

	//log out
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;

};