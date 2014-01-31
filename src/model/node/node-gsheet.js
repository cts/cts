CTS.Node.GSheet = function(data, tree, opts) {
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
CTS.Fn.extend(CTS.Node.Html.prototype, CTS.Node.Base, CTS.Events, {

  debugName: function() {
    return "GSheet";
  },

  find: function(selector, ret) {
    // TODO
  },

  /************************************************************************
   **
   ** Required by Node base class
   **
   ************************************************************************/

   descendantOf: function(other) {
     return false;
   },

   /* Fetches list of workbook nodes from GSheet API.
    * Also potentially updates the name of this sheet.
    * - Precondition: this.children.length == 0
    */
   _subclass_realizeChildren: function() {
     var deferred = Q.defer();
     var self = this;

     CTS.GSheet.getWorksheets(key),then(
       function(specs) {
         for (var i = 0; i < specs.length; i++) {
           var kid = new CTS.Node.GWorksheet(specs[i], this.tree, this.opts);
           kid.parentNode = self;
           self.children.push(kid);
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
    * We have to creat this worksheet in GSheets.
    */
   _subclass_insertChild: function(child, afterIndex) {
   },

   /*
    * This gets called when a new worksheet is added to the
    * remote GSheet structure.
    *
    * In practice this will only happen if we enable background
    * polling of the API, since there are no notifications.
    */
   _onChildInserted: function(child) {
     // TODO - This should never get called.
   },

   /* 
    *  Removes this GSheet from Google.
    */
   _subclass_destroy: function() {
     // TODO: Is this even possible with the API?
   },

   // Not necessary.
   _subclass_getInlineRelationSpecString: function() {
     return null;
   },

   // TBD
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
