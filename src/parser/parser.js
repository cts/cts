CTS.Parser = {
  parseInlineSpecs: function(str, node, intoForrest, realize) {
    var tup = CTS.Parser._typeAndBodyForInline(str);
    var kind = tup[0];
    var body = tup[1];
    var spec = null;
    if (kind == 'json') {
      return CTS.Parser.Json.parseInlineSpecs(body, node, intoForrest, realize);
    } else if (kind == 'string') {
      return CTS.Parser.Cts.parseInlineSpecs(body, node, intoForrest, realize);
    } else {
      CTS.Log.Error("I don't understand the inline CTS format", kind);
      return null;
    }
  },

  parseForrestSpec: function(str, kind) {
    if (kind == 'json') {
      return CTS.Parser.Json.parseForrestSpec(str);
    } else if (kind == 'string') {
      return CTS.Parser.Cts.parseForrestSpec(str);
    } else {
      CTS.Log.Error("I don't understand the CTS Format", kind);
    }
  },

  parse: function(obj, kind) {
    if (typeof kind == 'undefined') {
      kind = 'string';
    }
    return CTS.Parser.parseForrestSpec(obj, kind);
  },

  /* Inline specs can take the form:
   *  1.  <syntax>:<cts string>
   *  2.  <cts string>
   *
   * Syntax may be one of {string, json}
   *
   * If no syntax is specified, string will be assumed.
   */
  _typeAndBodyForInline: function(str) {
    var res = /^([a-zA-Z]+):(.*)$/.exec(str);
    if (res === null) {
      return ['string', str];
    } else {
      return [res[1], res[2]];
    }
  }

};
