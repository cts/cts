CTS.Node.Firebase = function(spec, tree, opts, amiroot, key, value) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.kind = "Firebase";
  this.key = key || null;
  this.value = value || null;
  this.ctsId = Fn.uniqueId().toString();
  this.Ref = null;
  if (typeof amiroot == 'undefined') {
    amiroot = true;
  }
  this.amiroot = amiroot;
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.Firebase.prototype, CTS.Node.Base, CTS.Events, {
  // from node-gspreadsheet
  debugName: function() {
    return "Firebase";
  },

  find: function(selectorString, ret) {
    console.log("find called", selectorString);
    if (typeof ret == "undefined"){
      ret = [];
    }

    // XXX MAYBE CHANGE
    // assumption: selectorString is k1/k2/.../kn
    if (this.amiroot) {
      // ASSUMPTION: Root MUST be a dictionary. (is this true?)
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].find(selectorString, ret);
      }
    } else {
      var pieces = selectorString.split('/');
      if (pieces.length == 1) {
        // end of the road!
        if (this.key == pieces[0]) {
          ret.push(this);
        }
      } else {
        // maybe recurse?
        var newSelectorString = pieces.slice(1).join("/");
        if (this.key == pieces[0] || this.amiroot) {
          for (var i = 0; i < this.children.length; i++) {
            this.children[i].find(newSelectorString, ret);
          }
        }
      }
    }

    return ret;
    // XXX END CHANGE

    // someone wants to find a key within this node
    // find all the children of this node
    // if(this.key == selectorString){
    //   console.log('found it');
    //   ret.push(this.value);
    // }
    // for(i=0;i<this.children.length;i++){
    //   // does key match any children?
    //   if(this.children[i].key == selectorString){
    //     if (this.children[i].value !== null){
    //       // this is a leaf, return its value
    //       ret.push(this.children[i].value);
    //     } else {
    //       // not a leaf, return node
    //       ret.push(this.children[i])
    //     }
    //   }
    // }
    // return ret;
  },

  isDescendantOf: function(other) {
    return false;
  },

  _subclass_realizeChildren: function() {
    if (! this.amiroot) {
      var d = Q.defer();
      d.resolve();
      this.children = [];
      if (CTS.Fn.isObject(this.value)) {
        for (key in this.value) {
          var child = new CTS.Node.Firebase(
            this.spec,
            this.tree,
            this.opts,
            false,
            key,
            this.value[key]);
          this.children.push(child);
        }
      }
      return d.promise;
    } else {
      if (this.childrenDeferred) {
        return this.childrenDeferred.promise;
      }
      CTS.Log.Info("Realizing children on FB Node");

      this.childrenDeferred = Q.defer();
      this.children = [];
      this.realized = false;
      var self = this;
      // create the firebase nodes to represent children, add those to this.children
      this.Ref.on('value', function(snapshot){
        self.receivedFirebaseData(snapshot);
      });
      return this.childrenDeferred.promise;
    }
  },

  receivedFirebaseData: function(snapshot){
    if(snapshot.val() === null){
      CTS.Log.Error('This node has no children or value');
      this.childrenDeferred.reject("TODO: Figure out if this happens during non-err ops");
    } else {
      if(this.realized) {
        // already realized, this must be a Pushed update from FB
        this._onValueChange(snapshot)
      } else {
        this.realized = true;
        var data = snapshot.val();
        CTS.Log.Info("I just got this new data", data);
        var self = this;
        for (key in data) {
          var child = new CTS.Node.Firebase(
            this.spec,
            this.tree,
            this.opts,
            false,
            key,
            data[key]);
          child.parentNode = self;
        // child.realizeChildren();
          // child.Ref = val;
          // child.key = datasnapshot.name();
          // child.value = datasnapshot.val();
          self.children.push(child);
        }
        this.childrenDeferred.resolve();
      }
    };
  },

  _onValueChange: function(snapshot) {
    CTS.Log.Warn("Handle value change for existing value", snapshot);
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
