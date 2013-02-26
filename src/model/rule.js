var Rule = CTS.Rule = function(selection1, selection2, name, opts) {
  this.selection1 = selection1;
  this.selection2 = selection2;
  this.name = name;
  this.opts = opts || {};
};

_.extend(Rule.prototype, {
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
