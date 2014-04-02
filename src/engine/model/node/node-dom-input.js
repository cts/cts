// ### Constructor
CTS.Node.HtmlInput = function(node, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.kind = "HTMLInput";
  this.value = CTS.Util.createJqueryNode(node);
  this.value.data('ctsnode', this);
  this.ctsId = Fn.uniqueId().toString();
  this.value.data('ctsid', this.ctsId);
  this.value.data('ctsnode', this);

  this.subKind = "text";
  if (this.value.is('[type="checkbox"]')) {
    this.subKind = "checkbox";
  }

  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });

  this.toggleThrowDataEvents(true);
  this.shouldReceiveEvents = true;
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.HtmlInput.prototype, CTS.Node.Base, CTS.Events, CTS.Node.DomBase, {

   /*
    * Precondition: this.children.length == 0
    *
    * Realizes all children.
    */
   _subclass_realizeChildren: function() {
     // An INPUT node shouldn't have children.
     var deferred = Q.defer();
     this.children = [];
     deferred.resolve(this.children);
     return deferred.promise;
   },

   _subclass_insertChild: function(child, afterIndex) {
     CTS.Log.Error("[HTML Input] Can't insert child!", this, child);
   },

   _onChildInserted: function(child) {
     CTS.Log.Error("[HTML Input] Node shouldn't have children", this, child);
   },

  _subclass_beginClone: function($node) {
    var d = Q.defer();
    this._subclass_beginClone_base($node, CTS.Node.HtmlInput).then(
      function(clone) {
        if (clone.value.is('[type="checkbox"]')) {
          clone.setValue(false);
        }
        d.resolve(clone);
      },
      function(reason) {
        d.reject(reason);
      }
    );
    return d.promise;
  },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    if (Fn.isUndefined(opts) || Fn.isUndefined(opts.attribute)) {
      if (this.subKind == "checkbox") {
        return this.value.prop("checked");
      } else {
        return this.value.val();
      }
    } else {
      return this.value.attr(opts.attribute);
    }
  },

  setValue: function(value, opts) {
    if (Fn.isUndefined(opts) || Fn.isUndefined(opts.attribute)) {
      if (this.subKind == "checkbox") {
        var checked = CTS.Fn.truthyOrFalsy(value);
        this.value.prop('checked', checked);
      } else {
        this.value.val(value);
      }
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
      this.value.on('change', this._subclass_proxy_handleDomChange);
    } else {
      // SET OFF
      this._subclass_proxy_handleDomChange = null;
      this.value.off('change', this._subclass_proxy_handleDomChange);
    }
  },

  _subclass_handleDomChangeEvent: function(e) {
    this._maybeThrowDataEvent({
      eventName: "ValueChanged",
      node: this.value,
      ctsNode: this
    });
  }

});
