// RelationParser
// ==========================================================================
var RelationParser = CTS.RelationParser = {
  incorporate: function(ruleMap, selector, block) {
    console.log("hi");
    var rules = block.split(";");
    _.each(rules, function(ruleString) {
      var parts = ruleString.split(":");
      if (parts.length == 2) {
        var target = "";
        var name = "";
        var variant = "";
        var key = CTS.$.trim(parts[0]);
        var value = CTS.$.trim(parts[1]);
        var section = 0;
        for (var i = 0; i < key.length; i++) {
          if ((key[i] == "-") && (section === 0)) {
            section = 1;
          } else if (key[i] == "(") {
            section = 2;
          } else if ((key[i] == ")") && (section == 2)) {
            break;
          } else {
            // append string
            if (section === 0) {
              name += key[i];
            } else if (section == 1) {
              variant += key[i];
            } else if (section == 2) {
              target += key[i];
            }
          }
        }

        console.log("selector", selector, "key", key, "value", value);

        // Now add or accomodate the rule
        var selection1 = Selection.Create(selector);

        if (target.length > 0) {
          selection1.variant = target;
        }
        var selection1String = selection1.toString();

        console.log("selection1", selection1, selection1String);

        if (! _.contains(ruleMap, selection1String)) {
          // Ensure we know about this selector
          console.log("Creating slot for selection 1", selection1);
          ruleMap[selection1String] = {};
        }
        if (! _.contains(ruleMap[selection1String], name)) {
          console.log("Creating new rule for selection 1 :: name", selection1, name);
          ruleMap[selection1String][name] = new Rule(selection1, null, name, {});
        }

        if (variant.length === 0) {
          // We're setting selection 2
          var selection2 = Selection.Create(value);
          console.log("selection2", selection2, value);
          ruleMap[selection1String][name].selection2 = selection2;
        } else {
          // We're setting an option
          ruleMap[selection1String][name].addOption(variant, value);
        }

        console.log("Final after adding rule", ruleMap[selection1String][name]);
      } // if (parts.length == 2)
    }, this);
  },

  parse: function(ctsString) {
    var self = this;
    var relations = {};

    // Remove comments
    r = ctsString.replace(/\/\*(\r|\n|.)*\*\//g,"");

    var bracketDepth = 0;
    var openBracket = -1;
    var closeBracket = 0;
    var previousClose = 0;

    function peelChunk() {
      var selector = CTS.$.trim(r.substr(previousClose, openBracket - previousClose - 1));
      var block = CTS.$.trim(r.substr(openBracket + 1, closeBracket - openBracket - 1));
      previousClose = closeBracket + 1;
      self.incorporate(relations, selector, block);
    }

    for (var i = 0; i < r.length; i++) {
      if (r[i] == '{') {
        bracketDepth++;
        if (bracketDepth == 1) {
          console.log(r[i]);
          openBracket = i;
        }
      } else if (r[i] == '}') {
        bracketDepth--;
        if (bracketDepth === 0) {
          closeBracket = i;
          peelChunk();
        }
      }
    }

    var ret = [];
    _.each(_.values(relations), function(valueHash) {
      ret = _.union(ret, _.values(valueHash));
    });
    console.log(ret);
    return ret;
  }

};
