// ### Constructor
var DomNode = CTS.DomNode = function(node, tree, rules, opts, args) {
  var defaults;
  this.node = node;
  this.tree = tree;
  this.children = null; 
  this.rules = rules || [];
  this.opts = opts || {};
  this.parentNode = null;
  this.initialize.apply(this, args);
};

// ### Instance Methods
_.extend(CTS.DomNode.prototype, CTS.Events, CTS.StateMachine, CTS.Node, {

  initialize: function(args) {
    this.initializeStateMachine();
  },

  destroy: function(opts) {
    this.node.remove();
  },

  debugName: function() {
    return this.node[0].nodeName;
  },

  clone: function(opts) {
    var n = this.node.clone();
    
    // Insert after in the dom
    this.node.after(n);

    // TODO(eob): any use in saving args to apply when cloned?
    var c = new DomNode(n, this.tree, this.rules, this.opts);

    // Insert after in CTS hierarchy
    this.parentNode.registerChild(c, {'after': this});
  },

  registerChild: function(child, opts) {
    var didit = false;
    if ((! _.isUndefined(opts)) && (! _.isUndefined(opts.after))) {
      for (var i = this.children.length - 1; i >= 0; i--) {
        if (this.children[i] == opts.after) {
          // First bump forward everything
          for (var j = children.length - 1; j > i; j--) {
            this.children[j + 1] = this.children[j];
          }

          // Then set this at i+1
          this.children[i+1] = child;
          child.parentNode = this;
          didit = true;
        }
      }
      // do it after an element
    } 
    
    if (! didit) {
      // do it at end as failback, or if no relative position specified
      this.children[this.children.length] = child;
      child.parentNode = this;
    }
 },

  getInlineRules: function() {
    var inline = this.node.attr('data-cts');
    if ((inline !== null) && (typeof inline != 'undefined')) {
      return inline;
    } else {
      return null;
    }
  },

  _createChildren: function() {
    this.children = [];
    console.log("DomNode::createChildren", this);
    
//  var e = new Error('dummy');
//  var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
//      .replace(/^\s+at\s+/gm, '')
//      .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
//      .split('\n');
//  console.log(stack);

    var fringe = this.node.children().toArray();
    
    while (fringe.length > 0) {
      console.log("Fringe length: ", fringe.length);
      var first = CTS.$(fringe.shift());
      var child = new DomNode(first, this.tree);
      var relevantRules = this.tree.forrest.relationsForNode(this.tree, child);
      if ((child.node.html() == "a") || (child.node.html() == "b")) {
        console.log("Found child", child.node.html(), "with rules", relevantRules);
      }

      if (relevantRules.length > 0) {
        child.rules = relevantRules;
        this.registerChild(child);
      } else {
        fringe = _.union(fringe, first.children().toArray());
        console.log("New fringe length: ", fringe.length);
      }
    }
    console.log("Create Children Returned: ", this.children);
  },

  /**
   * Replaces the value of this node with the value of the
   * other node provided.
   */
  isIncoming: function(otherNodes, opts) {
    console.log("IS Incoming with otherNodes", otherNodes);
    if (otherNodes.length === 0) {
      console.log("Other nodes empty!");
      this.node.html("");
    } else {
      console.log("Other nodes non empty!");
      this.node.html(otherNodes[otherNodes.length - 1].isOutgoing(opts));
    }
  },

  /**
   * Provides the value of this node.
   */
  isOutgoing: function(opts) {
    return this.node.html();
  },

  /**
   * Performs several functions:
   *  1. Duplicates the itemscope'd child of this node once
   *     per other node.
   *  2. Remaps any down-tree relations such that iterations
   *     align.
   */
  areIncoming: function(otherNodes, opts) {
    // What are we remapping onto
    var others = _.flatten(_.map(otherNodes, function(o) {
      o.areOutgoing(opt);
    }, this));

    // Find the itemscoped children of this node.
    var these = _.filter(gets.node.getChildren(), function(n) {
      n.node.is("[itemscope]");
    }, this);

    // Align the cardinalities of the two
    var diff = Math.abs(these.length - others.length);
    var i;
    if (these.length > others.length) {
      for (i = 0; i < diff; i++) {
        these[these.length - 1].destroy();
      }
    } else if (these.length < others.length) {
      for (i = 0; i < diff; i++) {
        these[these.length] = these[these.length - 1].clone();
      }
    }

  },

  /**
   * Provides the itemscope'd nodes.
   */
  areOutgoing: function(opts) {
    _.filter(this.node.getChildren(), function(n) {
      n.node.is("[itemscope]");
    }, this);
  }

});
