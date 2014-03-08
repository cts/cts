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
