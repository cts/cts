// Node
// --------------------------------------------------------------------------
//
// A Node represents a fragment of a tree which is annotated with CTS.
//
// Nodes are responsible for understanding how to behave when acted on
// by certain relations (in both directions). The differences between
// different types of trees (JSON, HTML, etc) are concealed at this level.
CTS.Node = {};

CTS.Node.Factory = {
  Html: function(node, tree, opts) {
    var deferred = Q.defer();
    var node = new CTS.Node.Html(node, tree, opts);
    node.parseInlineRelationSpecs().then(
      function() {
        if (node == null) {
          CTS.Log.Error("Created NULL child");
        }
        deferred.resolve(node);
      },
      function(reason) {
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  }
};

CTS.Node.Base = {

  initializeNodeBase: function(tree, opts) {
    this.opts = opts;
    this.tree = tree;
    this.kind = null;
    this.children = [];
    this.parentNode = null;
    this.relations = [];
    this.value = null;
    this.shouldThrowEvents = false;
    this.shouldReceiveEvents = false;
    this.inlineRelationSpecs = [];
    this.parsedInlineRelationSpecs = false;
    this.realizedInlineRelationSpecs = false;
  },

  getChildren: function() {
    return this.children;
  },

  registerRelation: function(relation) {
    if (typeof this.relations == 'undefined') {
      this.relations = [];
    }
    if (! CTS.Fn.contains(this.relations, relation)) {
      this.relations.push(relation);
    }
  },

  unregisterRelation: function(relation) {
    this.relations = CTS.Fn.filter(this.relations,
        function(r) { return r != relation; });
  },

  getRelations: function() {
    if (! this.realizedInlineRelationSpecs) {
      for (var i = 0; i < this.inlineRelationSpecs.length; i++) {
        var spec = this.inlineRelationSpecs[i];
        this.tree.forrest.realizeRelation(spec);
      }
      this.realizedInlineRelationSpecs = true;
    }
    return this.relations;
  },

  parseInlineRelationSpecs: function() {
    var deferred = Q.defer();
    var self = this;

    // Already added
    if (this.parsedInlineRelationSpecs === true) {
      CTS.Log.Warn("Not registering inline relations: have already done so.");
      deferred.resolve();
      return deferred.promise;
    }

    var specStr = this._subclass_getInlineRelationSpecString();

    // No inline spec
    if (! specStr) {
      deferred.resolve();
      self.parsedInlineRelationSpecs = true;
      return deferred.promise;
    }

    if (typeof this.tree == 'undefined') {
      deferred.reject("Undefined tree");
      self.parsedInlineRelationSpecs = true;
      return deferred.promise;
    }

    if (typeof this.tree.forrest == 'undefined') {
      deferred.reject("Undefined forrest");
      self.parsedInlineRelationSpecs = true;
      return deferred.promise;
    }

    var self = this;

    CTS.Parser.parseInlineSpecs(specStr, self, self.tree.forrest, true).then(
      function(forrestSpecs) {
        Fn.each(forrestSpecs, function(forrestSpec) {
          self.parsedInlineRelationSpecs = true;
          if (typeof forrestSpec.relationSpecs != 'undefined') {
            self.inlineRelationSpecs = forrestSpec.relationSpecs;
          }
        });
        deferred.resolve();
      },
      function(reason) {
        self.parsedInlineRelationSpecs = true;
        deferred.reject(reason);
      }
    );

    return deferred.promise;
  },

  getSubtreeRelations: function() {
    return CTS.Fn.union(this.getRelations(), CTS.Fn.flatten(
      CTS.Fn.map(this.getChildren(), function(kid) {
        return kid.getSubtreeRelations();
      }))
    );
    /*
       var deferred = Q.defer();

    this.getRelations().then(function(relations) {
      var kidPromises = CTS.Fn.map(this.getChildren(), function(kid) {
        return kid.getSubtreeRelations();
      });
      if (kidPromises.length == 0) {
        deferred.resolve(relations);
      } else {
        Q.allSettled(kidPromises).then(function(results) {
          var rejected = false
          var kidRelations = [];
          results.forEach(function(result) {
            if (result.state == "fulfilled") {
              kidRelations.push(result.value);
            } else {
              rejected = true;
              CTS.Log.Error(result.reason);
              deferred.reject(result.reason);
            }
          });
          if (!rejected) {
            var allR = CTS.Fn.union(relations, CTS.Fn.flatten(kidRelations));
            deferred.resolve(allR);
          }
        });
      }
    }, function(reason) {
      deferred.reject(reason);
    });

    return deferred.promise;
    */
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
    // Now clean up anything left
    this._subclass_ensure_childless();

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
    var deferred = Q.defer();

    if (this.children.length != 0) {
      CTS.Log.Fatal("Trying to realize children when already have some.");
      deferred.reject("Trying to realize when children > 0");
    }

    var self = this;
    var sc = this._subclass_realizeChildren();

    sc.then(
      function() {
        var promises = CTS.Fn.map(self.children, function(child) {
          return child.realizeChildren();
        });
        Q.all(promises).then(
          function() {
            deferred.resolve();
          },
          function(reason) {
            deferred.reject(reason);
          }
        );
      },
      function(reason) {
        deferred.reject(reason);
      }
    );

    return deferred.promise;
  },

  clone: function() {
    var c = this._subclass_beginClone();
    if (c.relations.length > 0) {
      CTS.Log.Error("Clone shouldn't have relations yet");
    }

    this.recursivelyCloneRelations(c);
    // Note that we DON'T wire up any parent-child relationships
    // because that would result in more than just cloning the node
    // but also modifying other structures, such as the tree which
    // contained the source.
    return c;
  },

  recursivelyCloneRelations: function(to) {
    var r = this.getRelations();
    if (to.relations.length > 0) {
      CTS.Log.Error("Clone relations to non-empty relation container. Blowing away");
      while (to.relations.length > 0) {
        to.relations[0].destroy();
      }
    }

    for (var i = 0; i < r.length; i++) {
      var n1 = r[i].node1;
      var n2 = r[i].node2;
      if (n1 == this) {
        n1 = to;
      } else if (n2 == this) {
        n2 = to;
      } else {
        CTS.Log.Fatal("Clone failed");
      }
      var relationClone = r[i].clone(n1, n2);
    };

    for (var j = 0; j < this.getChildren().length; j++) {
      var myKid = this.children[j];
      var otherKid = to.children[j];
      myKid.recursivelyCloneRelations(otherKid);
    }
  },

  pruneRelations: function(otherParent, otherContainer) {
    var self = this;
    this.relations = CTS.Fn.filter(this.getRelations(), function(r) {
      var other = r.opposite(self);
      // If the rule ISN'T subtree of this iterable
      // But it IS inside the other container
      // Remove it
      var otherCheck = ((typeof otherContainer == 'undefined') || other.isDescendantOf(otherContainer));
      var thisCheck = (! (other.equals(otherParent) || other.isDescendantOf(otherParent)));
      if (CTS.LogLevel.Debug()) {
        CTS.Log.Debug("Prune relations", thisCheck, otherCheck, this, otherParent, otherContainer);
      }
      if (thisCheck && otherCheck) {
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

  trigger: function(eventName, eventData) {
    this._subclass_trigger(eventName, eventData);
  },

  getProvenance: function() {
    if (this.provenance == null) {
      if (this.parentNode == null) {
        // We're the root of a tree. This is an error: the root should always know where it
        // came from.
        CTS.Log.Error("Root of tree has no provenance information");
        return null;
      } else {
        return this.parentNode.getProvenance();
      }
    } else {
      return this.provenance;
    }
  },

  setProvenance: function(tree, node) {
    this.provenance = {
      tree: tree
    }
    if (! Fn.isUndefined(node)) {
      this.provenance.node = node;
    }
  },

  _processIncoming: function() {
    // Do incoming nodes except graft
    var self = this;
    var r = this.getRelations();
    self._processIncomingRelations(r, 'if-exist');
    self._processIncomingRelations(r, 'if-nexist');
    self._processIncomingRelations(r, 'is');
    self._processIncomingRelations(r, 'are');

    for (var i = 0; i < self.children.length; i++) {
      self.children[i]._processIncoming();
    }

    // Do graft
    self._processIncomingRelations(r, 'graft', true);
  },

  _processIncomingRelations: function(relations, name, once) {
    for (var i = 0; i < relations.length; i++) {
      if (relations[i].name == name) {
        if (relations[i].node1.equals(this)) {
          relations[i].execute(this);
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

  getIfExistValue: function() {
    // The node's existence is enough by default.
    return true;
  },

  setValue: function(v, opts) {
    this.value = v;
  },

  hasRule: function(name) {
    for (var i = 0; i < this.relations.length; i++) {
      if (this.relations[i].name == name) {
        return true;
      }
    }
    return false;
  },

  /* Parent needs to have an ARE and we also need to be within
   * the scope.
   */
  isEnumerated: function() {
    if (this.parentNode != null) {
      var p = this.parentNode;
      for (var i = 0; i < p.relations.length; i++) {
        if (p.relations[i].name == 'are') {
          var r = p.relations[i];
          var opts = r.optsFor(p);
          var kids = p.getChildren();
          var iterables = kids.slice(opts.prefix, kids.length - opts.suffix);
          if (iterables.indexOf(this) > -1) {
            return true;
          }
        }
      }
    }
    return false;
  },

  descendantOf: function(other) {
    return false;
  },

  onDataEvent: function(eventName, callback) {
    this._subclass_onDataEvent(eventName, callback);
  },

  offDataEvent: function(eventName, callback) {
    this._subclass_offDataEvent(eventName, callback);
  },

  /***************************************************************************
   * EVENTS
   *
   * Two modes:
   *   - shouldThrowEvents
   *   - shouldReceiveEvents (and modify)
   *
   * Events are dicts. The `name` field contains the type.
   *
   * ValueChanged:
   *   newValue -- contains the new value
   *
   **************************************************************************/

  toggleThrowDataEvents: function(bool) {
    if (typeof this._valueChangedListenerProxy == 'undefined') {
      this._valueChangedListenerProxy = CTS.$.proxy(this._subclass_valueChangedListener, this);
    }

    if (bool == this.shouldThrowEvents) {
      return;
    } else if (bool) {
      this.shouldThrowEvents = true;
      this._subclass_onDataEvent("ValueChanged", this._valueChangedListenerProxy);
    } else {
      this.shouldThrowEvents = false;
      this._subclass_offDataEvent("ValueChanged", this._valueChangedListenerProxy);
    }
  },

  toggleReceiveRelationEvents: function(bool) {
    if (bool == this.shouldReceiveEvents) {
      return;
    } else if (bool) {
      this.shouldReceiveEvents = true;
    } else {
      this.shouldReceiveEvents = true;
    }
  },

  handleEventFromData: function(evt) {
    if (CTS.LogLevel.Debug()) {
      CTS.Log.Debug("Event from data", evt);
    }
    if (this.shouldThrowEvents) {
      this.passEventToRelations(evt);
    }
  },

  handleEventFromRelation: function(evt, fromRelation, fromNode) {
    console.log("EVENT FROM RELATION");
    if (this.shouldReceiveEvents) {
      if (evt.name == "ValueChanged") {
        if (fromRelation.name == "is") {
          this._subclass_setValue(evt.newValue);
        }
      }
    }
  },

  passEventToRelations: function(evt) {
    if (! this.relations) {
      return;
    }
    for (var i = 0; i < this.relations.length; i++) {
      var relation = this.relations[i];
      var other = relation.opposite(this);
      other.handleEventFromRelation(evt, relation, this);
    }
  },

  // TODO: How to supress events
  _subclass_setValue: function(newValue) {},

  /***************************************************************************
   * STUBS FOR SUBCLASS
   **************************************************************************/

  _subclass_onDataEvent: function() {},
  _subclass_offDataEvent: function() {},
  _subclass_realizeChildren: function() {},
  _subclass_insertChild: function(child, afterIndex) {},
  _subclass_destroy: function() {},
  _subclass_beginClone: function() {},
  _subclass_getInlineRelationSpecString: function() { return null; },
//  _subclass_trigger: function(eventName, eventData) { },
  _subclass_ensure_childless: function() { },
};
