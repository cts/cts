// Constructor
// -----------
var DomTree = CTS.DomTree = function(forrest, node, spec) {
  CTS.Log.Info("DomTree::Constructor", [forrest, node]);
  this.root = new CTS.DomNode(node);
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
};

// Instance Methods
// ----------------
_.extend(DomTree.prototype, Tree, {
  nodesForSelectionSpec: function(spec) {
    // Assumption: root can't be a sibling group
    var jqnodes = this.root.siblings[0].find(spec.selectorString).toArray();
    var nodes = _.map(jqnodes, function(n) {
      return new DomNode(CTS.$(n), this);
    }, this);
    return nodes;
  }
});
