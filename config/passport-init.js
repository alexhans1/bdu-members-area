var mysql = require('mysql');
var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');

var DBName = 'BDUDBdev';
//create mysql connection
var conn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: DBName
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
		function(req, email, password, done) { // callback with email and password from our form

			var selectLoginQuery = 	"SELECT * FROM users WHERE email = '" + email + "'";
				console.info('selectLoginQuery: ' + selectLoginQuery);
			conn.query(selectLoginQuery, function(err,rows){
			if (err){
				console.error('Error in the login query');
				return done(err);
			}
			if (!rows.length) {
                return done(null, false, req.flash('loginMessage', 'No user found with that email: ' + email + '.')); // req.flash is the way to set flashdata using connect-flash
            }
			// if the user is found but the password is wrong
            if (!isValidPassword(password, rows[0].password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
			
            // all is well, return successful user
            console.log('Login successful');
				console.info(rows);
				console.info("above row object");
            return done(null, rows[0], req.flash('loginMessage', 'Login successful. email: ' + email));
		
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
	    function(req, email, password, done) {

			// find a user whose email is the same as the forms email
			// we are checking to see if the user trying to login already exists
	        var selectSignupQuery = 	"SELECT * FROM users WHERE email = '" + email + "'";
				console.info('selectSignupQuery: ' + selectSignupQuery);
			conn.query(selectSignupQuery, function(err,rows){
				
				if (err){
					console.error('Error in the signup SELECT query')
					return done(err);
				}
				if (rows.length) {
					console.info(rows);
					console.info("above row object");
	                return done(null, false, req.flash('signupMessage', 'A User with that email already exists.'));
	            } else {

					// if there is no user with that email
	                // create the user
	                var newUserMysql = new Object();
					
					newUserMysql.email = email;
					var pwdHash = createHash(password); // only the Password Hash is stored in the DB
	                newUserMysql.password = pwdHash;
					
					var insertQuery = 	"INSERT INTO users (id, email, password) " + 
										"VALUES (NULL, '" + email + "', '" + pwdHash + "')";
						console.info('signup insertQuery ' + insertQuery);
					conn.query(insertQuery, function(err,rows){
						if (err) {
							console.error('Error in the insert query');
						} else {
							newUserMysql.id = rows.insertId;
							return done(null, newUserMysql, req.flash('signupMessage', 
								'Signup successful. ID: ' + newUserMysql.id + ', email: ' + newUserMysql.email + ', pwd: ' + newUserMysql.password));
						}
					});
	            }
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