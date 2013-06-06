// Constructor
// -----------
var JsonTree = CTS.JsonTree = function(forrest, root, spec) {
  this.root = new CTS.JsonNode(root, this);
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
};

// Instance Methods
// ----------------
_.extend(JsonTree.prototype, Tree, {
  nodesForSelectionSpec: function(spec) {
    CTS.Log.Fatal("JsonTree::nodesForSelectionSpec - Unimplemented!");
    return [];
  }
});
