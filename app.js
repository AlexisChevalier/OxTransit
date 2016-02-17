require('newrelic');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var nconf = require('nconf');
var mongoose = require('mongoose');

var routes = require('./routes/index');
var api = require('./routes/api');

var app = express();

// Use of Domain API to prevent general crashes

app.use(require('express-domain-middleware'));

// Nconf initialization

nconf
    .argv()
    .env()
    .file({ file: './config.json' });

//DB
mongoose.connect(nconf.get("MONGODB_URL"));
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.on('open',function(err,conn) {
    var dbObject = require('./db');
    dbObject.StationModel.InitializeStationsDb();
});
// Configure Nunjucks
if (app.get('env') === 'development') {
    nunjucks.configure('views', {
        autoescape: true,
        express: app,
        noCache: true
    });
} else {
    nunjucks.configure('views', {
        autoescape: true,
        express: app,
        noCache: false
    });
}
// Configure Express views
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With'); 
    next();
});

app.use('/', routes);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
