// Engine
// ==========================================================================

/*
 * Available options:
 * 
 * - autoLoadSpecs (default: true) - Should we autload specs from
 *   script and link elements
 * - forrestSpecs - optional array of forrest specs to load
 * forrest {
 *   - body: - optional jQuery node which represents the body
 * }
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

    function addSpecs(specs) {
      var promises = Fn.map(specs, function(spec) {
        return self.forrest.addSpec(spec);
      });
      return Q.all(promises);
    };

    // tuple = [raw, kind]
    function parseAndAddSpec(rawData, kind, fromUrl) {
      var deferred = Q.defer();

      CTS.Parser.parseForrestSpec(rawData, kind).then(
        function(specs) {
          if (fromUrl != 'undefined') {
            Fn.each(specs, function(spec) {
              for (i = 0; i < spec.treeSpecs.length; i++) {
                spec.treeSpecs[i].loadedFrom = fromUrl;
              }
              for (i = 0; i < spec.dependencySpecs.length; i++) {
                spec.dependencySpecs[i].loadedFrom = fromUrl;
              }
            });
          }
          addSpecs(specs).then(
            function() {
              deferred.resolve();
            },
            function(reason) {
              deferred.reject(reason);
            }
          );
        },
        function(reason) {
          deferred.reject(reason);
        }
      );
      return deferred.promise;
    };

    // Possibly add specs from the OPTS hash passed to Engine.
    if ((typeof self.opts.forrestSpecs != 'undefined') && (self.opts.forrestSpecs.length > 0)) {
      promises.push(addSpecs(self.opts.forrestSpecs));
    }

    if ((typeof self.opts.autoLoadSpecs != 'undefined') && (self.opts.autoLoadSpecs === true)) {
      Fn.each(CTS.Utilities.getTreesheetLinks(), function(block) {
        var deferred = Q.defer();
        if (block.type == 'link') {
          CTS.Utilities.fetchString(block).then(
            function(content) {
              var url = block.url;
              parseAndAddSpec(content, block.format, url).then(
                function() {
                  deferred.resolve();
                },
                function(reason) {
                  CTS.Log.Error("Could not parse and add spec", content, block);
                  deferred.resolve();
                }
              );
            },
            function(reason) {
              CTS.Log.Error("Could not fetch CTS link:", block);
              deferred.resolve();
            });
        } else if (block.type == 'block') {
          var url = window.location;
          parseAndAddSpec(block.content, block.format, url).then(
            function() {
              deferred.resolve();
            },
            function(reason) {
              CTS.Log.Error("Could not parse and add spec", content, block);
              deferred.resolve();
            }
          );
        } else {
          CTS.Log.Error("Could not load CTS: did not understand block type", block.block, block);
          deferred.resolve();
        }
        promises.push(deferred.promise);
      });
    }
    return Q.all(promises);
  },

  // Stops all event listeners
  shutdown: function() {
    this.forrest.stopListening();
  }

});
