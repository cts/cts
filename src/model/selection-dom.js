var DomSelection = CTS.DomSelection = function(selector) {
  this.treeName = null;
  this.treeType = null;
  this.originalString = null;
  this._nodes = null;
  this.selector = selector;
};

_.extend(DomSelection.prototype, Selection, {
  matches: function(node) {
    console.log("this treename", this.treeName, "node", node.tree.name);
    console.log("node is <", this.selector, ">", node.node.is(this.selector));
    return (
      (this.treeName == node.tree.name) &&
      (node.node.is(this.selector)));
  },

  nodes: function(forrest) {
    if (this._nodes === null) {
      // First time; compute.
      this._nodes = forrest.nodesForSelection(this);
    }
    return this._nodes;
  }
});
