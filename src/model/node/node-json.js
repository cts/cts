// ### Constructor
var JsonNode = CTS.JsonNode = function(obj, tree, opts, args) {
  var defaults;
  this._kind = 'json';
  this.dataType = null; // {set, object, property, string, boolean, number}
  this.value = null;
  this.tree = tree;
  this.opts = opts || {};
  this.initialize.apply(this, obj, args);
};
 
// ### Instance Methods
CTS.Fn.extend(CTS.JsonNode.prototype, CTS.Events, CTS.StateMachine, CTS.Node, {

  initialize: function(obj, args) {
    this.initializeStateMachine();
    this.children = [];

    // Recursively create all children
    if (CTS.Fn.isNull(obj)) {
      this.dataType = 'null';
      this.value = null;
    } else if (CTS.Fn.isUndefined(obj)) {
      this.dataType = 'null';
      this.value = null;
    } else if (CTS.Fn.isArray(obj)) {
      this.dataType = 'set';
      CTS.Fn.each(obj, function(item) {
        this.children.push(new JsonNode(item, this.tree, opts, args));
      }, this);
    } else if (CTS.Fn.isObject(obj)) {
      this.dataType = 'object';
      CTS.Fn.each(obj, function(val, key) {
        var kid = new JsonNode(null, this.tree, opts, args);
        kid.dataType = 'property';
        kid.value = key;
        kid.children = [new JsonNode(val, this.tree, opts, args)];
        this.children.push(kid);
      }, this);
    } else {
      this.dataType = typeof obj;
      this.value = obj;
    }
  },

  destroy: function(opts) {
    // TODO: handle case of trying to unregister root.
  },

  debugName: function() {
  },

  clone: function(opts) {
  },

  getInlineRules: function() {
    // A JSON Node can't have inline rules.
    return null;
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

  failedConditional: function() {
  },

  isIncoming: function(otherNodeSelection, opts) {
    if (otherNodeSelection.nodes.length === 0) {
      this.dataType = 'undefined';
      this.value = null;
      this.children = [];
    } else if (otherNodeSelection.nodes.length === 1) {
      this.value = otherNodeSelection.nodes[0].isOutgoing(opts);
      this.dataType = typeof this.value;
    } else {
      this.value = CTS.Fn.map(otherNodeSelection.nodes, function(n) {
        n.isOutgoing(opts)
      }, this).join("");
      this.dataType = typeof this.value;
    }
  },

  isOutgoing: function(opts) {
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

  areIncoming: function(otherSelection, relation, opts) {
  },

  areOutgoing: function(relation, opts) {
  }
});

