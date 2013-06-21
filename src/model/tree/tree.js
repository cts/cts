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
    var node = $('body');
    var tree = new CTS.Tree.Html(forrest, node, spec);
    deferred.resolve(tree);
  } else {
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
          var node = $(content);
          var tree = new CTS.Tree.Html(forrest, node, spec);
          deferred.resolve(tree);
        } else {
          deferred.reject();
        }
      },
      function() {
        deferred.reject();
      }
    );
  }
  return deferred.promise;
};
