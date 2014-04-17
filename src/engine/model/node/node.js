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
    var klass = CTS.Node.Html;

    if (! CTS.Fn.isUndefined(node.jquery)) {
      if (node.is('input') || node.is('select')) {
        klass = CTS.Node.HtmlInput;
      }
    } else if (node instanceof Element) {
      if ((node.nodeName == 'INPUT') || (node.nodeName == 'SELECT')) {
        klass = CTS.Node.HtmlInput;
      }
    }

    var node = new klass(node, tree, opts);
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
    this._lastValueChangedValue = null;
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
      this.on('ValueChanged', relation.handleEventFromNode, relation);
      this.on('ChildInserted', relation.handleEventFromNode, relation);
    }
  },

  unregisterRelation: function(relation) {
    this.off('ValueChanged', relation.handleEventFromNode, relation);
    this.off('ChildInserted', relation.handleEventFromNode, relation);
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

  markRelationsAsForCreation: function(val, recurse) {
    var rs = this.getRelations();
    for (var i = 0; i < rs.length; i++) {
      rs[i].forCreationOnly(val);
    }
    if (recurse) {
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].markRelationsAsForCreation(val, recurse);
      }
    }
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

    self.parsedInlineRelationSpecs = true;
    var specStr = this._subclass_getInlineRelationSpecString();

    // No inline spec
    if (! specStr) {
      deferred.resolve();
      return deferred.promise;
    }

    if (typeof this.tree == 'undefined') {
      deferred.reject("Undefined tree");
      return deferred.promise;
    }

    if (typeof this.tree.forrest == 'undefined') {
      deferred.reject("Undefined forrest");
      return deferred.promise;
    }

    var self = this;

    CTS.Parser.parseInlineSpecs(specStr, self, self.tree.forrest, true).then(
      function(forrestSpecs) {
        Fn.each(forrestSpecs, function(forrestSpec) {
          if (typeof forrestSpec.relationSpecs != 'undefined') {
            self.inlineRelationSpecs = forrestSpec.relationSpecs;
          }
        });
        deferred.resolve();
      },
      function(reason) {
        deferred.reject(reason);
      }
    );

    return deferred.promise;
  },

  parseInlineRelationSpecsRecursive: function() {
    var d = Q.defer();
    var self = this;
    this.parseInlineRelationSpecs().then(
      function() {
        Q.all(CTS.Fn.map(self.children, function(kid) {
           return kid.parseInlineRelationSpecsRecursive();
        })).then(function() {
          d.resolve();
        }, function(reason) {
          d.reject(reason);
        });
      },
      function(reason) {
        d.reject(reason);
      }
    );
    return d.promise;

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

  insertChild: function(node, afterIndex, throwEvent) {
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

    // Now we need to realize relations for this node.

    //TODO(eob) Have this be an event
    this._subclass_insertChild(node, afterIndex);

    if (throwEvent) {
      this.trigger("ChildInserted", {
        eventName: "ChildInserted",
        ctsNode: node,
        sourceNode: this,
        sourceTree: this.tree,
        afterIndex: afterIndex
      });
    }
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

  hide: function() {

  },

  unhide: function() {

  },

  destroy: function(destroyValueToo) {
    var gotIt = false;
    if (typeof destroyValueToo == 'undefined') {
      destroyValueToo = true;
    }
    if (this.parentNode) {
      for (var i = 0; i < this.parentNode.children.length; i++) {
        if (this.parentNode.children[i] == this) {
          CTS.Fn.arrDelete(this.parentNode.children, i, i);
          gotIt = true;
          break;
        }
      }
    }

    for (var i = 0; i < this.relations.length; i++) {
      this.relations[i].destroy();
    }
    // No need to log if we don't have it. That means it's root.
    // TODO(eob) log error if not tree root
    if (destroyValueToo) {
      this._subclass_destroy();
    }
  },

  undestroy: function() {
  },

  realizeChildren: function() {
    var deferred = Q.defer();

    if (this.children.length != 0) {
      CTS.Log.Fatal("Trying to realize children when already have some.", this);
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
    var deferred = Q.defer();
    var self = this;
    var p = this._subclass_beginClone();
    p.then(
      function(clone) {
        if (typeof clone == 'undefined') {
          CTS.Log.Fatal("Subclass did not clone itself when asked.");
          deferred.reject("Subclass did not clone itself when asked");
        } else {
          if (clone.relations.length > 0) {
            CTS.Log.Error("Clone shouldn't have relations yet, but does", clone);
          }
          // Note that we DON'T wire up any parent-child relationships
          // because that would result in more than just cloning the node
          // but also modifying other structures, such as the tree which
          // contained the source.
          self.recursivelyCloneRelations(clone);
          deferred.resolve(clone);
        }
      },
      function(reason) {
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  },

  recursivelyCloneRelations: function(to) {
    if (typeof to == 'undefined') {
      debugger;
    }
    var r = this.getRelations();

    if (to.relations && (to.relations.length > 0)) {
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
      if (typeof otherKid == 'undefined') {
        CTS.Log.Error("Cloned children out of sync with origin children.");
      }
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
      var insideOtherContainer = false;
      if (typeof otherContainer == 'undefined') {
        // They didn't specify, so anything fits.
        insideOtherContainer = true;
      } else if (other.equals(otherContainer) || other.isDescendantOf(otherContainer)) {
        insideOtherContainer = true;
      }
      var insideOtherParent = (other.equals(otherParent) || other.isDescendantOf(otherParent));

      if ((! insideOtherParent) && (insideOtherContainer)) {
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
    var d = Q.defer();
    var self = this;
    var r = this.getRelations();
    self._processIncomingRelations(r, 'if-exist');
    self._processIncomingRelations(r, 'if-nexist');
    self._processIncomingRelations(r, 'is', false, true).then(function() {
      return self._processIncomingRelations(r, 'are', true, true)
    }).then(function() {
      return Q.all(CTS.Fn.map(self.getChildren(), function(child) {
        return child._processIncoming();
      }));
    }).then(function() {
      return self._processIncomingRelations(r, 'graft', true, true);
    }).then(function() {
      d.resolve();
    }, function(reason) {
      d.reject(reason);
    })
    return d.promise;
  },

  _processIncomingRelations: function(relations, name, once, defer) {
    if (defer) {
      promises = [];
    }
    for (var i = 0; i < relations.length; i++) {
      if (relations[i].name == name) {
        if (relations[i].node1.equals(this)) {
          if (defer) {
            var res = relations[i].execute(this);
            if (res) {
              promises.push(res);
            }
          } else {
            relations[i].execute(this);
          }
          if (once) {
            break;
          }
        }
      }
    }
    if (defer) {
      return Q.all(promises);
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
    return this.value;
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
      this._subclass_throwChangeEvents(true);
    } else {
      this.shouldThrowEvents = false;
      this._subclass_throwChangeEvents(false);
    }
  },

  _maybeThrowDataEvent: function(evt) {
    if (this.shouldThrowEvents) {
      if (evt.ctsNode) {
        evt.newValue = evt.ctsNode.getValue();
        if (evt.eventName == 'ValueChanged') {
          // Maybe squash if we're in an echo chamber.
          if (this._lastValueChangedValue == evt.newValue) {
            // An echo! Stop it here.
            CTS.Log.Info("Suppressing event echo", this, evt);
            this._lastValueChangedValue = null;
            return;
          } else {
            this._lastValueChangedValue = evt.newValue;
            evt.sourceNode = this;
            evt.sourceTree = this.tree;
            this.trigger(evt.eventName, evt);
            if (this.tree && this.tree.trigger) {
              this.tree.trigger(evt.eventName, evt); // Throw it for the tree, too.
            }
          }
        }
      }
    }
  },

  toggleReceiveRelationEvents: function(bool, recursive) {
    if (bool == this.shouldReceiveEvents) {
      return;
    } else if (bool) {
      this.shouldReceiveEvents = true;
    } else {
      this.shouldReceiveEvents = true;
    }

    if (recursive) {
      for (var i = 0; i < this.getChildren().length; i++) {
        this.children[i].toggleReceiveRelationEvents(bool, recursive);
      }
    }
  },

  handleEventFromRelation: function(evt, fromRelation, fromNode) {
    var self = this;
    if (this.shouldReceiveEvents) {
      if (evt.eventName == "ValueChanged") {
        if (fromRelation.name == "is") {
          this.setValue(evt.newValue);
        }
      } else if (evt.eventName == "ChildInserted") {
        var otherContainer = evt.sourceNode;
        var otherItem = evt.ctsNode;
        // If the from relation is ARE...
        if (fromRelation.name == "are") {
          // XXX: Make diff instead of redo! For efficiency!
          // Clone one.
          var afterIndex = evt.afterIndex;
          var myIterables = fromRelation._getIterables(this);
          // TODO YAY!
          myIterables[afterIndex].clone().then(
            function(clone) {
              // This will force realization of inline specs.
              clone.parseInlineRelationSpecsRecursive().then(
                function() {
                  self.tree.forrest.realizeRelations(myIterables[afterIndex], clone);
                  clone.pruneRelations(otherItem, otherContainer);
                  clone._processIncoming().then(
                    function() {
                      window.hooga = clone; // xxx
                      self.insertChild(clone, afterIndex, false);
                    },
                    function(reason) {
                      CTS.Log.Error(reason);
                    }
                  ).done();
                }
              )
            },
            function(reason) {
              CTS.Log.Error(reason);
            }
          );
        }
      }
    }
  },

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
