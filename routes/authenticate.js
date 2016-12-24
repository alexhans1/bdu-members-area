var express = require('express');
var router = express.Router();

module.exports = function(passport){

	//sends successful login state back to angular
	router.get('/successLogin', function(req, res){
		res.send(req.flash());
		// res.send({state: 'success', user: req.user ? req.user : null, message: "Login successful"});
	});

	//sends successful login state back to angular
	router.get('/insertUserData', function(req, res) {
		res.send({state: 'success', user: req.user ? req.user : null, message: "signup successful"});
	})

	//sends successful login state back to angular
	router.get('/successSignup', function(req, res){
		// res.send(req.flash());
		// res.send({state: 'success', user: req.user ? req.user : null, message: "Login successful"});

		res.redirect('/auth/insertUserData')
	});

	//sends failure login state back to angular
	router.get('/failure', function(req, res){
		res.send(req.flash());
		// res.send({state: 'failure', user: null, message: "Invalid username or password"});
	});

	//log in
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/auth/successLogin',
		failureRedirect: '/auth/failure'
	}));

	//sign up
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/auth/insertUserData',
		failureRedirect: '/auth/failure'
	}));

	//log out
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;

}