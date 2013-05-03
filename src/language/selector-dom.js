var DomSelector = CTS.DomSelector = function(selector) {
  this.treeName = null;
  this.treeType = null;
  this.originalString = null;
  this._selection = null;
  this.selector = selector;
  this.inline = false;
  this.inlineNode = null;
  this._kind = "dom";
};

_.extend(DomSelector.prototype, Selector, {


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
