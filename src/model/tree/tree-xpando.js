/* Like a JSON tree but any CTS rules CREATE the keypath upon resolution.
 */
CTS.Tree.Xpando = function(forrest, attributes) {
  this.forrest = forrest;
  this.root = {};
};

// Instance Methods
// ----------------
CTS.Fn.extend(CTS.Tree.Xpando, CTS.Tree.Base, {

  nodesForSelectionSpec: function(spec) {
    alert("unimplemented!");
    return [];
  }


});
