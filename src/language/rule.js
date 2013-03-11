var RuleConstants = CTS.RuleConstants = {
  opts1Prefix: "<-",
  opts2Prefix: "->"
};

var Rule = CTS.Rule = function(selector1, selector2, name, opts) {
  this.selector1 = selector1;
  this.selector2 = selector2;
  this.name = name;
  this.opts = {};
  this.opts1 = {};
  this.opts2 = {};
  this.initialize(opts);
};

_.extend(Rule.prototype, {
  initialize: function(opts) {
    _.each(_.pairs(opts), function(pair) {
      var key;
      if (pair[0].indexOf(RelationConstants.opts1Prefix) === 0) {
        key = pair[0].substring(RuleConstants.opts1Prefix.length).trim();
        this.opts1[key] = pair[1];
      } else if (pair[0].indexOf(RelationConstants.opts2Prefix) === 0) {
        key = pair[0].substring(RuleConstants.opts2Prefix.length).trim();
        this.opts2[key] = pair[1];
      } else {
        this.opts[pair[0]] = pair[1];
      }
    });
  },

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
