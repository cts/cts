CTS.shouldAutoload = function() {
  var foundCtsElement = false;
  var autoload = true;

  // Search through <script> elements to find the CTS element.
  _.each(CTS.$('script'), function(elem) {
    var url = $(elem).attr('src');
    if ((!_.isUndefined(url)) && (url != null) && (elem.indexOf('cts.js') != 1)) {
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
  CTS.engine = new CTS.Engine();
  CTS.engine.boot();
}
