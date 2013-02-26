// Constructor
// -----------
var DomTree = CTS.DomTree = function(forrest, node, attributes) {
  this.root = node || new CTS.DomNode(CTS.$('body'), this);
  this.forrest = forrest;
  this.name = "body";
  if ((typeof attributes != 'undefined') && ('name' in attributes)) {
    this.name = attributes.name;
  }
};

// Instance Methods
// ----------------
_.extend(DomTree.prototype, Tree, {
  nodesForSelection: function(selection) {
    var jqnodes = this.root.node.find(selection.selector).toArray();
    var nodes = _.map(jqnodes, function(n) {
      return new DomNode(CTS.$(n), this);
    }, this);
    console.log("Tree", this, "nodes for selection", selection, nodes);
    return nodes;
  }
});
