// Constructor
// -----------
CTS.Tree.Html = function(forrest, node, spec) {
  CTS.Log.Info("DomTree::Constructor", [forrest, node]);
  this.root = new CTS.Node.Html(node, this);
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
  this.root.realizeChildren();
};

// Instance Methods
// ----------------
CTS.Fn.extend(CTS.Tree.Html.prototype, CTS.Tree.Base, {
  nodesForSelectionSpec: function(spec) {
    console.log("nodes for: " + spec.selectorString);
    if (spec.inline) {
      console.log("Nodes for inline spec", this.inlineObject);
      return [spec.inlineObject];
    } else {
      console.log("nodes for selector string spec");
      var results = this.root.find(spec.selectorString);
      if (results.length == 0) {
        console.log(this.name, spec.selectorString);
        console.log(this.root.value.html());
      }
      return results;
    }
  }

});
