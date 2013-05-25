/* Like a JSON tree but any CTS rules CREATE the keypath upon resolution.
 */
var ScraperTree = CTS.ScraperTree = function(forrest, attributes) {
  this.forrest = forrest;
  this.root = {};
};

// Instance Methods
// ----------------
_.extend(JsonTree.prototype, Tree, {

  nodesForSelectionSpec: function(spec) {
    alert("unimplemented!");
    return [];
  }


});
