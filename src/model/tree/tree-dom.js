// Constructor
// -----------
CTS.Tree.Html = function(forrest, spec) {
  this._nodeLookup = {};
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
  this.root = null;
};

// Instance Methods
// ----------------
CTS.Fn.extend(CTS.Tree.Html.prototype, CTS.Tree.Base, {
  setRoot: function(node) {
    this.root = node;
    this._nodeLookup[root.ctsId] = root;
    this.root.setProvenance(this);
    
    // Propagate insertion events from HTML -> CTS Node
    var self = this;
    this.root.value.on("DOMNodeInserted", function(evt) {
      self.root.trigger("DOMNodeInserted", evt);
    });
  },

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
