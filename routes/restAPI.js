var express = require('express');
var router = express.Router();
var knex = require('knex')({
	client: 'mysql',
	connection: {
		host: 'db.hosting-agency.de',
		user: 'dbuser30796',
		password: 'berlindebating',
		database: 'db6107x1',
		charset: 'utf8'
	}
});
var Bookshelf = require('bookshelf')(knex);
var _ = require('lodash');
var fs = require('fs');
var multer  = require('multer')
var upload = multer({ dest: 'public/images/userPics/' })

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
};

//Register the authentication middleware
//for all URI with /index/users use the isAuthenticated function
router.use('/', isAuthenticated);

// --------------------------------------------------------------------------
// ------------------------------MODELS--------------------------------------
// --------------------------------------------------------------------------

// User model
var User = Bookshelf.Model.extend({
	tableName: 'users',

	tournaments: function () {
		return this.belongsToMany(Tournament);
	}
});

var Users = Bookshelf.Collection.extend({
	model: User
});

// Post model
var Tournament = Bookshelf.Model.extend({
	tableName: 'tournaments',

	users: function () {
		return this.belongsToMany(User);
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

router.route('/user/profile/:id')
	.get(function(req, res) {
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
					console.log('Getting user profile successful');
					res.render('pages/profile.ejs', {
						user : user.toJSON() // get the user out of session and pass to template
					});
				}
			})
			.catch(function (err) {
				console.error('Error while getting user profile. Error message:\n' + err);
				res.render('error.ejs', {message: 'Error while getting user profile.', error: err});
				// res.status(500).json({error: true, data: {message: err.message}});
			});
		} else {
			console.log('User is not authorized to get user information of user with the ID: ' + req.params.id);
			res.render('error.ejs', {message: 'Unauthorized', error: ''});
			// res.status(401).json({error: true, message: 'Unauthorized'});
		}
	});

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
		User.forge({id: req.user.id}).fetch()
		.then(function (user) {
			user.save({
				image: req.file.filename
			});
			var deletePath = './public/images/userPics/' + user.get('image');
			if (fs.existsSync(deletePath)) {
				fs.unlinkSync(deletePath);
			}			 
			req.flash('updateMessage', 'Uploading new profile image successful.')
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
					res.status(200).send(user.toJSON());
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
		if(req.params.id == req.user.id || req.user.role == 1){
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
				req.flash('updateMessage', 'User details updated');
				res.status(200).send('Success');
			})
			.catch(function (err) {
				console.error('Error while updating user.');
				req.flash('updateMessage', err.message);
				res.status(500).send(err);
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

// --------------------------------------------------------------------------
// ------------------------------TOURNAMENT REST API-------------------------------
// --------------------------------------------------------------------------

router.route('/tournament')
	// fetch all tournaments
	.get(function (req, res) {
		Tournaments.forge()
		.fetch()
		.then(function (collection) {
			console.log('Getting all tournaments successful');
			return res.send(collection.toJSON());
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
				comments: req.body.comments,
				language: req.body.language
			})
			.save()
			.then(function (tournament) {
				console.log('Create Tournament successful.');
				res.status(200).json({error: false, tournament: tournament});
			})
			.catch(function (err) {
				console.log('Error while adding new Tournament. Error: \n' + err);
				res.status(500).json({error: true, data: {message: err.message}});
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
	//made to post and not put because html forms only know get and post methods
	.post(function (req, res) {
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
					comments: req.body.comments,
					language: req.body.language
				})
			})
			.then(function () {
				console.log('Updating tournament successful');
				req.flash('message', 'Tournament details updated.');
				res.redirect('/app/tournament');
				// res.json({error: false, data: {message: 'Tournament details updated'}});
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
				res.status(200).json({error: false, message: 'Deleting tournament successful.'});
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

//links to the edit tournament view
//needed cause html doesn't know put method
router.route('/tournament/edit/:id')
	.get(function (req, res) {
		if(req.user.role == 1){
			Tournament.forge({id: req.params.id})
			.fetch()
			.then(function (tournament) {
				if (!tournament) {
					console.error('The tournament with the ID "' + req.params.id + '" is not in the database.');
					req.flash('message', 'The tournament with the ID "' + req.params.id + '" is not in the database.');
					res.redirect('/app/tournament');
					res.status(404).json({error: true, data: {}, message: 'The tournament with the ID "' + req.params.id + '" is not in the database.'});
				}
				else {
					console.log('Getting tournament for edit successful');
					res.render('pages/editTournament.ejs', {tournament: tournament.toJSON(), message: ''});
						// res.json({error: false, data: tournament.toJSON()});
					}
				})
			.catch(function (err) {
				console.error('Error while getting tournament to edit. Error message:\n' + err);
				req.flash('message', 'Error while getting tournament to edit.');
				res.redirect('/app/tournament');
				res.status(500).json({error: true, data: {message: err.message}});
			});

		} else {
			console.log('User is not authorized to edit tournament');
			req.flash('message', 'Du bist nicht berechtigt ein Turnier zu ändern.');
			res.redirect('/app/tournament');
		}
	});

//delete tournament method als get request da hmtl delete nicht kennt.. macht aber REST Stil kaputt =/
router.route('/tournament/delete/:id')
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
				req.flash('message', 'Tournament successfully deleted.');
				res.redirect('/app/tournament');
				// res.json({error: false, data: {message: 'Tournament successfully deleted'}});
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
			var tournaments = user.related('tournaments').toJSON();
			Tournaments_Users_Col.query(function(qb) {
				qb.where('user_id', '=', req.user.id);
			}).fetch()
			.then(function (data) {
				var merge = _.map(tournaments, function(item) {
				    return _.merge(item, _.find(data.toJSON(), { 'tournament_id' : item.id }));
				});
				res.send(merge);
			})
		})
		.catch(function (err) {
			res.send(err);
		})
	});

// router to render user tournaments
router.route('/teamnames/:id')
	.get(function (req, res) {
		Tournaments_Users_Col.query(function(qb) {
			qb.where('tournament_id', '=', req.params.id);
		}).fetch()
		.then(function (collection) {
			res.send(collection.toJSON());
		})
		.catch(function (err) {
			res.status(500).send(err);
		})
	});

router.route('/test2')
	.get(function (req, res) {
		User.forge({id: req.user.id}).fetch({withRelated: ['tournaments']})  
		.then(function(user) {
			var data = user.related('tournaments').toJSON();
			console.log(data[0]._pivot_user_id);
			Tournaments_Users_Col.query(function(qb) {
				qb.where('user_id', '=', req.user.id);
			}).fetch()
			.then(function (entry) {				
				res.send({data: entry, tournaments: data});
			})			
		});
	});

router.route('/test')
	.get(function (req, res) {
		User.forge({id: req.user.id}).fetch({withRelated: ['tournaments']})  
		.then(function(user) {
			var tournaments = user.related('tournaments').toJSON();
			console.log(tournaments[0]._pivot_user_id);
			Tournaments_Users_Col.query(function(qb) {
				qb.where('user_id', '=', req.user.id);
			}).fetch()
			.then(function (data) {
				var merge = _.map(tournaments, function(item) {
				    return _.merge(item, _.find(data.toJSON(), { 'tournament_id' : item.id }));
				});
				res.send(merge);
			})
		});
	});

router.route('/test3')
	.get(function (req, res) {
		User.forge({id: req.user.id}).fetch({withRelated: ['tournaments']})  
		.then(function(user) {
			var tournaments = user.related('tournaments').toJSON();
			Tournaments_Users_Col.query(function(qb) {
				qb.where('user_id', '=', req.user.id);
			}).fetch()
			.then(function (data) {
				var dat2 = data.toJSON();
				var dat22 = [
					{
			            tournament_id: 16,
			            user_id: 21,
			            role: 'judge',
			            teamname: null,
			            attended: null
			        },
			        {
			            tournament_id: 17,
			            user_id: 21,
			            role: 'judge',
			            teamname: null,
			            attended: null
			        }
				];
				var merge = _.map(data.toJSON(), function(item) {
					console.log('log: ' + _.find(tournaments, { 'id' : item.tournament_id }));
				    return _.merge(item, _.find(tournaments, { 'id' : item.tournament_id }));
				});
				res.send(merge);
			});
		});

		// var dat1 = [
		// 	{
	 //            tournament_id: 16,
	 //            user_id: 21,
	 //            role: 'judge',
	 //            teamname: null,
	 //            attended: null
	 //        },
	 //        {
	 //            tournament_id: 17,
	 //            user_id: 21,
	 //            role: 'judge',
	 //            teamname: null,
	 //            attended: null
	 //        }
		// ];
		// var dat2 = [
		// 	{
	 //            id: 16,
	 //            age: 24
	 //        },
	 //        {
	 //            id: 17,
	 //            age: 25
	 //        }
		// ];
		// var merge = _.map(dat1, function(item) {
		// 	console.log(_.find(dat2, { 'id' : item.tournament_id }));
		//     return _.merge(item, _.find(dat2, { 'id' : item.tournament_id }));
		// });
		// res.send(merge);
		
	});

module.exports = router;