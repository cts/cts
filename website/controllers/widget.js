var path = require('path');

exports.index = function(req, res) {
  var widgets = require(path.join(__dirname, '..', 'static', 'widgets', 'index.json'));
  for (var i = 0; i < widgets.length; i++) {
    widgets[i]['thumbnailUrl'] = '/widgets/' + widgets[i].id + '/' + widgets[i].id + '.png';
    widgets[i]['url'] = '/widgets/' + widgets[i].id + '/';
  }
  res.render('cts/widgets/index', {widgets: widgets});
};

exports.show = function(req, res) {
  var widget = req.params.widget;
  res.render('cts/widgets/show', {});
};

