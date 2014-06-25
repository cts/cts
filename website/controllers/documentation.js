/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  res.render('cts/index', {
    'title': 'Home'
  });
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