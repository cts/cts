/*
 * GRAFT
 * =====
 *
 * Intended as a Mix-In to Relation.
 */

CTS.Relation.Graft = function(node1, node2, spec) {
  if (CTS.Fn.isUndefined(spec)) {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
  this.initializeBase();
};

CTS.Fn.extend(CTS.Relation.Graft.prototype, CTS.Relation.Relation, {
  execute: function(toward) {
  }
});

