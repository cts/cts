/**
 * Grunt Buildfile for Cascading Tree Sheets
 *
 * To be used with GruntJS <http://gruntjs.com/>
 *
 * Most Useful Targets:
 *
 *   engine  -  compiles the CTS engine:
 *                * release/cts.js
 *                * release/cts.dev.js
 *
 *   ui      -  compiles the CTS UI widget:
 *                * release/ctsui.js
 *                * release/ctsui.dev.js
 *
 *  server   -  runs the development server
 *                * watches and recompiles upon code modification
 *
 */

var gruntConfig = require('./management/grunt-config');
var serverTask  = require('./management/grunt-servertask');

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-web-server');

  // Project configuration.
  grunt.initConfig(gruntConfig);

  grunt.registerTask('default',
      ['jshint', 'concat']);

  grunt.task.registerTask('background_server',
     'Host AND Watch for changes.', serverTask);

  grunt.registerTask('server',
      ['default', 'jshint', 'concat', 'background_server', 'watch']);
};
