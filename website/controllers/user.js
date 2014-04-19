var passport = require('passport');
var _ = require('underscore');
var User = require('../models/User');

/**
 * GET /login
 * Login page.
 */

exports.getLogin = function(req, res, popup) {
  var rootLocation = '/';
  var signupLocation = 'account/login';
  if (popup) {
    rootLocation = '/check-gauth-popup';
    signupLocation = 'account/login_popup';
  }

  if (req.user) return res.redirect(rootLocation);
  res.render(signupLocation, {
    title: 'Login'
  });
};

exports.getLoginPopup = function(req, res) {
  exports.getLogin(req, res, true);
};


/**
 * POST /login
 * Sign in using email and password.
 * @param email
 * @param password
 */

exports.postLogin = function(req, res, next, popup) {
  var rootLocation = '/';
  var loginLocation = '/login';
  if (popup) {
    rootLocation = '/check-gauth-popup';
    loginLocation = '/login-popup';
  }

  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(loginLocation);
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);

    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect(loginLocation);
    }

    req.logIn(user, function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Success! You are logged in.' });
      return res.redirect(rootLocation);
    });
  })(req, res, next);
};


exports.postLoginPopup = function(req, res, next) {
  exports.postLogin(req, res, next, true);
};

/**
 * GET /logout
 * Log out.
 */

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * GET /signup
 * Signup page.
 */

exports.getSignup = function(req, res, popup) {
  var rootLocation = '/';
  var signupLocation = 'account/signup';
  if (popup) {
    rootLocation = '/check-gauth-popup';
    signupLocation = 'account/signup_popup';
  }

  if (req.user) return res.redirect(rootLocation);
  res.render(signupLocation, {
    title: 'Create Account'
  });
};

exports.getSignupPopup = function(req, res) {
  exports.getSignup(req, res, true);
};

/**
 * POST /signup
 * Create a new local account.
 * @param email
 * @param password
 */

exports.postSignup = function(req, res, next, popup) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  var rootLocation = '/';
  var signupLocation = '/signup';
  if (popup) {
    rootLocation = '/check-gauth-popup';
    signupLocation = '/signup-popup';
  }

  if (errors) {
    req.flash('errors', errors);
    return res.redirect(signupLocation);
  }

  var user = new User({
    email: req.body.email,
    password: req.body.password
  });

  user.save(function(err) {
    if (err) {
      if (err.code === 11000) {
        req.flash('errors', { msg: 'User with that email already exists.' });
      }
      return res.redirect(signupLocation);
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      res.redirect(rootLocation);
    });
  });
};

exports.postSignupPopup = function(req, res, next) {
  exports.postSignup(req, res, next, true);
}

exports.getCheckGauthPopup = function(req, res) {
  var popup = true;

  if (! req.user) return res.redirect('/login-popup');

  if (req.user.google) {
    res.render('account/gauth_success');
  } else {
    res.render('account/gauth_popup', {
      title: 'GAuth'
    });
  }
};

/**
 * GET /account
 * Profile page.
 */

exports.getAccount = function(req, res) {
  res.render('account/profile', {
    title: 'Account Management'
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */

exports.postUpdateProfile = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);
    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Profile information updated.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 * @param password
 */

exports.postUpdatePassword = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.password = req.body.password;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 * @param id - User ObjectId
 */

exports.postDeleteAccount = function(req, res, next) {
  User.remove({ _id: req.user.id }, function(err) {
    if (err) return next(err);
    req.logout();
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth2 provider from the current user.
 * @param provider
 * @param id - User ObjectId
 */

exports.getOauthUnlink = function(req, res, next) {
  var provider = req.params.provider;
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user[provider] = undefined;
    user.tokens = _.reject(user.tokens, function(token) { return token.kind === provider; });

    user.save(function(err) {
      if (err) return next(err);
      req.flash('info', { msg: provider + ' account has been unlinked.' });
      res.redirect('/account');
    });
  });
};
