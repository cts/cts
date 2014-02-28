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
    console.log("WS find", selector);
    if (typeof ret == 'undefined') {
      ret = [];
    }

    if (selector.trim() == "items") {
      console.log("Worksheet interpreting find request as ITEM enumeration");
      // TODO: A number of things should really apply here..
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].kind == "GListFeedItem") {
          ret.push(this.children[i]);
        }
      }
    } else if (selector.trim()[0] == ".") {
      console.log("Worksheet interpreting find request as ITEM PROPERTY search");
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].kind == "GListFeedItem") {
          this.children[i].find(selector, ret);
        }
      }
    } else {
      console.log("Worksheet interpreting find request as CELL query");
      // We'll do it ssheet reference style
      selector = selector.trim();
      console.log("console ", selector);
      var letterIdx = 0;
      while (isNaN(parseInt(selector[letterIdx]))) {
        letterIdx++;
      }
      console.log("Letter Index", letterIdx);
      var col = selector.slice(0, letterIdx);
      var row = parseInt(selector.slice(letterIdx));

      console.log("Row", row, "Col", col);

      for (var i = 0; i < this.children.length; i++) {
        console.log("Kid type", this.children[i].kind)
        if (this.children[i].kind == "GColumn") {
          console.log("has value", this.children[i].value)
          if (this.children[i].value == col) {
            console.log("Asking kid to find", row);
            this.children[i].find(row, ret);
          }
        }
      }
    }
    console.log("Finished WS Find", ret);
    return ret;
  },

  descendantOf: function(other) {
    false;
  },

  _subclass_realizeChildren: function() {
    console.log("Worksheet realize kids", this.spec);
    var self = this;

    var listFeedPromise = Q.defer();
    var cellFeedPromise = Q.defer();

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
        listFeedPromise.resolve();
      },
      function(reason) {
        console.log("Rejected", reason);
        listFeedPromise.reject(reason);
      }
    );

    CTS.Util.GSheet.getCellFeed(this.spec.sskey, this.spec.wskey).then(
      function(gdata) {
        console.log("Got cell feed worksheet", gdata);
        self.gdata = gdata;

        for (var rowName in gdata.rows) {
          console.log("Row", rowName);
          var columns = gdata.rows[rowName];
          console.log("Row Columns", columns);
          var child = new CTS.Node.GColumn(rowName, columns, self.tree, self.opts);
          console.log("New Child ", child);
          self.children.push(child);
        }
        console.log("Resolving Worksheet Kids");
        cellFeedPromise.resolve();
      },
      function(reason) {
        console.log("Rejected", reason);
        cellFeedPromise.reject(reason);
      }
    );

    return Q.all([listFeedPromise.promise, cellFeedPromise.promise]);
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

