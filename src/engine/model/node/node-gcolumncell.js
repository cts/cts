/** A Google Spreadsheets "Cell Row" Node.
 *
 */

CTS.Node.GColumnCell = function(row, spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.row = row;
  this.spec = spec;
  this.value = spec.content;
  this.colNum = spec.colNum;
  this.ctsId = Fn.uniqueId().toString();
  this.kind = 'GColumnCell';
  this.shouldReceiveEvents = true;
  this.shouldThrowEvents = true;
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

  getRowNum: function() {
    return this.row;
  },

  getColNum: function() {
    return this.colNum;
  },

  getWorksheetKey: function() {
    return this.parentNode.parentNode.getWorksheetKey();
  },

  getSpreadsheetKey: function() {
    return this.parentNode.parentNode.getSpreadsheetKey();
  },

  isFormulaCell: function() {
    return this.spec.isComputed;
  },

  updateIfComputed: function() {
    var self = this;
    if (this.isFormulaCell()) {
      return CTS.Util.GSheet.getCell(
        this.getSpreadsheetKey(),
        this.getWorksheetKey(),
        this.getRowNum(),
        this.getColNum()).then(
          function(newVal) {
            var oldVal = self.value;
            self.value = newVal;
            if (oldVal != newVal) {
              self._maybeThrowDataEvent({
                eventName: "ValueChanged",
                ctsNode: self
              });
            }
          }, function(reason) {
            CTS.Log.Error(reason);
          }
        ).done();
    }
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
    this.value = value;
    var self = this;
    CTS.Log.Info("Column Cell setting to ", value, this);
    var promise = CTS.Util.GSheet.modifyCell(
      this.getSpreadsheetKey(),
      this.getWorksheetKey(),
      this.getRowNum(),
      this.getColNum(),
      value).then(
        function() {
          self.parentNode.parentNode.updateComputedNodes();
        },
        function(reason) {
          CTS.Log.Error("Cell update failed", reason);
        }
      ).done();
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
    console.log("VALUE CHANGED!", evt);
  }

});
