// stuff for reset password function
const crypto = require('crypto');
const sg = require('sendgrid')(process.env.SENDGRID_KEY);
const helper = require('sendgrid').mail;

module.exports = ({ router, Bookshelf, passport }) => {
  console.info('> adding authentication routes...');

  // sends failure login state back to angular
  router.route('/failure').get((req, res) => {
    console.error(req.flash().error || 'Error during login. Check username and password.');
    res.status(409).json({
      message: req.flash().error || 'Error during login. Check username and password.',
    });
  });

  // process the login form
  console.info('> > adding login route...');
  router.route('/login').post(
    passport.authenticate('login', {
      failureRedirect: '/failure', // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    }),
    (req, res) => {
      // If this function gets called, authentication was successful.
      // `req.user` contains the authenticated user.
      res.status(200).json(req.user);
    },
  );

  // process the signup form
  console.info('> > adding signup route...');
  router.route('/signup').post(
    passport.authenticate('signup', {
      failureRedirect: '/failure', // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    }),
    (req, res) => {
      // If this function gets called, authentication was successful.
      // `req.user` contains the authenticated user.
      res.status(200).json(req.user);
    },
  );

  // process the logout
  console.info('> > adding logout route...');
  router.route('/logout').get((req, res) => {
    req.logout();
    res.status(200).send('success');
  });

  // get current authenticated user
  router.route('/currentUser').get(async (req, res) => {
    if (req.isAuthenticated()) {
      try {
        const currentUser = await Models.User.forge({ id: req.user.id }).fetch({
          withRelated: ['tournaments'],
        });
        return res.status(200).json(await currentUser.toJSON());
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Could not fetch user.' });
      }
    }
    res.status(401).json({ message: 'No user logged in.' });
  });

  // =============================================================================
  // ========================== RESET PASSWORD FUNCTION ==========================
  // =============================================================================

  // FIRST: SEND FORGOT PASSWORD EMAIL
  // THIS SETS THE resetPasswordToken AND resetPasswordExpires AND SENDS LINK WITH TOKEN TO USEREMAIL

  // User model
  const Models = require('../models/bookshelfModels.js')(Bookshelf);

  router.route('/forgot').post(async (req, res) => {
    let token = null;
    await crypto.randomBytes(20, (err, buf) => {
      token = buf.toString('hex');
    });

    await Models.User.forge({ email: req.body.email })
      .fetch({ require: true })
      .then(user => {
        user.save({
          resetPasswordToken: token,
          resetPasswordExpires: Date.now() + 1800000, // set the time to 30 minutes from now
        });
      });

    const from_email = new helper.Email('bdudb_password_reset@debating.de');
    const to_email = new helper.Email(req.body.email);
    const subject = 'BDUDB Password Reset';
    const text =
      `${'You are receiving this because you (or someone else) have ' +
        'requested the reset of the password for your BDUDB account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://'}${req.headers.host}/reset/${token}\n\n` +
      'If you did not request this, please ignore this email and your password will remain unchanged.\n';
    const content = new helper.Content('text/plain', text);
    const mail = new helper.Mail(from_email, subject, to_email, content);

    const request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON(),
    });

    await sg.API(request, (error, response) => {
      console.info(response.statusCode);
      console.info(response.body);
      console.info(response.headers);
      if (error) console.error(error);
    });
    console.log(`An e-mail has been sent to ${req.body.email}`);
    res.status(200).send();
  });

  // SECOND: RENDER THE RESET PASSWORD PAGE
  router.route('/reset/:token').get((req, res) => {
    new Models.User({ resetPasswordToken: req.params.token }).fetch().then(user => {
      if (!user) {
        console.log('Password reset token is invalid.');
        // res.status(500).json({error: true, data: {}, message: 'Password reset token is invalid.'});
        req.flash('error', 'Password reset token is invalid.');
        // return res.redirect('/forgot');
      } else if (Date.now() > user.get('resetPasswordExpires')) {
        // res.status(500).json({error: true, data: {}, message: 'Password reset token has expired.'});
        req.flash('error', 'Password reset token has expired.');
      } // else {
      res.render('reset.ejs', { message: req.flash('error'), user: user || null });
      // }
    });
  });

  // THIRD: RESET PASSWORD METHOD
  router.route('/reset').post(
    passport.authenticate('reset', {
      successRedirect: '/', // redirect to the login section
      failureRedirect: '/resetFailure', // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    }),
  );

  // sends failure login state back to angular
  router.route('/resetFailure').get((req, res) => {
    res.render('reset.ejs', { message: req.flash('reset'), user: null });
  });

  // =============================================================================
  // ========================== CHANGE PASSWORD FUNCTION =========================
  // =============================================================================

  router.route('/changePassword').post(
    passport.authenticate('change', {
      successRedirect: '/changeSuccess', // redirect to the secure profile section
      failureRedirect: '/changeFailure', // redirect back to the signup page if there is an error
      successFlash: true, // allow flash messages
      failureFlash: true, // allow flash messages
    }),
  );

  // sends failure password change state back to angular
  router.route('/changeSuccess').get((req, res) => {
    res.send({ state: 'success', error: false, message: req.flash('changeMsg') || null });
  });

  // sends failure password change state back to angular
  router.route('/changeFailure').get((req, res) => {
    res.send({ state: 'failure', error: true, message: req.flash('changeMsg') || null });
  });
};
