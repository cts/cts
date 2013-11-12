

/**
 * Grunt Buildfile for Cascading Tree Sheets
 *
 * To be used with GruntJS <http://gruntjs.com/>
 */

sourcelist = [
  "src/preamble.js",

  "src/util/fn.js",

  "src/debugging/log.js",
  "src/debugging/debugging.js",
  "src/debugging/tree-viz.js",

  /* Misc */
  "src/util/q.js",
  "src/util/state-machine.js",
  "src/util/events.js",
  "src/util/utilities.js",

  /* Node Containers */
  "src/model/node/node.js",
  "src/model/node/node-state-machine.js",
  "src/model/node/node-abstract.js",
  "src/model/node/node-dom.js",
  "src/model/node/node-json.js",

  /* Relations */
  "src/model/relation/relation-spec.js",
  "src/model/relation/relation.js",
  "src/model/relation/is.js",
  "src/model/relation/are.js",
  "src/model/relation/ifexist.js",
  "src/model/relation/ifnexist.js",
  "src/model/relation/graft.js",
 
  /* Tree Model */
  "src/model/tree/tree.js",
  "src/model/tree/tree-spec.js",
  "src/model/tree/tree-dom.js",
  "src/model/tree/tree-json.js",
  "src/model/tree/tree-xpando.js",
  "src/model/forrest-spec.js",
  "src/model/forrest.js",
  "src/model/selection-spec.js",
  "src/model/selection.js",
  "src/model/dependency-spec.js",
 
  /* For creating async stuff */
  "src/model/factory.js",

  /* Parser */
  "src/parser/parser.js",
  "src/parser/parser-json.js",
  "src/parser/parser-cts.js",
  "src/parser/parser-cts-impl.js",
  "src/parser/html.js",
  //"autogen/cts2-parser.js",
  //"src/fragments/postparser._js",

  "src/engine.js",
  "src/autoloader.js",

  /* Xtras */
  "src/xtras/xtras.js",
  "src/xtras/color-tree.js",

  "src/fragments/postfix._js"
];

var devSourceList = sourcelist.slice(0);
var prodSourceList = sourcelist.slice(0);

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
        files: "<config:lint.files>",
        tasks: "default"
      }
    },
    jshint: {
      options: {
        browser: true
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'concat']);

};
