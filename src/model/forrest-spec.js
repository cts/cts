var ForrestSpec = CTS.ForrestSpec = function() {
  this.treeSpeecs = [];
  this.relationSpecs = [];
};

CTS.Fn.extend(ForrestSpec.prototype, {
  incorporateJson: function(json) {
    if (typeof json.relations != 'undefined') {
      for (var i = 0; i < json.relations.length; i++) {
        if (json.relations[i].length == 3) {
          var s1 = this._jsonToSelectorSpec(json.relations[i][0]);
          var s2 = this._jsonToSelectorSpec(json.relations[i][2]);
          var rule = this._jsonToRelationSpec(json.relations[i][1], s1, s2);
          this.relationSpecs.push(rule);
        }
      }
    }

    if (typeof json.trees != 'undefined') {
      for (var i = 0; i < json.trees.length; i++) {
        if (json.trees[i].length == 3) {
          this.treeSpecs.push(new CTS.TreeSpec(
            json.trees[i][0],
            json.trees[i][1],
            json.trees[i][2]));
        }
      }
    }
  },

  /* The JSON should be of the form:
   * 1. [
   * 2.   ["TreeName", "SelectorName", {"selector1-prop":"selector1-val"}]
   * 3.   ["Relation",  {"prop":"selector1-val"}]
   * 4.   ["TreeName", "SelectorName", {"selector2-prop":"selector1-val"}]
   * 5. ]
   *
   * The outer array (lines 1 and 5) are optional if you only have a single rule.
   *
   */
  incorporateInlineJson: function(json, node) {
    if (json.length == 0) {
      return [];
    }
    if (! CTS.Fn.isArray(json[0])) {
      json = [json];
    }
    var ret = [];
    for (var i = 0; i < json.length; i++) {
      var s1 = this._jsonToSelectorSpec(json[i][0], node);
      var s2 = this._jsonToSelectorSpec(json[i][2], node);
      var rule = this._jsonToRelationSpec(json[i][1], s1, s2);
      this.relationSpecs.push(rule);
      ret.push(rule);
    }
    return ret;
  },

  _jsonToSelectorSpec: function(json, inlineNode) {
    var treeName = null;
    var selectorString = null;
    var args = {};

    if ((json === null) && (inlineNode)) {
      treeName = inlineNode.tree.name;
    } else if (CTS.Fn.isArray(json)) {
      if (json.length == 1) {
        selectorString = json[0];
      } else if (json.length == 2) {
        treeName = json[0];
        selectorString = json[1];
      } else if (json.length == 3) {
        treeName = json[0];
        selectorString = json[1];
        args = json[2];
      }
    } else if (typeof json == 'string') {
      selectorString = json;
    }
    var s = new CTS.SelectionSpec(treeName, selectorString, args);
    if ((json === null) && (inlineNode)) {
      s.inline = true;
      s.inlineObject = inlineNode;
    }
    return s;
  },

  _jsonToRelationSpec: function(json, selectorSpec1, selectorSpec2) {
    var ruleName = null;
    var ruleProps = {};
    if (CTS.Fn.isArray(json)) {
      if (json.length == 2) {
        CTS.Fn.extend(ruleProps, json[1]);
      }
      if (json.length > 0) {
        ruleName = json[0];
      }
    } else if (typeof json == 'string') {
      ruleName = json;
    }
    return new CTS.RelationSpec(selectorSpec1, selectorSpec2, ruleName, ruleProps);
  }
});
