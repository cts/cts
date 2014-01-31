CTS.Node.GWorksheet = function(spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.kind = "HTML";
  this.value = this._createJqueryNode(node);
  this.ctsId = Fn.uniqueId().toString();
  
  this.value.data('ctsid', this.ctsId);
  this.value.data('ctsnode', this);

  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GWorkbook.prototype, CTS.Node.Base, CTS.Events, {

  debugName: function() {
    return "GWorkbook";
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
   },

   /* 
    * Inserts this DOM node after the child at the specified index.
    * It must be a new row node.
    */
   _subclass_insertChild: function(child, afterIndex) {
   },

   /*
    */
   _onChildInserted: function(child) {
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
  },

  setValue: function(value, opts) {
  },

  _subclass_ensure_childless: function() { 
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

