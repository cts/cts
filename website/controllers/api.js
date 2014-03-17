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

/**
 * GET /api
 * List of API examples.
 */

exports.getApi = function(req, res) {
  res.render('api/index', {
    title: 'API Browser'
  });
};

exports.updateCell = function(req, res) {
  var deferred = Q.defer();
  var rowNum = req.body.rowNum;
  var colNum = req.body.colNum;
  var ssKey = req.body.ssKey;
  var wsKey = req.body.wsKey;
  var value = req.body.value;
  var cell = 'R' + rowNum + 'C' + colNum;
  var token = req.body.token;

  var url = "https://spreadsheets.google.com/feeds/cells/" +
        ssKey + "/" + wsKey + "/private/full/" + cell +
        "?access_token=" + token;

  var contentType = "application/atom+xml";
  var xmlBody = '<entry xmlns="http://www.w3.org/2005/Atom"';
  xmlBody += ' xmlns:gs="http://schemas.google.com/spreadsheets/2006">\n';
  xmlBody += '\t<id>' + url + '</id>\n';
  xmlBody += '\t<link rel="edit" type="application/atom+xml" ';
  xmlBody += 'href="' + url + '" />\n';
  xmlBody += '\t<gs:cell row="' + rowNum + '" col="' + colNum + '" ';
  xmlBody += 'inputValue="' + value + '"/>\n</entry>';
  console.log(xmlBody);
  var verb = 'PUT';

  request({
    url: url,
    method: verb,
    body: xmlBody,
    headers: {
      'Content-Type': contentType,
      'GData-Version': '3.0',
      'If-Match': '*'
    }},
    function(err, resp, body) {

      console.log(err, resp, body);
  });
};

exports.updateListItemProperty = function(req, res) {
  var deferred = Q.defer();
  var item = req.body.item;
  var property = req.body.property;
  var ssKey = req.body.ssKey;
  var wsKey = req.body.wsKey;
  var value = req.body.value;
  var token = req.body.token;

  var rowId = "https://spreadsheets.google.com/feeds/list/" + ssKey + "/" +
        wsKey + "/private/full/" + item;

  var url = "https://spreadsheets.google.com/feeds/list/" +
        ssKey + "/" + wsKey + "/private/full?access_token=" + token;

  var contentType = "application/atom+xml";
  var xmlBody = '<entry xmlns="http://www.w3.org/2005/Atom"';
  xmlBody += ' xmlns:gs="http://schemas.google.com/spreadsheets/2006">\n';
  xmlBody += '\t<id>' + rowID + '</id>\n';
  xmlBody += '\t<gsx:' + property + '>' + value + '</gsx:' + property + '>\n'
  xmlBody += '</entry>';
  console.log(xmlBody);
  var verb = 'PUT';

  request({
    url: url,
    method: verb,
    body: xmlBody,
    headers: {
      'Content-Type': contentType,
      'GData-Version': '3.0',
      'If-Match': '*'
    }},
    function(err, resp, body) {

      console.log(err, resp, body);
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
