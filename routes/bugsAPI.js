module.exports = ({ router, Bookshelf }) => {
  console.info('> adding bugs routes...');

  const Models = require('../models/bookshelfModels.js')(Bookshelf);

  console.info('> > adding get Bugs route...');
  router.route('/bugs').get((req, res) => {
    // Check if session user is authorized
    if (req.user.position === 1) {
      Models.Bugs.forge()
        .fetch({ withRelated: ['user'] })
        .then(bugs => {
          bugs = bugs.toJSON();
          console.log('Getting all bugs successful');
          res.json({ error: false, data: bugs });
        })
        .catch(err => {
          console.error(`Error while getting all bugs. Error message:\n${err}`);
          res.json({
            error: true,
            err,
            message: `Error while getting all bugs. Error message:\n${err}`,
          });
        });
    } else {
      console.log('User is not authorized to get all bugs');
      res.status(401).json({ error: true, message: 'Unauthorized' });
    }
  });

  console.info('> > adding post Bugs route...');
  router.route('/bugs').post((req, res) => {
    const user_id = typeof req.user === 'undefined' ? null : req.user.id;
    Models.Bug.forge({
      description: req.body.description,
      type: req.body.type,
      user_id,
    })
      .save()
      .then(() => {
        console.log('Post bug successful.');
        res.json({ error: false, message: 'Report bug successful.' });
      })
      .catch(err => {
        console.log(`Error while reporting new bug. Error: \n${err}`);
        res.json({
          error: true,
          message: `Error while reporting new bug. Error: \n${err.message}`,
        });
      });
  });

  console.info('> > adding put Bugs route...');
  router.route('/bugs/:id').put((req, res) => {
    // Check if session user is authorized
    if (req.user.position === 1) {
      Models.Bug.forge({ id: req.params.id })
        .fetch({ require: true })
        .then(bug => {
          bug.save({
            description: req.body.description,
            type: req.body.type,
            status: req.body.status,
          });
        })
        .then(() => {
          console.log('Updating bug successful.');
          res.status(200).json({ error: false, message: 'Updating bug successful.' });
        })
        .catch(err => {
          console.error(`Error while updating bug. Error: ${err.message}`);
          res.json({ error: true, message: 'Error while updating bug.' });
        });
    } else {
      console.log('User is not authorized to update bug');
      res.json({ error: true, message: 'Unauthorized' });
    }
  });

  console.info('> > adding delete Bugs route...');
  router.route('/bugs/:id').delete((req, res) => {
    // Check if session user is authorized
    if (req.user.position === 1) {
      Models.Bug.forge({ id: req.params.id })
        .fetch({ require: true })
        .then(bug => {
          bug.destroy();
        })
        .then(() => {
          console.log('Deleting bug successful');
          res.status(200).json({ error: false, message: 'Deleting bug successful.' });
        })
        .catch(err => {
          console.error(`Error while deleting bug. Error: ${err.message}`);
          res.json({ error: true, message: 'Error while deleting bug.' });
        });
    } else {
      console.log('User is not authorized to delete bug');
      res.json({ error: true, message: 'Unauthorized' });
    }
  });

  return router;
};
