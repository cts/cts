var fs = require('fs')
var path = require('path')
var _ = require('underscore');

exports.index = function(req, res) {
  var p = path.join(__dirname, '..', 'views', 'cts', 'scratch');
  fs.readdir(p, function(err, files) {
    if (err) throw err;
    var scratches = files.map(function(file) {
      return file.split('.')[0];
    }).filter(function(file) {
      return file != 'index';
    }).sort(function(a, b){
      if(a < b) return -1;
      if(a > b) return 1;
      return 0;
    });

    res.render('cts/scratch/index', {scratches: scratches});
  });
};

exports.other = function(req, res) {
  var page = req.params.page;
  res.render('cts/scratch/' + String(page), {});
};

