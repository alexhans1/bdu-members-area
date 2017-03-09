//stuff for reset password function
var crypto = require('crypto');
var async = require('async');
var nodemailer = require('nodemailer');
var sg = require('sendgrid')(process.env.SENDGRID_KEY);
var helper = require('sendgrid').mail;

module.exports = function(app, passport, Bookshelf) {
	//sends successful login state back to angular
	app.get('/success', function(req, res){
		res.send({state: 'success', user: req.user ? req.user : null});
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
	app.get('/logout', function(req) {
		req.logout();
		// res.redirect('/');
	});

	// =====================================
	// HELP ROUTES==========================
	// =====================================
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

	// =============================================================================
	// ========================== RESET PASSWORD FUNCTION ==========================
	// =============================================================================
	
	//FIRST: SEND FORGOT PASSWORD EMAIL
	//THIS SETS THE resetPasswordToken AND resetPasswordExpires AND SENDS LINK WITH TOKEN TO USEREMAIL
	
	// User model
	var User = Bookshelf.Model.extend({
		tableName: 'users'
	});

	app.post('/forgot', function (req, res) {
		async.waterfall([
			function(done) {
				crypto.randomBytes(20, function(err, buf) {
					var token = buf.toString('hex');
					done(err, token);
				});
			},
			function(token, done) {

				new User({email: req.body.email})
				.fetch()
				.then(function (user) {
					if (!user) {
						console.error('No account with that email address exists.');
						res.status(404).json({error: true, data: {}, message: 'No account with that email address exists.\nEmail: ' + req.body.email});
						return done(null, false, req.flash('authMsg', 'No account with that email address exists.'));
					}
					user.save({
						resetPasswordToken: token,
						resetPasswordExpires: Date.now() + 1800000 // set the time to 30 minutes from now
					});
					done(null, token, user);
				});
			},
			function(token, user, done) {

				var from_email = new helper.Email('bdudb_password_reset@debating.de');
				var to_email = new helper.Email(req.body.email);
				var subject = 'BDUDB Password Reset';
				var text = 'You are receiving this because you (or someone else) have requested the reset of the password for your BDUDB account.\n\n' +
					'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
					'http://' + req.headers.host + '/reset/' + token + '\n\n' +
					'If you did not request this, please ignore this email and your password will remain unchanged.\n';
				var content = new helper.Content('text/plain', text);
				var mail = new helper.Mail(from_email, subject, to_email, content);
				
				var request = sg.emptyRequest({
					method: 'POST',
					path: '/v3/mail/send',
					body: mail.toJSON()
				});

				sg.API(request, function(error, response) {
					console.info(response.statusCode);
					console.info(response.body);
					console.info(response.headers);
					if (error) console.error(error);
				});
				console.log('An e-mail has been sent to ' + req.body.email);
				res.status(200).send('An e-mail has been sent to ' + req.body.email + ' with further instructions. Please also check your ');
			}
		], function (err, result) {
            if(err) console.error(err);
            else console.info(result);
        });
	});

	//SECOND: RENDER THE RESET PASSWORD PAGE
	app.get('/reset/:token', function(req, res) {
		new User({resetPasswordToken: req.params.token})
		.fetch()
		.then(function (user) {
			if (!user) {
				console.log('Password reset token is invalid.');
				// res.status(500).json({error: true, data: {}, message: 'Password reset token is invalid.'});
				req.flash('error', 'Password reset token is invalid.');
				// return res.redirect('/forgot');
			} else if(Date.now() > user.get('resetPasswordExpires')) {
				// res.status(500).json({error: true, data: {}, message: 'Password reset token has expired.'});
				req.flash('error', 'Password reset token has expired.');
			}// else {
			res.render('reset.ejs', {message: req.flash('error'), user: user || null});
			// }
		});
	});

	//THIRD: RESET PASSWORD METHOD
	app.post('/reset', passport.authenticate('reset', {
		successRedirect : '/', // redirect to the login section
		failureRedirect : '/resetFailure', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	//sends failure login state back to angular
	app.get('/resetFailure', function(req, res){
		res.render('reset.ejs', {message: req.flash('reset'), user: null});
	});


    // =========================================================================
    // ========================== BUG REPORT SYSTEM ============================
    // =========================================================================

	//MODELS

    // User model
    var User = Bookshelf.Model.extend({
        tableName: 'users',

        bugs: function() {
            return this.hasMany(Bug);
        }
    });

    var Bug = Bookshelf.Model.extend({
        tableName: 'bugs',
        hasTimestamps: true,

        user: function() {
            return this.belongsTo(User);
        }
    });

    var Bugs = Bookshelf.Collection.extend({
        model: Bug
    });

	app.get('/bugs', function (req, res) {
        //Check if session user is authorized
        if(req.user.position == 1){
			Bugs.forge().fetch({withRelated: ['user']})
			.then(function (bugs) {
				bugs = bugs.toJSON();
				console.log('Getting all bugs successful');
				res.json({error: false, data: bugs});
			})
			.catch(function (err) {
				console.error('Error while getting all bugs. Error message:\n' + err);
				res.json({error: true, err: err, message: 'Error while getting all bugs. Error message:\n' + err});
			});
        } else {
            console.log('User is not authorized to get all bugs');
            res.status(401).json({error: true, message: 'Unauthorized'});
        }
    });
    
    app.post('/bugs', function (req, res) {
		Bug.forge({
			description: req.body.description,
			type: req.body.type,
			user_id: req.user.id
		})
		.save()
		.then(function (bug) {
			console.log('Report bug successful.');
			res.json({error: false, message: 'Report bug successful.'});
		})
		.catch(function (err) {
			console.log('Error while reporting new bug. Error: \n' + err);
			res.json({ error: true, message: 'Error while reporting new bug. Error: \n' + err.message });
		});
    })
};
