/**
 * GET /
 * Home page.
 */

exports.index = function(req, res) {
  res.render('home', {
    title: 'Home'
  });
};

exports.getAbout = function(req, res) {
  res.render('cts/about', {
    title: 'About'
  });
};
