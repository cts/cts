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
}

var variants = {
  engine: {
    development: {
      additions: [
        "src/engine/fragments/constants-debug._js",
        "src/engine/fragments/prefix._js",
        "<banner>"
      ],
      output: 'release/cts.dev.js'
    },
    production: {
      additions: [
        "src/engine/fragments/constants-production._js",
        "src/engine/fragments/prefix._js",
        "<banner>"
      ],
      output: 'release/cts.js',
      minOutput: 'release/cts.min.js'
    }
  }
}

for (var project in variants) {
  for (variant in variants[project]) {
    var sourcelist = sources[project].slice(0);
    for (var i = 0; i < variants[project][variant].additions; i++) {
      sourcelist.unshift(variants[project][variant][i]);
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

  // This is a simple static file server
  web_server: {
    whyisthisnecessary: 'idontknow',
    options: {
      cors: true,
      port: 9000,
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
  for (variant in variants[project]) {
    var targetName = project + "_" + variant;
    gruntConfig['concat'][targetName] = {
      src: variants[project][variants].sources,
      dest: variants[project][variants].output
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
