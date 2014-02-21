CTS.registerNamespace('CTS.Util');

// We're going to load *some* things in the util namespace here.

CTS.Util.getUrlParameter = function(param, url) {
  if (typeof url == 'undefined') {
    url = window.location.search;
  }
  var p = param.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + p + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(url)
  if (results == null) {
    return null;
  } else {
    return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
};

CTS.Util.shouldAutoload = function() {
  if (typeof document == 'undefined') {
    return false;
  }
  var scripts = document.getElementsByTagName('script');
  // Do it backwards because this should be the LAST script
  // since we're executing, and scripts are loaded sequentially
  for (var i = scripts.length - 1; i >= 0; i--) {
    var script = scripts[i];
    if (typeof script != 'undefined') {
      if ((typeof script.src != 'undefined') &&
          (script.src != null) && 
          ((script.src.indexOf('cts.js') != -1) ||
           (script.src.indexOf('cts.min.js') != -1) ||
           (script.src.indexOf('cts.dev.js') != -1))) {
        var param = CTS.Util.getUrlParameter('autoload', script.src)
        if (param == 'false') {
          return false;
        } else {
          return true;
        }
      }
    }
  }
  return false;
};

CTS.Util.hideDocumentBody = function() {
  var css = 'body { display: none; }';
  var head = document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);
};

CTS.Util.showDocumentBody = function($e) {
  CTS.$('body').show();
};

