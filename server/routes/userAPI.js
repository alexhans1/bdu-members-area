module.exports = ({
  router,
  Bookshelf,
  isAuthenticated,
  isAdmin,
  handleUnauthorized,
}) => {
  console.info('> adding user routes...');
  // Register the authentication middleware
  // for all URIs use the isAuthenticated function
  router.use('/user', isAuthenticated);

  const Models = require('../models/bookshelfModels.js')(Bookshelf);

  console.info('> > adding get /user/:id route...');
  router.route('/user/:id').get((req, res) => {
    // check if session user is the requested user or an admin
    if (req.user.id !== parseInt(req.params.id, 10) && !isAdmin(req)) {
      return handleUnauthorized(
        res,
        `User is not authorized to get user information of user with the ID: "${
          req.params.id
        }"`,
      );
    }
    try {
      Models.User.forge({ id: req.params.id })
        .fetch({ withRelated: ['tournaments'] })
        .then(user => {
          if (!user) {
            console.error(
              `The user with the ID "${req.params.id}" is not in the database.`,
            );
            res.status(404).json({
              error: true,
              message: `The user with the ID "${
                req.params.id
              }" is not in the database.`,
            });
          } else {
            res.status(200).json(user.toJSON());
          }
        });
    } catch (err) {
      console.error(`Error while getting specfic user. Error message:\n${err}`);
      res.status(500).json({ message: 'Error while getting specific user.' });
    }
  });

  console.info('> > adding get /user route...');
  router.route('/user').get((req, res) => {
    Models.Users.query('where', 'id', '!=', req.user.id)
      .fetch({ withRelated: ['tournaments'] })
      .then(collection => {
        const users = collection
          .toJSON()
          .map(
            ({
              password,
              resetPasswordToken,
              resetPasswordExpires,
              created_at,
              updated_at,
              ...user
            }) => user,
          );
        if (isAdmin(req)) res.status(200).send(users);
        else {
          const limitedUsers = users.map(
            ({
              email,
              food,
              last_login,
              tournaments,
              position,
              gender,
              last_mail,
              new_tournament_count,
              ...user
            }) => user,
          );
          res.status(200).send(limitedUsers);
        }
      })
      .catch(err => {
        console.error(`Error while getting all users. Error message:\n${err}`);
        res.status(500).json({ message: 'Error while getting all users.' });
      });
  });

  console.info('> > adding put /user/:id route...');
  router.route('/user/:id').put((req, res) => {
    // check if session user is the requested user
    if (req.user.id !== parseInt(req.params.id, 10) && !isAdmin(req)) {
      return handleUnauthorized(
        res,
        `User is not authorized to edit user information of user with the ID: "${
          req.params.id
        }"`,
      );
    }
    try {
      Models.User.forge({ id: req.params.id })
        .fetch({ require: true })
        .then(user => {
          if (!user) {
            console.error(
              `The user with the ID "${req.params.id}" is not in the database.`,
            );
            return res.status(404).json({
              error: true,
              message: `The user with the ID "${
                req.params.id
              }" is not in the database.`,
            });
          }
          user
            .save({
              email: req.body.email,
              name: req.body.name,
              vorname: req.body.vorname,
              gender: req.body.gender,
              food: req.body.food,
              new_tournament_count: req.body.new_tournament_count,
            })
            .then(updatedUser => {
              res
                .status(200)
                .json({
                  user: updatedUser,
                  message: 'Update user successful.',
                });
            });
        })
        .catch(err => {
          console.error(`Error while updating user. Error message:\n ${err}`);
          res.status(500).json({ message: 'Error while updating user.' });
        });
    } catch (err) {
      console.error(`Error while updating user. Error message:\n ${err}`);
      res.status(500).json({ message: 'Error while updating user.' });
    }
  });

  console.info('> > adding delete /user/:id route...');
  router.route('/user/:id').delete((req, res) => {
    // check if session user is the requested user
    if (req.user.id !== req.params.id && !isAdmin(req)) {
      return handleUnauthorized(
        res,
        `User is not authorized to delete user information of user with the ID: "${
          req.params.id
        }"`,
      );
    }
    try {
      Models.User.forge({ id: req.params.id })
        .fetch({ require: true })
        .then(user => {
          if (!user) {
            console.error(
              `The user with the ID "${req.params.id}" is not in the database.`,
            );
            res.status(404).json({
              error: true,
              message: `The user with the ID "${
                req.params.id
              }" is not in the database.`,
            });
          } else {
            user.destroy();
          }
        })
        .then(() => {
          res.status(200).json({ message: 'User successfully deleted' });
        });
    } catch (err) {
      console.error(`Error while deleting user. Error: ${err.message}`);
      res
        .status(500)
        .json({ error: true, message: 'Error while deleting user.' });
    }
  });

  return router;
};
