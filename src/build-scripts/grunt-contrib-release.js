var touch = require('touch');
var path = require('path');
var fs = require('fs-extra');

module.exports = function(grunt) {

  var releaseFn = function() {
    var target = this.target;
    var data = this.data;
    var src = data.src;
    var from = path.resolve(__dirname, '..', '..', 'build', 'build', src);
    var to = path.resolve(__dirname, '..', '..', '..', 'cloudstitch', 'website', 'static', 'release', src);
    fs.copySync(from, to);
    grunt.log.ok('Copying ', from, ' to ', to);
  }

  grunt.registerMultiTask('release', 'Copies JS files to Cloudstitch', releaseFn);
};