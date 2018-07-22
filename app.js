const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session'); // browser sessions for authentication
const mysql = require('mysql');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport'); // Passport is the library we will use to handle storing users within HTTP sessions

if (process.env.NODE_ENV !== 'production') { // only if not production
  require('longjohn'); // for extensive logging in local
}
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv'); // enables environment variables for development
if (process.env.NODE_ENV !== 'production') dotenv.load();
require('console-stamp')(console, { pattern: 'dd/mm/yyyy HH:MM:ss' }); // adds a timestamp to each console log
const flash = require('req-flash'); // lets me parse individual messages to requests

// connect to database
let conn,
  knex,
  Bookshelf;
try {
  conn = require('./knexfile.js'); // read out the DB Conn Data
  knex = require('knex')(conn[process.env.NODE_ENV || 'local']); // require knex query binder
  Bookshelf = require('bookshelf')(knex); // require Bookshelf ORM Framework
} catch (ex) {
  console.log(ex);
}

// https redirect
const sslRedirect = require('heroku-ssl-redirect');
app.use(sslRedirect());

// disable cors when local
if (process.env.NODE_ENV !== 'production') {
  const cors = require('cors');
  app.use(cors());
}

// use passport & sessions
app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport using passport-init.js
const initPassport = require('./config/passport-init');
initPassport(passport, Bookshelf);

// sessionStore options
const options = {
  checkExpirationInterval: 1000 * 60 * 15, // 15 min // How frequently expired sessions will be cleared; milliseconds.
  expiration: 1000 * 60 * 60 * 24 * 30, // 30 days // The maximum age of a valid session; milliseconds.
  createDatabaseTable: true, // Whether or not to create the sessions database table, if one does not already exist.
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data',
    },
  },
};

// connect to the db
const dbConnectionInfo = {
  host: process.env.NODE_ENV !== 'production' ? 'localhost' : 'us-cdbr-iron-east-03.cleardb.net',
  port: 3306,
  user: process.env.NODE_ENV !== 'production' ? 'root' : 'bb41eedfd379a8',
  password: process.env.NODE_ENV !== 'production' ? process.env.localDBPassword : process.env.clearDB_password,
  database: process.env.NODE_ENV !== 'production' ? 'bdudb' : 'heroku_9b6f95eb7a9adf8',
  connectionLimit: 10, // if you use a pool like I did
};

const pool = mysql.createPool(dbConnectionInfo); // create connection pool
const sessionStore = new MySQLStore(options, pool);

app.use(session({
  // key: 'cookie_key',
  secret: 'cookie_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));


// ---------Middleware--------------
app.use(morgan('tiny'));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// IF NEW ROUTE IS CREATED, DEFINE NEW ROUTE HERE AND SET URI FURTHER DOWN
// sets up routes variables
const index = require('./routes/index');
const restApi = require('./routes/restAPI')(Bookshelf);
const rankingApi = require('./routes/rankingAPI')(Bookshelf);
const dashboard = require('./routes/dashboardAPI')(Bookshelf);

// setup routes URIs
app.use('/', index);
app.use('/app', restApi);
app.use('/ranking', rankingApi);
app.use('/dashboard', dashboard);
require('./routes/routes.js')(app, passport, Bookshelf);

// setup scheduled jobs
if (process.env.NODE_ENV === 'production') {
  require('./scheduled_jobs/sendDebtMails');
  require('./scheduled_jobs/saveTotalClubDebt');
  require('./scheduled_jobs/checkTransactionsService/checkBankTransactions');
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
