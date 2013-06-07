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
  this.name = name;
  this.opts = CTS.Fn.extend({}, opts);
  this.opts1 = CTS.Fn.extend(RelationOpts, opts1);
  this.opts2 = CTS.Fn.extend(RelationOpts, opts2);
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

  optsFor: function(node) {
    if (this.node1 === node) {
      return this.spec.opts1;
    } else if (this.node2 == node) {
      return this.spec.opts2;
    }
    return {};
  },

  clone: function() {
    return new CTS.Relation(
        this.selection1.clone(),
        this.selection2.clone(),
        this.name,
        this.opts,
        this.opts1,
        this.opts2);
  }
});
