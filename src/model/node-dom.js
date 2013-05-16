// ### Constructor
var DomNode = CTS.DomNode = function(node, tree, opts, args) {
  var defaults;
  this._kind = 'dom'
  this.children = null;
  this.parentNode = null;
  this.relations = [];
  this.searchedForRelations = false;
  this.isSiblingGroup = false;
  this.isEnumerable = false;

  // A Node contains multiple DOM Nodes
  if (typeof node == 'object') {
    if (! _.isUndefined(node.jquery)) {
      CTS.Debugging.DumpStack();
      //console.log("SIBLINGS A", node);
      this.siblings = [node];
    } else if (node instanceof Array) {
      //console.log("SIBLINGS B", node);
      this.siblings = node;
    } else if (node instanceof Element) {
      //console.log("SIBLINGS C", node);
      this.siblings = [$(node)];
    } else {
      //console.log("SIBLINGS D", node);
      this.siblings = [];
    }
  } else if (typeof node == 'string') {
    //console.log("SIBLINGS E", node);
    this.siblings = _.map($(node), function(n) { return $(n); });
  } else {
    //console.log("SIBLINGS F", node);
    this.siblings = [];
  }

  if (this.siblings.length > 1) {
    this.isSiblingGroup = true;
  }
  this.opts = opts || {};

  this.tree = tree;
  if (typeof this.opts.relations != 'undefined') {
    this.relations = this.opts.relations;
  }
  this.initialize.apply(this, args);
};

// ### Instance Methods
_.extend(CTS.DomNode.prototype, CTS.Events, CTS.StateMachine, CTS.Node, {

  initialize: function(args) {
    this.initializeStateMachine();
  },

  destroy: function(opts) {
    // 1. Remove from parent in the shadow DOM
    // TODO: handle case of trying to unregister root.
    this.parentNode.unregisterChild(this);

    // 2. Remove nodes form DOM tree
    _.each(this.siblings, function(s) {
      s.remove();
    });
  },

  debugName: function() {
    return _.map(this.siblings, function(node) {
      return node[0].nodeName; }
    ).join(', ');
  },

  clone: function(opts) {
    console.log("SIBSIB", this.siblings);
    var n = _.map(this.siblings, function(s) {return s.clone();});
    // TODO(eob): any use in saving args to apply when cloned?
    var c = new DomNode(n, this.tree, [], this.opts);
    var relations = _.map(this.relations, function(relation) {
      var r = relation.clone();
      if (r.selection1.contains(this)) {
        r.selection1.nodes = _.without(r.selection1.nodes, this);
        r.selection1.nodes.push(c);
        _.each(r.selection2.nodes, function(node) {
          node.registerRelation(r);
        });
      } else if (r.selection2.contains(this)) {
        r.selection2.nodes = _.without(r.selection2.nodes, this);
        r.selection2.nodes.push(c);
        _.each(r.selection1.nodes, function(node) {
          node.registerRelation(r);
        });
      }
      return r;
    }, this);
    c.relations = relations;
    if ((typeof this.parentNode != 'undefined') && (this.parentNode !== null)) {
      this.parentNode.registerChild(c, {after: this, andInsert: true});
    }
    return c;
  },

  unregisterChild: function(child, opts) {
    this.children = _.without(this.children, child);
  },

  registerChild: function(child, opts) {
    console.log("registerChild", this, child);
    if (this.children === null) {
      // Danger: potential endless circular recursion
      // if this function and createChildren don't coordinate
      // properly.
      this._createChildren();
    }
    var didit = false;

    //TODO(eob): Handle case where there are no children.

    if ((! _.isUndefined(opts)) && (! _.isUndefined(opts.after))) {
      for (var i = this.children.length - 1; i >= 0; i--) {
        if (this.children[i] == opts.after) {
          // First bump forward everything
          for (var j = this.children.length - 1; j > i; j--) {
            this.children[j + 1] = this.children[j];
          }

          // Then set this at i+1
          this.children[i+1] = child;
          child.parentNode = this;
          if ((typeof opts != 'undefined') && (typeof opts.andInsert != 'undefined') && (opts.andInsert === true)) {
            this.children[i].siblings[this.children[i].siblings.length - 1].after(child.siblings);
          }
          didit = true;
        }
      }
      // do it after an element
    } 
    
    if (! didit) {
      // do it at end as failback, or if no relative position specified
      console.log("FFFF", this.children);
      var lastChild = this.children[this.children.length - 1];
      console.log("Last Child", lastChild, this);
      this.children[this.children.length] = child;
      if ((typeof opts != 'undefined') && (typeof opts.andInsert != 'undefined') && (opts.andInsert === true)) {
        lastChild.siblings[lastChild.siblings.length - 1].after(child.siblings);
      }
      child.parentNode = this;
    }
  },

  getInlineRules: function() {
    if (this.isSiblingGroup === true) {
      return null;
    } else {
      var inline = this.siblings[0].attr('data-cts');
      console.log("SIBS", this.siblings[0], this.siblings[0].html(), this.siblings);
      if ((inline !== null) && (typeof inline != 'undefined')) {
        return inline;
      } else {
        return null;
      }
    }
  },

  _findChildIn: function(fringe) {
    // Start exploring the subtree, adding the first.
    while (fringe.length > 0) {
      var first = CTS.$(fringe.shift());
      var child = new DomNode(first, this.tree);
      var relevantRelations = child.getRelations();
      if (relevantRelations.length > 0) {
        console.log("RELATIONS OH MY", first, child, relevantRelations);
        child.relations = relevantRelations;
        this.registerChild(child);
      } else {
        fringe = _.union(fringe, first.children().toArray());
      }
    }
  },

  _createChildren: function() {
    console.log("DomNode::createChildren", this);
    this.children = []; 

    if (this.isSiblingGroup === true) {
      // If this is a sibling group, the children are the siblings.
      _.each(this.siblingGroup, function(node) {
        this.registerChild(node);
      }, this);
    } else {
      if (this.siblings.length > 1) {
        // If this isn't s sibling group, there should only be one node
        // represented by this node.
        CTS.Debugging.Fatal("Siblings > 1", this);
      } else {
        // We start off with all child DOM nodes 
        var domKids = this.siblings[0].children().toArray();

        // Now we figure out if there is an ARE relation, which
        // requires us to add all enumerables below us as a child.
        var areRelations = _.filter(this.getRelations(), function(relation) {
          return (relation.name == "are");
        }, this);

        if (areRelations.length > 1) {
          CTS.Debugging.Log.Fatal(
              "We don't know what to do with >1 ARE for a node yet.",
              this);
        } else if (areRelations.length > 0) {
          /*
           * Part 1:
           *  Add kids in the prefix
           */
          var fringe = [];
          var i = 0;
          var opts = areRelations[0].optsFor(this);
          for (i = 0; i < opts.prefix; i++) {
            fringe.push(domKids[i]);
          }
          this._findChildIn(fringe);

          /*
           * Part 2:
           *  Add the enumerables
           */
          var lastOne = 0;
          var terminal = (domKids.length - opts.suffix);
          for (i = opts.prefix; i < terminal; i += opts.step) {
            var newNodes = [];
            for (var j = 0; j < opts.step; j++) {
              newNodes.push(CTS.$(domKids[i+j]));
              lastOne = i+j;
            }
            console.log("New", newNodes);
            var newNode = new CTS.DomNode(newNodes, this.tree);
            newNode.isEnumerable = true;
            this.registerChild(newNode);
          }

          /*
           * Part 3:
           *  Add nodes in the suffix
           */
          lastOne += 1;
          fringe = [];
          for (i = lastOne; i < domKids.length; i++) {
            fringe.push(domKids[i]);
          }
          this._findChildIn(fringe);
        } else {
          /* The easy case: just look for CTS-related nodes in the subtree */
          this._findChildIn(this.siblings[0].children().toArray());
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

  areIncoming: function(otherSelection, relation, opts) {
    // Note: all this prefix, sufix stuff should be handled
    // by the getChildren call.
    //var buckets = [];
    //var kid = this.node.children();
    //options = _.extend({
    //  prefix: 0,
    //  suffix: 0,
    //  step: 1
    //}, opts);

    //for (var i = 0; i < kid.length; i++) {
    //  if ((i >= options.prefix) && 
    //      (i < kid.length - options.suffix)) {
    //    // Create a new bucket at the start of a step
    //    if (((i - options.prefix) % options.prefix) == 0) {
    //      buckets[buckets.length] = [];
    //    }
    //    buckets[buckets.length - 1].append(kid[i]);
    //  }
    //}
    // Find the itemscoped children of this node.
    // var these = _.filter(this.node.children(), function(n) {
    //  return true;
    // }, this);
  },

  /**
   * Provides the itemscope'd nodes.
   */
  areOutgoing: function(relation, opts) {
    console.log("areOutgoing");
    var ret = _.filter(this.getChildren(), function(child) {
      return child.isEnumerable;
    });
    console.log("areOutgoing", ret);
    return ret;
  }

});
