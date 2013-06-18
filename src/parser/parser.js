CTS.Parser = {
  parseInlineSpecs(str, node, intoForrest, realize) {
    var tup = CTS.Parser._typeAndBodyForInline(str);
    var kind = tup[0];
    var body = tup[1];
    if (kind == 'json') {
      return CTS.Parser.Json.parseInlineSpecs(str, node, intoForrest, realize);
    } else if (kind == 'string') {
      return CTS.Parser.String.parseInlineSpecs(str, node, intoForrest, realize);
    } else {
      CTS.Log.Error("I don't understand the inline CTS format", kind);
      return null;
    }
  },

  /* Inline specs can take the form:
   *  1.  <syntax>:<cts string>
   *  2.  <cts string>
   *
   * Syntax may be one of {string, json}
   *
   * If no syntax is specified, string will be assumed.
   */
  _typeAndBodyForInline(str) {
    var res = /^\s*([a-zA-Z]+):(.*)$/.exec(str);
    if (res !== null) {
      return ['string', str];
    } else {
      return [res[1], res[2]];
    }
  }
};
