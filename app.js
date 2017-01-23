var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// add timestamps in front of log messages
require('console-stamp')( console, { pattern : "dd/mm/yyyy HH:MM:ss" } ); //adds a timestamp to each console log
var flash = require('req-flash'); //lets me parse individual messages to requests
var session = require('express-session'); //browser sessions for authentification
var passport = require('passport'); //Passport is the library we will use to handle storing users within HTTP sessions
var mysql = require('mysql');

//IF NEW ROUTE IS CREATED, DEFINE NEW ROUTE HERE AND SET URI FURTHER DOWN
//sets up routes variables
var index = require('./routes/index');
var restApi = require('./routes/restApi');
var authenticate = require('./routes/authenticate')(passport);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//---------Middleware--------------

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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
var initPassport = require('./config/passport-init');
initPassport(passport);

//setup routes URIs
app.use('/', index);
app.use('/auth', authenticate);
app.use('/app', restApi);
require('./routes/routes.js')(app, passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
