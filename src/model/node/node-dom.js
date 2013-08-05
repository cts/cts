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
      ret.push(this);
    }
    for (var i = 0; i < this.children.length; i++) {
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

     var promises = [];
     this.children = [];
     Fn.each(this.value.children(), function(child) {
       var promise = Q.defer();

       CTS.Node.Factory.Html(child, this.tree, this.opts).then(
         function(node) {


 // NOTE: Neeed to do a linear chain! The kids have to be realized in proper order!



           self.children.push(node);
         },
         function(reason) {
           promise.reject(reason);
         }
       );


       promises.push(promise.promise);

       var node = new CTS.Node.Html(child, this.tree, this.opts);

     }, this);


     this.children = CTS.Fn.map(this.value.children(), function(child) {
       this.tree._nodeLookup[node.ctsId] = node;
       node.parentNode = this;
       return node;
     }, this);

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
     var ctsChild = new CTS.Node.Html(child, this.tree, this.opts);
     ctsChild.parentNode = this;
     // Need to get the right index of this child.

     var idx = child.index();

     this.children[this.children.length] = null;
     for (var i = this.children.length - 1; i >= idx; i--) {
       if (i == idx) {
         this.children[i] = ctsChild;
       } else {
         this.children[i] = this.children[i - 1];
       }
     }

     ctsChild.realizeChildren();

     return ctsChild;
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

   _subclass_beginClone: function() {
     var c = this.value.clone();

     // NOTE: beginClone is allowed to directly create a Node
     // without going through the factory because we already can be
     // sure that all this node's trees have been realized
     var d = new CTS.Node.Html(c, this.tree, this.opts);
     d.realizeChildren();
     return d;
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    if (Fn.isUndefined(opts.attribute)) {
      return this.value.html();
    } else {
      return this.value.attr(opts.attribute);
    }
  },

  setValue: function(value, opts) {
    if (Fn.isUndefined(opts.attribute)) {
      this.value.html(value);
    } else {
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
    // TODO(eob): fix this..
    console.log("adding listener for", evtName);
    this.value.on(evtName, handler);
  }

});
