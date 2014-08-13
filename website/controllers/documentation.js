/**
 * GET /
 * Home page.
 */

var path = require('path');
var fs = require('fs');

exports.index = function(req, res) {
  res.render('cts/index', {
    'title': 'Home'
  });
};

exports.docs = function(req, res) {
  if (typeof req.params.page != 'undefined') {
    var p;
    if (typeof req.params.subpage != 'undefined') {
      p = path.join('cts', 'documentation', req.params.page, req.params.subpage);
    } else {
      p = path.join('cts', 'documentation', req.params.page);
    }
    var file = path.join(__dirname, '..', 'views', p + '.jade');
    fs.exists(file, function(exists) {
      if (exists) {
        res.render(p);
      } else {
        req.flash('errors', {msg: "Sorry, we couldn't find a documentation page by that name."});
        return res.redirect('docs/index');
      }
    });
  } else {
    res.render('cts/documentation/index');
  }
};

exports.dscrape = function(req, res) {
  res.render('cts/dscrape/index', {});
};

exports.demos = function(req, res) {
  res.render('cts/demos', {
    title: 'Demos'
  });
};

exports.docindex = function(req, res) {
  res.render('cts/documentation/index');
};

exports.setup = function(req, res) {
  res.render('cts/documentation/setup');
};

exports.quiltsetup = function(req, res) {
  res.render('cts/documentation/quilt-setup');
};

exports.quiltexamples = function(req, res) {
  res.render('cts/documentation/quilt-examples');
};