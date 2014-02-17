var RelationSpec = CTS.RelationSpec = function(selector1, selector2, name, props) {
  this.selectionSpec1 = selector1;
  this.selectionSpec2 = selector2;
  this.name = name;
  this.opts = props || {};
};

CTS.Fn.extend(CTS.RelationSpec.prototype, {
  head: function() {
    return this.selectionSpec1;
  },

  tail: function() {
    return this.selectionSpec2;
  },
});
