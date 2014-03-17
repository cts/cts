/**
 * A Relation is a connection between two tree nodes.
 * Relations are the actual arcs between nodes.
 * Rules are the language which specify relations.
 */

CTS.Relation = {};

CTS.Relation.CreateFromSpec = function(node1, node2, spec) {
  if (spec.name == 'is') {
    return new CTS.Relation.Is(node1, node2, spec);
  } else if (spec.name == 'are') {
    return new CTS.Relation.Are(node1, node2, spec);
  } else if (spec.name == 'graft') {
    return new CTS.Relation.Graft(node1, node2, spec);
  } else if (spec.name == 'if-exist') {
    return new CTS.Relation.IfExist(node1, node2, spec);
  } else if (spec.name == 'if-nexist') {
    return new CTS.Relation.IfNexist(node1, node2, spec);
  } else {
    CTS.Log.Fatal("Unsure what kind of relation this is:", spec.name);
    return null;
  }
};

CTS.Relation.Base = {

  initializeBase: function() {
    if (this.node1 != null) {
      this.node1.registerRelation(this);
    }
    if (this.node2 != null) {
      this.node2.registerRelation(this);
    }
    this._forCreationOnly = false;
    this.defaultOpts = this.getDefaultOpts();
  },

  getDefaultOpts: function() {
    return {};
  },

  addOption: function(key, value) {
    this.opts[key] = value;
  },

  head: function() {
    return this.selection1;
  },

  tail: function() {
    return this.selection2;
  },

  opposite: function(node) {
    return (node == this.node1) ? this.node2 : this.node1;
  },

  forCreationOnly: function(val) {
    if (typeof val == 'undefined') {
      return this._forCreationOnly;
    } else if (val) {
      this._forCreationOnly = true;
      return true;
    } else {
      this._forCreationOnly = false;
      return false;
    }
  },

  handleEventFromNode: function(evt) {
    if (this._forCreationOnly) {
      // Otherwise modifications to the input elements of the
      // form will set the entire collection that this is creation-mapped
      // to!
      return;
    }
    // Pass it on over.
    evt.viaRelation = this;
    if (evt.sourceNode == this.node1) {
      this.node2.handleEventFromRelation(evt, this, this.node1);
    } else {
      this.node1.handleEventFromRelation(evt, this, this.node2);
    }
  },

  /*
   * removes this relation from both node1 and node2
   */
  destroy: function() {
    if (this.node1 != null) {
      this.node1.unregisterRelation(this);
    }
    if (this.node2 != null) {
      this.node2.unregisterRelation(this);
    }
  },

  optsFor: function(node) {
    var toRet = {};
    Fn.extend(toRet, this.defaultOpts);
    if (this.node1 === node) {
      if (this.spec && this.spec.selectionSpec1) {
        Fn.extend(toRet, this.spec.selectionSpec1.props);
      }
    } else if (this.node2 == node) {
      if (this.spec && this.spec.selectionSpec1) {
        Fn.extend(toRet, this.spec.selectionSpec2.props);
      }
    }
    return toRet;
  },

  clone: function(from, to) {
    if (typeof from == 'undefined') {
      from = this.node1;
    }
    if (typeof to == 'undefined') {
      to = this.node2;
    }
    return new CTS.Relation.Relation(from, to, this.spec);
  },

  signature: function() {
    return "<" + this.name + " " + CTS.Fn.map(this.opts, function(v, k) { return k + ":" + v}).join(";") + ">";
  },

  _getIterables: function(node) {
    var opts = this.optsFor(node);
    var kids = node.getChildren();
    var prefix = 0;
    var suffix = 0;
    if (opts.prefix) {
      prefix = opts.prefix;
    }
    if (opts.suffix) {
      suffix = opts.suffix;
    }
    var iterables = kids.slice(prefix, kids.length - suffix);
    return iterables;
  }

};
