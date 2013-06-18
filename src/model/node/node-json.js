// ### Constructor
var JsonNode = CTS.JsonNode = function(node, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.kind = "JSON";
  this.value = null;
  this.dataType = null;
  if (opts.property) {
    this.value = opts.property;
    this.dataType = 'property'
  } else {
    this.value = node;
    this.updateDataType();
  }
};
 
// ### Instance Methods
CTS.Fn.extend(CTS.JsonNode.prototype, CTS.Events, CTS.Node, {

  updateDataType: function() {
    if (CTS.Fn.isNull(this.value)) {
      this.dataType = 'null';
    } else if (CTS.Fn.isUndefined(this.value)) {
      this.dataType = 'null';
    } else if (CTS.Fn.isArray(this.value)) {
      this.dataType = 'array';
    } else if (CTS.Fn.isObject(this.value)) {
      this.dataType = 'object';
    } else {
      this.dataType = typeof this.value;
    }
  },

  toJSON: function() {
    if (this.dataType == 'set') {
      return CTS.Fn.map(this.children, function(kid) {
        return kid.toJSON();
      });
    } else if (this.dataType == 'object') {
      var ret = {};
      CTS.Fn.each(this.children, function(kid) {
        ret[kid.value] = kid.toJSON();
      }, this);
      return ret;
    } else if (this.dataType == 'property') {
      if (this.children.length == 0) {
        return null;
      } else if (this.children.length > 1) {
        CTS.Debugging.Error("More than one child of property", [this]);
        return null;
      } else {
        return this.children[0].toJSON();
      }
    } else {
      return value;
    }
  },

  debugName: function() {
    return "<JsonNode " + this.dataType + " :: " + this.value + ">"
  },

  /************************************************************************
   **
   ** Required by Node base class
   **
   ************************************************************************/

  /*
   * Precondition: this.children.length == 0
   *
   * Realizes all children.
   */
  _subclass_realizeChildren: function() {
    this.children = [];
  },

  /* 
   * Inserts this DOM node after the child at the specified index.
   */
  _subclass_insertChild: function(child, afterIndex) {
    var leftSibling = this.getChildren()[afterIndex];
  },

  /* 
   *  Removes this DOM node from the DOM tree it is in.
   */
  _subclass_destroy: function() {
    this.jQueryNode.remove();
  },

  _subclass_getInlineRelationSpecs: function() {
    return null;
  },

  _subclass_beginClone: function() {
    var c = this.originalJson;
    var d = new JsonNode(c, this.tree, this.opts);
    d.realizeChildren();
    return d;
  },

 /************************************************************************
  **
  ** Required by Relation classes
  **
  ************************************************************************/

  getValue: function(opts) {
    if (this.dataType == 'set') {
      return JSON.stringify(this.toJSON());
    } else if (this.dataType == 'object') {
      return JSON.stringify(this.toJSON());
    } else if (this.dataType == 'property') {
      return this.children[0].value;
    } else {
      return value;
    }
  },

  setValue: function(value, opts) {
    if (this.dataType == 'property') {
      CTS.Log.Warn("Should not be setting the value of a property.");
    }
    this.value = value;
  }
  
  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

});

