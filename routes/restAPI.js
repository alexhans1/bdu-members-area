var express = require('express');
var router = express.Router();
var _ = require('lodash');
var fs = require('fs');
var multer = require('multer');

//rename-keys is used to change bookshelf's pivot table returns from _pivot_[attribute] to pivot_[attribute]
// we need to change this because angular does not allow underscores as a first character of a key string
var rename = require('rename-keys');
var removeUnderscores = function(key) {
    return _.replace(key,'_','');
};

async = require('async');
var Client = require('ftp');
var FTPStorage = require('multer-ftp');
 
var upload = multer({
	storage: new FTPStorage({
		basepath: '/public_html/BDUDBdev/userpics/',
		ftp: {
			host: 'ftp.hosting-agency.de',
			// secure: true, // enables FTPS/FTP with TLS
			user: 'u0023243923',
			password: process.env.BDU_ftp_server
		}
	})
});

var ftp = {
    host: 'ftp.hosting-agency.de',
    // secure: true, // enables FTPS/FTP with TLS
    user: process.env.BDU_ftp_user,
    password: process.env.db_password
};



//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects

	if (req.isAuthenticated()){
		return next();
	}

	// if the user is not authenticated then redirect him to the login page
	return res.redirect('/');
}

module.exports = function(Bookshelf){

	//Register the authentication middleware
	//for all URIs use the isAuthenticated function
	// router.use('/', isAuthenticated);

	// --------------------------------------------------------------------------
	// ------------------------------MODELS--------------------------------------
	// --------------------------------------------------------------------------

	// User model
	var User = Bookshelf.Model.extend({
		tableName: 'users',

		tournaments: function () {
			return this.belongsToMany(Tournament).withPivot(['role','attended','teamname']);
		}
	});

	var Users = Bookshelf.Collection.extend({
		model: User
	});

	// Post model
	var Tournament = Bookshelf.Model.extend({
		tableName: 'tournaments',

		users: function () {
			return this.belongsToMany(User).withPivot(['role','attended','teamname']);
		}
	});

	var Tournaments = Bookshelf.Collection.extend({
		model: Tournament
	});

	var Tournaments_Users = Bookshelf.Model.extend({
		tableName: 'tournaments_users'
	});

	var Tournaments_Users_Col = Bookshelf.Collection.extend({
		model: Tournaments_Users
	});

	// --------------------------------------------------------------------------
	// ------------------------------USER REST API-------------------------------
	// --------------------------------------------------------------------------

	router.route('/user')
		// fetch all users
		.get(function (req, res) {
			//Check if session user is authorized
			if(req.user.position == 1){
				Users.forge()
				.fetch({withRelated: ['tournaments']})
				.then(function (collection) {
					collection = collection.toJSON();
					_.forEach(collection, function (user) {
                        user.tournaments.forEach(function(part, index) {
                            user.tournaments[index] = rename(user.tournaments[index], removeUnderscores);
                        });
                    });
					console.log('Getting all users successful');
					res.send(collection);
					// res.json({error: false, data: collection.toJSON()});
				})
				.catch(function (err) {
					console.error('Error while getting all users. Error message:\n' + err);
					res.status(500).json({error: true, data: {message: err.message}});
				});
			} else {
				console.log('User is not authorized to get all user information');
				res.status(401).json({error: true, message: 'Unauthorized'});
			}			
		});

	// no create user function here as we do that in the passport-init.js.js

	//hilfsroute um nur eingeloggten user zu senden
	router.route('/user/send')
		//show update user info form
		.get(function (req, res) {
			User.forge({id: req.user.id}).fetch()
			.then(function (user) {
				res.send(user.toJSON());
			})
			.catch(function (err) {
				console.error('Error while sending current user. Error message:\n' + err);
				res.status(500).send('Error while sending current user. Error message:\n' + err);
			})
		});

	router.route('/user/image')
		//upload new image for current user
		.post(upload.single('pic'), function (req, res) {
			console.log('Uploaded new user pic.');
			//then get the current user
			User.forge({id: req.user.id}).fetch()
			.then(function (user) {
				//save the image path from the db
                var deletePath = '/public_html/BDUDBdev/userpics/' + user.get('image');

                //update the file name in the db
				user.save({
					image: req.file.path.split("/")[req.file.path.split("/").length-1] //we only want to store the file name not the entire path
				});

				//lastly use node-ftp to delete the current profile pic using the deletePath
                var c = new Client();
                c.on('ready', function() {
                    c.delete(deletePath, function(err) {
                        if (err) console.error(err);
                        else console.log('Successfully deleted old user pic: ' + deletePath);
                        c.end();
                    });
                });
                c.connect(ftp);

				res.send('Uploading new profile image successful.');
			})
			.catch(function (err) {
				console.error('Error while uploading profile pic. Error message:\n' + err);
				res.render('error.ejs', {message: 'Error while uploading profile pic.', error: err});
				// res.status(500).json({error: true, data: {message: err.message}});
			});
		});

	router.route('/user/:id')
		// fetch user
		//show update user info form
		.get(function (req, res) {
			//check if session user is the requested user
			if(req.params.id == req.user.id || req.user.position == 1){
				User.forge({id: req.params.id})
				.fetch({withRelated: ['tournaments']})
				.then(function (user) {
					if (!user) {
						console.error('The user with the ID "' + req.params.id + '" is not in the database.');
						res.status(404).json({error: true, data: {}, message: 'The user with the ID "' + req.params.id + '" is not in the database.'});
					}
					else {
						user = user.toJSON();
                        user.tournaments.forEach(function(part, index) {
                            user.tournaments[index] = rename(user.tournaments[index], removeUnderscores);
                        });
						console.log('Getting specific user successful');
						res.status(200).send(user);
					}
				})
				.catch(function (err) {
					console.error('Error while getting specfic user. Error message:\n' + err);
					res.render('error.ejs', {message: 'Error while getting specfic user.', error: err});
				});
			} else {
				console.log('User is not authorized to get user information of user with the ID: ' + req.params.id);
				res.render('error.ejs', {message: 'Unauthorized', error: ''});
			}
		})

		// update user details
		.put(function (req, res) {
			//check if session user is the requested user
			if(req.params.id == req.user.id || req.user.position == 1){
				User.forge({id: req.params.id})
				.fetch({require: true})
				.then(function (user) {
					user.save({
						email: req.body.email,
						name: req.body.name,
						vorname: req.body.vorname,
						gender: req.body.gender,
						food: req.body.food
					})
				})
				.then(function () {
					console.log('Updating user successful');
					res.status(200).json({error: false, message: 'Update successful.'});
				})
				.catch(function (err) {
					console.error('Error while updating user. Error message:\n ' + err);
					res.status(500).json({error: true, message: 'Error while updating.'});
				})
			} else {
				console.log('User is not authorized to update user information of user with the ID: ' + req.params.id);
				res.status(401).json({error: true, message: 'Unauthorized'});
			}
		})

		// delete a user
		.delete(function (req, res) {
			//check if session user is the requested user
			if(req.params.id == req.user.id || req.user.position == 1){
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

	// --------------------------------------------------------------------------
	// ------------------------------TOURNAMENT REST API-------------------------------
	// --------------------------------------------------------------------------

	router.route('/tournament')
		// fetch all tournaments
		.get(function (req, res) {
			Tournaments.forge()
			.fetch({withRelated: ['users']})
			.then(function (collection) {
				collection = collection.toJSON();
                _.forEach(collection, function (tournament) {
                    tournament.users.forEach(function(part, index) {
                        tournament.users[index] = rename(tournament.users[index], removeUnderscores);
                    });
                });
				console.log('Getting all tournaments successful.');
				return res.send(collection);
			})
			.catch(function (err) {
				console.error('Error while getting all tournaments. Error message:\n' + err);
                res.status(500).json({error: true, data: {message: err.message}});
			});
		})

		// create a tournament
		.post(function (req, res) {
			//Check if session user is authorized
			if(req.user.position == 1){
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
					comments: req.body.comments,
					language: req.body.language
				})
				.save()
				.then(function (tournament) {
					console.log('Create Tournament successful.');
					res.status(200).json({error: false, tournament: tournament, message: 'Create Tournament successful.'});
				})
				.catch(function (err) {
					console.log('Error while adding new Tournament. Error: \n' + err);
					res.status(500).json({ error: true, message: err.message });
				});
			} else {
				console.log('User is not authorized to create a new tournament');
				res.status(401).json({error: true, message: 'Unauthorized'});
			}			
		});

	router.route('/tournament/:id')
		// fetch single tournament
		.get(function (req, res) {
			Tournament.forge({id: req.params.id})
			.fetch({withRelated: ['users']})
			.then(function (tournament) {
				if (!tournament) {
					console.error('The tournament with the ID "' + req.params.id + '" is not in the database.');
					res.status(404).json({error: true, message: 'The tournament with the ID "' + req.params.id + '" is not in the database.'});
				}
				else {
                    tournament = tournament.toJSON();
                    tournament.users.forEach(function(part, index) {
                        tournament.users[index] = rename(tournament.users[index], removeUnderscores);
                    });
					console.log('Getting specific tournament successful');
					res.json({error: false, data: tournament});
				}
			})
			.catch(function (err) {
				console.error('Error while getting specific tournament. Error message:\n' + err);
				res.status(500).json({error: true, message: err.message});
			});
		})

		// update tournament details
		.put(function (req, res) {
			//Check if session user is authorized
			if(req.user.position == 1){
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
						comments: req.body.comments,
						language: req.body.language
					})
				})
				.then(function () {
					console.log('Updating tournament successful.');
					res.status(200).json({error: false, message: 'Updating tournament successful.'});
				})
				.catch(function (err) {
					console.error('Error while updating tournament.');
					res.status(500).json({error: true, message: err.message});
				})
			} else {
				console.log('User is not authorized to update tournament');
				res.status(401).json({error: true, message: 'Unauthorized'});
			}
		})

		// delete a tournament
		.delete(function (req, res) {
			//Check if session user is authorized
			if(req.user.position == 1){
				Tournament.forge({id: req.params.id})
				.fetch({require: true})
				.then(function (tournament) {
					tournament.destroy()
				})
				.then(function () {
					console.log('Deleting tournament successful');
					res.status(200).json({ error: false, message: 'Deleting tournament successful.' });
				})
				.catch(function (err) {
					console.error('Error while deleting tournament.');
					res.status(500).json({ error: true, message: err.message });
				})
			} else {
				console.log('User is not authorized to delete tournament');
				res.status(401).json({ error: true, message: 'Unauthorized' });
			}
		});

	// --------------------------------------------------------------------------
	// ------------------------------RELATION API--------------------------------
	// --------------------------------------------------------------------------

	router.route('/reg/:t_id')
		.post(function (req, res) {
			// check if Tournament exists in DB
			Tournament.forge({id: req.params.t_id}).fetch()
			.then(function (tournament) {
				if (!tournament) {
					//if the tournament wasn't found the can't reg for it
					console.error('Tournament is not in the DB.');
					res.status(202).send('Tournament is not in the DB.');
				} else {
					//if tournament was found we,
					//check if user isn't already registered
					Tournaments_Users.forge({tournament_id: req.params.t_id, user_id: req.user.id}).fetch()
					.then(function (arg) {
						if(arg){
							//if a user was found we return that user is already registered
							console.error('User is already registered.');
							res.status(202).send('You are already registered for this tournament.');
						} else {
							//if no user was found,
							//check role of request
							if(req.body.role == 'judge') {
								//if reg request is for judge reg user
								Tournaments_Users.forge({
									tournament_id: req.params.t_id,
									user_id: req.user.id,
									role: req.body.role
								})
								.save()
								.then(function(entry) {
									console.log('Successfully registered for ' + req.params.t_id + ' as judge.');
									res.status(200).send(entry);
								})
							} else if(req.body.role == 'independent') {
								//if reg request is for independent reg user
								Tournaments_Users.forge({
									tournament_id: req.params.t_id,
									user_id: req.user.id,
									role: req.body.role
								})
								.save()
								.then(function(entry) {
									console.log('Successfully registered for ' + req.params.t_id + ' as independent.');
									res.status(200).send(entry);
								})
							} else if(req.body.role == 'speaker') {
								//if req request is for speaker,
								//check if teamname is given
								if(req.body.team == '') {
									//if no partner is named, reg user alone
									Tournaments_Users.forge({
										tournament_id: req.params.t_id,
										user_id: req.user.id,
										role: req.body.role
									})
									.save()
									.then(function(entry) {
										console.log('Successfully registered for ' + req.params.t_id + ' as speaker.');
										res.status(200).send(entry);
									})
								} else {
									//if a teamname is given we reg user
									Tournaments_Users.forge({
										tournament_id: req.params.t_id,
										user_id: req.user.id,
										role: req.body.role,
										teamname: req.body.team
									})
									.save()
									.then(function(entry) {
										console.log('Successfully registered for ' + req.params.t_id + ' as speaker in team ' + req.body.teamname);
										res.status(200).send(entry);
									})								
								}
							} else {
								//if none of the reg roles apply return error
								console.error('Error while registering user as ' + req.body.role);
								res.status(202).send('Error while registering user as ' + req.body.role);
							}
						}
					})
				}
			})
		});

	// router to get all tournaments the logged in user is registered for
	router.route('/getUserTournaments')
		.get(function (req, res) {
			User.forge({id: req.user.id}).fetch({withRelated: ['tournaments']})
			.then(function(user) {
                res.send(user);
			})
			.catch(function (err) {
				res.send(err);
			})
		});

	//for delete registration
	router.route('/deleteReg')
		.delete(function (req, res) {

			var rawSql = 'DELETE FROM tournaments_users WHERE tournament_id = '+ req.body.t_id + ' AND user_id = ' + req.body.u_id;

			Bookshelf.knex.raw(rawSql)
			.then(function () {
				console.log('Deleting registration successful.');
				res.status(200).json({error: false, message: 'Deleting registration successful.'});
			})
			.catch(function (err) {
				console.error('Error while deleting registration.');
				res.status(500).json({error: true, data: {message: err.message}});
			})
		});

	//for overview of tournament registrations
	router.route('/getAllTournamentsUsers')
		.get(function (req, res) {
			
			var merge = [];
			Tournaments.forge().fetch({withRelated: ['users']})
			.then(function(tournaments) {
				_.forEach(tournaments.toJSON(), function(value){
					Tournaments_Users_Col.query(function(qb) {
						qb.where('tournament_id', '=', value.id);
					}).fetch()
					.then(function (data) {
						_.forEach(value.users, function(user){
							_.assign(user, _.find(data.toJSON(), { 'user_id' : user.id }));
						});
						merge.push(value);
						if(merge.length == tournaments.length) res.send(merge);
					})
					.catch(function (err) {
						res.send(err);
						done(new Error("Error:" + err));
					});
				});
			})
			.catch(function (err) {
				res.send(err);
				done(new Error("Error:" + err));
			});
		});

	router.route('/setAttended')
		.put(function (req, res) {
			
			var rawSql = 'UPDATE tournaments_users SET attended =1 WHERE tournament_id = '+ req.body.t_id + ' AND user_id = ' + req.body.u_id;

			Bookshelf.knex.raw(rawSql)
			.then(function() {
				res.status(200).json({error: false, data: {message: 'works'}});
			})
			.catch(function (err) {
				console.error('Error while updating tournament.');
				res.status(500).json({error: true, data: {message: err.message}});
			})
		});

	return router;
};