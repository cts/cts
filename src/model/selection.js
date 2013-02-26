var Selection = CTS.Selection = {
  toString: function() {
    return "<Selection {tree:" + this.treeName +
           ", type:" + this.treeType +
           ", selector:" + this.selector +
           ", variant:" + this.variant + "}>";
  },

  // Returns tuple of [treeName, treeType, stringSpec]
  PreParse: function(selectionString) {
    var treeName = "body";
    var treeType = "html";
    var selector = null;

    var trimmed = CTS.$.trim(selectionString);
    if (trimmed[0] == "@") {
      var pair = trimmed.split('|');
      if (pair.length == 1) {
        throw new Error("Cound not parse: " + self.stringSpec);
      } else {
        treeName = CTS.$.trim(pair.shift().substring(1));
        // TODO(eob): set tree type
        selector = CTS.$.trim(_.join(pair, ""));
      }
    } else {
      selector = selectionString;
    }
    return [treeName, treeType, selector];
  },

  // Factory for new selections
  Create: function(selectionString) {
    var parts = this.PreParse(selectionString);
    var selection = null;

    if (parts[1] == "html") {
      selection = new DomSelection(parts[2]);
    } 

    console.log("s", selection);
    if (selection !== null) {
      selection.treeName = parts[0];
      selection.treeType = parts[1];
      selection.originalString = selectionString;
    }

    return selection;
  }

};


