// ### Constructor
var DomNode = CTS.DomNode = function(node, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.kind = "DOM";
  this.value = this.createJqueryNode(node);
};

// ### Instance Methods
CTS.Fn.extend(CTS.DomNode.prototype, CTS.Events, CTS.StateMachine, CTS.Node, {

  debugName: function() {
    return CTS.Fn.map(this.siblings, function(node) {
      return node[0].nodeName; }
    ).join(', ');
  },

  /************************************************************************
   **
   ** Required by Node base class
   **
   ************************************************************************/

   descendantOf: function(other) {
     // jQuery trick
     // this.value is a jQuery node
     return this.value.closest(other.value).length != 0;
   }

   /*
    * Precondition: this.children.length == 0
    *
    * Realizes all children.
    */
   _subclass_realizeChildren: function() {
     this.children = CTS.Fn.map(this.value.children(), function(child) {
       var node = new DomNode(child);
       return node;
     });
   },

   /* 
    * Inserts this DOM node after the child at the specified index.
    */
   _subclass_insertChild: function(child, afterIndex) {
     var leftSibling = this.getChildren()[afterIndex];
     leftSibling.value.after(this.value);
   },

   /* 
    *  Removes this DOM node from the DOM tree it is in.
    */
   _subclass_destroy: function() {
     this.value.remove();
   },

   _subclass_getInlineRelationSpecs: function() {
     if (this.value!== null) {
       var inline = this.value.attr('data-cts');
       var specs = CTS.Parser.ParseInlineSpecs(inline, this);
       return specs;
     }
   },

   _subclass_beginClone: function() {
     var c = this.value.clone();
     var d = new DomNode(c, this.tree, this.opts);
     d.realizeChildren();
     return d;
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    return this.value.html();
  },

  setValue: function(value, opts) {
    this.value.html(value);
  },

  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

  _createJqueryNode: function(node) {
    // A Node contains multiple DOM Nodes
    if (typeof node == 'object') {
      if (! CTS.Fn.isUndefined(node.jquery)) {
        CTS.Debugging.DumpStack();
        return node;
      } else if (node instanceof Array) {
        return node[0];
      } else if (node instanceof Element) {
        return CTS.$(node);
      } else {
        return null;
      }
    } else if (typeof node == 'string') {
      //console.log("SIBLINGS E", node);
      return $(node);
    } else {
      return null;
    }
  }

});
