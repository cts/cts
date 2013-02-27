// Forrest
// ==========================================================================
//
// ==========================================================================

// Constructor
// -----------
var Forrest = CTS.Forrest = function(opts, args) {
  this.trees = {};
  this.rules = [];
  this.initialize.apply(this, args);
};

// Instance Methods
// ----------------
_.extend(Forrest.prototype, {

  initialize: function() {
    this.addDefaultTrees();
  },

  containsTreeAlias: function(alias) {
    _.has(this.trees, alias);
  },

  addTree: function(alias, tree) {
    this.trees[alias] = tree;
  },

  addRule: function(rule) {
    // Faster than .push()
    this.rules[this.rules.length] = rule;
  },

  addRules: function(someRules) {
    for (var i = 0; i < someRules.length; i++) {
      // Faster than .push()
      this.rules[this.rules.length] = someRules[i];
    }
  },

  selectionForSelector: function(selector) {
    console.log("trees", this.trees, "selector name", selector.treeName);
    // TODO(eob): The commented out line doesn't work.. but
    // I don't know why. That makes me worried.
    //if (_.contains(this.trees, selector.treeName)) {
    if (typeof this.trees[selector.treeName] != "undefined") {
      return this.trees[selector.treeName].selectionForSelector(selector);
    } else {
      console.log("Nodes for selector bailing");
      return new CTS.Selection([]);
    }
  },

  getPrimaryTree: function() {
    return this.trees.body;
  },

  ingestRules: function(someRuleString) {
    var ruleSet = RuleParser.parse(someRuleString);
    this.addRules(ruleSet);
  },

  /* Adds the DOM as a local tree called `body` and the `window` variable as
   * a tree called window.
   */ 
  addDefaultTrees: function() {
    this.addTree('body', new CTS.DomTree(this));
    this.addTree('window', new CTS.JsonTree(this, window));
  },

  rulesForNode: function(tree, node) {
    var ret = [];
    _.each(this.rules, function(rule) {
      console.log("Rule", rule, "for node", node);
      if ((rule.selector1.matches(node)) || 
          (rule.selector2.matches(node))) {
        ret[ret.length] = rule;
      } else {
        console.log("Failed match", rule.selector1.selector);
        console.log("Failed match", rule.selector2.selector);
      }
    }, this);

    var inlineRules = node.getInlineRules();
   
    if (inlineRules !== null) {
      var ruleSet = RuleParser.parseInline(inlineRules);
      if (typeof ruleSet != "undefined") {
        ret = _.union(ret, ruleSet);
      }
    }
    return ret;
  },

  relationsForNode: function(tree, node) {
    var rules = this.rulesForNode(tree, node);
    var relations = _.map(rules, function(rule) {
      var selection1 = null;
      var selection2 = null;
      var selector = null;
      if (rule.selector1.matches(node)) {
        selection1 = new CTS.Selection([node]);
        selection2 = rule.selector2.toSelection(this);
      } else {
        selection2 = new CTS.Selection([node]);
        selection1 = rule.selector1.toSelection(this);
      }
      var relation = new Relation(selection1, selection2, rule.opts);
      return relation;
    }, this);
    return relations;
  }

});
