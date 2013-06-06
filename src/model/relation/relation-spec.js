var RelationSpec = CTS.RelationSpec = function(selector1, selector2, name, props1, props2) {
  this.selectionSpec1 = selector1;
  this.selectionSpec2 = selector2;
  this.name = name;
  this.opts1 = props1;
  this.opts2 = props2;
};

_.extend(Rule.prototype, {
  head: function() {
    return this.selectionSpec1;
  },

  tail: function() {
    return this.selectionSpec2;
  }
});
