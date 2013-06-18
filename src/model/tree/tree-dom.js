// Constructor
// -----------
var DomTree = CTS.DomTree = function(forrest, node, spec) {
  CTS.Log.Info("DomTree::Constructor", [forrest, node]);
  this.root = new CTS.DomNode(node, this);
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
};

// Instance Methods
// ----------------
CTS.Fn.extend(DomTree.prototype, Tree, {
  nodesForSelectionSpec: function(spec) {
    if (spec.inline) {
      return [this.inlineObject];
    } else {
      // Assumption: root can't be a sibling group
      var jqnodes = this.root.find(spec.selectorString).toArray();
      var nodes = CTS.Fn.map(jqnodes, function(n) {
        return new DomNode(CTS.$(n), this);
      }, this);
      return nodes;
    }
  }
});
