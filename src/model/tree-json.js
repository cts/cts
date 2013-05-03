var JsonTree = CTS.JsonTree = function(forrest, root, attributes) {
  this.root = new CTS.JsonNode(root, this);
  this.forrest = forrest;
  this.name = "json";
  if ((typeof attributes != 'undefined') && ('name' in attributes)) {
    this.name = attributes.name;
  }
};

// Instance Methods
// ----------------
_.extend(JsonTree.prototype, Tree, {

  // Creates the keypath leading up to this selector
  selectionForSelector: function(selector) {
    var jqnodes = this.root.siblings[0].find(selector.selector).toArray();
    var nodes = _.map(jqnodes, function(n) {
      return new DomNode(CTS.$(n), this);
    }, this);
    console.log("Tree", this, "nodes for selection", selector, nodes);
    return new CTS.Selection(nodes);
  }


});
