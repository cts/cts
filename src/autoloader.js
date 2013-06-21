CTS.shouldAutoload = function() {
  var foundCtsElement = false;
  var autoload = true;

  // Search through <script> elements to find the CTS element.
  CTS.Fn.each(CTS.$('script'), function(elem) {
    var url = $(elem).attr('src');
    if ((!CTS.Fn.isUndefined(url)) && (url != null) && (url.indexOf('cts.js') != 1)) {
      foundCtsElement = true;
      var param = CTS.Utilities.getUrlParameter('autoload', url);
      if (param == 'false') {
        autoload = false;
      }
    }
  }, this);

  return (foundCtsElement && autoload);
};

if (CTS.shouldAutoload()) {
  CTS.$(function() {
    CTS.engine = new CTS.Engine();
    CTS.engine.boot();
  });
}
