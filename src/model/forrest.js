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

  nodesForSelection: function(selection) {
    console.log("trees", this.trees, "selection name", selection.treeName);
    // TODO(eob): The commented out line doesn't work.. but
    // I don't know why. That makes me worried.
    //if (_.contains(this.trees, selection.treeName)) {
    if (typeof this.trees[selection.treeName] != "undefined") {
      return this.trees[selection.treeName].nodesForSelection(selection);
    } else {
      console.log("Nodes for selection bailing");
      return [];
    }
  },

  getPrimaryTree: function() {
    return this.trees.body;
  },

  ingestRules: function(someRuleString) {
    var ruleSet = RelationParser.parse(someRuleString);
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
      if ((rule.selection1.matches(node)) || 
          (rule.selection2.matches(node))) {
        ret[ret.length] = rule;
      } else {
        console.log("Failed match", rule.selection1.selector);
        console.log("Failed match", rule.selection2.selector);
      }
    }, this);
    console.log("Rules for node: ", ret);
    return ret;
  }
  
});
