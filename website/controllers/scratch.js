/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  res.render('cts/scratch/index', {});
};

exports.other = function(req, res) {
  var page = req.params.page;
  res.render('cts/scratch/' + String(page), {});
};

