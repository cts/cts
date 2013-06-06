/*
 * ARE
 * ===
 *
 * Intended as a Mix-In to Relation.
 */

var CTS.Relations.Are = {
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

    if (nodeCard > cardinality) {
      // Greater. We're going to have to destroy some.
      for (i = 0; i < diff; i++) {
        var n = this.getChildren()[opts.prefix + nodeCard - 1 + i];
        n.destroy();
      }
    } else if (cardinality > nodeCard) {
      // Less. We're going to have to create some.
      for (i = 0; i < diff; i ++) {
        var n = this.getChildren()[opts.prefix + nodeCard - 1 + i];
        var n2 = n.clone();
        node.insertChild(n2, (opts.prefix + nodeCard - 1 + i));
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
  },
};
