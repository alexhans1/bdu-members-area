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
	
	//create a new post
	.post(function(req, res){
		var name = req.body.name;
		var ort = req.body.ort;
		var startdate = req.body.startdate;
		var enddate = req.body.enddate;
		var deadline = req.body.deadline;
		var format = req.body.format;
		var league = req.body.league;
		var accommodation = req.body.accommodation;
		var speakerprice = req.body.speakerprice;
		var judgeprice = req.body.judgeprice;
		var rankingvalue = req.body.rankingvalue;
		var link = req.body.link;
		var teamspots = req.body.teamspots;
		var judgespots = req.body.judgespots;
		var comments = req.body.comments;

		var createTournamentQuery = "INSERT INTO tournaments (id, name, ort, startdate, enddate, deadline, format, league, accommodation, speakerprice, judgeprice, rankingvalue, link, teamspots, judgespots, comments) " + 
									"VALUES (NULL, '" + name + "', '" + ort + "', '" + startdate + "', '" + enddate + "', '" + deadline + 
									"', '" + format + "', '" + league + "', '" + accommodation + "', '" + speakerprice + "', '" + judgeprice + 
									"', '" + rankingvalue + "', '" + link + "', '" + teamspots + "', '" + judgespots + "', '" + comments + "')";
		console.info('createTournamentQuery: ' + createTournamentQuery);

		conn.query(createTournamentQuery, function(err,rows){
			if (err){
				console.error('Error in the createTournamentQuery');
				return res.send(err);
			}
	        // all is well, return created tournament
	        console.log('Create tournament was successful');
	        return res.json(rows);	
		});
	})

	.get(function(req, res){

		var getAllTournamentsQuery = "SELECT * FROM tournaments";
		console.info('getAllTournamentsQuery: ' + getAllTournamentsQuery);

		conn.query(getAllTournamentsQuery, function(err,rows){
			if (err){
				console.error('Error in the getAllTournamentsQuery');
				return res.send(err);
			}
	        // all is well, return tournaments
	        console.log('Getting all tournaments successful');
	        return res.json(rows);	
		});
	});

//api for a specfic post
router.route('/posts/:id')
	
	//create
	.put(function(req,res){
		var name = req.body.name;
		var ort = req.body.ort;
		var startdate = req.body.startdate;
		var enddate = req.body.enddate;
		var deadline = req.body.deadline;
		var format = req.body.format;
		var league = req.body.league;
		var accommodation = req.body.accommodation;
		var speakerprice = req.body.speakerprice;
		var judgeprice = req.body.judgeprice;
		var rankingvalue = req.body.rankingvalue;
		var link = req.body.link;
		var teamspots = req.body.teamspots;
		var judgespots = req.body.judgespots;
		var comments = req.body.comments;

		var updateTournamentQuery = 	"UPDATE tournaments SET name = '" + name + 
										"', ort = '" + ort + 
										"', startdate = '" + startdate + 
										"', enddate = '" + enddate + 
										"', deadline = '" + deadline + 
										"', format = '" + format + 
										"', league = '" + league + 
										"', accommodation = '" + accommodation + 
										"', speakerprice = '" + speakerprice + 
										"', judgeprice = '" + judgeprice + 
										"', rankingvalue = '" + rankingvalue + 
										"', link = '" + link + 
										"', teamspots = '" + teamspots + 
										"', judgespots = '" + judgespots + 
										"', comments	= '" + comments + "' WHERE tournaments.id = " + req.params.id;
		console.info('updateTournamentQuery: ' + updateTournamentQuery);

		conn.query(updateTournamentQuery, function(err,rows){
			if (err){
				console.error('Error in the updateTournamentQuery');
				return res.send(err);
			}
	        // all is well
	        console.log('Update tournament successful');
	        return res.json(rows);	
		});
	})

	.get(function(req,res){
		var getSingleTournamentQuery = "SELECT * FROM tournaments WHERE tournaments.id = " + req.params.id;
		console.info('getSingleTournamentQuery: ' + getSingleTournamentQuery);

		conn.query(getSingleTournamentQuery, function(err,rows){
			if (err){
				console.error('Error in the getSingleTournamentQuery');
				return res.send(err);
			}
	        // all is well, return tournament
	        console.log('Getting single tournament was successful');
	        return res.json(rows);	
		});
	})

	.delete(function(req,res){
		var deleteTournamentQuery = "DELETE FROM tournaments WHERE tournaments.id = " + req.params.id;
		console.info('deleteTournamentQuery: ' + deleteTournamentQuery);

		conn.query(deleteTournamentQuery, function(err,rows){
			if (err){
				console.error('Error in the deleteTournamentQuery');
				return res.send(err);
			}
	        // all is well, return success message
	        console.log('Delete tournament successful');
	        return res.send({state: 'success', message: "Delete tournament successful"});	
		});	
	});

module.exports = router;