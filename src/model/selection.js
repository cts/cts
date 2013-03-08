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
  }
});
