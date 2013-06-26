/*
 * IF-EXIST
 * ========
 *
 * Intended as a Mix-In to Relation.
 */

CTS.Relation.IfExist = function(node1, node2, spec) {
  if (typeof spec == 'undefined') {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
  this.name = 'if-exist';
  this.initializeBase();
};

CTS.Fn.extend(CTS.Relation.IfExist.prototype, CTS.Relation.Base, {
  execute: function(toward) {
    var other = this.opposite(toward);
    var existed = false;
    if ((other == CTS.NonExistantNode) || (other == null) || (CTS.Fn.isUndefined(other))) {
      toward.destroy();
      existed = false;
    } else {
      toward.undestroy();
      existed = true;
    }
    toward.trigger('received-if-exist', {
      target: toward,
      source: other,
      relation: this,
      existed: existed
    });

  },

  clone: function(n1, n2) {
    if (CTS.Fn.isUndefined(n1)) {
      n1 = this.node1;
    }
    if (CTS.Fn.isUndefined(n2)) {
      n2 = this.node2;
    }
    return new CTS.Relation.IfExist(n1, n2, this.spec);
  }


});
