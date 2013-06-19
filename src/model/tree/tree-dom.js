// Constructor
// -----------
var DomTree = CTS.DomTree = function(forrest, node, spec) {
  CTS.Log.Info("DomTree::Constructor", [forrest, node]);
  this.root = new CTS.DomNode(node, this);
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
  this.root.realizeChildren();
};

// Instance Methods
// ----------------
CTS.Fn.extend(DomTree.prototype, Tree, {
  nodesForSelectionSpec: function(spec) {
    if (spec.inline) {
      console.log("Nodes for inline spec", this.inlineObject);
      return [spec.inlineObject];
    } else {
      console.log("nodes for selector string spec");
      return this.root.find(spec.selectorString);
    }
  }

});
