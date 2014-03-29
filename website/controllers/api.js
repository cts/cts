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

    var url = editLink;

  var contentType = "application/atom+xml";
  var xmlBody = "<?xml version='1.0' ?>";
  xmlBody += '<entry xmlns="http://www.w3.org/2005/Atom"';
  xmlBody += ' xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">\n';
  xmlBody += '\t<id>' + url + '</id>\n';
  xmlBody += '\t<link rel="edit" type="application/atom+xml" ';
  xmlBody += 'href="' + url + '" />\n';
  xmlBody += '\t<gsx:cell row="' + rowNum + '" col="' + colNum + '" ';
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

exports.updateListItem = function(req, res) {
  var deferred = Q.defer();
  var item = req.body.item;
  var properties = req.body.properties;
  var ssKey = req.body.ssKey;
  var wsKey = req.body.wsKey;
  var token = req.body.token;
  var editLink = req.body.editLink;
  var url = editLink;
  console.log("REQUEST URL", url);
  var contentType = "application/atom+xml";
  var xmlBody = "<?xml version='1.0' ?>";
  xmlBody += '<entry xmlns="http://www.w3.org/2005/Atom"';
  xmlBody += ' xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">\n';
  xmlBody += '\t<link rel="edit" type="application/atom+xml" ';
  xmlBody += 'href="' + editLink + '" />\n';
  xmlBody += '\t<id>' + item + '</id>\n';
  for (var property in properties) {
    var value = properties[property];
    xmlBody += '\t<gsx:' + property + '>' + value + '</gsx:' + property + '>\n'
  }
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
      'If-Match': '*',
      'Authorization': 'AuthSub token="' + token + '"'
    }},
    function(err, resp, body) {
      if (err) {
        console.log("Item Modification Fail", err);
        res.send(500, err);
      } else {
        console.log("Item Modification Success");
        res.send(200);
      }
  });
};


exports.appendListItem = function(req, res) {
  var deferred = Q.defer();
  var properties = req.body.properties;
  var ssKey = req.body.ssKey;
  var wsKey = req.body.wsKey;
  var token = req.body.token;
  var url = "https://spreadsheets.google.com/feeds/list/" + ssKey +
            "/" + wsKey + "/private/full?alt=json-in-script&access_token=" + token;
            console.log(url);
  var contentType = "application/atom+xml";
  var xmlBody = "<?xml version='1.0' ?>";
  xmlBody += '<entry xmlns="http://www.w3.org/2005/Atom"';
  xmlBody += ' xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">\n';
  for (var property in properties) {
    var value = properties[property];
    xmlBody += '\t<gsx:' + property + '>' + value + '</gsx:' + property + '>\n'
  }
  xmlBody += '</entry>';
  var verb = 'POST';

  request({
    url: url,
    method: verb,
    body: xmlBody,
    headers: {
      'Content-Type': contentType,
      'GData-Version': '3.0',
      'Authorization': 'AuthSub token="' + token + '"'
    }},
    function(err, resp, body) {
      if (err) {
        console.log("Request Failed", err);
      } else {
        console.log("Row Creation Success");
        if (body.indexOf("gdata.io.handleScriptLoaded(") == 0) {
          body = body.replace("gdata.io.handleScriptLoaded(", "");
        }
        if (body.indexOf(");") == body.length - 2) {
          body = body.substring(0, body.length - 2);
        }
        res.send(200, body);
      }
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
