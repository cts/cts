CTS.Node.GWorksheet = function(spec, tree, opts) {
  console.log("GWorksheet Constructor");
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.kind = "GWorksheet";
  this.name = spec.title;
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
    console.log("WS find", selector);
    if (typeof ret == 'undefined') {
      ret = [];
    }

    if (selector.trim() == "items") {
      console.log("Worksheet interpreting find request as ITEM enumeration");
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].kind == "GListFeed") {
          ret.push(this.children[i]);
        }
      }
    } else if (selector.trim()[0] == ".") {
      console.log("Worksheet interpreting find request as ITEM PROPERTY search");
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].kind == "GListFeed") {
          this.children[i].find(selector, ret);
        }
      }
    } else {
      console.log("Worksheet interpreting find request as CELL query");
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].kind == "GCellFeed") {
          this.children[i].find(selector, ret);
        }
      }
    }
    console.log("Finished WS Find", ret);
    return ret;
  },

  isDescendantOf: function(other) {
    false;
  },

  _subclass_realizeChildren: function() {
    console.log("Worksheet realize kids", this.spec);
    var lf = new CTS.Node.GListFeed(this.spec, this.tree, this.opts);
    lf.parentNode = this;
    var cf = new CTS.Node.GCellFeed(this.spec, this.tree, this.opts);
    cf.parentNode = this;
    this.children = [lf, cf];
    var deferred = Q.defer();
    deferred.resolve();
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

