/**
 * A Relation is a connection between two tree nodes.
 * Relations are the actual arcs between nodes.
 * Rules are the language which specify relations.
 */

var RelationOpts = CTS.RelationOpts = {
  prefix: 0,
  suffix: 0,
  step: 1
};

var Relation = CTS.Relation = function(node1, node2, spec) {
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
};

CTS.Fn.extend(Relation.prototype, RelationOps, {
  initialize: function() {
    this.node1.addRelation(this);
    this.node2.addRelation(this);
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
    if (this.node1 === node) {
      return this.spec.opts1;
    } else if (this.node2 == node) {
      return this.spec.opts2;
    }
    return {};
  },

  clone: function() {
    return new CTS.Relation(this.node1, this.node2, this.spec);
  }
});
