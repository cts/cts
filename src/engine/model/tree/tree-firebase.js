// Constructor
// -----------
CTS.Tree.Firebase = function(forrest, spec) {
  this.forrest = forrest;
  this.spec = spec;
  this.root = null;
  this.insertionListener = null;
};

// Instance Methods
// ----------------
CTS.Fn.extend(CTS.Tree.Firebase.prototype, CTS.Tree.Base, {
  setRoot: function(node) {
    this.root = node;
    this.root.setProvenance(this);
  },

  nodesForSelectionSpec: function(spec) {
    CTS.Log.Info(this, "got selection spec", spec);
    return [];
  },

  listenForNodeInsertions: function(new_val) {
  }

});
