/** A Google Spreadsheets "List Feed" Property Node.
 *
 * The LIST FEED represents the view of a Work Sheet that google considers to
 * be a list items, each with key-value pairs. This node represents the
 * PROPERTY of one of those items.
 *
 * As such, it is addressed (and initialized, in constructor) with the KEY and
 * VALUE that it represents, and has no notion of typical spreadsheet
 * addressing.
 *
 */

CTS.Node.GListFeedProperty = function(key, value, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.key = key;
  this.value = value;
  this.ctsId = Fn.uniqueId().toString();
  this.kind = 'GListFeedProperty';
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GListFeedProperty.prototype, CTS.Node.Base, CTS.Events, {

  debugName: function() {
    return "GListFeedProperty";
  },

  // Find alreays returns empty on a leaf.
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    return ret;
  },

  isDescendantOf: function(other) {
    // This node is only below a worksheet or gsheet.
    var ret = false;
    if (this.parentNode != null) {
      if (other == this.parentNode) {
        ret =true;
      } else {
        ret = this.parentNode.isDescendantOf(other);
      }
    }
    return ret;
  },

  _subclass_realizeChildren: function() {
     // No op. This node is a child.
     var deferred = Q.defer();
     this.children = [];
     deferred.resolve();
     return deferred.promise;
   },

   _subclass_insertChild: function(child, afterIndex) {
     CTS.Log.Error("insertChild called (impossibly) on GListFeedProperty Node");
   },

   /*
    */
   _onChildInserted: function(child) {
     CTS.Log.Error("onChildInserted called (impossibly) on GListFeedProperty Node");
   },

   /* 
    *  Removes this Workbook from the GSheet
    */
   _subclass_destroy: function() {
     // TODO: Delete cell from sheet
   },

   _subclass_getInlineRelationSpecString: function() {a
     return null;
   },

   _subclass_beginClone: function(node) {
     var value = this.value;
     var key = this.key;
     var clone = new CTS.Node.GWorkSheet(key, value, this.tree, this.opts);
     // there are no children, so no need to do anything there.
     return clone;
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    return this.value;
  },

  setValue: function(value, opts) {
    this.value = value;
  },

  _subclass_ensure_childless: function() { 
    this.value = null;
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
    this.value = newValue;
  }

});


