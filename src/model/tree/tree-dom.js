// Constructor
// -----------
CTS.Tree.Html = function(forrest, node, spec) {
  CTS.Log.Info("DomTree::Constructor", [forrest, node]);
  this._nodeLookup = {};
  this.root = new CTS.Node.Html(node, this);
  this._nodeLookup[root.ctsId] = root;
  this.root.setProvenance(this);
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
  this.root.realizeChildren();

  // Listen for DOMNodeInserted events in the DOM tree, and spread
  // propagation of that event into the CTS tree
  var self = this;
  this.root.value.on("DOMNodeInserted", function(evt) {
    self.root.trigger("DOMNodeInserted", evt);
  });
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
  },

  getCtsNode: function(jqNode) {
    var ctsId = jqNode.attr('data-ctsId');
    if ((ctsId == null) || (typeof ctsId == 'undefined')) {
      return null;
    } else if ((typeof this._nodeLookup[ctsId] == 'undefined') ||
               (this._nodeLookup[ctsId] == null)) {
      return null;
    } else {
      return this._nodeLookup[ctsId];
    }
  }

});
