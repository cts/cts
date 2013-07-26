CTS._ready = Q.defer();

// You can use this to trigger things that depend on CTS and
// all its dependencies (e.g., CTS.$)
CTS.ready = CTS._ready.promise; 

CTS.shouldAutoload = function() {
  var foundCtsElement = false;
  var autoload = true;

  // Search through <script> elements to find the CTS element.
  CTS.Fn.each(CTS.$('script'), function(elem) {
    var url = CTS.$(elem).attr('src');
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

CTS.ensureJqueryThenMaybeAutoload = function() {
  if (typeof root.jQuery != 'undefined') {
    CTS.$ = root.jQuery;
    CTS.maybeAutoload();
    CTS._ready.resolve();
  } else if ((typeof exports !== 'undefined') && (typeof require == 'function')) {
    // This is only if we're operating inside node.js
    CTS.$ = require('jquery');
    CTS.maybeAutoload();
    CTS._ready.resolve();
  } else {
    var s = document.createElement('script');
    s.setAttribute('src', '//ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js');
    s.setAttribute('type', 'text/javascript');
    s.onload = function() {
      CTS.$ = jQuery.noConflict();
      CTS.maybeAutoload();
      CTS._ready.resolve();
    };
    document.getElementsByTagName('head')[0].appendChild(s);
  }
};

CTS.maybeAutoload = function() {
  if (CTS.shouldAutoload()) {
    CTS.$(function() {
      CTS.engine = new CTS.Engine();
      CTS.engine.boot();
    });
  }
};

CTS.ensureJqueryThenMaybeAutoload();


