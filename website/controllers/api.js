var secrets = require('../config/secrets');
var User = require('../models/User');
var querystring = require('querystring');
var validator = require('validator');
var async = require('async');
var cheerio = require('cheerio');
var request = require('request');
var _ = require('underscore');
var Github = require('github-api');
var Twit = require('twit');
var url = require('url');
var Q = require('q');
var cors = require('../helpers/cors');

/**
 * GET /api
 * List of API examples.
 */

exports.getApi = function(req, res) {
  res.render('api/index', {
    title: 'API Browser'
  });
};


exports.getProxy = function(req, res) {
  var u = req.query.url;
  request(u, function(err, resp, body) {
    if (err) {
      res.send(500, err);
    } else {
      // insert the base
      var uu = url.parse(u);
      var uuu = uu.protocol + '//' + uu.host + uu.pathname;
      var base = "<base href='" + uuu + "' />";
      body = body.replace("<head>", "<head>" + base);
      res.send(resp.statusCode, body);
    }
  });
};

/**
 * GET /api/github
 * GitHub API Example.
 */
exports.getGithub = function(req, res) {
  var token = _.findWhere(req.user.tokens, { kind: 'github' });
  var github = new Github({ token: token.accessToken });
  var repo = github.getRepo('sahat', 'requirejs-library');
  repo.show(function(err, repo) {
    res.render('api/github', {
      title: 'GitHub API',
      repo: repo
    });
  });

};

exports.googleLogin = function(req, res) {
  cors.addCORSHeaders(req, res);
  res.render('api/google-login', {});
};
