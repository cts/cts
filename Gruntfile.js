/**
 * Grunt Buildfile for Cascading Tree Sheets
 *
 * To be used with GruntJS <http://gruntjs.com/>
 *
 * Most Useful Targets:
 *
 *  default  -  compiles CTS and CTS-UI
 *
 *  server   -  runs the development server
 *                * watches and recompiles upon code modification
 *
 */

var gruntConfig = require('./management/grunt-config');
var serverTask  = require('./management/grunt-servertask');

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-web-server');

  // Project configuration.
  grunt.initConfig(gruntConfig);
  console.log(gruntConfig);

  grunt.task.registerTask('background_server',
     'Host AND Watch for changes.', serverTask);

  grunt.registerTask('default', ['concat']);

  grunt.registerTask('server',
      ['default', 'concat', 'background_server', 'watch']);

};
