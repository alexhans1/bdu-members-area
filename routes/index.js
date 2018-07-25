// Used for routes that must be authenticated.
const isAuthenticated = (req, res, next) => {
  // if user is authenticated in the session, call the next() to call the next request handler
  // Passport adds this method to request object. A middleware is allowed to add properties to
  // request and response objects

  if (req.isAuthenticated()) {
    return next();
  }

  // if the user is not authenticated then redirect him to the login page
  console.info('not logged in');
  return res.status(401).json({ message: 'Unauthorized' });
};

const isAdmin = req => req.user.position === 1;
const handleUnauthorized = (res, message) => {
  res.status(403).json({ message });
};

module.exports = ({ express, Bookshelf, passport }) => {
  const router = express.Router();
  console.info('adding api routes...');

  require('./authentication')({
    router, Bookshelf, passport,
  });
  require('./userAPI')({
    router, Bookshelf, isAuthenticated, isAdmin, handleUnauthorized,
  });
  require('./tournamentAPI')({
    router, Bookshelf, isAuthenticated, isAdmin, handleUnauthorized,
  });
  require('./registrationAPI')({
    router, Bookshelf, isAuthenticated, isAdmin, handleUnauthorized,
  });
  require('./bugsAPI')({
    router, Bookshelf,
  });
  require('./dashboardAPI')({
    router, Bookshelf, isAuthenticated,
  });
  require('./rankingAPI')({
    router, Bookshelf, isAuthenticated,
  });

  return router;
};
