var DomSelector = CTS.DomSelector = function(selector) {
  this.treeName = null;
  this.treeType = null;
  this.originalString = null;
  this._selection = null;
  this.selector = selector;
  this.inline = false;
  this.inlineNode = null;
};

_.extend(DomSelector.prototype, Selector, {
  matches: function(node) {
    console.log("DomSelector::Matches ", node, this.inlineNode, node == this.inlineNode, this.originalString);
    if (this.inline) {
      console.log("DomSelector::matches inline!", this.inlineNode, node);
      return (this.inlineNode == node);
    } else {
      var res = ((this.treeName == node.tree.name) && (node.node.is(this.selector)));
    console.log("DomSelector::matches tree", this.treeName, " / ", node.tree.name, " selector ", this.selector, " / ", node.node.is(this.selector), "res", res);
    return res;
    }
  },

  toSelection: function(forrest) {
    console.log("DomSelector::toSelection", this.originalString);
    if (this.inline === true) {
      if (this.inlineNode === null) {
        return new CTS.Selection();
      } else {
        return new CTS.Selection([this.inlineNode]);
      }
    } else {
      if (this._selection === null) {
        // First time; compute.
        this._selection = forrest.selectionForSelector(this);
      }
      return this._selection;
    }
  }
});
