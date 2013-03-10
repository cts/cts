/**
 * A Relation is a connection between two tree nodes.
 * Relations are the actual arcs between nodes.
 * Rules are the language which specify relations.
 *
 *
 */

var RelationOpts = CTS.RelationOpts = {
  prefix: 0,
  suffix: 0,
  step: 1
};

var Relation = CTS.Relation= function(selection1, selection2, name, opts, opts1, opts2) {
  this.selection1 = selection1;
  this.selection2 = selection2;
  this.name = name;
  this.opts = opts;
  this.opts1 = _.extend(RelationOpts, opts1);
  this.opts2 = _.extend(RelationOpts, opts2);
};

_.extend(Relation.prototype, {

  addOption: function(key, value) {
    this.opts[key] = value;
  },

  head: function() {
    return this.selection1;
  },

  tail: function() {
    return this.selection2;
  },

  optsFor: function(node) {
    if (this.selection1.contains(node)) {
      return this.opts1;
    } else if (this.selection2.contains(node)) {
      return this.opts2;
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
