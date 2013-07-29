// DOM Tree
// ==========================================================================
//
// ==========================================================================

var Tree = CTS.Tree = {};

CTS.Tree.Base = {
  render: function(opts) {
    this.root.render(opts);
  }
};

/*
 * Returns a promise
 */
CTS.Tree.Create = function(spec, forrest) {
  var deferred = Q.defer();
  // Special case
  if ((spec.url == null) && (spec.name = 'body')) {
    var node = CTS.$('body');
    var tree = new CTS.Tree.Html(forrest, node, spec);
    deferred.resolve(tree);
  } else if (typeof spec.url == "string") {
    CTS.Utilities.fetchString(spec).then(
      function(content) {
        if ((spec.kind == 'HTML') || (spec.kind == 'html')) {
          //try {
          //  var domNodes = CTS.Parser.Html.HTMLtoDOM(content); 
          //} catch (e) {
          //  console.log(e);
          //  CTS.Debugging.DumpStack();
          //  debugger;
          //}
          var div = CTS.$("<div></div>");
          var nodes = CTS.$.parseHTML(content);
          var jqNodes = Fn.map(nodes, function(n) {
            return CTS.$(n);
          });
          div.append(jqNodes);
          var tree = new CTS.Tree.Html(forrest, div, spec);
          deferred.resolve(tree);
        } else {
          deferred.reject("Don't know how to make Tree of kind: " + spec.kind);
        }
      },
      function(reason) {
        deferred.reject(reason);
      }
    );
  } else {
    // jquery node
    var node = spec.url;
    var tree = new CTS.Tree.Html(forrest, node, spec);
    deferred.resolve(tree);
  }
  return deferred.promise;
};
