module.exports = ({ router, Bookshelf, isAuthenticated, isAdmin, handleUnauthorized }) => {
  console.info('> adding registration routes...');
  // Register the authentication middleware
  // for all URIs use the isAuthenticated function
  router.use('/registration', isAuthenticated);

  const Models = require('../models/bookshelfModels.js')(Bookshelf);
  const isUserRegisteredForTournament = async (tournament_id, user_id) => {
    try {
      return await Models.Registration.forge({ tournament_id, user_id }).fetch()
        .then(registration => !!registration);
    } catch (err) {
      throw err;
    }
  };
  const doesUserExist = async (user_id) => {
    try {
      return await Models.User.forge({ id: user_id }).fetch()
        .then(user => !!user);
    } catch (err) {
      throw err;
    }
  };

  console.info('> > adding get /registration/:id route...');
  router.route('/registration/:id').get((req, res) => {
    // check if session user is an admin
    if (!isAdmin(req)) return handleUnauthorized(res, 'User is not authorized to view registration.');
    try {
      Models.Registration.forge({ id: req.params.id })
        .fetch()
        .then((registration) => {
          if (!registration) {
            console.error(`The registration with the ID "${req.params.id}" is not in the database.`);
            res.status(404).json({
              error: true,
              message: `The registration with the ID "${req.params.id}" is not in the database.`,
            });
          } else {
            res.status(200).json(registration.toJSON());
          }
        });
    } catch (ex) {
      console.error(`Error while getting specific registration. Error message:\n${ex.message}`);
      res.status(500).json({ error: true, message: 'Error while getting specific registration.' });
    }
  });

  console.info('> > adding get /registration route...');
  router.route('/registration').get((req, res) => {
    // check if session user is an admin
    if (!isAdmin(req)) return handleUnauthorized(res, 'User is not authorized to view registrations.');
    try {
      Models.Registrations.forge()
        .fetch()
        .then((collection) => {
          res.status(200).json(collection.toJSON());
        });
    } catch (err) {
      console.error(`Error while getting all registrations. Error message:\n${err.message}`);
      res.status(500).json({ error: true, message: 'Error while getting all registrations.' });
    }
  });

  console.info('> > adding post /registration route...');
  router.route('/registration').post(async (req, res) => {
    // Step 1)
    // check if Tournament exists in DB
    try {
      await Models.Tournament.forge({ id: req.body.tournament_id }).fetch()
        .then((tournament) => {
          if (!tournament) {
            console.error('Error while posting registration. Tournament is not in the DB.');
            return res.status(404).json({ message: 'Tournament is not in the DB.' });
          }
        });
    } catch (ex) {
      console.error(`Error while posting registration. Error in Step 1 - Getting Tournament.
       Error message:\n${ex.message}`);
      return res.status(500).json({ message: 'Error while posting registration.' });
    }

    // check if user exists in DB
    try {
      if (!await doesUserExist(req.body.user_id)) {
        return res.status(409).json({ message: 'User does not exist.' });
      }
    } catch (ex) {
      console.error(`Error while posting registration. Error in Step 1 - Check if user is exists.
       Error message:\n${ex.message}`);
      return res.status(500).json({ message: 'Error while posting registration.' });
    }

    // Step 2)
    // check if user is already registered
    try {
      if (await isUserRegisteredForTournament(req.body.tournament_id, req.body.user_id)) {
        return res.status(409).json({ message: 'You are already registered for this tournament.' });
      }
    } catch (ex) {
      console.error(`Error while posting registration. Error in Step 2 - Check if user is already registered.
       Error message:\n${ex.message}`);
      return res.status(500).json({ message: 'Error while posting registration.' });
    }

    // Step 3)
    // register user(s)
    try {
      if (req.body.role === 'judge') {
        return Models.Registration.forge({
          tournament_id: req.body.tournament_id,
          user_id: req.body.user_id,
          role: 'judge',
          comment: req.body.comment,
          is_independent: req.body.is_independent || 0,
          funding: req.body.funding || 0,
        }).save().then(() => res.status(200).json({
          message: 'Successfully registered as judge.',
        }));
      }

      if (req.body.role === 'speaker') {
        // if speaker, check if partner is named
        if (req.body.partner1 && req.body.partner1 > 0) {
          // check if second partner is named
          if (req.body.partner2 && req.body.partner2 > 0) {
            // check if all users are unique
            if (
              req.body.user_id === req.body.partner1
              || req.body.user_id === req.body.partner2
              || req.body.partner1 === req.body.partner2
            ) return res.status(409).json({ message: 'All users to register must be different users.' });

            // if two partners are given, check if they exist and are already registered
            if (!await doesUserExist(req.body.partner1)) {
              return res.status(409).json({ message: 'Your first named partner does not exist in the database.' });
            }
            if (await isUserRegisteredForTournament(req.body.tournament_id, req.body.partner1)) {
              return res.status(409).json({ message: 'Your first named partner is '
                + 'already registered for this tournament.' });
            }
            if (!await doesUserExist(req.body.partner2)) {
              return res.status(409).json({ message: 'Your second named partner does not exist in the database.' });
            }
            if (await isUserRegisteredForTournament(req.body.tournament_id, req.body.partner2)) {
              return res.status(409).json({ message: 'Your second named partner is '
                + 'already registered for this tournament.' });
            }
            // register all three for the tournament
            Models.Registrations.forge([
              {
                tournament_id: req.body.tournament_id,
                user_id: req.body.user_id,
                role: 'speaker',
                comment: req.body.comment,
                is_independent: req.body.is_independent || 0,
                funding: req.body.funding || 0,
                teamname: req.body.team || '',
              },
              {
                tournament_id: req.body.tournament_id,
                user_id: req.body.partner1,
                role: 'speaker',
                teamname: req.body.team || '',
              },
              {
                tournament_id: req.body.tournament_id,
                user_id: req.body.partner2,
                role: 'speaker',
                teamname: req.body.team || '',
              },
            ]).invokeThen('save')
              .then(() => {
                res.status(200).json('Successfully registered you and your partners as speakers.');
              });
          } else {
            // if only first partner is named,
            // check if all users are unique
            if (req.body.user_id === req.body.partner1) {
              return res.status(409).json({ message: 'All users to register must be different users.' });
            }
            // check if partner exists and is already registered
            if (!await doesUserExist(req.body.partner1)) {
              return res.status(409).json({ message: 'Your first named partner does not exist in the database.' });
            }
            if (await isUserRegisteredForTournament(req.body.tournament_id, req.body.partner1)) {
              return res.status(409).json({ message: 'Your partner is already'
                + ' registered for this tournament.' });
            }
            // if no user was found,
            // register both
            Models.Registrations.forge([
              {
                tournament_id: req.body.tournament_id,
                user_id: req.body.user_id,
                role: 'speaker',
                comment: req.body.comment,
                is_independent: req.body.is_independent || 0,
                funding: req.body.funding || 0,
                teamname: req.body.team || '',
              },
              {
                tournament_id: req.body.tournament_id,
                user_id: req.body.partner1,
                role: 'speaker',
                teamname: req.body.team || '',
              },
            ]).invokeThen('save')
              .then(() => {
                res.status(200).json('Successfully registered you and your partner as speakers.');
              });
          }
        } else {
          // if no partner is named, register user alone
          Models.Registration.forge({
            tournament_id: req.body.tournament_id,
            user_id: req.body.user_id,
            role: 'speaker',
            comment: req.body.comment,
            is_independent: req.body.is_independent || 0,
            funding: req.body.funding || 0,
            teamname: req.body.team || '',
          }).save().then(() => res.status(200).json({
            message: 'Successfully registered as speaker.',
          }));
        }
      } else {
        // if none of the reg roles apply return error
        console.error(`Error while registering user as ${req.body.role}`);
        res.status(409).json({ message: `Error while registering user as ${req.body.role}` });
      }
    } catch (ex) {
      console.error(`Error while posting registration. Error in Step 3 - Register user.
       Error message:\n${ex.message}`);
      return res.status(500).json({ message: 'Error while posting registration.' });
    }
  });

  console.info('> > adding put /registration/:id route...');
  router.route('/registration/:id').put(async (req, res) => {
    try {
      const registration = await Models.Registration.forge({ id: req.params.id }).fetch({ require: true });
      if (!registration) {
        console.error(`The registration with the ID "${req.params.id}" is not in the database.`);
        return res.status(404).json({
          error: true,
          message: `The registration with the ID "${req.params.id}" is not in the database.`,
        });
      }
      if (registration.toJSON().user_id !== req.user.id && !isAdmin(req)) {
        return handleUnauthorized(res, 'User is not authorized to update registration.');
      }
      registration.save({
        role: req.body.role,
        is_independent: req.body.is_independent,
        teamname: req.body.teamname,
        comment: req.body.comment,
        funding: req.body.funding,
        price_paid: req.body.price_paid,
        price_owed: req.body.price_owed,
        transaction_date: req.body.transaction_date,
        transaction_from: req.body.transaction_from,
      }).then(() => {
        res.status(200).json({ error: false, message: 'Update registration successful.' });
      });
    } catch (err) {
      console.error(`Error while updating registration. Error message:\n ${err.message}`);
      res.status(500).json({ error: true, message: 'Error while updating registration.' });
    }
  });

  console.info('> > adding delete /registration/:id route...');
  router.route('/registration/:id').delete(async (req, res) => {
    try {
      const registration = await Models.Registration.forge({ id: req.params.id }).fetch({ require: true });
      if (!registration) {
        console.error(`The registration with the ID "${req.params.id}" is not in the database.`);
        return res.status(404).json({
          error: true,
          message: `The registration with the ID "${req.params.id}" is not in the database.`,
        });
      }
      if (registration.toJSON().user_id !== req.user.id && !isAdmin(req)) {
        return handleUnauthorized(res, 'User is not authorized to delete registration.');
      }
      registration.destroy().then(() => {
        res.status(200).json({ error: false, message: 'Delete registration successful.' });
      });
    } catch (err) {
      console.error(`Error while deleting registration. Error message:\n ${err}`);
      res.status(500).json({ error: true, message: 'Error while deleting registration.' });
    }
  });

  return router;
};
