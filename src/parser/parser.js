CTS.Parser = {
  /* Helper function which wraps parseForrestSpec. 
   *
   * Args:
   *   - spec: the spec to parse
   *   - kind: the format which encodes the spec
   *   - fromUrl: the url which loaded the spec
   */
  parse: function(spec, format, fromUrl) {
    if (typeof kind == 'undefined') {
      kind = 'string';
    }
    return CTS.Parser.parseForrestSpec(spec, format, fromUrl);
  },

  /* Parses a forrest (externally linked) CTS sheet.
   * 
   * Args:
   *  - spec: the spec to parse
   *  - format: the format which encodes the spec
   *  - fromUrl: the url which loaded the spec
   *
   * Returns:
   *  Promise for a ForrestSpec object
   */
  parseForrestSpec: function(spec, format, fromUrl) {
    if (format == 'json') {
      return CTS.Parser.Json.parseForrestSpec(spec, fromUrl);
    } else if (format == 'string') {
      return CTS.Parser.Cts.parseForrestSpec(spec, fromUrl);
    } else {
      var deferred = Q.defer();
      deferred.reject("I don't understand the CTS Format:" + format);
      return deferred.promise;
    }
  },


  /* Parses an inline (in a DOM Note attribute) CTS sheet.
   *
   * Args:
   *   - spec: the spec to parse
   *   - node: the CTS node on which the spec was inlined
   *   - intoForrest: the forrest into which to add this inline spec
   *   - realizeTrees: (bool) should any unrealized trees referenced within
   *                   be automatically realized before promise is resolved?
   *
   * Returns:
   *   Promise for a ForrestSpec object.
   */
  parseInlineSpecs: function(spec, node, intoForrest, realizeTrees) {
    var tup = CTS.Parser._typeAndBodyForInline(spec);
    var kind = tup[0];
    var body = tup[1];
    
    if (kind == 'json') {
      return CTS.Parser.Json.parseInlineSpecs(body, node, intoForrest, realizeTrees);
    } else if (kind == 'string') {
      return CTS.Parser.Cts.parseInlineSpecs(body, node, intoForrest, realizeTrees);
    } else {
      var deferred = Q.defer();
      deferred.reject("I don't understand the CTS Format:" + kind);
      return deferred.promise;
    }
  },

  /* Helper: separates inline spec into FORMAT and BODY.
   *
   * Args:
   *  - str: The string encoding of a CTS spec.
   *
   *  str may be either <format>:<cts spec> or <cts spec>
   *  <format> may be either 'json' or 'str'
   *
   * Returns:
   *  Tuple of [format, specBody]
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
