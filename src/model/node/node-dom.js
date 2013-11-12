// ### Constructor
CTS.Node.Html = function(node, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.kind = "HTML";
  this.value = this._createJqueryNode(node);
  var currentAttr = this.value.attr('data-ctsid');
//  if ((typeof currentAttr != 'undefined') && (currentAttr != null)) {
//    CTS.Log.Warn("Warning: Creating Node.Html for element with ctsId", this);
//  }
  this.ctsId = Fn.uniqueId().toString();
  this.tree._nodeLookup[this.ctsId] = this;
  this.value.attr('data-ctsid', this.ctsId);

  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.Html.prototype, CTS.Node.Base, CTS.Events, {

  debugName: function() {
    return CTS.Fn.map(this.siblings, function(node) {
      return node[0].nodeName; }
    ).join(', ');
  },

  // Horrendously inefficient.
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    if (this.value.is(selector)) {
      if (typeof ret == 'undefined') {
        CTS.Log.Error("push");
      }
      ret.push(this);
    }
    for (var i = 0; i < this.children.length; i++) {
      if (typeof this.children[i] == 'undefined') {
        CTS.Log.Error("Undefined child");
      }
      this.children[i].find(selector, ret);
    }
    return ret;
  },

  /************************************************************************
   **
   ** Required by Node base class
   **
   ************************************************************************/

   descendantOf: function(other) {
     // jQuery trick
     // this.value is a jQuery node
     return this.value.closest(other.value).length != 0;
   },

   /*
    * Precondition: this.children.length == 0
    *
    * Realizes all children.
    */
   _subclass_realizeChildren: function() {
     // promise
     var deferred = Q.defer();
     var last = deferred.promise;

     this.children = [];

     // Map each child
    
     var self = this;
     var promises = CTS.Fn.map(this.value.children(), function(child) {
       var promise = CTS.Node.Factory.Html(child, self.tree, self.opts);
       return promise;
     });


     Q.all(promises).then(
       function(results) {
         self.children = results;
         for (var i = 0; i < self.children.length; i++) {
           var node = self.children[i];
           if (typeof node == "undefined") {
             CTS.Log.Error("Child is undefined");
           }
           node.parentNode = self;
           self.tree._nodeLookup[node.ctsId] = node;
         }
         deferred.resolve();
       },
       function(reason) {
         deferred.reject(reason);
       }
     );

     return deferred.promise;
   },

   /* 
    * Inserts this DOM node after the child at the specified index.
    */
   _subclass_insertChild: function(child, afterIndex) {
     this.tree._nodeLookup[child.ctsId] = child;
     if (afterIndex == -1) {
       if (this.getChildren().length == 0) {
         this.value.append(child.value);
       } else {
         this.value.prepend(child.value)
       }
     } else if (afterIndex > -1) {
       var leftSibling = this.getChildren()[afterIndex];
       leftSibling.value.after(child.value);
     } else {
       CTS.Log.Error("[HTML Node] Afer index shouldn't be ", afterIndex);
     }
   },

   /*
    *
    * Args:
    *   child: A jQuery node
    *
    * TODO(eob(): Implement some kind of locking here?
    */
   _onChildInserted: function(child) {
     var self = this;
     CTS.Node.Factory.Html(child, this.tree, this.opts).then(
       function(ctsChild) {
         ctsChild.parentNode = self;
         var idx = child.index();
         self.children[self.children.length] = null;
         // TODO: need locking on kids
         for (var i = self.children.length - 1; i >= idx; i--) {
           if (i == idx) {
             self.children[i] = ctsChild;
           } else {
             self.children[i] = self.children[i - 1];
           }
         }

         ctsChild.realizeChildren().then(
           function() {
             //  Now run any rules.
             CTS.Log.Info("Running CTS Rules on new node");
             ctsChild._processIncoming();
           },
           function(reason) {
             CTS.Log.Error("Could not realize children of new CTS node", ctsChild);
           }
         );
       },
       function(reason) {
         CTS.Log.Error("Could not convert new node to CTS node", child, reason);
       }
     );
   },

   /* 
    *  Removes this DOM node from the DOM tree it is in.
    */
   _subclass_destroy: function() {
     delete this.tree._nodeLookup[this.ctsId];
     this.value.remove();
   },

   _subclass_getInlineRelationSpecString: function() {
     if (this.value !== null) {
       var inline = this.value.attr('data-cts');
       return inline;
     }
   },

   _subclass_beginClone: function(node) {
     var value = null;
     if (typeof node == "undefined") {
       value = this.value.clone();
     } else {
       value = CTS.$(node);
     }

     // NOTE: beginClone is allowed to directly create a Node
     // without going through the factory because we already can be
     // sure that all this node's trees have been realized
     var clone = new CTS.Node.Html(value, this.tree, this.opts);

     // Handled by superclass
     //for (var i = 0; i < this.relations.length; i++) {
     //  var r = this.relations[i].clone();
     //  r.rebind(this, clone);
     //  clone.relations.push(r);
     //}

     if (this.children.length != clone.value.children().length) {
       CTS.Log.Error("Trying to clone CTS node that is out of sync with dom");
     }
     // We use THIS to set i
     for (var i = 0; i < this.children.length; i++) {
       var childNode = clone.value.children()[i];
       var child = this.children[i]._subclass_beginClone(childNode);
       child.parentNode = clone;
       this.tree._nodeLookup[child.ctsId] = child;
       if (typeof child.children  == 'undefined') {
         CTS.Log.Error("Kids undefined");
       }
       clone.children.push(child);
     }

     if (clone.relations.length > 0) {
       CTS.Log.Error("After subclass clone, relations shouldn't be > 0");
     }

     return clone;
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    if (Fn.isUndefined(opts) || Fn.isUndefined(opts.attribute)) {
      return this.value.html();
    } else {
      return this.value.attr(opts.attribute);
    }
  },

  setValue: function(value, opts) {
    if (Fn.isUndefined(opts) || Fn.isUndefined(opts.attribute)) {
      this.value.html(value);
      CTS.Log.Info("Just set myself to", this.tree.name, value); } else {
      this.value.attr(opts.attribute, value);
    }
  },

  _subclass_ensure_childless: function() { 
    if (this.value !== null) {
      this.value.html("");
    }
  },

  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

  _createJqueryNode: function(node) {
    // A Node contains multiple DOM Nodes
    var n = null;
    if (typeof node == 'object') {
      if (! CTS.Fn.isUndefined(node.jquery)) {
        n = node;
      } else if (node instanceof Array) {
        n = node[0];
      } else if (node instanceof Element) {
        n = CTS.$(node);
      } else {
        n = null;
      }
    } else if (typeof node == 'string') {
      n = $(node);
    } else {
      n = null;
    }

    if (n !== null) {
      // n is now a jqnode.
      // place a little link to us.
      n.data('ctsnode', this);
    }

    return n;
  },

//  _subclass_trigger: function(eventName, eventData, spreadToBaseLayer) { 
//    if (spreadToBaseLayer && (this.value != null)) {
//      this.value.trigger(eventName, eventData);
//    }
//  },

  _subclass_on: function(evtName, handler) {
    console.log("adding listener for", evtName);
    this.value.on(evtName, handler);
  }

});
