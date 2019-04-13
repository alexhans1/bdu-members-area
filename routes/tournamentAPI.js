const moment = require('moment');

module.exports = ({ router, Bookshelf, isAuthenticated, isAdmin, handleUnauthorized }) => {
  console.info('> adding tournament routes...');
  // Register the authentication middleware
  // for all URIs use the isAuthenticated function
  router.use('/tournament', isAuthenticated);

  const Models = require('../models/bookshelfModels.js')(Bookshelf);

  console.info('> > adding get /tournament/:id route...');
  router.route('/tournament/:id').get((req, res) => {
    try {
      Models.Tournament.forge({ id: req.params.id })
        .fetch({ withRelated: ['users'] })
        .then(tournament => {
          if (!tournament) {
            console.error(`The tournament with the ID "${req.params.id}" is not in the database.`);
            res.status(404).json({
              error: true,
              message: `The tournament with the ID "${req.params.id}" is not in the database.`,
            });
          } else {
            res.status(200).json(tournament.toJSON());
          }
        });
    } catch (ex) {
      console.error(`Error while getting specific tournament. Error message:\n${ex.message}`);
      res.status(500).json({ error: true, message: 'Error while getting specific tournament.' });
    }
  });

  console.info('> > adding get /tournament route...');
  router.route('/tournament').get((req, res) => {
    try {
      const tournamentQuery = req.query.filterByMinDate
        ? Models.Tournaments.query(
            'where',
            'startdate',
            '>',
            moment(req.query.filterByMinDate).format(),
          )
        : Models.Tournaments.forge();
      tournamentQuery
        .orderBy('startdate', 'DESC')
        .fetch({ withRelated: ['users'] })
        .then(collection => {
          res.status(200).json(collection.toJSON());
        });
    } catch (err) {
      console.error(`Error while getting all tournaments. Error message:\n${err.message}`);
      res.status(500).json({
        error: true,
        message: 'Error while getting all tournaments.',
      });
    }
  });

  console.info('> > adding post /tournament route...');
  router.route('/tournament').post((req, res) => {
    // check if session user is an admin
    if (!isAdmin(req))
      return handleUnauthorized(res, 'User is not authorized to create tournament.');
    try {
      Models.Tournament.forge({
        name: req.body.name,
        ort: req.body.ort,
        startdate: moment(req.body.startdate).format('YYYY-MM-DD'),
        enddate: moment(req.body.enddate).format('YYYY-MM-DD'),
        deadline: req.body.deadline,
        format: req.body.format,
        league: req.body.league,
        accommodation: req.body.accommodation,
        speakerprice: req.body.speakerprice,
        judgeprice: req.body.judgeprice,
        rankingvalue: req.body.rankingvalue || null,
        link: req.body.link,
        teamspots: req.body.teamspots,
        judgespots: req.body.judgespots,
        comments: req.body.comments,
        language: req.body.language,
      })
        .save()
        .then(tournament => {
          res
            .status(200)
            .json({ message: 'Create Tournament successful.', tournament: tournament.attributes });
        })
        .then(() => {
          if (moment(req.body.startdate).unix() > Date.now() / 1000) {
            try {
              Models.Users.forge()
                .fetch()
                .then(users => {
                  users.forEach(user => {
                    user.save({
                      new_tournament_count: user.toJSON().new_tournament_count + 1,
                    });
                  });
                });
            } catch (err) {
              console.error('Unable to increment new_tournament_counts.');
              console.error(err.message);
            }
          }
        });
    } catch (err) {
      console.error(`Error while adding new Tournament. Error: \n${err.message}`);
      res.status(500).json({ error: true, message: 'Error while adding new Tournament.' });
    }
  });

  console.info('> > adding put /tournament/:id route...');
  router.route('/tournament/:id').put((req, res) => {
    // check if session user is an admin
    if (!isAdmin(req))
      return handleUnauthorized(res, 'User is not authorized to update tournament.');
    try {
      Models.Tournament.forge({ id: req.params.id })
        .fetch({ require: true })
        .then(tournament => {
          if (!tournament) {
            console.error(`The tournament with the ID "${req.params.id}" is not in the database.`);
            res.status(404).json({
              error: true,
              message: `The tournament with the ID "${req.params.id}" is not in the database.`,
            });
          } else {
            tournament
              .save({
                name: req.body.name,
                ort: req.body.ort,
                startdate: moment(req.body.startdate).format('YYYY-MM-DD'),
                enddate: moment(req.body.enddate).format('YYYY-MM-DD'),
                deadline: req.body.deadline,
                format: req.body.format,
                league: req.body.league,
                accommodation: req.body.accommodation,
                speakerprice: req.body.speakerprice,
                judgeprice: req.body.judgeprice,
                rankingvalue: req.body.rankingvalue || null,
                link: req.body.link,
                teamspots: req.body.teamspots,
                judgespots: req.body.judgespots,
                comments: req.body.comments,
                language: req.body.language,
              })
              .then(updatedTournament => {
                res.status(200).json({
                  tournament: updatedTournament,
                  message: 'Update tournament successful.',
                });
              });
          }
        });
    } catch (err) {
      console.error(`Error while updating user. Error message:\n ${err.message}`);
      res.status(500).json({ error: true, message: 'Error while updating tournament.' });
    }
  });

  console.info('> > adding delete /tournament/:id route...');
  router.route('/tournament/:id').delete((req, res) => {
    // check if session user is an admin
    if (!isAdmin(req))
      return handleUnauthorized(res, 'User is not authorized to delete tournament.');
    try {
      Models.Tournament.forge({ id: req.params.id })
        .fetch({ require: true })
        .then(tournament => {
          if (!tournament) {
            console.error(`The tournament with the ID "${req.params.id}" is not in the database.`);
            res.status(404).json({
              error: true,
              message: `The tournament with the ID "${req.params.id}" is not in the database.`,
            });
          } else {
            tournament.destroy();
          }
        })
        .then(() => {
          res.status(200).json({ message: 'Tournament successfully deleted' });
        });
    } catch (err) {
      console.error(`Error while deleting tournament. Error: ${err.message}`);
      res.status(500).json({ error: true, message: 'Error while deleting user.' });
    }
  });

  return router;
};
