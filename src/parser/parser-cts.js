CTS.Parser.Cts = {

  parseInlineSpecs: function(str, node, intoForrest, realize) {
    return null;
  },

  parseForrestSpec: function(str) {
    var json = null;
    try {
      json = CTS.Parser.CtsImpl.parse(str.trim());
    } catch (e) {
      CTS.Log.Error("Parser error: couldn't parse string", str, e);
      return null;
    }
    console.log(json);
    json.trees = [];
    json.css = [];
    json.js = [];
    var i;
    var f = new ForrestSpec();
    if (typeof json.headers != 'undefined') {
      for (i = 0; i < json.headers.length; i++) {
        var h = json.headers[i];
        var kind = h.shift();
        if (kind == 'html') {
          f.treeSpecs.push(new TreeSpec('html', h[0], h[1]));
        } else if (kind == 'css') {
        } else if (kind == 'js') {
        } else {
          CTS.Log.Error("Don't know CTS header type:", kind);
        }
      }
    }
    f.relationSpecs = json.relations;
    return f;
  }

};
