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
CTS.Fn.extend(CTS.Tree.Html.prototype, CTS.Tree.Base, CTS.Events, {
  setRoot: function($$node) {
    this.root = $$node;
    this.root.setProvenance(this);
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
  }

});
