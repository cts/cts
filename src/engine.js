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
CTS.Fn.extend(Engine.prototype, Events, StateMachine, Bootstrapper, {

  initialize: function() {
    this.forrest = new CTS.Forrest();
  },

  /**
   * Rendering picks a primary tree. For each node in the tree, we:
   *  1: Process any *incoming* relations for its subtree.
   *  2: Process any *outgoing* tempalte operations
   *  3: 
   */
  render: function(opts) {
    console.log(pt);
    var pt = this.forrest.getPrimaryTree();
    var options = CTS.Fn.extend({}, opts);
    pt.root._processIncoming();
    //pt.render(options);
  },

  ingestRules: function(rules) {
    this.forrest.ingestRules(rules);
  },

});
