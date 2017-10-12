let sslRedirect = require('heroku-ssl-redirect');
let express = require('express');
let app = express();
let path = require('path');
if (process.env.NODE_ENV !== 'production'){
	require('longjohn');
}
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let dotenv = require('dotenv'); //enables environment variables for development
dotenv.load();
console.log(process.env.NODE_ENV);
require('console-stamp')( console, { pattern : "dd/mm/yyyy HH:MM:ss" } ); //adds a timestamp to each console log
let flash = require('req-flash'); //lets me parse individual messages to requests
let session = require('express-session'); //browser sessions for authentication
let passport = require('passport'); //Passport is the library we will use to handle storing users within HTTP sessions

// connect to database
let conn, knex, Bookshelf;
try {
	conn = require('./knexfile.js'); //read out the DB Conn Data
	knex = require('knex')(conn[process.env.NODE_ENV || 'local']); //require knex query binder
	Bookshelf = require('bookshelf')(knex); //require Bookshelf ORM Framework
} catch (ex) {
	console.log(ex);
}

//IF NEW ROUTE IS CREATED, DEFINE NEW ROUTE HERE AND SET URI FURTHER DOWN
//sets up routes variables
let index = require('./routes/index');
let restApi = require('./routes/restAPI')(Bookshelf);
let rankingApi = require('./routes/rankingAPI')(Bookshelf);
let dashboard = require('./routes/dashboardAPI')(Bookshelf);

// https redirect
app.use(sslRedirect());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//---------Middleware--------------

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/images', 'BDU.png')));
app.use(logger('dev'));

//initialize sessions middleware, set secret to 'keyboard cat' to be used by cookies later I guess ?
app.use(session({
	secret: 'keyboard cat2',
	resave: true,
	saveUninitialized: true
}));

app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/static', express.static('public'));

//use passport & sessions
app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport using passport-init.js
let initPassport = require('./config/passport-init');
initPassport(passport, Bookshelf);

//setup routes URIs
app.use('/', index);
app.use('/app', restApi);
app.use('/ranking', rankingApi);
app.use('/dashboard', dashboard);
require('./routes/routes.js')(app, passport, Bookshelf);

//setup scheduled jobs
if (!((process.env.NODE_ENV === 'local'))) {
	require('./scheduled_jobs/sendDebtMails');
}
require('./scheduled_jobs/saveTotalClubDebt');
require('./scheduled_jobs/checkBankTransactions');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
