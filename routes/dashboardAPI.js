const moment = require('moment');

module.exports = ({ router, Bookshelf, isAuthenticated }) => {
  console.info('> adding dashboard routes...');
  // Register the authentication middleware
  // for all URIs use the isAuthenticated function
  router.use('/clubdebt', isAuthenticated);

  const Models = require('../models/bookshelfModels.js')(Bookshelf);

  console.info('> > adding get clubDebt route...');
  router.route('/clubDebt')
  // fetch all users
    .get((req, res) => {
      const result = {
        name: 'Club Debt',
        data: [],
      };

      try {
        Models.Club_Debt_Col.forge().fetch()
          .then((clubDebtCollection) => {
            console.info('Successfully retrieved all daily club debt.');
            clubDebtCollection = clubDebtCollection.toJSON();

            clubDebtCollection.forEach((obj) => {
              result.data.push([
                moment(obj.timestamp).unix() * 1000,
                obj.debt,
              ]);
            });
            res.send(result);
          });
      } catch (ex) {
        console.log(ex);
      }
    });

  return router;
};
