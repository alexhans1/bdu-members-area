var express = require('express');
var router = express.Router();
var mysql = require('mysql');

// set up DB conn
var DBName = 'BDUDBdev';
//create mysql connection
var conn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: DBName
});

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
router.use('/posts', isAuthenticated);

//api for all posts
router.route('/posts')

	//no create user function here as we do that already in signup during authentication

	.get(function(req, res){

		var getAllUsersQuery = 	"SELECT * FROM users";
		console.info('getAllUsersQuery: ' + getAllUsersQuery);

		conn.query(getAllUsersQuery, function(err,rows){
			if (err){
				console.error('Error in the getAllUsersQuery');
				return res.send(err);
			}
	        // all is well, return successful user
	        console.log('Getting all users successful');
	        return res.json(rows);	
		});
	});

//api for a specfic post
router.route('/posts/:id')
	
	//create
	.put(function(req,res){
		var newUserName = req.body.name;
		var newUserVorname = req.body.vorname;
		var newUserEmail = req.body.email;
		var newUserGender = req.body.gender;
		//update password will be handled in seperate route

		var updateUserQuery = 	"UPDATE users SET email = '" + newUserEmail + 
										"', name = '" + newUserName + 
										"', vorname	= '" + newUserVorname + 
										"', gender = '" + newUserGender + "' WHERE users.id = " + req.params.id;
		console.info('updateUserQuery: ' + updateUserQuery);

		conn.query(updateUserQuery, function(err){
			if (err){
				console.error('Error in the updateUserQuery');
				return res.send(err);
			}
	        // all is well
	        console.log('Update user successful');

	        //get updated user and return it
	        var getUpdatedUserQuery = "SELECT * FROM users WHERE users.id = " + req.params.id;

			conn.query(getUpdatedUserQuery, function(err,rows){
				if (err){
					console.error('Error in the getUpdatedUserQuery');
					return res.send(err);
				}
		        // all is well, return successful user
		        console.log('Return updated user');
		        return res.json(rows);		
			});	
		});
	})

	.get(function(req,res){
		var getSingleUserQuery = "SELECT * FROM users WHERE users.id = " + req.params.id;
		console.info('getSingleUserQuery: ' + getSingleUserQuery);

		conn.query(getSingleUserQuery, function(err,rows){
			if (err){
				console.error('Error in the getSingleUserQuery');
				return res.send(err);
			}
	        // all is well, return successful user
	        console.log('Getting single user was successful');
	        return res.json(rows);	
		});
	})

	.delete(function(req,res){
		var deleteUserQuery = "DELETE FROM users WHERE users.id = " + req.params.id;
		console.info('deleteUserQuery: ' + deleteUserQuery);

		conn.query(deleteUserQuery, function(err,rows){
			if (err){
				console.error('Error in the deleteUserQuery');
				return res.send(err);
			}
	        // all is well, return success message
	        console.log('Delete user successful');
	        return res.send({state: 'success', message: "Delete user successful"});	
		});
	});

module.exports = router;