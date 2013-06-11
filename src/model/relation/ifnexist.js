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
  this.name = 'if-nexist';
  this.initializeBase();
};

CTS.Fn.extend(CTS.Relation.IfNexist.prototype, CTS.Relation.Relation, {
  execute: function(toward) {
    var other = this.opposite(toward);
    if ((other == CTS.NonExistantNode) || (other == null) || (CTS.Fn.isUndefined(other))) {
      toward.undestroy();
    } else {
      toward.destroy();
    }
  },

  clone: function(n1, n2) {
    if (CTS.Fn.isUndefined(n1)) {
      n1 = this.node1;
    }
    if (CTS.Fn.isUndefined(n2)) {
      n2 = this.node2;
    }
    return new CTS.Relation.IfNexist(n1, n2, this.spec);
  }


});
