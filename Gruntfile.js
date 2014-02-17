

/**
 * Grunt Buildfile for Cascading Tree Sheets
 *
 * To be used with GruntJS <http://gruntjs.com/>
 */

ctsjs_sourcelist = [
  "src/cts/preamble.js",

  "src/cts/util/fn.js",

  "src/cts/debugging/log.js",
  "src/cts/debugging/debugging.js",
  "src/cts/debugging/tree-viz.js",

  /* Misc */
  "src/cts/util/q.js",
  "src/cts/util/state-machine.js",
  "src/cts/util/events.js",
  "src/cts/util/utilities.js",
  "src/cts/util/gapi.js",
  "src/cts/util/gsheet.js",

  /* Node Containers */
  "src/cts/model/node/node.js",
  "src/cts/model/node/node-abstract.js",
  "src/cts/model/node/node-dom.js",
  "src/cts/model/node/node-glistfeedproperty.js",
  "src/cts/model/node/node-glistfeeditem.js",
  "src/cts/model/node/node-gworksheet.js",
  "src/cts/model/node/node-gspreadsheet.js",

  /* Relations */
  "src/cts/model/relation/relation-spec.js",
  "src/cts/model/relation/relation.js",
  "src/cts/model/relation/is.js",
  "src/cts/model/relation/are.js",
  "src/cts/model/relation/ifexist.js",
  "src/cts/model/relation/ifnexist.js",
  "src/cts/model/relation/graft.js",
 
  /* Tree Model */
  "src/cts/model/tree/tree.js",
  "src/cts/model/tree/tree-spec.js",
  "src/cts/model/tree/tree-dom.js",
  "src/cts/model/tree/tree-gspreadsheet.js",
  "src/cts/model/forrest-spec.js",
  "src/cts/model/forrest.js",
  "src/cts/model/selection-spec.js",
  "src/cts/model/selection.js",
  "src/cts/model/dependency-spec.js",
 
  /* For creating async stuff */
  "src/cts/model/factory.js",

  /* Parser */
  "src/cts/parser/parser.js",
  "src/cts/parser/parser-json.js",
  "src/cts/parser/parser-cts.js",
  "src/cts/parser/parser-cts-impl.js",
  "src/cts/parser/html.js",

  "src/cts/engine.js",
  "src/cts/autoloader.js",

  /* Xtras */
  "src/cts/xtras/xtras.js",
  "src/cts/xtras/color-tree.js",

  "src/cts/fragments/postfix._js"
];

var devSourceList = ctsjs_sourcelist.slice(0);
var prodSourceList = ctsjs_sourcelist.slice(0);

devSourceList.unshift('src/fragments/constants-debug._js');
devSourceList.unshift('src/fragments/prefix._js');
devSourceList.unshift('<banner>');
devSourceOut = 'release/cts.dev.js';

prodSourceList.unshift('src/fragments/constants-production._js');
prodSourceList.unshift('src/fragments/prefix._js');
prodSourceList.unshift('<banner>');
prodSourceOut = 'release/cts.js';

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-web-server');

  // Project configuration.
  grunt.initConfig({
    pkg: "<json:package.json>",
    meta: {
      banner: "/**\n" +
              "* <%= pkg.name %>\n" +
              " * <%= pkg.description %>\n" +
              " *\n" +
              " * @author <%= pkg.author.name %> <<%= pkg.author.email %>>\n" +
              " * @copyright <%= pkg.author.name %> <%= grunt.template.today('yyyy') %>\n" +
              " * @license <%= pkg.licenses[0].type %> <<%= pkg.licenses[0].url %>>\n" +
              " * @link <%= pkg.homepage %>\n" +
              " * @module <%= pkg.name %>\n" +
              " * @version <%= pkg.version %>\n" +
              " */"
    },
    web_server: {
      whyisthisnecessary: 'idontknow',
      options: {
        cors: true,
        port: 9000,
        logRequests: true,
        nevercache: true
      }
    },
    concat: {
      dev: {
        src: devSourceList,
        dest: devSourceOut
      },
      prod: {
        src: prodSourceList,
        dest: prodSourceOut
      }
    },
    lint: {
      all: ['grunt.js', 'src/**/*.js']
    },
    min: {
      "release/cts.min.js": ["<banner>", "release/cts.js"]
    },
    qunit: {
      files: [
        "test/index.html"
      ]
    },
    watch: {
      scripts: {
        files: "src/**/*.js",
        tasks: ["default"]
      }
    },
    jshint: {
      options: {
        browser: true
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'concat']);

  grunt.task.registerTask('background_server', 'Host AND Watch for changes.', function(arg1, arg2) {
    var child_process = require('child_process');
    var child = child_process.exec('grunt web_server');
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });

  grunt.registerTask('server', ['default', 'jshint', 'concat', 'background_server', 'watch']);

};
