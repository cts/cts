/**
 * Grunt Buildfile for Cascading Tree Sheets
 *
 * To be used with GruntJS <http://gruntjs.com/>
 *
 * Most Useful Targets:
 *
 *  default  -  compiles CTS and CTS-UI
 *
 *  server   -  * Runs server on :3000
 *              * Runs file server on :3001
 *              * Watches and recompiles upon file change
 *
 */

var serverTask  = require('./grunt-servertask');

var path = require('path');
var fs = require('fs');
var ASSETNAME = 'cts';

var variants = {
  ui: {
    development: {
      less: {
        options: {
          paths: ["mockups/css"]
        },
        files: {}
      }
    },
    production: {
      less: {
        options: {
          paths: ["mockups/css"],
          yuicompress: true
        },
        files: {}
      }
    }
  }
}

// For each file in website/static/widgets/ctsui/less, map it to same in css.
var p = path.join(__dirname, 'website', 'static', 'widgets', 'ctsui', 'less');
var files = fs.readdirSync(p);
for (var i = 0; i < files.length; i++) {
  var file = files[i];
  var parts = file.split('.');
  if (parts[parts.length - 1] == 'less') {
    var css = file.split('.');
    css[css.length - 1] = 'css';
    css = css.join('.');
    var prefix = path.join('website', 'static', 'widgets', 'ctsui');
    var lessFile = path.join(prefix, 'less', file);
    var cssFile = path.join(prefix, 'css', css);
    variants.ui.development.less.files[cssFile] = lessFile;
    variants.ui.production.less.files[cssFile] = lessFile;
  }
}

/*
 * Calculate options to pass to grunt tasks.
 ****************************************************************************/

function banner(opts) {
  return "/**\n" +
         "* Cascading Tree Sheets\n" +
         " *\n" +
         " * @author Edward Benson <eob@csail.mit.edu> \n" +
         " * @copyright Edward Benson 2014 %>\n" +
         " * @license MIT License\n" +
         " * @link http://www.treesheets.org\n" +
         " */"
}

var gruntConfig = {
  pkg: "Cascading Tree Sheets",
  meta: { banner: banner() },
  variants: variants,

  concat: {
    development: {
      src: [
        'lib/gapi.js',
        'src/part-01-preamble.js',
        'src/part-02.dev.js',
        'src/part-03-constants.js',
        'src/part-04-boot.js'
      ],
      dest: 'tmp/' + ASSETNAME + '.dev.js'
    },
    production: {
      src: [
        'lib/gapi.js',
        'src/part-01-preamble.js',
        'src/part-02.prod.js',
        'src/part-03-constants.js',
        'src/part-04-boot.js'
      ],
      dest: 'tmp/' + ASSETNAME + '.js'
    }
  },
  duo: {
    development: {
      src: ASSETNAME + '.dev.js',
      inputContext: path.join(__dirname, 'tmp'),
      outputContext: path.join(__dirname, '..', 'release'),
      development: true
    },
    production: {
      src: ASSETNAME + '.js',
      inputContext: path.join(__dirname, 'tmp'),
      outputContext: path.join(__dirname, 'release')
    }    
  },
  copy: {
    cts: {
      files: [
        {expand: true, cwd: 'release', src: [ASSETNAME + '*'], dest: 'website/static/release/', filter: 'isFile'}
      ]
    }
  },


  // This is a simple static file server
  web_server: {
    whyisthisnecessary: 'idontknow',
    options: {
      cors: true,
      port: 3001,
      logRequests: true,
      nevercache: true
    }
  }

};

/*
 * Less Task
 * -----------
 */

gruntConfig['less'] = {};
for (var project in variants) {
  for (var variant in variants[project]) {
    if (typeof variants[project][variant].less != 'undefined') {
      var targetName = project + "_" + variant;
      gruntConfig['less'][targetName] = variants[project][variant].less
    }
  }
}

// Now we add the website stuff into the less task.
gruntConfig['less']['webserver'] = {
  options: {
  },
  files: {
    "website/static/css/gen/styles.css": "website/assets/css/styles.less"
  }
}

/*
 * Watch Task
 * -----------
 */

gruntConfig['watch'] = {
  scripts: {
    files: "src/**/*.js",
    tasks: ["default"]
  },
  less: {
    files: "website/static/widgets/ctsui/less/*.less",
    tasks: ["less"]
  }
};



module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-web-server');
  grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.task.registerTask('background_server',
     'Host AND Watch for changes.', serverTask);
  grunt.registerTask('server',
      ['default', 'concat', 'background_server', 'watch']);


  // Load duo task
  require('./grunt-contrib-duo')(grunt);

  // Project configuration.
  grunt.initConfig(gruntConfig);

  // grunt.task.registerTask('background_server',
  //    'Host AND Watch for changes.', serverTask);

  grunt.registerTask('default', ['concat', 'duo', 'copy']);

  // grunt.registerTask('server',
  //     ['default', 'concat', 'background_server', 'watch']);
};
