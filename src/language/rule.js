var Rule = CTS.Rule = function(selector1, selector2, name, opts) {
  this.selector1 = selector1;
  this.selector2 = selector2;
  this.name = name;
  this.opts = opts || {};
};

_.extend(Rule.prototype, {
  addOption: function(key, value) {
    this.opts[key] = value;
  },

  head: function() {
    return this.selector1;
  },

  tail: function() {
    return this.selector2;
  }
});
