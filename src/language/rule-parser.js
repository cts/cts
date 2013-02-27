// RuleParser
// ==========================================================================
var RuleParser = CTS.RuleParser = {
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
        var selector1 = Selector.Create(selector);

        if (target.length > 0) {
          selector1.variant = target;
        }
        var selector1String = selector1.toString();

        console.log("selector1", selector1, selector1String);

        if (! _.contains(ruleMap, selector1String)) {
          // Ensure we know about this selector
          console.log("Creating slot for selector 1", selector1);
          ruleMap[selector1String] = {};
        }
        if (! _.contains(ruleMap[selector1String], name)) {
          console.log("Creating new rule for selector 1 :: name", selector1, name);
          ruleMap[selector1String][name] = new Rule(selector1, null, name, {});
        }

        if (variant.length === 0) {
          // We're setting selector 2
          var selector2 = Selector.Create(value);
          console.log("selector2", selector2, value);
          ruleMap[selector1String][name].selector2 = selector2;
        } else {
          // We're setting an option
          ruleMap[selector1String][name].addOption(variant, value);
        }

        console.log("Final after adding rule", ruleMap[selector1String][name]);
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
  },

  parseInline: function(inlineCtsString) {
    var relations = {};
    this.incorporate(relations, "_", inlineCtsString);
    var ret = [];
    _.each(_.values(relations), function(valueHash) {
      ret = _.union(ret, _.values(valueHash));
    });
    return ret;
  }

};
