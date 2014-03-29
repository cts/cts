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
  this.name = 'is';
  this.initializeBase();
};

CTS.Fn.extend(CTS.Relation.Is.prototype, CTS.Relation.Base, {
  /*
   */
  execute: function(toward) {
    if (this._forCreationOnly) {
      console.log("CREATION ONLY!");
      return;
    }
    var from = this.opposite(toward);
    var content = from.getValue(this.optsFor(from));
    var res = toward.setValue(content, this.optsFor(toward));
    toward.setProvenance(from.tree, from);
    return res;
  },

  clone: function(n1, n2) {
    if (CTS.Fn.isUndefined(n1)) {
      n1 = this.node1;
    }
    if (CTS.Fn.isUndefined(n2)) {
      n2 = this.node2;
    }
    return new CTS.Relation.Is(n1, n2, this.spec);
  }

});
