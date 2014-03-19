/**
 * Module dependencies.
 */
var express = require('express');
var MongoStore = require('connect-mongo')(express);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');


/**
 * Load controllers.
 */
var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var contactController = require('./controllers/contact');
var scratchController = require('./controllers/scratch');
var widgetController = require('./controllers/widget');
var docController = require('./controllers/documentation');
var apiController = require('./controllers/api');
var forgotController = require('./controllers/forgot');
var resetController = require('./controllers/reset');
var snippetController = require('./controllers/snippet');

/**
 * API keys + Passport configuration.
 */

var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */

var app = express();

/**
 * Mongoose configuration.
 */

mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

/**
 * Express configuration.
 */

var hour = 3600000;
var day = (hour * 24);
var week = (day * 7);
var month = (day * 30);

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(require('connect-assets')({
  src: 'static',
  helperContext: app.locals
}));
app.use(express.compress());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(expressValidator());
app.use(express.methodOverride());
app.use(express.session({
  secret: secrets.sessionSecret,
  store: new MongoStore({
    db: mongoose.connection.db,
    auto_reconnect: true
  })
}));

var csrf = express.csrf();

var conditionalCSRF = function (req, res, next) {
  var needCSRF = true;
  if (req.url.indexOf("/api/updatecell") != -1) {
    needCSRF = false;
  }
  if (needCSRF) {
    csrf(req, res, next);
  } else {
    next();
  }
}

app.use(conditionalCSRF);
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  if (typeof req.csrfToken != 'undefined') {
    res.locals.token = req.csrfToken();
  }
  res.locals.secrets = secrets;
  next();
});
app.use(flash());
app.use(app.router);
app.use('/release/current', express.static(path.join(__dirname, '..', 'release'), { maxAge: week }));
app.use('/src', express.static(path.join(__dirname, '..', 'src'), { maxAge: week }));
app.use(express.static(path.join(__dirname, 'static'), { maxAge: week }));
app.use(function(req, res) {
  res.status(404);
  res.render('404');
});
app.use(express.errorHandler());

/**
 * DOCUMENTATION ROUTES
 * ======================================================================
 */
app.get('/', docController.index);
app.get('/demos', docController.demos);
app.get('/widgets', widgetController.index);
app.get('/web-scraping', docController.dscrape);
app.get('/widgets/:widget', widgetController.show);
app.get('/scratch', scratchController.index);
app.get('/scratch/:page', scratchController.other);

/**
 * APPLICATION ROUTES
 * ======================================================================
 */

app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', forgotController.getForgot);
app.post('/forgot', forgotController.postForgot);
app.get('/reset/:token', resetController.getReset);
app.post('/reset/:token', resetController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/about', homeController.getAbout);

app.post('/api/gsheet/updatecell', apiController.updateCell);
app.post('/api/gsheet/updatelistitemproperty', apiController.updateListItemProperty);
app.get('/api/proxy', apiController.getProxy);

app.get('/snippet', snippetController.getIndex);
app.get('/snippet/new', passportConf.isAuthenticated, snippetController.createSnippet);
app.get('/snippet/:snippet/json', snippetController.getSnippetJson);
app.get('/snippet/:snippet', snippetController.getSnippet);
app.post('/snippet/:snippet', snippetController.saveSnippet);

app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/login' }));

/**
 * Start Express server.
 */
var banner = "" +
"    _________________   \n" +
"   / ____/_  __/ ___/ \n" +
"  / /     / /  \\__ \\      __|  _ \\  __|\\ \\   / _ \\  __| \n" +
" / /___  / /  ___/ /    \\__ \\  __/ |    \\ \\ /  __/ |   \n" +
"  ____/ /_/  /____/     ____/\\___|_|     \\_/ \\___|_|   \n\n" +
"               Cascading Tree Sheets Server \n";

app.listen(app.get('port'), function() {
  console.log("\n" + banner);
  console.log("  ✔ Express server listening on port %d", app.get('port'));
  console.log("  ✔ Mode: %s ", app.settings.env);
});
