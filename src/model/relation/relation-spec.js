CTS.RelationSpec = function(selector1, selector2, name, props1, props2, propsMiddle) {
  this.selectionSpec1 = selector1;
  this.selectionSpec2 = selector2;
  this.name = name;
  this.opts1 = props1;
  this.opts2 = props2;
  this.opts = propsMiddle || {};
};

CTS.Fn.extend(CTS.RelationSpec.prototype, {
  head: function() {
    return this.selectionSpec1;
  },

  tail: function() {
    return this.selectionSpec2;
  },
});
