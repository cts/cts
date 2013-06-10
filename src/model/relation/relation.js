/**
 * A Relation is a connection between two tree nodes.
 * Relations are the actual arcs between nodes.
 * Rules are the language which specify relations.
 */

CTS.Relation.Relation = {

  initializeBase: function() {
    if (this.node1 != null) {
      this.node1.registerRelation(this);
    }
    if (this.node2 != null) {
      this.node2.registerRelation(this);
    }
    this.defaultOpts = this.getDefaultOpts();
  },

  getDefaultOpts: function() {
    return {};
  },

  addOption: function(key, value) {
    this.opts[key] = value;
  },

  head: function() {
    return this.selection1;
  },

  tail: function() {
    return this.selection2;
  },

  opposite: function(node) {
    return (node == this.node1) ? this.node2 : this.node1;
  },

  rebind: function(source, destination) {
    if (source == this.node1) {
      this.node1 = destination;
    } else if (source == this.node2) {
      this.node2 = destination;
    } else {
      CTS.Log.Error("Asked to rebind but no match.");
    }
  },

  optsFor: function(node) {
    var toRet;
    if (this.node1 === node) {
      toRet = this.spec.opts1;
    } else if (this.node2 == node) {
      toRet = this.spec.opts2;
    }
    if (CTS.Fn.isUndefined(toRet)) {
      toRet = {};
    }
    CTS.Fn.extend(toRet, this.defaultOpts);
    return toRet;
  },

  clone: function() {
    return new CTS.Relation.Relation(this.node1, this.node2, this.spec);
  }
};
