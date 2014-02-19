/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  res.render('cts/widgets/index', {});
};

exports.show = function(req, res) {
  var widget = req.params.widget;
  res.render('cts/widgets/show', {});
};


