/**
 * A Relation is a connection between two tree nodes.
 * Relations are the actual arcs between nodes.
 * Rules are the language which specify relations.
 */

var Selection = CTS.Selection = function(nodes, opts) {
  this.nodes = nodes;
  this.opts = {};
  if (typeof opts != 'undefined') {
    this.opts = _.extend(this.opts, opts);
  }
};

_.extend(Selection.prototype, {
  contains: function(node) {
    return _.contains(this.nodes, node);
  },

  clone: function() {
    // not a deep clone of the selection. we don't want duplicate nodes
    // running around.
    return new CTS.Selection(_.union([], this.nodes), this.opts);
  },

  matchesArray: function(arr, exactly, orArrayAncestor) {
    if (typeof backoffToAncestor == 'undefined') {
      backoffToAncestor = false;
    }

    for (var i = 0; i < this.nodes.length; i++) {
      if (! _.contains(arr, this.nodes[i])) {
        if (backoffToAncestor) {
          // 
        } else {
          return false;
        }
      }
    }
    if ((typeof exactly != 'undefined') && (exactly === true)) {
      return (arr.length = self.nodes.length);
    } else {
      return true;
    }
  }

});
