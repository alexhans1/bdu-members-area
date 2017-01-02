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

var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');

// User model
var User = Bookshelf.Model.extend({
	tableName: 'users'
});

var Users = Bookshelf.Collection.extend({
	model: User
});

module.exports = function(passport){

	// passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and deserialize users out of session
	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
	
	passport.serializeUser(function(user, done) {
	  done(null, user);
	});

	passport.deserializeUser(function(user, done) {
	  done(null, user);
	});

	// LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup

	passport.use('login', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
	},
		function(req, userEmail, password, done) { // callback with email and password from our form

			new User({email: userEmail})
			.fetch()
			.then(function (user) {
				if(!user){
					return done(null, false, req.flash('loginMessage', 'No user found with that email: ' + userEmail + '.')); // req.flash is the way to set flashdata using connect-flash
				}
				if(!isValidPassword(password, user.get('password'))){
					return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
				}

				// all is well, return successful user
				console.log('Login successful');
				console.info(user.toJSON());
				return done(null, user, req.flash('loginMessage', 'Login successful. email: ' + userEmail));
			})
			.catch(function (err) {
				console.error('Error during login. Error message:' + err)
				return done(null, false, req.flash('loginMessage', 'Error during login'));
			});
		}
	));

	// LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup

	passport.use('signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
	    function(req, userEmail, password, done) {

			// find a user whose email is the same as the forms email
			// check if user already exists in DB
	    	new User({email: userEmail})
			.fetch()
			.then(function (user) {
				if(user){
					console.info('User already exists:' + user.toJSON());
					return done(null, false, req.flash('signupMessage', 'A User with that email already exists.'));
				}
				else {
					// if there is no user with that email
					// create the user
					User.forge({
						email: req.body.email,
						password: createHash(req.body.password)
					})
					.save()
					.then(function (user) {
						console.log('Signup user successful');
						return done(null, user, req.flash('signupMessage', 'Signup successful.' + user.toJSON));
					})
					.catch(function (err) {
						console.error('Error during saving new user. Error message:' + err)
						return done(null, false, req.flash('signupMessage', 'Error during signup.'));
					});
				}
			})
			.catch(function (err) {
				console.error('Error during fetching user during signup. Error message:' + err)
				return done(null, false, req.flash('signupMessage', 'Error during signup.'));
			});
		}
	));

	var isValidPassword = function(pwd, pwdHash){
		try {
			return bCrypt.compareSync(pwd, pwdHash);
		}
		catch(err){
			console.error(err + ' - the password seems to have the wrong format');
			return false;
		}
	};
	// Generates hash using bCrypt
	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};
}