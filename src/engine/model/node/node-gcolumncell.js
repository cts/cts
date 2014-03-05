/** A Google Spreadsheets "Cell Row" Node.
 *
 */

CTS.Node.GColumnCell = function(row, value, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.value = value;
  this.row = row;
  this.ctsId = Fn.uniqueId().toString();
  this.kind = 'GColumnCell';
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GColumnCell.prototype, CTS.Node.Base, CTS.Events, {

  debugName: function() {
    return "GColumnCell";
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
    if (this.parentNode != null) {
      if (other == this.parentNode) {
        return true;
      } else {
        return this.parentNode.isDescendantOf(other);
      }
    }
    return false;
  },

  _subclass_realizeChildren: function() {
     // No kids!
     var deferred = Q.defer();
     this.children = [];
     deferred.resolve();
     return deferred.promise;
   },

   _subclass_insertChild: function(child, afterIndex) {
     CTS.Log.Error("insertChild called (impossibly) on GListFeedItem");
   },

   /*
    */
   _onChildInserted: function(child) {
     CTS.Log.Error("onChildInserted called (impossibly) on GListFeedItem Node");
   },

   /*
    *  Removes this Workbook from the GSheet
    */
   _subclass_destroy: function() {
     // TODO: Delete item from sheet
   },

   _subclass_getInlineRelationSpecString: function() {a
     return null;
   },

   _subclass_beginClone: function(node) {
     return null;
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    return this.value; // no value.
  },

  getIfExistValue: function() {
    return ((this.value != null) && (this.value != ""));
  },

  setValue: function(value, opts) {
    // noop.
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
