var JsonTree = CTS.JsonTree = function(forrest, json, attributes) {
  this.forrest = forrest;
  this.root = json || window;
};

// Instance Methods
// ----------------
_.extend(JsonTree.prototype, Tree, {

});
