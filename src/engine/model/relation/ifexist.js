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
  isEmpty: function(node) {
    return (
      (node == CTS.NonExistantNode) ||
      (node == null) ||
      (! node.getIfExistValue())
    );
  },

  execute: function(toward) {
    if (this._forCreationOnly) {
      return;
    }

    var other = this.opposite(toward);
    var existed = false;
    if (this.isEmpty(other)) {
      alert("hiding" + toward.value.html());
      toward.hide();
      existed = false;
    } else {
      toward.unhide();
      existed = true;
    }
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
