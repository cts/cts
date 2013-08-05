// Constructor
// -----------
CTS.Tree.Html = function(forrest, node, spec) {
  CTS.Log.Info("DomTree::Constructor", [forrest, node]);
  this._nodeLookup = {};
  this.root = node;
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
    if (spec.inline) {
      return [spec.inlineObject];
    } else {
      var results = this.root.find(spec.selectorString);
      return results;
    }
  },

  getCtsNode: function(jqNode) {
    var ctsId = jqNode.attr('data-ctsid');
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
