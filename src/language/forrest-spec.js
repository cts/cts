var ForrestSpec = CTS.ForrestSpec = function() {
  var trees = [];
  var rules = [];
};

_.extend(TreeSheet.prototype, {
  incorporateJson: function(json) {
    if (typeof json.relations != 'undefined') {
      for (var i = 0; i < json.relations.length; i++) {
        if (json.relations[i].length == 3) {
          var s1 = this._jsonToSelector(json.relations[i][0]);
          var s2 = this._jsonToSelector(json.relations[i][2]);
          var ruleName = null;
          var ruleProps = {};
          if (_.isArray(json.relations[i][1])) {
            if (json.relations[i][1].length == 2) {
              _.extend(ruleProps, json.relations[i][1][1]);
            }
            if (json.relations[i][1].length > 0) {
              ruleName = json.relations[i][1][0];
            }
          } else if (typeof json.relations[i][1] == 'string') {
            ruleName = json.relations[i][1];
          }

          var rule = new CTS.RelationSpec(selector1, selector2, ruleName, ruleProps);
          this.rules.push(rule);
        }
      }
    }

    if (typeof json.trees != 'undefined') {
      for (var i = 0; i < json.trees.length; i++) {
        if (json.trees[i].length == 3) {
          this.trees.push(new CTS.TreeSpec(
            json.trees[i][0],
            json.trees[i][1],
            json.trees[i][2]));
        }
      }
    }
  },

  _jsonToSelector: function(json) {
    var treeName = null;
    var selectorString = null;
    var args = {};

    if (_.isArray(json)) {
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
    return new CTS.SelectorSpec(treeName, selectorString, args);
  }
});
 
