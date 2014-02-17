CTS.Node.GSpreadsheet = function(spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.kind = "GSpreadsheet";
  this.value = null;
  this.ctsId = Fn.uniqueId().toString();
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GSpreadsheet.prototype, CTS.Node.Base, CTS.Events, {

  debugName: function() {
    return "GSpreadsheet";
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
     var deferred = Q.defer();
     this.children = [];
     var self = this;
     CTS.GSheet.getWorksheets(this.spec.sskey).then(
       function(gdata) {
         self.gdata = gdata;
         for (var i = 0; i < gdata.length; i++) {
           var item = gdata[i];
           var child = new CTS.Node.GWorksheet(item, self.tree, self.opts);
           child.parentNode = self;
           self.children.push(child);
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

