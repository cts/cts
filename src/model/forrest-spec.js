var ForrestSpec = CTS.ForrestSpec = function() {
  this.treeSpecs = [];
  this.relationSpecs = [];
  this.dependencySpecs = [];
};

CTS.Fn.extend(ForrestSpec.prototype, {
  incorporateJson: function(json) {
    if (typeof json.relations != 'undefined') {
      for (var i = 0; i < json.relations.length; i++) {
        if (json.relations[i].length == 3) {
          var s1 = CTS.Parser.Json.parseSelectorSpec(json.relations[i][0]);
          var s2 = CTS.Parser.Json.parseSelectorSpec(json.relations[i][2]);
          var rule = CTS.Parser.Json.parseRelationSpec(json.relations[i][1], s1, s2);
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






});
