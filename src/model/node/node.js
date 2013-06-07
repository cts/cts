// Node
// --------------------------------------------------------------------------
// 
// A Node represents a fragment of a tree which is annotated with CTS.
//
// Nodes are responsible for understanding how to behave when acted on
// by certain relations (in both directions). The differences between
// different types of trees (JSON, HTML, etc) are concealed at this level.

CTS.NonExistantNode = {};

CTS.Node = {

  '_kind': 'undefined',

  initializeNodeBase: function() {
    this.kind = null;
    this.children = [];
    this.parentNode = null;
    this.relations = [];
    this.initializeStateMachine();
  },

  render: function(opts) {
    console.log(this, "render");

    if (! CTS.Fn.isUndefined(opts)) {
      if (CTS.Fn.has(opts, 'callback')) {
        var scope = this;
        if (CTS.Fn.has(opts, 'callbackScope')) {
          scope = opts.callbackScope;
        }
        this.once('FsmEntered:Finished', opts.callback, scope);
      }
    }

    this.fsmTransition("BeginRender");
  },

  getChildren: function() {
    if (CTS.Fn.isUndefined(this.children) || CTS.Fn.isNull(this.children)) {
      this._createChildren();
    }
    return this.children;
  },

  registerRelation: function(relation) {
    if (! CTS.Fn.contains(this.relations, relation)) {
      this.relations.push(relation);
    }
  },

  getRelations: function() {
    if (! this.searchedForRelations) {
      if ((typeof this.tree != 'undefined') && (typeof this.tree.forrest != 'undefined')) {
        this.tree.forrest.registerRelationsForNode(this);
      }
      this.searchedForRelations = true;
    }
    return this.relations;
  },

  getSubtreeRelations: function() {
    return CTS.Fn.union(this.getRelations(), CTS.Fn.flatten(
      CTS.Fn.map(this.getChildren(), function(kid) {
        return kid.getSubtreeRelations();
      }))
    );
  },

  treeSize: function() {
    return 1 + this.getChildren().length;
  },

  subtreeRelations: function() {
    var relations = this.tree.forrest.relationsForNode(this);
    var myChildren = this.getChildren();
    for (var i = 0; i < myChildren.length; i++) {
      relations = CTS.Fn.union(relations, myChildren[i].subtreeRelations());
    }
    return relations;
  },

  getInlineRules: function() {
    return null;
  },

  insertChild: function(node, afterIndex) {
    if (typeof afterIndex == 'undefined') {
      afterIndex = this.getChildren().length - 1;
    }

    this.children[this.children.length] = null;
    for (var i = this.children.length - 1; i > afterIndex; i--) {
      if (i == (afterIndex + 1)) {
        this.children[i] == node;
      } else {
        this.children[i] = this.children[i - 1];
      }
    }

    node.parentNode = this;

    //TODO(eob) Have this be an event
    this._subclass_insertChild(node, afterIndex);
  },

  destroy: function() {
    if (this.parentNode) {
      var gotIt = false;
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i] == node) {
          delete this.children[node];
          gotIt = true;
          break;
        }
      }
    }
    if (! gotIt) {
      CTS.Log.Error("Destroying child whose parent doesn't know about it.");
    }
    this._subclass_destroy();
  },

  /************************************************************************
   **
   ** To be implemented by format-specific node subclasses
   **
   ************************************************************************/

  _subclass_realizeChildren: function() {},
  _subclass_insertChild: function(child, afterIndex) {},
  _subclass_destroy: function() {}

};
