var CTS.Parser.Json = {

  parseInlineSpecs(json, node, intoForrest, realize) {
    if (typeof json == 'string') {
      json = JSON.parse(json);
    }

    // Now we build a proper spec document around it.
    var relations = intoForrest.spec.inforporateInlineJson(json, node, realize);
    
    if (realize) {
      for (var i = 0; i < relations.length; i++) {
        intoForrest.realizeRelationSpec(relations[i]);
      }
    }
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
  }
};
