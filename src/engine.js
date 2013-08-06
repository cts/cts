// Engine
// ==========================================================================

/*
 * Available options:
 * 
 * - autoLoadSpecs (default: true) - Should we autload specs from
 *   script and link elements
 * - forrestSpecs - optional array of forrest specs to load
 *
 */


var Engine = CTS.Engine = function(opts, args) {
  var defaults;
  this.opts = opts || {};

  if (typeof this.opts.autoLoadSpecs == 'undefined') {
    this.opts.autoLoadSpecs = true;
  }

  this._booted = Q.defer();
  this.booted = this._booted.promise;

  // The main tree.
  this.forrest = null;
  this.initialize.apply(this, args);
};

// Instance Methods
// ----------------
CTS.Fn.extend(Engine.prototype, Events, {

  initialize: function() {
  },

  /**
   * Rendering picks a primary tree. For each node in the tree, we:
   *  1: Process any *incoming* relations for its subtree.
   *  2: Process any *outgoing* tempalte operations
   *  3: 
   */
  render: function(opts) {
    var pt = this.forrest.getPrimaryTree();
    CTS.Log.Info("CTS::Engine::render called on Primary Tree", pt);
    var options = CTS.Fn.extend({}, opts);
    pt.root._processIncoming();
  },

  boot: function() {
    var self = this;
    if (typeof self.booting != 'undefined') {
      CTS.Error("Already booted / booting");
    } else {
      self.booting = true;
    }
    var uhoh = function(reason) {
      deferred.reject(uhoh);
    }

    self.loadForrest().then(
      function() {
        self.loadCts().then(
          function() {
            self.forrest.realizeDependencies().then(
              function() {
                self.forrest.realizeTrees().then(
                  function() {
                    self.forrest.realizeRelations().then(
                      function() {
                        self.render.call(self);
                        self._booted.resolve();
                      }, uhoh
                    );
                  }, uhoh
                );
              }, uhoh
            );
          }, uhoh
        );
      }, uhoh
    );

    return self.booted;
  },

  loadForrest: function() {
    var deferred = Q.defer();
    var self = this;
    if (typeof this.opts.forrest == 'undefined') {
      this.opts.forrest = {};
    }
    this.opts.forrest.engine = this;
    CTS.Factory.Forrest(this.opts.forrest).then(
      function(forrest) {
        self.forrest = forrest;
        deferred.resolve();
      },
      function(reason) {
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  },

  loadCts: function() {
    var promises = [];
    var self = this;

    if ((typeof self.forrestSpecs != 'undefined') && (self.forrestSpecs.length > 0)) {
      for (var i = 0; i < self.forrestSpecs.length; i++) {
        (function(spec) {
          var deferred = Q.defer();
          self.forrest.addSpec(spec).then(
            function() {
              deferred.resolve();
            },
            function(reason) {
              deferred.reject(reason);
            }
          );
          promises.push(deferred.promise);
        })(self.forrestSpecs[i]);
      }
    }

    if ((typeof self.autoLoadSpecs != 'undefined') && (self.autoLoadSpecs === true)) {
      Fn.each(CTS.Utilities.getTreesheetLinks(), function(block) {
        var deferred = Q.defer();
        if (block.type == 'link') {
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
              self.forrest.addSpec(spec).then(
                function() {
                  deferred.resolve(); 
                },
                function(reason) {
                  deferred.reject(reason);
                }
              );
            },
            function(reason) {
              CTS.Log.Error("Couldn't fetch string.");
              deferred.reject(reason);
            }
          );
        } else if (block.type == 'block') {
          var spec = CTS.Parser.parseForrestSpec(block.content, block.format);
          self.forrest.addSpec(spec).then(
            function() {
              deferred.resolve();
            },
            function(reason) {
              deferred.reject(reason);
            }
          );
        }
        if (typeof promises =='undefined') {
          CTS.Log.Error("PUSH UNDEF");
        }
        promises.push(deferred.promise);
      }, this);
    }
    return Q.all(promises);
  },

  // Stops all event listeners
  shutdown: function() {
    this.forrest.stopListening();
  }

});
