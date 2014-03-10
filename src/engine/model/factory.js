CTS.Factory = {
  Forrest: function(opts) {
    var deferred = Q.defer();
    var forrest = new CTS.Forrest(opts);
    forrest.initializeAsync().then(
      function() {
        deferred.resolve(forrest);
      },
      function(reason) {
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  },

  Tree: function(spec, forrest) {
    if ((spec.url == null) && (spec.name = 'body')) {
      return CTS.Factory.TreeWithJquery(CTS.$('body'), forrest, spec);
    } if ((spec.kind == "GSheet" || spec.kind == 'gsheet')) {
      return CTS.Factory.GSpreadsheetTree(spec, forrest);
    } else if (typeof spec.url == "string") {
      var deferred = Q.defer();
      CTS.Util.fetchString(spec).then(
        function(content) {
          if ((spec.kind == 'HTML') || (spec.kind == 'html')) {
            var div = CTS.$("<div></div>");
            var nodes = CTS.$.parseHTML(content);
            var jqNodes = Fn.map(nodes, function(n) {
              return CTS.$(n);
            });
            div.append(jqNodes);
            if (spec.fixLinks) {
              CTS.Util.rewriteRelativeLinks(div, spec.url);
            }
            CTS.Factory.TreeWithJquery(div, forrest, spec).then(
              function(tree) {
                deferred.resolve(tree);
              },
              function(reason) {
                deferred.reject(reason);
              }
            );
          } else {
            deferred.reject("Don't know how to make Tree of kind: " + spec.kind);
          }
        },
        function(reason) {
          deferred.reject(reason);
        }
      );
      return deferred.promise;
    } else {
      return CTS.Factory.TreeWithJquery(spec.url, forrest, spec);
    }
  },

  TreeWithJquery: function(node, forrest, spec) {
    var deferred = Q.defer();
    var tree = new CTS.Tree.Html(forrest, spec);
    CTS.Node.Factory.Html(node, tree).then(
      function(ctsNode) {
        ctsNode.realizeChildren().then(
          function() {
            tree.setRoot(ctsNode);
            deferred.resolve(tree);
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

  GSpreadsheetTree: function(treespec, forrest) {
    var deferred = Q.defer();
    // For the GSheet.
    treespec.sskey = treespec.url;
    var tree = new CTS.Tree.GSpreadsheet(forrest, treespec);
    var ss = new CTS.Node.GSpreadsheet(treespec, tree);
    var ws = false;
    if (typeof treespec.worksheet != 'undefined') {
      ws = true;
    }

    CTS.Util.GSheet.maybeLogin().then(
      function() {
        ss.realizeChildren().then(
          function() {
            if (ws) {
              var found = false;
              for (var i = 0; i < ss.children.length; i++) {
                var child = ss.children[i];
                if ((! found) && (child.name == treespec.worksheet)) {
                  tree.root = child;
                  found = true;
                  deferred.resolve(tree);
                }
              }
              if (! found) {
                deferred.reject("Couldn't find worksheet named: " + treespec.worksheet);
              }
            } else {
              tree.root = ss;
              deferred.resolve(tree);
            }
          },
          function(reason) {
            console.log("couldn't realize");
            deferred.reject(reason);
          }
        );
      },
      function(reason) {
        CTS.Log.Error("Couldn't Login to Google Spreadsheets", reason);
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  }
}
