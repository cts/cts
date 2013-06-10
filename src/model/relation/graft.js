/*
 * GRAFT
 * =====
 *
 * Intended as a Mix-In to Relation.
 */

var CTS.Relation.Graft = function(node1, node2, spec) {
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
};

CTS.Fn.extend(CTS.Relation.Graft.prototype, CTS.Relation.Relation, {
  execute: function(toward) {
  }
};

