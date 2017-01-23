module.exports = function(app, passport) {

	//sends successful login state back to angular
	app.get('/success', function(req, res){
		res.send({state: 'success', user: req.user ? req.user : null});
	});

	//sends login state back to angular
	app.get('/isAuthenticated', function(req, res){
		res.send(req.isAuthenticated());
	});

	//sends successful login state back to angular
	app.get('/sendUser', function(req, res){
		if (req.isAuthenticated()){
			res.send(req.user);
		} else {
			res.status(204).send('No user logged in.');
		}
	});

	//sends failure login state back to angular
	app.get('/failure', function(req, res){
		res.send({state: 'failure', user: null, message: req.flash('authMsg') || null});
	});

	// process the login form
	app.post('/login', passport.authenticate('login', {
		successRedirect : '/success', // redirect to the secure profile section
		failureRedirect : '/failure', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// process the signup form
	app.post('/signup', passport.authenticate('signup', {
		successRedirect : '/success', // redirect to the secure profile section
		failureRedirect : '/failure', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		// res.redirect('/');
	});
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
    	return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
