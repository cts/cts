// Forrest
// ==========================================================================
// A Forrest contains:
//  * Named trees
//  * Relations between those trees
// ==========================================================================

// Constructor
// -----------
var Forrest = CTS.Forrest = function(opts) {
  this.forrestSpecs = [];

  this.treeSpecs = {};
  this.trees = {};
  
  this.relationSpecs = [];
  this.relations= [];

  this.opts = opts || {};
  this.initialize();
};

// Instance Methods
// ----------------
CTS.Fn.extend(Forrest.prototype, {

  /*
   * Initialization Bits
   *
   * -------------------------------------------------------- */

  initialize: function() {
    this.addAndRealizeDefaultTrees();
    // If there is a forrest spec in the opts, we'll use it
    if (typeof this.opts.spec != 'undefined') {
      this.addSpec(this.opts.spec);
    }
  },

  addAndRealizeDefaultTrees: function() {
    var pageBody = new CTS.TreeSpec('HTML', 'body', null);
    this.addTreeSpec(pageBody);
    this.realizeTreeSpec(pageBody);
  },

  /*
   * Adding Specs
   *
   * A forrest is built by adding SPECS (from the language/ package) to it
   * rather than actual objects. These specs are lazily instantiated into
   * model objects as they are needed.  Thus, the addTree method takes a
   * TreeSpec, rather than a Tree, and so on.
   *
   * -------------------------------------------------------- */

  addSpec: function(forrestSpec) {
    this.forrestSpecs.push(forrestSpec);
    var i;
    for (i = 0; i < forrestSpec.treeSpecs.length; i++) {
      this.addTree(forrestSpec.treeSpecs[i]);
    }
    for (i = 0; i < forrestSpec.relationSpecs.length; i++) {
      this.addRelation(forrestSpec.relationSpecs[i]);
    }
  },

  addTreeSpec: function(treeSpec) {
    this.treeSpecs[treeSpec.name] = treeSpec;
  },

  addRelationSpec: function(relationSpec) {
    this.relationSpecs.push(relationSpec);
  },

  addRelationSpecs: function(someRelationSpecs) {
    for (var i = 0; i < someRelationSpecs.length; i++) {
      // Faster than .push()
      this.relationSpecs.push(someRelationSpecs[i]);
    }
  },

  /* The JSON should be of the form:
   * 1. [
   * 2.   ["TreeName", "SelectorName", {"selector1-prop":"selector1-val"}]
   * 3.   ["Relation",  {"prop":"selector1-val"}]
   * 4.   ["TreeName", "SelectorName", {"selector2-prop":"selector1-val"}]
   * 5. ]
   *
   * The outer array (lines 1 and 5) are optional if you only have a single rule.
   *
   */
  incorporateInlineJson: function(json, node) {
    if (json.length == 0) {
      return [];
    }
    if (! CTS.Fn.isArray(json[0])) {
      json = [json];
    }
    var ret = [];
    for (var i = 0; i < json.length; i++) {
      var s1 = CTS.Parser.Json.parseSelectorSpec(json[i][0], node);
      var s2 = CTS.Parser.Json.parseSelectorSpec(json[i][2], node);
      var rule = CTS.Parser.Json.parseRelationSpec(json[i][1], s1, s2);
      this.relationSpecs.push(rule);
      ret.push(rule);
    }
    return ret;
  },

  /*
   * Realizing Specs
   *
   * Here, we take specs (ideally those that we've already added, but
   * currently that constraint isn't enforced) and actually transform them
   * into model objects such as Tree and Relation objects.
   *
   * Note that realizing a relation depends upon the prior realization of the
   * trees that the relation references. 
   *
   * -------------------------------------------------------- */

  realizeTreeSpec: function(spec) {
    var self = this;
    CTS.Utilities.fetchTree(spec, function(error, root) {
      if (error) {
        CTS.Log.Error("Could not fetch Tree for Spec " + alias);
      } else {
        if (spec.kind == 'HTML') {
          var tree = new CTS.DomTree(self, root, spec);
          this.trees[spec.name] = tree;
        } else if (spec.kind == 'JSON') {
          var tree = new CTS.JsonTree(self, root, spec);
          this.trees[spec.name] = tree;
        } else {
          CTS.Log.Error("Unknown kind of Tree in Spec " + alias); 
        }
      }
    }, this);
  },

  realizeRelationSpec: function(spec) {
    var s1 = spec.selectionSpec1;
    var s2 = spec.selectionSpec2;

    // Realizing a relation spec has a dependency on the realization of
    // the realization of the treespecs.
    // TODO(eob): One day, having a nice dependency DAG would be nice.
    // For now, we'll error if deps aren't met.
    if (! (this.containsTree(s1.treeName) && this.containsTree(s2.treeName))) {
      if (! this.containsTree(s1.treeName)) {
        CTS.Log.Error("Can not realize RelationSpec becasue one or more trees are not available", s1.treeName);
      }
      if (! this.containsTree(s2.treeName)) {
        CTS.Log.Error("Can not realize RelationSpec becasue one or more trees are not available", s2.treeName);
      }
      return;
    }

    // Here we're guaranteed that the trees are available.

    // Now we find all the nodes that this spec matches on each side and
    // take the cross product of all combinations.

    var nodes1 = this.trees[s1.treeName].nodesForSelectionSpec(s1);
    var nodes2 = this.trees[s2.treeName].nodesForSelectionSpec(s2);

    for (var i = 0; i < nodes1.length; i++) {
      for (var j = 0; j < nodes2.length; j++) {
        // Realize a relation between i and j. Creating the relation adds
        // a pointer back to the nodes.
        var relation = new CTS.Relation.CreateFromSpec(nodes1[i], nodes2[j], spec);
        console.log("Created relation", relation);
        // Add the relation to the forrest
        this.relations.push(relation);
      }
    }
  },

  /*
   * Fetching Objects
   *
   * -------------------------------------------------------- */

  containsTree: function(alias) {
    return CTS.Fn.has(this.trees, alias);
  },

  getTree: function(alias) {
    return this.trees[alias];
  },

  getPrimaryTree: function() {
    return this.trees.body;
  }

  /*
   * NOTE:
   *  All the below code was very clever, but a premature optimization aimed at lazy-loading.
   *  Consider bringing it back once we achieve (slow) functionality.
   */

  //nodesForSelectionSpec: function(spec) {
  //  if (typeof this.trees[spec.treeName] != "undefined") {
  //    return this.trees[spec.treeName].nodesForSelectionSpec(spec);
  //  } else {
  //    return [];
  //  }
  //},

  //rulesForNode: function(node) {
  //  console.log("Forrest:::rulesForNode");
  //  var ret = [];
  //  CTS.Fn.each(this.rules, function(rule) {
  //    console.log("Forrest::rulesForNode Rule", rule, "for node", node);
  //    if ((rule.selector1.matches(node)) || 
  //        (rule.selector2.matches(node))) {
  //      ret[ret.length] = rule;
  //    } else {
  //      console.log("Failed match", rule.selector1.selector);
  //      console.log("Failed match", rule.selector2.selector);
  //    }
  //  }, this);

  //  var inlineRules = node.getInlineRules();
  // 
  //  if (inlineRules !== null) {
  //    var ruleSet = RuleParser.parseInline(node, inlineRules);
  //    if (typeof ruleSet != "undefined") {
  //      ret = CTS.Fn.union(ret, ruleSet);
  //    }
  //  }
  //  return ret;
  //},

  //registerRelationsForNode: function(node) {
  //  console.log("Forrest::RelationsForNode");
  //  var rules = this.rulesForNode(node);
  //  console.log("Rules for", node.siblings[0].html(), rules);
  //  var relations = CTS.Fn.map(rules, function(rule) {
  //    var selection1 = null;
  //    var selection2 = null;
  //    var selector = null;
  //    var other = null;
  //    if (rule.selector1.matches(node)) {
  //      selection1 = new CTS.Selection([node]);
  //      selection2 = rule.selector2.toSelection(this);
  //      other = selection2;
  //    } else {
  //      selection2 = new CTS.Selection([node]);
  //      selection1 = rule.selector1.toSelection(this);
  //      other = selection1;
  //    }
  //    var relation = new Relation(selection1, selection2, rule.name, rule.opts, rule.opts1, rule.opts2);
  //    node.registerRelation(relation);
  //    // Make sure that we wire up the relations,
  //    // since some might come in from inline.
  //    CTS.Fn.each(other.nodes, function(n) {
  //      n.registerRelation(relation);
  //    }, this);
  //  }, this);
  //  console.log("Returning Relations for", node.siblings[0].html(), relations);
  //  return relations;
  //}

});
