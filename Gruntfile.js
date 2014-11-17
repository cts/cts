/**
 * Grunt Buildfile for Cascading Tree Sheets
 */

var gruntConfig = {
  pkg: "Cascading Tree Sheets",
  meta: { banner: options.banner },
  variants: variants,
  concat: {},
  duo: {}
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
    dest: 'tmp/' + particulars.shortname + particulars.suffix
  };

  gruntConfig.duo[variant] = {
    src: particulars.shortname + particulars.suffix,
    inputContext: './build-tmp',
    outputContext: './build',
    development: particulars.duoDevelopment
  };
}

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  require('./src/build-scripts/grunt-contrib-duo')(grunt);
  require('./src/build-scripts/grunt-contrib-projectsetup')(grunt);
  grunt.initConfig(gruntConfig);
  grunt.registerTask('default', ['concat', 'duo']);
};
