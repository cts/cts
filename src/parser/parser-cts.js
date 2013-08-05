CTS.Parser.Cts = {

  parseInlineSpecs: function(str, node, intoForrest) {
    var deferred = Q.defer();
    // First parse out the spec. The user should be using "this" to refer
    // to the current node.
    var spec = CTS.Parser.Cts.parseForrestSpec(str);
    // We have to zip through here to find any instances of 'this' and replace
    // it with the tree that we're working with.
    if (typeof spec.relationSpecs != "undefined") {
      for (var i = 0; i < spec.relationSpecs.length; i++) {
        var rs = spec.relationSpecs[i];
        var s1 = rs.selectionSpec1;
        var s2 = rs.selectionSpec2;
        if (s1.selectorString.trim() == "this") {
          s1.inline = true;
          s1.inlineObject = node;
        }
        if (s2.selectorString.trim() == "this") {
          s2.inline = true;
          s2.inlineObject = node;
        }
      }
    }
    intoForrest.addSpec(spec).then(function() {
      deferred.resolve(spec);
    }, function() {
      deferred.reject();
    });
    return deferred.promise;
  },

  parseForrestSpec: function(str) {
    var json = null;
    try {
      json = CTS.Parser.CtsImpl.parse(str.trim());
    } catch (e) {
      CTS.Log.Error("Parser error: couldn't parse string", str, e);
      return null;
    }
    json.trees = [];
    json.css = [];
    json.js = [];
    var i;
    var f = new ForrestSpec();
    if (typeof json.headers != 'undefined') {
      for (i = 0; i < json.headers.length; i++) {
        var h = json.headers[i];
        var kind = h.shift().trim();
        if (kind == 'html') {
          f.treeSpecs.push(new TreeSpec('html', h[0], h[1]));
        } else if (kind == 'css') {
          f.dependencySpecs.push(new DependencySpec('css', h[0]));
        } else if (kind == 'js') {
          f.dependencySpecs.push(new DependencySpec('js', h[0]));
        } else {
          CTS.Log.Error("Don't know CTS header type:", kind);
        }
      }
    }
    f.relationSpecs = json.relations;
    return f;
  }

};
