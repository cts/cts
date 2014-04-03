CTS.Node.Firebase = function(spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.kind = "Firebase";
  this.value = null;
  this.ctsId = Fn.uniqueId().toString();
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.Firebase.prototype, CTS.Node.Base, CTS.Events, {
  // from node-gspreadsheet
  debugName: function() {
    return "Firebase";
  },

  find: function(spec, ret) {
    return [];
  },

  isDescendantOf: function(other) {
    return false;
  },

  _subclass_realizeChildren: function() {
    var deferred = Q.defer();
    this.children = [];
    var self = this;
    // create the firebase nodes to represent children, add those to this.children

    return deferred.promise;
  },

  getValue: function(opts) {
    return null;
  },

  setValue: function(value, opts) {
    // call util function for write
  },
});
