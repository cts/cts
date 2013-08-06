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
    }, function(reason) {
      deferred.reject(reason);
    });
    return deferred.promise;
  },

  parseForrestSpec: function(str) {
    var deferred = Q.defer();
    var json = null;
    var remoteLoads = [];
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
    var forrestSpecs = [];
    var f = new ForrestSpec();
    if (typeof json.headers != 'undefined') {
      for (i = 0; i < json.headers.length; i++) {
        var h = json.headers[i];
        var kind = h.shift().trim();
        if (kind == 'html') {
          f.treeSpecs.push(new TreeSpec('html', h[0], h[1]));
        } else if (kind == 'css') {
          f.dependencySpecs.push(new DependencySpec('css', h[0]));
        } else if (kind == 'cts') {
          f.dependencySpecs.push(new DependencySpec('cts', h[0]));
          remoteLoads.push(CTS.Utilities.fetchString({url: h[0]}));
        } else if (kind == 'js') {
          f.dependencySpecs.push(new DependencySpec('js', h[0]));
        } else {
          CTS.Log.Error("Don't know CTS header type:", kind);
        }
      }
    }
    f.relationSpecs = json.relations;
    forrestSpecs.push(f);
    
    // If there are any other linked specs, we'll load them here.
    deferred.resolve(forrestSpecs);

    Q.all(remoteLoads).then(
      function(results) {
        // Results here contains MORE cts strings
        var parsePromises = Fn.map(results, function(result) {
          return self.parseForrestSpec(result);
        });
        Q.all(parsePromises).then(
          function(moreSpecs) {
            for (var i = 0; i < moreSpecs.length; i++) {
              for (var j = 0; j < moreSpecs[i].length; j++) {
                forrestSpecs.push(moreSpecs[i][j]);
              }
            }
            deferred.resolve(forrestSpecs);
          },
          function(reason) {
            deferred.reject(reason);
          }
        );
      },
      function(reason) {
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  }

};
