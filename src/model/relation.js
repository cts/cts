/**
 * A Relation is a connection between two tree nodes.
 * Relations are the actual arcs between nodes.
 * Rules are the language which specify relations.
 */

var Relation = CTS.Relation= function(selection1, selection2, name, opts) {
  this.selection1 = selection1;
  this.selection2 = selection2;
  this.name = name;
  this.opts = opts || {};
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
  }

});
