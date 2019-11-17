const moment = require('moment');
const _ = require('lodash');

module.exports = ({ router, Bookshelf, isAuthenticated }) => {
  console.info('> adding ranking routes...');
  // Register the authentication middleware
  // for all URIs use the isAuthenticated function
  router.use('/ranking', isAuthenticated);

  const Models = require('../models/bookshelfModels.js')(Bookshelf);

  console.info('> > adding get /ranking route...');
  router.route('/ranking').get((req, res) => {
    let result = [];

    // get all tournaments
    const fetchOldestTournament = async () => {
      try {
        return await Models.Tournaments.forge()
          .orderBy('startdate', 'ASC')
          .fetchOne();
      } catch (ex) {
        console.error(ex.message);
      }
    };

    fetchOldestTournament().then(oldestTournament => {
      // build ranking data
      try {
        Models.Users.forge()
          .fetch({ withRelated: ['tournaments'] })
          .then(users => {
            users = users.toJSON();

            users.forEach((user, index) => {
              result.push({
                name: `${user.vorname} ${user.name.substring(0, 1)}.`,
                data: [],
                showInNavigator: true,
              });
              user.totalPoints = 0;
              const a = moment(oldestTournament.toJSON().startdate).subtract(
                10,
                'days',
              );
              const b = moment();
              for (let m = b; m.isAfter(a); m.subtract(10, 'days')) {
                let tmpPoints = 0;
                user.tournaments.forEach(tournament => {
                  if (tournament._pivot_points) {
                    const start = moment(tournament.startdate);
                    if (
                      m.isAfter(start) &&
                      m.isBefore(start.clone().add(1, 'year'))
                    ) {
                      tmpPoints += tournament._pivot_points;
                    }
                  }
                });
                result[index].data.push([m.unix() * 1000, tmpPoints]);
              }
            });
          })
          .then(() => {
            const nowData = result.map(obj => {
              if (obj.type === 'flags') return obj;
              return {
                name: obj.name,
                currentPoints: obj.data[0][1],
              };
            });
            let topNames = _.orderBy(nowData, ['currentPoints'], ['desc'])
              .slice(0, 10)
              .map(obj => obj.name);
            if (req.user) topNames = _.union([req.user.vorname], topNames);

            result = result.filter(obj => topNames.includes(obj.name));
          })
          .then(() => {
            // add tournament flags
            result.push({
              type: 'flags',
              name: 'Tournaments List',
              data: [],
              showInLegend: true,
              shape: 'flag', // Defines the shape of the flags.)
              color: '#f36c25', // same as onSeries
              fillColor: '#f36c25',
              style: {
                // text style
                color: 'white',
              },
              stackDistance: 24,
            });
            try {
              oldestTournament = Models.Tournaments.forge()
                .orderBy('startdate', 'ASC')
                .fetch()
                .then(tournaments => {
                  tournaments = tournaments.toJSON();
                  tournaments.forEach(obj => {
                    if (moment(obj.startdate).isAfter(moment())) return;
                    const startdate = moment(obj.startdate);
                    if (startdate.day() === 5) startdate.add(1, 'days');
                    if (startdate.day() === 7) startdate.subtract(1, 'days');
                    result[result.length - 1].data.push({
                      x: startdate.unix() * 1000,
                      title: obj.name,
                      text: obj.name,
                    });
                  });

                  res.status(200).json(result);
                });
            } catch (ex) {
              console.log(ex);
              res.status(500).json({ error: true, message: ex.message });
            }
          });
      } catch (err) {
        console.error(
          `Error while generating ranking data. Error message:\n${err.message}`,
        );
        res.status(500).json({ error: true, message: err.message });
      }
    });
  });

  return router;
};
