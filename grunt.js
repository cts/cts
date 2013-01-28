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
          "src/cts.js"
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
  grunt.registerTask('default', 'lint qunit concat min');
};
