CTS.Node.DomBase = {
  debugName: function() {
    return CTS.Fn.map(this.siblings, function(node) {
      return node[0].nodeName; }
    ).join(', ');
  },

  stash: function() {
    this.value.attr('data-ctsid', this.ctsId);
    this.tree.nodeStash[this.ctsId] = this;
  },

  _subclass_shouldRunCtsOnInsertion: function() {
    if (! this.value) return false;
    if (this.value.hasClass('cts-ignore')) return false;
  },

  _subclass_getTreesheetLinks: function() {
    return CTS.Util.getTreesheetLinks(this.value);
  },

  // Horrendously inefficient.
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    if (this.value.is(selector)) {
      if (typeof ret == 'undefined') {
        CTS.Log.Error("push");
      }
      ret.push(this);
    }
    for (var i = 0; i < this.children.length; i++) {
      if (this.children[i] == null) {
        CTS.Log.Error("Error: Child " + i + " of me is null (find:" + selector + ")", this);
      } else {
        if (typeof this.children[i] == 'undefined') {
          CTS.Log.Error("Undefined child");
        }
        this.children[i].find(selector, ret);
      }
    }
    return ret;
  },

  _subclass_beginClone_base: function($node, klass) {
    var d = Q.defer();
    var $value = null;
    if (typeof $node == "undefined") {
      $value = this.value.clone();
    } else {
      $value = $node;
    }

    // Remove any inline CTS annotations, since we're going to
    // manually copy in relations.
    $value.attr('data-cts', null);
    $value.find("*").attr('data-cts', null);

    // NOTE: beginClone is allowed to directly create a Node
    // without going through the factory because we already can be
    // sure that all this node's trees have been realized
    var clone = new klass($value, this.tree, this.opts);
    var cloneKids = clone.value.children();

    if (this.children.length != cloneKids.length) {
      CTS.Log.Error("Trying to clone CTS node that is out of sync with dom");
    }
    // We use THIS to set i
    var kidPromises = [];
    for (var i = 0; i < cloneKids.length; i++) {
      var $child = CTS.$(cloneKids[i]);
      kidPromises.push(this.children[i]._subclass_beginClone($child));
    }

    if (kidPromises.length == 0) {
      d.resolve(clone);
    } else {
      Q.all(kidPromises).then(
        function(kids) {
          for (var i = 0; i < kids.length; i++) {
            kids[i].parentNode = clone;
            clone.children.push(kids[i]);
          }
          d.resolve(clone);
        },
        function(reason) {
          d.reject(reason);
        }
      );
    }
    return d.promise;
  },


  /*
   *  Removes this DOM node from the DOM tree it is in.
   */
  _subclass_destroy: function() {
    this.value.remove();
  },


  _subclass_getInlineRelationSpecString: function() {
    if (this.value !== null) {
      var inline = this.value.attr('data-cts');
      if (inline) {
        return inline;
      } else {
        // Temporary spreadsheet case.
        inline = this.value.attr('data-stitch');
        if (inline) {
          if (inline.indexOf('rows') > -1) {
            if (this.value.is("form")) {
              return "this :graft sheet | items {createNew: true};";
            } else {
              console.log("this :are sheet | items;");
              return "this :are sheet | items;";
            }
          } else if (this.value.closest('form').length > 0) {
            return "sheet | " + inline + " :is this;";
          } else {
            return "this :is sheet | " + inline + ';';
          }
        }
      }
    }
    return null;
  },

  _subclass_ensure_childless: function() {
    if (this.value !== null) {
      this.value.html("");
    }
  }
};
