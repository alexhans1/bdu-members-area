/**
 * Created by alex.hans on 29.07.2017.
 */
const schedule = require('node-schedule');
const dotenv = require('dotenv');
// enables environment variables for development
dotenv.load();

let Bookshelf;
try {
  const conn = require('../knexfile.js'); // read out the DB Conn Data
  const knex = require('knex')(conn[process.env.NODE_ENV || 'local']); // require knex query binder
  Bookshelf = require('bookshelf')(knex); // require Bookshelf ORM Framework
} catch (ex) {
  console.log(ex);
}

// DEFINE MODELS
const Models = require('../models/bookshelfModels.js')(Bookshelf);

schedule.scheduleJob('0 3 * * *', function() {
  Models.Registrations.forge()
    .fetch()
    .then(function(registrations) {
      registrations = registrations.toJSON();
      let totalClubDebt = 0;
      registrations.forEach(registration => {
        totalClubDebt += registration.price_owed - registration.price_paid;
      });
      Models.Club_Debt.forge({
        debt: totalClubDebt,
        timestamp: new Date(),
      })
        .save()
        .then(() => {
          console.log('Successfully saved total club debt.');
        });
    });
});
