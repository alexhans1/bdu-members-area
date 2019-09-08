// load configuration settings from environment file .env
require('dotenv').load();

// require all the necessary dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const sslRedirect = require('heroku-ssl-redirect');
const flash = require('req-flash');
const httpRequestLogger = require('morgan');

const app = express();
const port = process.env.PORT || 8080;

// https redirect
app.use(sslRedirect());

// add security
const whitelist = [
  'http://local.members.debating.de:3000',
  'http://local.members.debating.de:3006',
];
const corsOptions = {
  origin: whitelist,
  optionsSuccessStatus: 200,
  credentials: true,
  preflightContinue: false,
  methods: 'GET,PUT,PATCH,POST,DELETE',
};

app.use(cors(corsOptions));

// add parsers for body and cookies
app.use(bodyParser.json({ limit: '10mb' }));
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(cookieParser());

// add HTTP Request logging
app.use(httpRequestLogger('tiny'));

// connect to database
let conn;
let knex;
let Bookshelf;
try {
  conn = require('./knexfile.js'); // read out the DB Conn Data
  knex = require('knex')(conn[process.env.NODE_ENV || 'local']); // require knex query binder
  Bookshelf = require('bookshelf')(knex); // require Bookshelf ORM Framework
} catch (ex) {
  console.error(ex.message);
}

// browser sessions for authentication
const session = require('express-session');
const mysql = require('mysql');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport'); // Passport is the library we will use to handle storing users within HTTP sessions

// sessionStore options
const options = {
  clearExpired: true, // Whether or not to automatically check for and clear expired sessions:
  checkExpirationInterval: 1000 * 60 * 60 * 24, // once a day // How frequently expired sessions will be cleared; milliseconds.
  expiration: 1000 * 60 * 60 * 24 * 200, // 200 days // The maximum age of a valid session; milliseconds.
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
  host:
    process.env.NODE_ENV !== 'production'
      ? 'localhost'
      : 'us-cdbr-iron-east-03.cleardb.net',
  port: 3306,
  user: process.env.NODE_ENV !== 'production' ? 'root' : 'bb41eedfd379a8',
  password:
    process.env.NODE_ENV !== 'production'
      ? process.env.localDBPassword
      : process.env.clearDB_password,
  database: 'heroku_9b6f95eb7a9adf8',
  connectionLimit: 10, // if you use a pool like I did
};

const pool = mysql.createPool(dbConnectionInfo); // create connection pool
const sessionStore = new MySQLStore(options, pool);

app.use(
  session({
    secret: 'cookie_secret',
    store: sessionStore,
    resave: false,
    unset: 'destroy',
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 200, // 200 days // The maximum age of a valid session; milliseconds.
    },
  }),
);

// use passport & sessions
app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport using passport-init.js
require('./routes/config/passport-init')(passport, Bookshelf);

// lets me parse individual messages to requests
app.use(flash());

// add basic routes needed in all environments
app.use('/', require('./routes/')({ express, Bookshelf, passport }));

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
  res.locals.error = app.get('env') === 'local' ? err : {};

  res.status(err.status || 500).send(err.message);
});

app.listen(port);
console.log(`\nENV: ${app.get('env')}`);
console.log(`Listening to port: ${port}\n`);

module.exports = app;
