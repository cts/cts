/**
 * Grunt Configuration for Cascading Tree Sheets
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


var sources = {
  engine: [
    // base and constants to be added by next step.
    "src/common/utilities.js",
    "src/engine/prologue.js",
  
    "src/engine/util/fn.js",
  
    "src/engine/debugging/log.js",
    "src/engine/debugging/debugging.js",
    "src/engine/debugging/tree-viz.js",
  
    /* Misc */
    "src/engine/util/q.js",
    "src/engine/util/state-machine.js",
    "src/engine/util/events.js",
    "src/engine/util/utilities.js",
    "src/engine/util/gapi.js",
    "src/engine/util/gsheet.js",
  
    /* Node Containers */
    "src/engine/model/node/node.js",
    "src/engine/model/node/node-abstract.js",
    "src/engine/model/node/node-dom.js",
    "src/engine/model/node/node-glistfeedproperty.js",
    "src/engine/model/node/node-glistfeeditem.js",
    "src/engine/model/node/node-gworksheet.js",
    "src/engine/model/node/node-gspreadsheet.js",
  
    /* Relations */
    "src/engine/model/relation/relation-spec.js",
    "src/engine/model/relation/relation.js",
    "src/engine/model/relation/is.js",
    "src/engine/model/relation/are.js",
    "src/engine/model/relation/ifexist.js",
    "src/engine/model/relation/ifnexist.js",
    "src/engine/model/relation/graft.js",
   
    /* Tree Model */
    "src/engine/model/tree/tree.js",
    "src/engine/model/tree/tree-spec.js",
    "src/engine/model/tree/tree-dom.js",
    "src/engine/model/tree/tree-gspreadsheet.js",
    "src/engine/model/forrest-spec.js",
    "src/engine/model/forrest.js",
    "src/engine/model/selection-spec.js",
    "src/engine/model/selection.js",
    "src/engine/model/dependency-spec.js",
   
    /* For creating async stuff */
    "src/engine/model/factory.js",
  
    /* Parser */
    "src/engine/parser/parser.js",
    "src/engine/parser/parser-json.js",
    "src/engine/parser/parser-cts.js",
    "src/engine/parser/parser-cts-impl.js",
    "src/engine/parser/html.js",
  
    "src/engine/engine.js",
    "src/engine/epilogue.js",
  
    /* Xtras */
    "src/engine/xtras/xtras.js",
    "src/engine/xtras/color-tree.js",
  ],
  ui: [
    "src/ui/fragments/prefix.js",
    "src/ui/util/utilities.js",
    "src/lib/alertify.js",
    "src/lib/jquery.fileDownload.js",
    "src/ui/switchboard.js",
    "src/ui/sidebar/tray.js",
    "src/ui/widgets/card.js",
    "src/ui/widgets/picker.js",
    "src/ui/widgets/modal.js",
    "src/ui/util/clipboard.js",
    "src/ui/sidebar/theminator.js",
    "src/ui/sidebar/scraper.js",
    "src/ui/widgets/editor.js",
    "src/ui/sidebar/theme.js",
    "src/ui/fragments/postfix.js",  
    "src/ui/fragments/autoloader.js"
  ]
};

var variants = {
  engine: {
    development: {
      additions: [
        "src/common/constants-devel.js",
        "src/common/base.js"
      ],
      output: 'release/cts.dev.js'
    },
    production: {
      additions: [
        "src/common/constants.js",
        "src/common/base.js",
        "<banner>"
      ],
      output: 'release/cts.js',
      minOutput: 'release/cts.min.js'
    }
  },
  ui: {
    development: {
      additions: [
        "src/ui/fragments/development/constants.js",
        "<banner>"
      ],
      output: 'release/cts-ui.dev.js',
      less: {
        options: {
          paths: ["mockups/css"]
        },
        files: {
          "release/widgets/cts-ui/css/theminator.css": "src/ui/mockups/less/theminator.less",
          "release/widgets/cts-ui/css/tray.css": "src/ui/mockups/less/tray.less",
          "release/widgets/cts-ui/css/editor.css": "src/ui/mockups/less/editor.less"
        }
      }
    },
    production: {
      additions: [
        "src/ui/fragments/production/constants.js",
        "<banner>"
      ],
      output: 'release/cts-ui.js',
      minOutput: 'release/cts-ui.min.js',
      less: {
        options: {
          paths: ["mockups/css"],
          yuicompress: true
        },
        files: {
          "release/widgets/cts-ui/css/theminator.css": "src/ui/mockups/less/theminator.less",
          "release/widgets/cts-ui/css/tray.css": "src/ui/mockups/less/tray.less",
          "release/widgets/cts-ui/css/editor.css": "src/ui/mockups/less/editor.less"
        }
      }
    }
  }
}

for (var project in variants) {
  for (variant in variants[project]) {
    var sourcelist = sources[project].slice(0);
    for (var i = 0; i < variants[project][variant].additions.length; i++) {
      sourcelist.unshift(variants[project][variant].additions[i]);
    }
    variants[project][variant]['sources'] = sourcelist;
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

  // This is a simple static file server
  web_server: {
    whyisthisnecessary: 'idontknow',
    options: {
      cors: true,
      port: 3001,
      logRequests: true,
      nevercache: true
    }
  },
  lint: {
    all: ['Gruntfile.js', 'src/**/*.js']
  },

};

/*
 * Concat Task
 * -----------
 */

gruntConfig['concat'] = {};
for (var project in variants) {
  for (var variant in variants[project]) {
    var targetName = project + "_" + variant;
    gruntConfig['concat'][targetName] = {
      src: variants[project][variant].sources,
      dest: variants[project][variant].output
    }
  }
}

/*
 * Less Task
 * -----------
 */

gruntConfig['less'] = {};
for (var project in variants) {
  for (var variant in variants[project]) {
    var targetName = project + "_" + variant;
    gruntConfig['concat'][targetName] = {
      src: variants[project][variant].sources,
      dest: variants[project][variant].output
    }
  }
}



/*
 * Min Task
 * -----------
 */

gruntConfig['min'] = {};
for (var project in variants) {
  for (variant in variants[project]) {
    var targetName = project + "_" + variant;
    if (typeof variants[project][variant]['minOutput'] != 'undefined') {
      var minOut = variants[project][variant]['minOutput'];
      var minIn = variants[project][variant]['output'];
      gruntConfig['min'][minOut] = ["<banner>", minIn];
    }
  }
}

/*
 * QUint Task
 * -----------
 */

//    qunit: {
//      files: [
//        "test/index.html"
//      ]
//    },

/*
 * Watch Task
 * -----------
 */

gruntConfig['watch'] = {
  scripts: {
    files: "src/**/*.js",
    tasks: ["default"]
  }
};

module.exports = gruntConfig;
