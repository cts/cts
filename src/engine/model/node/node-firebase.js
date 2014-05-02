CTS.Node.Firebase = function(spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.kind = "Firebase";
  this.key = null;
  this.value = null;
  this.ctsId = Fn.uniqueId().toString();
  this.Ref = null;
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.Firebase.prototype, CTS.Node.Base, CTS.Events, {
  // from node-gspreadsheet
  debugName: function() {
    return "Firebase";
  },

  find: function(selectorString, ret) {
    console.log("find called");
    console.log(selectorString);
    if (typeof ret == "undefined"){
      ret = [];
    }
    // someone wants to find a key within this node
    // find all the children of this node
    if(this.key == selectorString){
      console.log('found it');
      ret.push(this.value);
    }
    for(i=0;i<this.children.length;i++){
      // does key match any children?
      if(this.children[i].key == selectorString){
        if (this.children[i].value !== null){
          // this is a leaf, return its value
          ret.push(this.children[i].value);
        } else {
          // not a leaf, return node
          ret.push(this.children[i])
        }
      }
    }
    return ret;
  },

  isDescendantOf: function(other) {
    return false;
  },

  _subclass_realizeChildren: function() {
    this.childrenDeferred = Q.defer();
    this.children = [];
    this.realized = false;
    var self = this;
    // create the firebase nodes to represent children, add those to this.children
    this.roofRef.on('value', function(snapshot){
      self.receivedFirebaseData(snapshot);
    });
    return this.childrenDeferred.promise;
  },

  receivedFirebaseData: function(snapshot){
    if(snapshot.val() === null){
      console.log('This node has no children or value');
    } else {
      if(this.realized){
        // already realized, this must be a Pushed update from FB
        this._onValueChange(snapshot)
      } else {
        // just getting for first time
        var data = snapshot.val();
        console.log(data);
        var self = this;
        var promises = [];
        data.forEach(function(datasnapshot) {
          var child = new CTS.Node.Firebase(self.spec, self.tree, self.opts);
          child.parentNode = self;
          child.Ref = datasnapshot;
          child.key = datasnapshot.name();
          child.value = datasnapshot.val();
          self.children.push(child);
          promises.push(child._subclass_realizeChildren())
        });
        Q.all(promises).then(function(){
          this.childrenDeferred.resolve();
        });
      }
    };
  },

  getValue: function(opts) {
    this.Ref.on('value', function(snapshot){
      return snapshot.val()[opts.key];
    });
  },

  setValue: function(value, opts) {
    // call util function for write
    this.Ref.child(opts.key).set(value);
    return;
  },
});
