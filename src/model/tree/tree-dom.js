// Constructor
// -----------
CTS.Tree.Html = function(forrest, spec) {
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
  this.root = null;
  this.nodeStash = [];
  this.insertionListener = null;
};

// Instance Methods
// ----------------
CTS.Fn.extend(CTS.Tree.Html.prototype, CTS.Tree.Base, {
  setRoot: function($$node) {
    this.root = $$node;
    this.root.setProvenance(this);
  },

  nodesForSelectionSpec: function(spec) {
    if (spec.inline) {
      return [spec.inlineObject];
    } else {
      var results = this.root.find(spec.selectorString);
      return results;
    }
  },
  
  getCtsNode: function($node) {
    var ctsnode = $node.data('ctsnode');
    if ((ctsnode == null) || (typeof ctsnode == 'undefined') || (ctsnode == '')) {
      // Last resort: look for an attr
      var attr = $node.attr('data-ctsid');
      if ((attr == null) || (typeof attr == 'undefined') || (attr == '')) {
        return null;
      }
      return this.nodeStash[attr];
    } else {
      return ctsnode;
    }
  },

  listenForNodeInsertions: function(new_val) {
    var listening = (this.insertionListener != null);
    if (typeof new_val == 'undefined') {
      return listening;
    } else {
      if (new_val == listening) {
        return new_val;
      } else if (new_val == true) {
        // Turn on.
        this.insertionListener = function(evt) {
          self.root.trigger("DOMNodeInserted", evt);
        };
        this.root.value.on("DOMNodeInserted", this.insertionListener);
      } else if (new_val == false) {
        this.root.value.off("DOMNodeInserted", this.insertionListener);
        this.insertionListener = null;
      } else {
        CTS.Log.Error("Invalid value passed to listenForNodeInsertions");
      }
    }
  }

});
