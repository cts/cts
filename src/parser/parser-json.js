CTS.Parser.Json = {

  parseInlineSpecs: function(json, node, intoForrest, realize) {
    if (typeof json == 'string') {
      json = JSON.parse(json);
    }
    console.log("parse inline specs for", node);

    // Now we build a proper spec document around it.
    var relations = intoForrest.incorporateInlineJson(json, node);
    
    if (realize) {
      for (var i = 0; i < relations.length; i++) {
        console.log("realize", relations[i]);
        intoForrest.realizeRelationSpec(relations[i]);
      }
    }
  },

  parseForrestSpec: function(json) {
    console.log(json);
    if (typeof json == 'string') {
      json = JSON.parse(json);
    }
    var ret = new CTS.ForrestSpec();

    if (! CTS.Fn.isUndefined(json.trees)) {
      CTS.Fn.each(json.trees, function(treeSpecJson) {
        var ts = CTS.Parser.Json.parseTreeSpec(treeSpecJson);
        ret.treeSpecs.push(ts);
      });
    };

    if (! CTS.Fn.isUndefined(json.relations)) {
      CTS.Fn.each(json.relations, function(relationSpecJson) {
        var s1 = CTS.Parser.Json.parseSelectorSpec(relationSpecJson[0]);
        var s2 = CTS.Parser.Json.parseSelectorSpec(relationSpecJson[2]);
        var r  = CTS.Parser.Json.parseRelationSpec(relationSpecJson[1], s1, s2);
        ret.relationSpecs.push(r);
      });
    }

    return ret;
  },

  /* 
   * Returns a Forrest.
   *
   * Arguments:
   *  json - Either a string or JSON object containing CTS.
   *
   */
  parseTreeSheet: function(json, intoForrestSpec) {
    if (typeof json == 'string') {
      json = JSON.parse(json);
    }

    if ((typeof intoForrestSpec == 'undefined') || (intoForrestSpec == null)) {
      intoForrestSpec = new CTS.ForrestSpec();
    }

    intoForrestSpec.incorporate(json);
  },

  parseRelationSpec: function(json, selectorSpec1, selectorSpec2) {
    console.log("j2r", json);
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
    var r = new CTS.RelationSpec(selectorSpec1, selectorSpec2, ruleName, ruleProps);
    console.log("parsed new relation spec", r);
    return r;
  },

  parseTreeSpec: function(json) {
    var ret = new CTS.Tree.Spec();
    ret.kind = json[0];
    ret.name = json[1];
    ret.url = json[2];
    return ret;
  },

  parseSelectorSpec: function(json, inlineNode) {
    console.log("json to selec", json);
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

    if (treeName == null) {
      treeName = 'body';
    }

    var s = new CTS.SelectionSpec(treeName, selectorString, args);
    if ((json === null) && (inlineNode)) {
      console.log("setting inline", inlineNode);
      s.inline = true;
      s.inlineObject = inlineNode;
    }
    return s;
  }

};
