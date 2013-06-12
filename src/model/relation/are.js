/*
 * ARE
 * ===
 *
 * Intended as a Mix-In to Relation.
 */

CTS.Relation.Are = function(node1, node2, spec) {
  if (typeof spec == 'undefined') {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
  this.initializeBase();
  this.name = 'are';
};

CTS.Fn.extend(CTS.Relation.Are.prototype, CTS.Relation.Relation, {
  getDefaultOpts: function() {
    return {
      prefix: 0,
      suffix: 0,
      step: 0
    };
  },

  execute: function(toward) {
    this._Are_AlignCardinalities(toward);
    //this._Are_PruneRules(toward);
  },

  clone: function(n1, n2) {
    if (CTS.Fn.isUndefined(n1)) {
      n1 = this.node1;
    }
    if (CTS.Fn.isUndefined(n2)) {
      n2 = this.node2;
    }
    return new CTS.Relation.Are(n1, n2, this.spec);
  },

  _Are_AlignCardinalities: function(toward) {
    var myOpts = this.optsFor(toward);
    var other = this.opposite(toward);
    var otherIterables = this._Are_GetIterables(other);
    var myIterables = this._Are_GetIterables(toward);

    if (myIterables.length > 0) {
      while (myIterables.length > 1) {
        var bye = myIterables.pop();
        bye.destroy();
      }
  
      // Now build it back up.
      if (otherIterables.length == 0) {
        myIterables[0].destroy();
      } else if (otherIterables.length > 1) {
        var lastIndex = myOpts.prefix;
        // WARNING: Note that i starts at 1
        for (var i = 1; i < otherIterables.length; i++) {
          // Clone the iterable.
          var clone = myIterables[0].clone();
          toward.insertChild(clone, lastIndex, true);
          console.log("added", clone, "to", toward);
          console.log(myIterables[0], clone);
          lastIndex++;
        }
      }
    }
  },

//  _Are_SetCardinality: function(node, cardinality) {
//    var nodeCard = this._Are_GetCardinality(node);
//    var diff = Math.abs(nodeCard - cardinality);
//    var opts = this.optsFor(node);
//
//    if (nodeCard > 0) {
//      if (nodeCard > cardinality) {
//        // Greater. We're going to have to destroy some.
//        for (i = 0; i < diff; i++) {
//          var toDestroy = opts.prefix + nodeCard - i - 1;
//          var n = node.getChildren()[toDestroy];
//          n.destroy();
//        }
//      } else if (cardinality > nodeCard) {
//        // Less. We're going to have to create some.
//        for (i = 0; i < diff; i ++) {
//          var n = node.getChildren()[opts.prefix + nodeCard - 1 + i];
//          var n2 = n.clone();
//          node.insertChild(n2, (opts.prefix + nodeCard - 1 + i));
//        }
//      }
//    }
//  },

  _Are_GetIterables: function(node) {
    var opts = this.optsFor(node);
    var kids = node.getChildren();
    return kids.slice(opts.prefix, kids.length - opts.suffix);
  },

  /*
   * Returns the number of items in the set rooted by this node,
   * respecting the prefix and suffix settings provided to the relation.
   *
   * An assumption is made here that the tree structure already takes
   * into an account the step size, using intermediate nodes.
   */
  _Are_GetCardinality: function(node) {
    var opts = this.optsFor(node);
    return node.getChildren().length - opts.prefix - opts.suffix;
  },

  /* 
   * Takes nodes that are splayed across all opposites, and deletes
   * all but the one for the proper index.
   */
//  _Are_PruneRules: function(node, index, opposites) {
//    if ((typeof index == 'undefined') && (typeof opposites == 'undefined')) {
//      // This is the base case, called on th PARENT of the are.
//      // ASSUMPTION! Cardinalities are already aligned.
//      var card = this._Are_GetCardinality(node);
//      var opts = this.optsFor(node);
//      var opposite = this.opposite(node);
//      var oppositeOpts = this.optsFor(opposite);
//
//      var opposites = opposite.children.slice(oppositeOpts.prefix, oppositeOpts.prefix + card);
//
//      for (var i = 0; i < card; i++) {
//        var child = node.children[opts.prefix + i];
//        this._Are_PruneRules(child, i, opposites);
//      }
//    } else {
//      var templates = this._Are_RuleTemplates(node);
//      console.log("TT", templates);
//      CTS.Fn.each(templates, function(rules, sig) {
//        this._Are_MaybePruneTemplate(node, index, opposites, rules);
//      }, this);
//      for (var i = 0; i < node.children.length; i++) {
//        this._Are_PruneRules(node.children[i], index, opposites);
//      }
//    }
//  },
//
//  /*
//   * Returns a hash of lists of rules for this node, grouped by 
//   * node signature
//   */
//  _Are_RuleTemplates: function(node) {
//    var ret = {};
//    for (var i = 0; i < node.relations.length; i++) {
//      var r = node.relations[i];
//      var sig = r.signature();
//      if (! CTS.Fn.has(ret, sig)) {
//        ret[sig] = [];
//      }
//      ret[sig].push(r);
//    }
//    return ret;
//  },

  /*
   * maybe prunes out templates
   */
//  _Are_MaybePruneTemplate: function(node, index, opposites, rules) {
//    if (rules.length < opposites.length) {
//      return;
//    }
//
//    var slots = [];
//    var i, j;
//    for (i = 0; i < opposites.length; i++) {
//      slots[i] = null;
//    }
//    
//    for (i = 0; i < rules.length; i++) {
//      var r = rules[i];
//      var opposite = r.opposite(node);
//      var foundIt = false;
//      for (j = 0; ((!foundIt) && (j < opposites.length)); j++) {
//        if (slots[j] == null) {
//          // Check to see if opposite is in lineage of opposites[j]
//          if (opposite.descendantOf(opposites[j])) {
//            slots[j] = r;
//            foundIt = true;
//          }
//        }
//      }
//    }
//
//    // Check if splayed. Remember which is our index
//    var splayed = true;
//    for (i = 0; i < slots.length; i++) {
//      if (slots[i] == null) {
//        splayed = false;
//        break;
//      }
//    }
//
//    // If it is splayed, remove all except the one at index
//    if (splayed) {
//      for (i=0; i<slots.length; i++) {
//        if (i != index) {
//          slots[i].destroy();
//        }
//      }
//    }
//
//  },

});
