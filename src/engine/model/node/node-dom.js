// ### Constructor
CTS.Node.Html = function(node, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.kind = "HTML";
  this.value = CTS.Util.createJqueryNode(node);
  this.value.data('ctsnode', this);
  this.ctsId = Fn.uniqueId().toString();

  this.value.data('ctsid', this.ctsId);
  this.value.data('ctsnode', this);
  this.shouldReceiveEvents = true;

  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.Html.prototype, CTS.Node.Base, CTS.Events, CTS.Node.DomBase, {

   /*
    * Precondition: this.children.length == 0
    *
    * Realizes all children.
    */
   _subclass_realizeChildren: function() {
     // promise
     var deferred = Q.defer();

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
           if ((typeof node == "undefined") || (node == null)) {
             CTS.Log.Error("Child is undefined or null!");
           }
           node.parentNode = self;
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
         var l = self.children.length;
         self.children[self.children.length] = null;
         // TODO: need locking on kids
         for (var i = self.children.length - 1; i >= idx; i--) {
           if (i == idx) {
             self.children[i] = ctsChild;
           } else {
             self.children[i] = self.children[i - 1];
           }
         }
         // XXX TODO: This is a hack case that happens when CTS indexing and DOM indexing get out of sync
         // because of cts-ignore nodes. Need to figure out how to fix.
         if ((self.children[self.children.length - 1] == null) && (idx >= self.children.length)) {
           self.children[self.children.length - 1] = ctsChild;
         }

         ctsChild.realizeChildren().then(
           function() {
             //  Now run any rules.
             CTS.Log.Info("Running CTS Rules on new node");
             ctsChild._processIncoming().done();
           },
           function(reason) {
             CTS.Log.Error("Could not realize children of new CTS node", ctsChild);
           }
         ).done();
       },
       function(reason) {
         CTS.Log.Error("Could not convert new node to CTS node", child, reason);
       }
     ).done();
   },

   _subclass_beginClone: function($node) {
     return this._subclass_beginClone_base($node, CTS.Node.Html);
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
      this.value.html("" + value);
    } else {
      if (opts.attribute != null) {
        this.value.attr(opts.attribute, value);
      }
    }
  },

  /************************************************************************
   **
   ** Events
   **
   ************************************************************************/

  /* Toggles whether this node will throw events when its data change. If so,
   * the event will be thrown by calling Node (superclass)'s
   * _throwEvent(name, data)
   */
  _subclass_throwChangeEvents: function(toggle, subtree) {
    var existing = (this._subclass_proxy_handleDomChange != null);
    // GET
    if (typeof toggle == 'undefined') {
      return existing;
    }
    // SET NO-OP
    if (toggle == existing) {
      return toggle;
    }

    var self = this;
    if (toggle) {
      // SET ON
      // This funny way of implementing is to save the "this" pointer.
      this._subclass_proxy_handleDomChange = function(e) {
        self._subclass_handleDomChangeEvent(e);
      }
      this._changeObserver = new MutationObserver(this._subclass_proxy_handleDomChange);
      var opts = {

      };
      this._changeObserver.observe(this.value[0], {
        attribute: true,
        characterData: true,
        childList: true,
        subtree: true
      });
    } else {
      // SET OFF
      this._changeObserver.disconnect();
      this._changeObserver = null;
      this._subclass_proxy_handleDomChange = null;
    }
  },

  click: function(fn) {
    this.value.on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      fn();
    });
  },

  _subclass_handleDomChangeEvent: function(mrs) {
    CTS.Log.Info("Change Occured", this, mrs);
    for (var j = 0; j < mrs.length; j++) {
      var mr = mrs[j];

      // Destroy the CTS accounting for any nodes that were removed.
      for (var i = 0; i < mr.removedNodes.length; i++) {
        var $removedNode = CTS.$(mr.removedNodes[i]);
        var $$rn = $removedNode.data('ctsNode');
        if ($$rn) {
            $$rn.destroy(false);
        }
      }

      for (var i = 0; i < mr.addedNodes.length; i++) {
        var $addedNode = CTS.$(mr.addedNodes[i]);
        this._maybeThrowDataEvent({
          eventName: "ValueChanged",
          node: $addedNode,
          ctsNode: $addedNode.data('ctsnode')
        });
      }

      if (mr.type == "characterData") {
        var textNode = mr.target;
        var $changedNode = CTS.$(textNode.parentElement);
        this._maybeThrowDataEvent({
          eventName: "ValueChanged",
          node: $changedNode,
          ctsNode: $changedNode.data('ctsnode')
        });
      }
    }

  }

});
