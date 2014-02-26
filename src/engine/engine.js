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
  this.bootStage = "PreBoot";

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
    console.log("CTS engine booting...");
    this.bootStage = "Booting";
    var self = this;
    if (typeof self.booting != 'undefined') {
      CTS.Error("Already booted / booting");
    } else {
      self.booting = true;
    }
    var uhoh = function(reason) {
      CTS.Error(uhoh);
      deferred.reject(uhoh);
    }

    self.bootStage = "Loading Forrest";
    self.loadForrest().then(
      function() {
        self.bootStage = "Loading CTS";
        self.loadCts().then(
          function() {
            self.bootStage = "Realizing Dependencies";
            self.forrest.realizeDependencies().then(
              function() {
                self.bootStage = "Realize Trees";
                console.log("realizing trees");
                self.forrest.realizeTrees().then(
                  function() {
                    self.bootStage = "Realize Relations";
                    self.forrest.realizeRelations().then(
                      function() {
                        console.log("CTS Resources Loaded. Rendering.");
                        self.bootStage = "Render";
                        self.render.call(self);
                        self.bootStage = "Finalizing Boot";
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
        console.log("Resolved forrest");
        deferred.resolve();
      },
      function(reason) {
        CTS.Log.Error(reason);
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  },

  loadCts: function() {
    var promises = [];
    var self = this;

    // Possibly add specs from the OPTS hash passed to Engine.
    if ((typeof self.opts.forrestSpecs != 'undefined') && (self.opts.forrestSpecs.length > 0)) {
      promises.push(self.forrest.addSpecs(self.opts.forrestSpecs));
    }

    if ((typeof self.opts.autoLoadSpecs != 'undefined') && (self.opts.autoLoadSpecs === true)) {
      var links = CTS.Util.getTreesheetLinks();
      var ps = self.forrest.parseAndAddSpecsFromLinks(links);
      for (var i = 0; i < ps.length; i++) {
        promises.push(ps[i]);
      }
    }
    return Q.all(promises);
  },

  // Stops all event listeners
  shutdown: function() {
    this.forrest.stopListening();
  }

});
