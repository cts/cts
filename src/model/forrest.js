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

  nodesForSelectionSpec: function(spec) {
    if (typeof this.trees[spec.treeName] != "undefined") {
      return this.trees[spec.treeName].nodesForSelectionSpec(spec);
    } else {
      return [];
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

  rulesForNode: function(node) {
    console.log("Forrest:::rulesForNode");
    var ret = [];
    _.each(this.rules, function(rule) {
      console.log("Forrest::rulesForNode Rule", rule, "for node", node);
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
      var ruleSet = RuleParser.parseInline(node, inlineRules);
      if (typeof ruleSet != "undefined") {
        ret = _.union(ret, ruleSet);
      }
    }
    return ret;
  },

  registerRelationsForNode: function(node) {
    console.log("Forrest::RelationsForNode");
    var rules = this.rulesForNode(node);
    console.log("Rules for", node.siblings[0].html(), rules);
    var relations = _.map(rules, function(rule) {
      var selection1 = null;
      var selection2 = null;
      var selector = null;
      var other = null;
      if (rule.selector1.matches(node)) {
        selection1 = new CTS.Selection([node]);
        selection2 = rule.selector2.toSelection(this);
        other = selection2;
      } else {
        selection2 = new CTS.Selection([node]);
        selection1 = rule.selector1.toSelection(this);
        other = selection1;
      }
      var relation = new Relation(selection1, selection2, rule.name, rule.opts, rule.opts1, rule.opts2);
      node.registerRelation(relation);
      // Make sure that we wire up the relations,
      // since some might come in from inline.
      _.each(other.nodes, function(n) {
        n.registerRelation(relation);
      }, this);
    }, this);
    console.log("Returning Relations for", node.siblings[0].html(), relations);
    return relations;
  }

});
