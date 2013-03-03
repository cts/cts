// Constructor
// -----------
var DomTree = CTS.DomTree = function(forrest, node, attributes) {
  console.log("DomTree::constructor", forrest, node);
  this.root = node || new CTS.DomNode('body', this);
  this.forrest = forrest;
  this.name = "body";
  if ((typeof attributes != 'undefined') && ('name' in attributes)) {
    this.name = attributes.name;
  }
};

// Instance Methods
// ----------------
_.extend(DomTree.prototype, Tree, {
  selectionForSelector: function(selector) {
    // Assumption: root can't be a sibling group
    var jqnodes = this.root.siblings[0].find(selector.selector).toArray();
    var nodes = _.map(jqnodes, function(n) {
      return new DomNode(CTS.$(n), this);
    }, this);
    console.log("Tree", this, "nodes for selection", selector, nodes);
    return new CTS.Selection(nodes);
  }
});
