module.exports = ({ router, Bookshelf, isAuthenticated, isAdmin, handleUnauthorized}) => {
  console.info('> adding bugs routes...');
  // Register the authentication middleware
  // for all URIs use the isAuthenticated function
  router.use('/tournament', isAuthenticated);

  const Models = require('../models/bookshelfModels.js')(Bookshelf);

  console.info('> > adding get wikiLinks route...');
  router.route('/wikiLinks').get((req, res) => {
    Models.Wiki_Link_Col.forge()
      .fetch()
      .then(links => {
        links = links.toJSON();
        console.log('Getting all wikiLinks successful');
        res.json({ error: false, data: links });
      })
      .catch(err => {
        console.error(`Error while getting all wikiLinks. Error message:\n${err}`);
        res.json({
          error: true,
          err,
          message: `Error while getting all wikiLinks. Error message:\n${err}`,
        });
      });
  });

  console.info('> > adding post wikiLinks route...');
  router.route('/wikiLinks').post((req, res) => {
    if (!isAdmin(req))
      return handleUnauthorized(res, 'User is not authorized to create new wiki links.');
    Models.Wiki_Link.forge({
      title: req.body.title,
      url: req.body.url,
      topic: req.body.topic,
      description: req.body.description
    })
    .save()
    .then((wikiLink) => {
      console.log('Post wikiLink successful.');
      res.status(200).json({ wikiLink, message: 'Report wikiLink successful.' });
    })
    .catch(err => {
      console.log(`Error while reporting new wikiLink. Error: \n${err}`);
      res.status(500).json({
        message: 'Error while reporting new wikiLink.',
      });
    });
  });

  console.info('> > adding put wikiLinks route...');
  router.route('/wikiLinks/:id').put((req, res) => {
    if (!isAdmin(req))
      return handleUnauthorized(res, 'User is not authorized to create new wiki links.');
    Models.Wiki_Link_Col.forge({ id: req.params.id })
      .fetch({ require: true })
      .then(wikiLink => {
        wikiLink.save({
          // TODO add the correct data fields for the data model
          description: req.body.description,
          type: req.body.type,
        });
      })
      .then(() => {
        console.log('Updating wikiLink successful.');
        res.status(200).json({ error: false, message: 'Updating wikiLink successful.' });
      })
      .catch(err => {
        console.error(`Error while updating wikiLink. Error: ${err.message}`);
        res.json({ error: true, message: 'Error while updating wikiLink.' });
      });
    
  });

  // TODO add the deletion API
  
  /* console.info('> > adding delete Bugs route...');
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
  }); */

  return router;
};
