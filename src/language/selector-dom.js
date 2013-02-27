var DomSelector = CTS.DomSelector = function(selector) {
  this.treeName = null;
  this.treeType = null;
  this.originalString = null;
  this._selection = null;
  this.selector = selector;
};

_.extend(DomSelector.prototype, Selector, {
  matches: function(node) {
    console.log("this treename", this.treeName, "node", node.tree.name);
    console.log("node is <", this.selector, ">", node.node.is(this.selector));
    return (
      (this.treeName == node.tree.name) &&
      (node.node.is(this.selector)));
  },

  toSelection: function(forrest) {
    if (this._selection === null) {
      // First time; compute.
      this._selection = forrest.selectionForSelector(this);
    }
    return this._selection;
  }
});
