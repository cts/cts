// Constructor
// -----------
CTS.Tree.GSheet = function(forrest, spec) {
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
  this.root = null;
  this.nodeStash = [];
  this.insertionListener = null;
};

// Instance Methods
// ----------------
CTS.Fn.extend(CTS.Tree.Html.prototype, CTS.Tree.Base, {
  setRoot: function($$node) {
    this.root = $$node;
    this.root.setProvenance(this);
  },

  nodesForSelectionSpec: function(spec) {
  },

  listenForNodeInsertions: function(new_val) {
  }
});
 
