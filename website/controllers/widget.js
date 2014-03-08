var path = require('path');
var fs = require('fs');

exports.index = function(req, res) {
  var widgets = require(path.join(__dirname, '..', 'static', 'widgets', 'index.json'));
  for (var i = 0; i < widgets.length; i++) {
    widgets[i]['thumbnailUrl'] = '/widgets/' + widgets[i].id + '/' + widgets[i].id + '.png';
    widgets[i]['url'] = '/widgets/' + widgets[i].id + '/';
  }
  res.render('cts/widgets/index', {
    widgets: widgets,
    title: 'Widgets'
  });
};

exports.show = function(req, res) {
  var widgetId = req.params.widget;
  var dataFile =  path.join(__dirname, '..', 'static', 'widgets', widgetId, 'index.json');
  var exampleFile =  path.join(__dirname, '..', 'static', 'widgets', widgetId, 'tutorial.html');

  var widget = require(dataFile);
  fs.readFile(exampleFile, function (err, data) {
    if (err) throw err;
    widget.exampleHtml = data;
    widget['thumbnailUrl'] = '/widgets/' + widgetId + '/' + widgetId + '.png';
    widget['bannerUrl'] = '/widgets/' + widgetId + '/banner.png';
    widget['exampleUrl'] = '/widgets/' + widgetId + '/example.html';
    widget['url'] = '/widgets/' + widgetId + '/';
    res.render('cts/widgets/show', widget);
  });

};
