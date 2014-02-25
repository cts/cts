CTS.Node.GWorksheet = function(spec, tree, opts) {
  console.log("GWorksheet Constructor");
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.kind = "GWorksheet";
  this.value = null;
  this.ctsId = Fn.uniqueId().toString();
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GWorksheet.prototype, CTS.Node.Base, CTS.Events, {

  debugName: function() {
    return "GWorkSheet";
  },

  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    return ret;
  },

  descendantOf: function(other) {
    false;
  },

  _subclass_realizeChildren: function() {
    console.log("Worksheet realize kids", this.spec);
    var self = this;
    var deferred = Q.defer();
    this.children = [];
    console.log(this.spec.sskey, this.spec.wskey);
    CTS.Util.GSheet.getListFeed(this.spec.sskey, this.spec.wskey).then(
      function(gdata) {
        console.log("Got list feed worksheet", gdata);
        self.gdata = gdata;
        for (var i = 0; i < gdata.items.length; i++) {
          var item = gdata.items[i];
          var child = new CTS.Node.GListFeedItem(item.title, item, self.tree, self.opts);
          self.children.push(child);
        }
        console.log("Resolving Worksheet Kids");
        deferred.resolve();
      },
      function(reason) {
        console.log("Rejected", reason);
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  },

   /* 
    * Inserts this DOM node after the child at the specified index.
    * It must be a new row node.
    */
   _subclass_insertChild: function(child, afterIndex) {
     // TODO: Figure out what to do.
   },

   /*
    */
   _onChildInserted: function(child) {
     // TODO: Figure out what to do.
   },

   /* 
    *  Removes this Workbook from the GSheet
    */
   _subclass_destroy: function() {
   },

   _subclass_getInlineRelationSpecString: function() {
   },

   _subclass_beginClone: function(node) {
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    return null;
  },

  setValue: function(value, opts) {
    // noop.
  },

  _subclass_ensure_childless: function() { 
    // noop.
  },

  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

  _subclass_onDataEvent: function(eventName, handler) {
  },

  _subclass_offDataEvent: function(eventName, handler) {
  },

  _subclass_valueChangedListener: function(evt) {
  },

  /***************************************************************************
   * EVENTS
   **************************************************************************/

  _subclass_setValue: function(newValue) {
  }

});

