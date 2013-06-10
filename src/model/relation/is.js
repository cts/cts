/*
 * IS
 * ==
 *
 * Intended as a Mix-In to Relation.
 */
CTS.Relation.Is = function(node1, node2, spec) {
  if (typeof spec == 'undefined') {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
  this.initializeBase();
};

CTS.Fn.extend(CTS.Relation.Is.prototype, CTS.Relation.Relation, {
  execute: function(toward) {
    var from = this.opposite(toward);
    var content = from.getValue(this.optsFor(from));
    toward.setValue(content, this.optsFor(toward));
  }
});

