const LocalStrategy = require('passport-local').Strategy;
const bCrypt = require('bcrypt-nodejs');

module.exports = (passport, Bookshelf) => {
  // User model
  const Models = require('../../models/bookshelfModels.js')(Bookshelf);

  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and deserialize users out of session
  // Passport needs to be able to serialize and deserialize users to support persistent login sessions

  passport.serializeUser((user, done) => {
    done(null, {
      id: user.attributes.id,
      email: user.attributes.email,
      vorname: user.attributes.vorname,
      name: user.attributes.name,
      position: user.attributes.position,
    });
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  passport.use('login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  },
    ((req, userEmail, password, done) => { // callback with email and password from our form
      try {
        new Models.User({ email: userEmail })
          .fetch({ withRelated: ['tournaments'] })
          .then((user) => {
            if (!user) {
              return done(null, false, { message: `No user found with that email: ${userEmail}.` });
            }
            if (!isValidPassword(password, user.get('password'))) {
              return done(null, false, { message: 'Incorrect password.' });
            }
            // all is well, return user
            user.save({
              last_login: new Date(),
            });
            return done(null, user);
          }).catch((ex) => {
            console.error(ex.message);
            return done(null, false, { message: 'Error during login' });
          });
      } catch (ex) {
        console.error(ex.message);
        return done(null, false, { message: 'Error during login' });
      }
    })));

  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup

  passport.use('signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  }, ((req, userEmail, password, done) => {
      try {
      // check if signup password is correct
        if (req.body.signup_password !== process.env.signup_password) {
          return done(null, false, {
            message: 'Signup password is not correct. Please ask the BDU board members for help.',
          });
        }
        // find a user whose email is the same as the forms email
        // check if user already exists in DB
        new Models.User({ email: userEmail })
          .fetch({ withRelated: ['tournaments'] })
          .then((user) => {
            if (user) {
              return done(null, false, { message: 'A User with that email already exists.' });
            }

            // if there is no user with that email
            // create the user
            Models.User.forge({
              email: req.body.email,
              password: createHash(req.body.password),
              vorname: req.body.vorname,
              name: req.body.name,
              image: req.body.image,
              gender: req.body.gender,
              food: req.body.food,
              last_login: new Date(),
            })
              .save()
              .then(newUser => done(null, newUser))
              .catch((err) => {
                console.error(`Error while saving new user. Error message:\n${err.message}`);
                return done(null, false, { message: 'Error during signup.' });
              });
          })
          .catch((err) => {
            console.error(`Error during fetching user during signup. Error message:\n${err.message}`);
            return done(null, false, { message: 'Error during signup.' });
          });
      } catch (err) {
        console.error(`Error during signup. Error message:\n${err.message}`);
        return done(null, false, { message: 'Error during signup.' });
      }
    })));

  // LOCAL PASSWORD RESET ====================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup

  passport.use('reset', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'id',
    passwordField: 'password',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  },
    ((req, userID, password, done) => {
      try {
        // find a user whose email is the same as the forms email
        // check if user already exists in DB
        new Models.User({ id: userID })
          .fetch()
          .then((user) => {
            if (!user) {
              console.error(`No user found with ID: ${userID}.`);
              return done(null, false, req.flash('reset', `No user found with ID: ${userID}.`));
            }
            if (Date.now() > user.get('resetPasswordExpires') || user.get('resetPasswordExpires') === null) {
              console.error('Password reset token has expired or is invalid.');
              return done(null, false, req.flash('reset', 'Password reset token has expired or is invalid.'));
            }
            // if user is found
            user.save({
              password: createHash(req.body.password),
              resetPasswordToken: null,
              resetPasswordExpires: null,
            })
              .then((newUser) => {
                console.log('New password saved.');
                return done(null, newUser, req.flash('reset', 'New password saved.'));
              })
              .catch((err) => {
                console.error(`Error during password reset. Error message:${err}`);
                return done(null, false, req.flash('reset', 'Error during password reset.'));
              });
          })
          .catch((err) => {
            console.error(`Error during fetching user during password reset. Error message:${err}`);
            return done(null, false, req.flash('reset', 'Error during password reset.'));
          });
      } catch (ex) {
        console.log(ex);
      }
    })));

  // =========================================================================
  // LOCAL PASSWORD CHANGE ===================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup

  passport.use('change', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'userID',
    passwordField: 'newPwd',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  },
    ((req, userID, newPwd, done) => {
      console.log(`Change password method called for user: ${userID}`);
      try {
        // find a user whose email is the same as the forms email
        new Models.User({ id: userID })
          .fetch()
          .then((user) => {
            if (!user) {
              console.error(`No user found with ID: ${userID}.`);
              return done(null, false, req.flash('changeMsg', `No user found with ID: ${userID}.`));
            }
            if (!isValidPassword(req.body.oldPwd, user.get('password'))) {
              console.error('Your given password does not match your old password.');
              return done(null, false, req.flash('changeMsg',
                'Your given password does not match your old password.'));
            }
            // if user is found and gives correct password
            user.save({
              password: createHash(newPwd),
            })
              .then((newUser) => {
                console.log('New password saved.');
                return done(null, newUser, req.flash('changeMsg', 'New password saved.'));
              })
              .catch((err) => {
                console.error(`Error during password change. Error message: ${err}`);
                return done(null, false, req.flash('changeMsg', 'Error during password change.'));
              });
          })
          .catch((err) => {
            console.error(`Error during fetching user during password change. Error message: ${err}`);
            return done(null, false, req.flash('changeMsg', 'Error during password change.'));
          });
      } catch (ex) {
        console.log(ex);
      }
    })));


  // Helper Functions

  let isValidPassword = (pwd, pwdHash) => {
    try {
      return bCrypt.compareSync(pwd, pwdHash);
    } catch (err) {
      console.error(`${err} - the password seems to have the wrong format`);
      return false;
    }
  };
  // Generates hash using bCrypt
  let createHash = password => bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};
