/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  res.render('scratch/index', {});
};

exports.other = function(req, res) {
  var page = req.params.page;
  res.render('scratch/' + String(page), {});
};

