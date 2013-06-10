/*
 * IF-EXIST
 * ========
 *
 * Intended as a Mix-In to Relation.
 */

CTS.Relation.IfNexist = function(node1, node2, spec) {
  if (typeof spec == 'undefined') {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
};

CTS.Fn.extend(CTS.Relation.IfNexist.prototype, CTS.Relation.Relation, {
  execute: function(toward) {
    var other = this.opposite(toward);
    if (other == CTS.NonExistantNode) {
      this.show();
    } else {
      this.hide();
    }
  }
});
