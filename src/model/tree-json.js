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

  nodesForSelectionSpec: function(spec) {
    alert("unimplemented!");
    return [];
  }

});
