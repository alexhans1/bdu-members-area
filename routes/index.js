// Used for routes that must be authenticated.
function isAuthenticated(req, res, next) {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects

  if (req.isAuthenticated()) {
    return next();
  }

  // if the user is not authenticated then redirect him to the login page
  console.info('not logged in');
  return res.status(401).json({ message: 'Unauthorized' });
}

module.exports = ({ express, Bookshelf, passport }) => {
  const router = express.Router();
  console.info('adding api routes...');

  require('./authentication')({
    router, Bookshelf, passport,
  });
  // require('./restAPI')({
  //   router, Bookshelf,
  // });
  require('./bugsAPI')({
    router, Bookshelf,
  });
  require('./dashboardAPI')({
    router, Bookshelf, isAuthenticated,
  });
  // require('./rankingAPI')({
  //   router, Bookshelf,
  // });

  return router;
};
