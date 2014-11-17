var touch = require('touch');
var path = require('path');
var fs = require('fs-extra');

module.exports = function(grunt) {

  var repoPathForComponent = function() {
  };

  var remapComponentToRepo = function(component, repo) {
  };

  var setupFn = function() {
    grunt.log.ok('Linking CTS Build Dependencies to Repositories');

    var opts = this.data;
    var componentDirectory = opts.componentDirectory;
    var repoDirectory = opts.repoDirectory;    

    grunt.log.writeln('.. Looking for repos in ' + repoDirectory);

    var files = fs.readdirSync(componentDirectory);
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var parts = file.match(/(.+)@(.+)/);
      if (parts) {
        var repo = parts[1];
        var repoPath = path.join(repoDirectory, repo);

        if (fs.existsSync(repoPath)) {
          fs.removeSync(path.join(componentDirectory, file));
          fs.symlinkSync(repoPath, path.join(componentDirectory, file), 'dir');
          grunt.log.ok('Remapped ' + file + ' -> ' + repoPath);
        } else {
          grunt.log.writeln('!! Did not remap ' + file);
        }
      }
    }
  }
  grunt.registerMultiTask('projectsetup', 'Sets up project', setupFn);
};