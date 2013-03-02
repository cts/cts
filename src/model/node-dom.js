// ### Constructor
var DomNode = CTS.DomNode = function(node, tree, relations, opts, args) {
  var defaults;

  this.isSiblingGroup = false;

  // A Node contains multiple DOM Nodes
  if (typeof node == 'object') {
    if (! _.isUndefined(node.jquery)) {
      this.siblings = [node];
    } else if (node instanceof Array) {
      this.siblings = node;
    } else if (node instanceof Element) {
      this.siblings = [$(node)];
    } else {
      this.siblings = [];
    }
  } else if (typeof node == 'string') {
    this.siblings = _.map($(node), function(n) { return $(n); });
  } else {
    this.siblings = [];
  }

  if (this.siblings.length > 1) {
    this.isSiblingGroup = true;
  }

  this.tree = tree;
  this.children = null; 
  this.relations = relations || [];
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
    _.each(this.siblings, function(s) {s.remove();});
  },

  debugName: function() {
    return _.map(this.siblings, function(node) {
      return node[0].nodeName; }
    ).join(', ');
  },

  clone: function(opts) {
    var n = _.map(this.siblings, function(s) {s.clone();});
    // TODO(eob): any use in saving args to apply when cloned?
    var c = new DomNode(n, this.tree, this.relations, this.opts);
    // Insert after in CTS hierarchy
    this.parentNode.registerChild(c, {'after': this});
    return c;
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
    if (this.isSiblingGroup) {
      return null;
    } else {
      var inline = this.siblings[0].attr('data-cts');
      if ((inline !== null) && (typeof inline != 'undefined')) {
        return inline;
      } else {
        return null;
      }
    }
  },

  _createChildren: function() {
    console.log("DomNode::createChildren", this);
    if (this.isSiblingGroup) {
      this.children = this.siblingGroup;
    } else {
      this.children = []; 
      var fringe = _.union(
        _.map(this.siblings, function(node) {
          return node.children().toArray();
        })
      );
      
      while (fringe.length > 0) {
        console.log("Fringe length: ", fringe.length);
        var first = CTS.$(fringe.shift());
        var child = new DomNode(first, this.tree);
        var relevantRelations = this.tree.forrest.relationsForNode(child);
        if (relevantRelations.length > 0) {
          child.relations = relevantRelations;
          this.registerChild(child);
        } else {
          fringe = _.union(fringe, first.children().toArray());
          console.log("New fringe length: ", fringe.length);
        }
      }
    }
    console.log("Create Children Returned: ", this.children);
  },

  failedConditional: function() {
    _.each(this.siblings, function(n) { n.hide(); });
  },

  /**
   * Replaces the value of this node with the value of the
   * other node provided.
   */
  isIncoming: function(otherNodeSelection, opts) {
    console.log("IS Incoming with otherNodes", otherNodeSelection);
    if (otherNodeSelection.nodes.length === 0) {
      _.each(this.siblings, function(s) { s.html(""); });
    } else {
      var html = _.map(otherNodeSelection.nodes, function(node) {
        return node.isOutgoing(opts);
      }).join("");
      _.each(this.siblings, function(s) { s.html(html); });
    }
  },

  /**
   * Provides the vilue of this node.
   */
  isOutgoing: function(opts) {
    return _.map(this.siblings, function(node) {
      return node.html();
    }).join("");
  },

  /**
   * Performs several functions:
   *  1. Duplicates the itemscope'd child of this node once
   *     per other node.
   *  2. Remaps any down-tree relations such that iterations
   *     align.
   */
  areIncoming: function(otherNodeSelection, opts) {
    // What are we remapping onto
    var others = _.flatten(_.map(otherNodeSelection.nodes, function(o) {
      return o.areOutgoing(opt);
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
    _.filter(
      _.union(
        _.map(this.siblings, function(node) {
          return node.getChildren();
        })
      ), function(n) {
        n.node.is("[itemscope]");
      }, this);
  }

});
