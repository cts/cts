/*
 * ARE
 * ===
 *
 * Intended as a Mix-In to Relation.
 */

CTS.Relation.Are = function(node1, node2, spec) {
  if (typeof spec == 'undefined') {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
  this.initializeBase();
};

CTS.Fn.extend(CTS.Relation.Are.prototype, CTS.Relation.Relation, {
  getDefaultOpts: function() {
    return {
      prefix: 0,
      suffix: 0,
      step: 0
    };
  },

  execute: function(toward) {
    this._Are_AlignCardinalities(toward);
  },

  _Are_AlignCardinalities: function(toward) {
    var other = this.opposite(toward);
    var otherCardinality = this._Are_GetCardinality(other);
    this._Are_SetCardinality(toward, otherCardinality);
  },

  _Are_SetCardinality: function(node, cardinality) {
    var nodeCard = this._Are_GetCardinality(node);
    var diff = Math.abs(nodeCard - cardinality);
    var opts = this.optsFor(node);

    if (nodeCard > 0) {
      if (nodeCard > cardinality) {
        // Greater. We're going to have to destroy some.
        for (i = 0; i < diff; i++) {
          var toDestroy = opts.prefix + nodeCard - i - 1;
          var n = node.getChildren()[toDestroy];
          n.destroy();
        }
      } else if (cardinality > nodeCard) {
        // Less. We're going to have to create some.
        for (i = 0; i < diff; i ++) {
          var n = node.getChildren()[opts.prefix + nodeCard - 1 + i];
          var n2 = n.clone();
          node.insertChild(n2, (opts.prefix + nodeCard - 1 + i));
        }
      }
    }
  },

  /*
   * Returns the number of items in the set rooted by this node,
   * respecting the prefix and suffix settings provided to the relation.
   *
   * An assumption is made here that the tree structure already takes
   * into an account the step size, using intermediate nodes.
   */
  _Are_GetCardinality: function(node) {
    var opts = this.optsFor(node);
    return node.getChildren().length - opts.prefix - opts.suffix;
  }
});
