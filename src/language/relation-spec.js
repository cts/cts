var RelationSpec = CTS.RelationSpec = function(selector1, selector2, name, props1, props2) {
  this.selector1 = selector1;
  this.selector2 = selector2;
  this.name = name;
  this.opts1 = props1;
  this.opts2 = props2;
};

_.extend(Rule.prototype, {
  head: function() {
    return this.selector1;
  },

  tail: function() {
    return this.selector2;
  }
});
