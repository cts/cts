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

  nodesForSelectionSpec: function(spec) {
    if (spec.inline) {
      return [spec.inlineObject];
    } else {
      // This passes in the SPEC rather than the selector.
      var results = this.root.find(spec);
      return results;
    }
  },

  listenForNodeInsertions: function(new_val) {
  }

});
