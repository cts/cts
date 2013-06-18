// Node
// --------------------------------------------------------------------------
// 
// A Node represents a fragment of a tree which is annotated with CTS.
//
// Nodes are responsible for understanding how to behave when acted on
// by certain relations (in both directions). The differences between
// different types of trees (JSON, HTML, etc) are concealed at this level.

CTS.Node = {

  initializeNodeBase: function(tree, opts) {
    this.opts = opts;
    this.tree = tree;
    this.kind = null;
    this.children = [];
    this.parentNode = null;
    this.relations = [];
    this.value = null;
    this.addedMyInlineRelationsToForrest = false;
    //this.initializeStateMachine();
  },

  getChildren: function() {
    return this.children;
  },

  registerRelation: function(relation) {
    if (! CTS.Fn.contains(this.relations, relation)) {
      this.relations.push(relation);
    }
  },

  unregisterRelation: function(relation) {
    this.relations = CTS.Fn.filter(this.relations,
        function(r) { return r != relation; });
  },

  getRelations: function() {
    if (! this.addedMyInlineRelationsToForrest) {
      this.registerInlineRelationSpecs();
    }
    return this.relations;
  },

  registerInlineRelationSpecs: function() {
    if (this.addedMyInlineRelationsToForrest) {
      CTS.Log.Warn("Not registering inline relations: have already done so.");
    } else {
      if ((typeof this.tree != 'undefined') && (typeof this.tree.forrest != 'undefined')) {
        var specStr = _subclass_getInlineRelationSpecString();
        if (specStr) {
          CTS.Parser.parseInlineSpecs(specStr, this, this.tree.forrest, true);
        }
        this.addedMyInlineRelationsToForrest = true;
      } else {
        CTS.Log.Warn("Could not add inline relations to null tree.forrest");
      }
    }
  },

  getSubtreeRelations: function() {
    return CTS.Fn.union(this.getRelations(), CTS.Fn.flatten(
      CTS.Fn.map(this.getChildren(), function(kid) {
        return kid.getSubtreeRelations();
      }))
    );
  },
  
  insertChild: function(node, afterIndex, log) {
    if (typeof afterIndex == 'undefined') {
      afterIndex = this.children.length - 1;
    }

    this.children[this.children.length] = null;
    for (var i = this.children.length - 1; i > afterIndex; i--) {
      if (i == (afterIndex + 1)) {
        this.children[i] = node;
      } else {
        this.children[i] = this.children[i - 1];
      }
    }
    if (log) {
      console.log("Adding", node, "to", this);
    }

    node.parentNode = this;

    //TODO(eob) Have this be an event
    this._subclass_insertChild(node, afterIndex);
  },

  isDescendantOf: function(other) {
    var p = this.parentNode;
    while (p != null) {
      if (p.equals(other)) {
        return true;
      }
      p = p.parentNode;
    }
    return false;
  },

  replaceChildrenWith: function(nodes) {
    var goodbye = this.children;
    this.children = [];
    for (var i = 0; i < goodbye.length; i++) {
      goodbye[i]._subclass_destroy();
    }

    for (var j = 0; j < nodes.length; j++) {
      this.insertChild(nodes[j]);
    }
  },

  // TODO(eob): potentially override later
  equals: function(other) {
    return this == other;
  },

  destroy: function() {
    var gotIt = false;
    if (this.parentNode) {
      for (var i = 0; i < this.parentNode.children.length; i++) {
        if (this.parentNode.children[i] == this) {
          CTS.Fn.arrDelete(this.parentNode.children, i, i);
          gotIt = true;
          break;
        }
      }
    }
    // No need to log if we don't have it. That means it's root.
    // TODO(eob) log error if not tree root
    this._subclass_destroy();
  },

  undestroy: function() {
  },

  realizeChildren: function() {
    if (this.children.length != 0) {
      CTS.Log.Fatal("Trying to realize children when already have some.");
    }
    this._subclass_realizeChildren();
    CTS.Fn.each(this.children, function(child) {
      child.realizeChildren();
    });
  },

  clone: function() {
    var c = this._subclass_beginClone();

    // Note: because the subclass constructs it's own subtree,
    // that means it is also responsible for cloning downstream nodes.
    // thus we only take care of THIS NODE's relations.
    var r = this.getRelations();
    for (var i = 0; i < r.length; i++) {
      var n1 = r[i].node1;
      var n2 = r[i].node2;
      if (n1 == this) {
        n1 = c;
      } else if (n2 == this) {
        n2 = c;
      } else {
        CTS.Fatal("Clone failed");
      }
      var relationClone = r[i].clone(n1, n2);
      console.log("Cloning", r[i].name, "for", this.getValue());
    };
    // Note that we DON'T wire up any parent-child relationships
    // because that would result in more than just cloning the node
    // but also modifying other structures, such as the tree which
    // contained the source.
    return c;
  },

  pruneRelations: function(otherParent, otherContainer) {
    var self = this;
    this.relations = CTS.Fn.filter(this.getRelations(), function(r) {
      var other = r.opposite(self);
      // If the rule ISN'T subtree of this iterable
      // But it IS inside the other container
      // Remove it
      if ((! (other.equals(otherParent) || other.isDescendantOf(otherParent))) 
         && ((typeof otherContainer == 'undefined') || other.isDescendantOf(otherContainer)))
        { 
        r.destroy();
        return false;
      } else {
        return true;
      }
    });
    
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].pruneRelations(otherParent, otherContainer);
    }
  },

  _processIncoming: function() {
    // Do incoming nodes except graft
    this._processIncomingRelations('if-exist');
    this._processIncomingRelations('if-nexist');
    this._processIncomingRelations('is');
    this._processIncomingRelations('are');

    CTS.Log.Info("Dump Pre");
    CTS.Debugging.DumpTree(this);
    // Do children
    for (var i = 0; i < this.children.length; i++) {
      this.children[i]._processIncoming();
    }
    CTS.Log.Info("Dump Post");
    CTS.Debugging.DumpTree(this);

    // Do graft
    this._processIncomingRelations('graft', true);
  },

  _processIncomingRelations: function(name, once) {
    console.log("proc inc from node", this.getValue(), name);
    for (var i = 0; i < this.relations.length; i++) {
      if (this.relations[i].name == name) {
        if (this.relations[i].node1.equals(this)) {
          this.relations[i].execute(this);
          console.log("found one " + this.relations[i].name, name);
          if (once) {
            break;
          }
        }
      }
    }
  },

  /************************************************************************
   **
   ** Methods to be overridden by subclasses
   **
   ************************************************************************/

  getValue: function(opts) {
    return this.value;
  },

  setValue: function(v, opts) {
    this.value = v;
  },

  descendantOf: function(other) {
    return false;
  },

  _subclass_realizeChildren: function() {},
  _subclass_insertChild: function(child, afterIndex) {},
  _subclass_destroy: function() {},
  _subclass_getInlineRelations: function() {},
  _subclass_beginClone: function() {}

};
