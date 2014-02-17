// Constructor
// -----------
CTS.Tree.GSpreadsheet = function(forrest, spec) {
  this.forrest = forrest;
  this.spec = spec;
  this.root = null;
  this.insertionListener = null;
};

// Instance Methods
// ----------------
CTS.Fn.extend(CTS.Tree.GSpreadsheet.prototype, CTS.Tree.Base, {
  setRoot: function(node) {
    this.root = node;
    this.root.setProvenance(this);
  },

  listenForNodeInsertions: function(new_val) {
  }
});
