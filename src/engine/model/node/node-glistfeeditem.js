/** A Google Spreadsheets "List Feed" Property Node.
 *
 * The LIST FEED represents the view of a Work Sheet that google considers to
 * be a list items, each with key-value pairs. This node represents one of
 * those ITEMS.
 *
 */

CTS.Node.GListFeedItem = function(value, spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.value = value;
  this.spec = spec;
  this.ctsId = Fn.uniqueId().toString();
  this.kind = 'GListFeedItem';
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GListFeedItem.prototype, CTS.Node.Base, CTS.Events, {

  debugName: function() {
    return "GListFeedItem";
  },

  // Find alreays returns empty on a leaf.
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    // If any of the properties match.
    var found = 0;
    selector = selector.trim();
    if (selector[0] == ".") {
      selector = selector.slice(1);
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        if (selector == child.key) {
          found++;
          ret.push(child);
        }
      }
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

  getItemId: function() {
    return spec.id;
  },

  _subclass_realizeChildren: function() {
     var deferred = Q.defer();
     this.children = [];
     for (var key in this.spec.data) {
       var value = this.spec.data[key];
       var child = new CTS.Node.GListFeedProperty(key, value, this.tree, this.opts);
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
     var value = this.value;
     // TODO: Need to generate a NEW id for insertion. And beginClone here
     // will neeed to be deferred!
     var spec = this.spec;
     var clone = new CTS.Node.GListFeedItem(value, spec, this.tree, this.opts);
     // there are no children, so no need to do anything there.
     return clone;
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
