CTS.Parser.Cts = {

  parseInlineSpecs: function(str, node, intoForrest) {
    var deferred = Q.defer();
    // First parse out the spec. The user should be using "this" to refer
    // to the current node.

    CTS.Parser.Cts.parseForrestSpec(str).then(
      function(specs) {
        // We have to zip through here to find any instances of 'this' and replace
        // it with the tree that we're working with.
        var promises = Fn.map(specs, function(spec) {
          var nullSelector = false;
          if (typeof spec.relationSpecs != "undefined") {
            for (var i = 0; i < spec.relationSpecs.length; i++) {
              var rs = spec.relationSpecs[i];
              var s1 = rs.selectionSpec1;
              var s2 = rs.selectionSpec2;
              if ((s1.selectorString != null) && (s2.selectorString != null)) {
                if (s1.selectorString.trim() == "this") {
                  s1.inline = true;
                  s1.inlineObject = node;
                }
                if (s2.selectorString.trim() == "this") {
                  s2.inline = true;
                  s2.inlineObject = node;
                }
              } else {
                nullSelector = true;
              }
            }
          }
          if (nullSelector) {
            var deferred = new Q.defer();
            var error = "Null selector. Can not parseForrestSpec";
            CTS.Log.Error(error);
            defer.reject(error);
            return deferred.promise;

          } else {
            return intoForrest.addSpec(spec);
          }
        });
    
        Q.all(promises).then(
          // Specs here is ref to result from parseForrestSpec
          function() {
            deferred.resolve(specs);
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
  },

  parseForrestSpec: function(str, fromLocation) {
    var deferred = Q.defer();
    var json = null;
    var remoteLoads = [];
    var self = this;

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
        } else if (kind == 'gsheet') {
          f.treeSpecs.push(new TreeSpec('gsheet', h[0], h[1]));
        } else if (kind == 'css') {
          f.dependencySpecs.push(new DependencySpec('css', h[0]));
        } else if (kind == 'cts') {
          f.dependencySpecs.push(new DependencySpec('cts', h[0]));
          var url = h[0];
          if (typeof fromLocation != 'undefined') {
            url = CTS.Utilities.fixRelativeUrl(url, fromLocation);
          }
          remoteLoads.push(
            CTS.Utilities.fetchString({url: url}).then(
              function(str) {
                return self.parseForrestSpec(str, url);
              }
            )
          );
        } else if (kind == 'js') {
          f.dependencySpecs.push(new DependencySpec('js', h[0]));
        } else {
          CTS.Log.Error("Don't know CTS header type:", kind);
        }
      }
    }
    f.relationSpecs = json.relations;
    forrestSpecs.push(f);
    
    Q.all(remoteLoads).then(
      function(moreSpecs) {
        // Results here contains MORE cts strings
        //var parsePromises = Fn.map(results, function(result) {
        //  return self.parseForrestSpec(result);
        //});
//        Q.all(parsePromises).then(
//          function(moreSpecs) {
            for (var i = 0; i < moreSpecs.length; i++) {
              for (var j = 0; j < moreSpecs[i].length; j++) {
                forrestSpecs.push(moreSpecs[i][j]);
              }
            }
            deferred.resolve(forrestSpecs);
//          },
//          function(reason) {
//            deferred.reject(reason);
//          }
//        );
      },
      function(reason) {
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  }

};
