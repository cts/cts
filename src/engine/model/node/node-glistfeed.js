/** A Google Spreadsheets "List Feed" Property Node.
 *
 * The LIST FEED represents the view of a Work Sheet that google considers to
 * be a list items, each with key-value pairs. This node represents one of
 * those ITEMS.
 */
CTS.Node.GListFeed = function(spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.ctsId = Fn.uniqueId().toString();
  this.kind = 'GListFeed';
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GListFeed.prototype, CTS.Node.Base, CTS.Events, {

  debugName: function() {
    return this.kind;
  },

  // Find alreays returns empty on a leaf.
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    // If any of the properties match.
    selector = selector.trim();
    if (selector[0] == ".") {
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        child.find(selector, ret);
      }
    }
    CTS.Log.Debug("GListFeed Finished Find");
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
     var deferred = Q.defer();
     this.children = [];
     var self = this;
     CTS.Util.GSheet.getListFeed(this.spec.sskey, this.spec.wskey).then(
       function(gdata) {
         CTS.Log.Debug("Got list feed worksheet", gdata);
         self.gdata = gdata;
         for (var i = 0; i < gdata.items.length; i++) {
           var item = gdata.items[i];
           var child = new CTS.Node.GListFeedItem(item.title, item, self.tree, self.opts);
           child.parentNode = self;
           self.children.push(child);
         }
         CTS.Log.Debug("Resolving Worksheet Kids");
         deferred.resolve();
       },
       function(reason) {
         CTS.Log.Warn("ListFeed Load Rejected", reason);
         deferred.reject(reason);
       }
     );
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
