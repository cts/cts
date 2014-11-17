/**
 * Grunt Buildfile for Cascading Tree Sheets
 */
var fs = require('fs');
var path = require('path');

var options;
if (fs.existsSync(path.join('.', 'build-options.js'))) {
  options = require('./build-options.js');
} else {
  options = require('./build-options.example.js');
}

var gruntConfig = {
  pkg: "Cascading Tree Sheets",
  meta: { banner: options.banner },
  concat: {},
  duo: {},
  projectsetup: {
    opts: {
      componentDirectory: path.resolve(options.componentDirectory),
      repoDirectory: path.resolve(options.repoDirectory)      
    }
  }
};

for (var variant in options.variants) {
  var particulars = options.variants[variant];

  gruntConfig.concat[variant] = {
    src: [
      'lib/gapi.js',
      'src/part-01-preamble.js',
      particulars.constantsFile,
      'src/part-03-constants.js',
      'src/part-04-boot.js'
    ],
    dest: path.join(options.buildMidpointDirectory, particulars.shortname + particulars.suffix)
  };

  gruntConfig.duo[variant] = {
    src: particulars.shortname + particulars.suffix,
    inputContext: path.resolve(options.buildMidpointDirectory),
    outputContext: path.resolve(options.buildOutputDirectory),
    development: particulars.duoDevelopment
  };
}

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  require('./src/build-scripts/grunt-contrib-duo')(grunt);
  require('./src/build-scripts/grunt-contrib-projectsetup')(grunt);
  grunt.initConfig(gruntConfig);

  grunt.file.mkdir( options.buildMidpointDirectory );
  grunt.file.mkdir( options.buildOutputDirectory );

  grunt.registerTask('default', ['concat', 'duo']);
  grunt.registerTask('setup', ['default', 'projectsetup']);

};
