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
    console.log('New tree', spec);
    if ((spec.url == null) && (spec.name = 'body')) {
      return CTS.Factory.TreeWithJquery(CTS.$('body'), forrest, spec);
    } if ((spec.kind == "GSheet" || spec.kind == 'gsheet')) {
      return CTS.Factory.GSpreadsheetTree(spec, forrest);
    } else if ((spec.kind == "Firebase" || spec.kind == 'firebase')) {
      return CTS.Factory.FirebaseTree(spec, forrest);
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
            if (spec.receiveEvents) {
              CTS.Log.Info("New tree should receive events", spec);
              tree.toggleReceiveRelationEvents(true);
            }
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
    // https://docs.google.com/spreadsheet/ccc?key=0Arj8lnBW4_tZdC1rVlAzQXFhWmFaLU1DY2RsMzVtUkE&usp=drive_web#gid=0
    if (treespec.url.indexOf('http') == 0) {
      var pat = "key=([^&]+)(&|$)";
      var match = treespec.url.match(pat);
      if (match && (match.length > 1)) {
        treespec.sskey = match[1];
      }
    } else {
      treespec.sskey = treespec.url;
    }
    CTS.Log.Info("Trying to resolve GSheet Tree:", treespec.sskey);

    var tree = new CTS.Tree.GSpreadsheet(forrest, treespec);
    var ss = new CTS.Node.GSpreadsheet(treespec, tree);
    var ws = false;
    if (typeof treespec.worksheet != 'undefined') {
      ws = true;
    }

    CTS.Util.GSheet.maybeLogin().then(
      function() {
        CTS.Log.Info("GSheets Logged In");
        ss.realizeChildren().then(
          function() {
            if (ws) {
              CTS.Log.Info("Looking for worksheed named ", ws);
              var found = false;
              for (var i = 0; i < ss.children.length; i++) {
                var child = ss.children[i];
                if ((! found) && (child.name == treespec.worksheet)) {
                  tree.root = child;
                   if (treespec.receiveEvents) {
                    tree.toggleReceiveRelationEvents(true);
                  }
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
  },

  FirebaseTree: function(treespec, forrest) {
    var deferred = Q.defer();
    var tree = new CTS.Tree.Firebase(forrest, treespec);
    var ss = new CTS.Node.Firebase(treespec, tree);
    ss.Ref = new Firebase(treespec.url);
    tree.root = ss
    deferred.resolve(tree);
    return deferred.promise;
  }
}
