var SelectionSpec = CTS.SelectionSpec = function(treeName, selectorString, props) {
  this.treeName = treeName;
  this.selectorString = selectorString;
  this.props = props || {};
  this.inline = false;
  this.inlineObject = null;
};

CTS.Fn.extend(SelectionSpec.prototype, {
  toString: function() {
    return "<Selector {tree:" + this.treeName +
           ", type:" + this.treeType +
           ", selector:" + this.selector +
           ", variant:" + this.variant + "}>";
  },

  matches: function(node) {
    if (CTS.Fn.isUndefined(node._kind)) {
      CTS.Debugging.Error("Node has no kind", [node]); 
      return false;
    } else if (node._kind != this._kind) {
      CTS.Debugging.Error("Node has wrong kind", [node]);
      return false;
    } else {
      if (this.inline) {
        return (this.inlineNode == node);
      } else {
        var res = ((this.treeName == node.tree.name) && (node.node.is(this.selector)));
        return res;
      }
    }
  },

  // Returns tuple of [treeName, treeType, stringSpec]
  PreParse: function(selectorString) {
    var treeName = "body";
    var treeType = "html";
    var selector = null;

    var trimmed = CTS.$.trim(selectorString);
    if (trimmed[0] == "@") {
      var pair = trimmed.split('|');
      if (pair.length == 1) {
        throw new Error("Cound not parse: " + self.stringSpec);
      } else {
        treeName = CTS.$.trim(pair.shift().substring(1));
        // TODO(eob): set tree type
        selector = CTS.$.trim(pair);
      }
    } else {
      selector = selectorString;
    }
    return [treeName, treeType, selector];
  },

  // Factory for new selectors
  Create: function(selectorString) {
    var parts = this.PreParse(selectorString);
    var selector = null;

    if (parts[1] == "html") {
      selector = new DomSelector(parts[2]);
    } 

    if (selector !== null) {
      selector.treeName = parts[0];
      selector.treeType = parts[1];
      selector.originalString = selectorString;
    }

    return selector;
  }
});
