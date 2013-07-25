// Engine
// ==========================================================================

// Constructor
// -----------
var Engine = CTS.Engine = function(opts, args) {
  var defaults;
  this.opts = opts || {};

  // The main tree.
  this.forrest = null;

  this.initialize.apply(this, args);
};

// Instance Methods
// ----------------
CTS.Fn.extend(Engine.prototype, Events, {

  initialize: function() {
    this.forrest = new CTS.Forrest(this.opts.forrest);
  },

  /**
   * Rendering picks a primary tree. For each node in the tree, we:
   *  1: Process any *incoming* relations for its subtree.
   *  2: Process any *outgoing* tempalte operations
   *  3: 
   */
  render: function(opts) {
    var pt = this.forrest.getPrimaryTree();
    console.log("rendering primary tree", pt);
    var options = CTS.Fn.extend({}, opts);
    pt.root._processIncoming();
    //pt.render(options);
  },

  boot: function() {
    var self = this;
    var ctsLoaded = this.loadCts();
    var treesLoaded = ctsLoaded.then(
      function() {
        self.forrest.realizeDependencies();
        self.forrest.realizeTrees().then(
          function() {
            self.forrest.realizeRelations();
            self.render();
          },
          function(err) {
            CTS.Log.Error("Couldn't load trees", err);
          }
        ).done();
      },
      function(err) {
        CTS.Log.Error("Couldn't load CTS.", err);
      }
    ).done();

    //    self.loadCts()
//      .then(function() {
//        self.forrest.realizeTrees().then(function() {
//          alert("realized " + this.forrest.trees.length);
//          self.forrest.realizeRelations();
//          self.render();
//        });
//      });
  },

  loadCts: function() {
    var promises = [];
    var self = this;
    Fn.each(Utilities.getTreesheetLinks(), function(block) {
      if (block.type == 'link') {
        var deferred = Q.defer();
        CTS.Utilities.fetchString(block).then(
          function(content) { 
            var spec = CTS.Parser.parseForrestSpec(content, block.format);
            var i;
            for (i = 0; i < spec.treeSpecs.length; i++) {
              spec.treeSpecs[i].loadedFrom = block.url;
            }
            for (i = 0; i < spec.dependencySpecs.length; i++) {
              spec.dependencySpecs[i].loadedFrom = block.url;
            }
            self.forrest.addSpec(spec);
            deferred.resolve(); 
          },
          function() {
            CTS.Log.Error("Couldn't fetch string.");
            deferred.reject();
          }
        );
        promises.push(deferred.promise);
      } else if (block.type == 'block') {
        var spec = CTS.Parser.parseForrestSpec(block.content, block.format);
        self.forrest.addSpec(spec);
      }
    }, this);
    return Q.all(promises);
  },

  onDomNodeInserted: function {
  }

});
