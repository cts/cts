/** A Google Spreadsheets "Cell Row" Node.
 *
 */

CTS.Node.GColumn = function(value, columns, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.value = value;
  this.columnNum = null;
  this.columns = columns;
  this.ctsId = Fn.uniqueId().toString();
  this.kind = 'GColumn';
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GColumn.prototype, CTS.Node.Base, CTS.Events, {

  debugName: function() {
    return "GColumn";
  },

  getColNum: function() {
    return this.columnNum;
  },

  getWorksheetKey: function() {
    return this.parentNode.getWorksheetKey();
  },

  // Find alreays returns empty on a leaf.
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    CTS.Log.Debug("Column asked to find selector", selector);
    // Incoming: a number
    selector = parseInt(selector);
    if (! isNaN(selector)) {
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].row == selector) {
          ret.push(this.children[i]);
        }
      }
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
    CTS.Log.Debug("GColumn Realize Children");
     var deferred = Q.defer();
     this.children = [];
     for (var rowName in this.columns) {
       var cellValue = this.columns[rowName];
       CTS.Log.Debug("Realize Cell Value", this.value, rowName, cellValue);
       var child = new CTS.Node.GColumnCell(rowName, cellValue, this.tree, this.opts);
       child.parentNode = this;
       this.children.push(child);
     }
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
    return null; // no value.
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
  }


});
