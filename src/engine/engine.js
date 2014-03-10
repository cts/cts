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
    CTS.Log.Info("Engine: Starting Boot");
    this.bootStage = "Booting";
    var self = this;
    if (typeof self.booting != 'undefined') {
      CTS.Error("Already booted / booting");
    } else {
      self.booting = true;
    }
    self.bootStage = "Loading Forrest";
    self.loadForrest().then(function() {
      CTS.Log.Info("Engine: Loaded Forrest");
      self.bootStage = "Loading CTS";
      return self.loadCts();
    }).then(function() {
      CTS.Log.Info("Engine: Loaded CTS");
      self.bootStage = "Realizing Dependencies";
      return self.forrest.realizeDependencies();
    }).then(function() {
      CTS.Log.Info("Engine: Realized Dependencies");
      self.bootStage = "Realize Trees";
      return self.forrest.realizeTrees();
    }).then(function() {
      CTS.Log.Info("Engine: Realized Trees");
      self.bootStage = "Realize Relations";
      return Q.fcall(function() {
        self.forrest.realizeRelations()
      });
    }).then(function() {
      CTS.Log.Info("Engine: CTS Realized Relations. Starting Render.");
      self.bootStage = "Render";
      self.render.call(self);
      self.bootStage = "Finalizing Boot";
      self._booted.resolve();
      return Q.fcall(function() { return true; });
    }).fail(function(error) {
      CTS.Log.Error("Boot stage failed.", error);
      self._booted.reject(error);
    }).done();
    return self.booted;
  },

  loadForrest: function() {
    var self = this;
    if (typeof this.opts.forrest == 'undefined') {
      this.opts.forrest = {};
    }
    this.opts.forrest.engine = this;
    return CTS.Factory.Forrest(this.opts.forrest).then(
      function(forrest) {
        self.forrest = forrest;
        CTS.Log.Info("Engine: Resolved forrest.");
      }
    );
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
