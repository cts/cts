/**
 * Grunt Buildfile for Cascading Tree Sheets
 *
 * To be used with GruntJS <http://gruntjs.com/>
 */
module.exports = function(grunt) {
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
    concat: {
      dist : {
        src : [
          "<banner>",
          "src/fragments/prefix._js",
          "src/preamble.js",
          "src/util/state-machine.js",
          "src/util/events.js",
          "src/language/rule.js",
          "src/language/selector.js",
          "src/language/selector-dom.js",
          "src/language/rule-parser.js",
          "src/model/node.js",
          "src/model/node-dom.js",
          "src/model/relation.js",
          "src/model/selection.js",
          "src/model/tree.js",
          "src/model/tree-dom.js",
          "src/model/tree-json.js",
          "src/model/forrest.js",
          "src/model/selection.js",
          "src/model/selection-dom.js",
          "src/model/rule.js",
          "src/parser/relation-parser.js",
          "src/engine.js",
          "src/debugging/debugging.js",
          "src/debugging/tree-viz.js",
          "src/fragments/postfix._js"
        ],
        dest : "release/cts.js"
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

  // Default task.
  grunt.registerTask('default', 'lint concat min');
};
