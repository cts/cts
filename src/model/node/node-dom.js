// ### Constructor
var DomNode = CTS.DomNode = function(node, tree, opts, args) {

  this.initializeNodeBase();

  this.searchedForRelations = false;
  this.isSiblingGroup = false;
  this.isEnumerable = false;

  // A Node contains multiple DOM Nodes
  if (typeof node == 'object') {
    if (! CTS.Fn.isUndefined(node.jquery)) {
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
    this.siblings = CTS.Fn.map($(node), function(n) { return $(n); });
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
CTS.Fn.extend(CTS.DomNode.prototype, CTS.Events, CTS.StateMachine, CTS.Node, {

  debugName: function() {
    return CTS.Fn.map(this.siblings, function(node) {
      return node[0].nodeName; }
    ).join(', ');
  },

  clone: function(opts) {
    console.log("SIBSIB", this.siblings);
    var n = CTS.Fn.map(this.siblings, function(s) {return s.clone();});
    // TODO(eob): any use in saving args to apply when cloned?
    var c = new DomNode(n, this.tree, [], this.opts);
    var relations = CTS.Fn.map(this.relations, function(relation) {
      var r = relation.clone();
      if (r.selection1.contains(this)) {
        r.selection1.nodes = CTS.Fn.without(r.selection1.nodes, this);
        r.selection1.nodes.push(c);
        CTS.Fn.each(r.selection2.nodes, function(node) {
          node.registerRelation(r);
        });
      } else if (r.selection2.contains(this)) {
        r.selection2.nodes = CTS.Fn.without(r.selection2.nodes, this);
        r.selection2.nodes.push(c);
        CTS.Fn.each(r.selection1.nodes, function(node) {
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

    if ((! CTS.Fn.isUndefined(opts)) && (! CTS.Fn.isUndefined(opts.after))) {
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
        fringe = CTS.Fn.union(fringe, first.children().toArray());
      }
    }
  },

  _createChildren: function() {
    console.log("DomNode::createChildren", this);
    this.children = []; 

    if (this.isSiblingGroup === true) {
      // If this is a sibling group, the children are the siblings.
      CTS.Fn.each(this.siblingGroup, function(node) {
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
        var areRelations = CTS.Fn.filter(this.getRelations(), function(relation) {
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

  /************************************************************************
   **
   ** Required by Node base class
   **
   ************************************************************************/

   /*
    * Precondition: this.children.length == 0
    *
    * Realizes all children.
    */
   _subclass_realizeChildren: function() {
     if (this.children.length != 0) {
       CTS.Log.Fatal("Trying to realize children when already have some.");
     }


   },

   /* 
    * Inserts this DOM node after the child at the specified index.
    */
   _subclass_insertChild: function(child, afterIndex) {
     var leftSibling = this.getChildren()[afterIndex];
     leftSibling.jQueryNode.after(this.jQueryNode);
   },

   /* 
    *  Removes this DOM node from the DOM tree it is in.
    */
   _subclass_destroy: function() {
     this.jQueryNode.remove();
   }

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/


});
