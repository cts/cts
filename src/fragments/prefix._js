// Save a reference to the global object. `this` is `window` in a browser.
var root = this;

var CTS;

if (typeof exports !== 'undefined') {
  CTS = exports;
} else {
  CTS = root.CTS = {};
}

CTS.Utilities = {
  getUrlParameter: function(param, url) {
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
  }
};

CTS.autoloadCheck = function() {
  if (typeof document == 'undefined') {
    return false;
  }
  var scripts = document.getElementsByTagName('script');
  // Do it backwards because this should be the LAST script
  // since we're executing, and scripts are loaded sequentially
  for (var i = scripts.length - 1; i >= 0; i++) {
    var script = scripts[i];
    if ((typeof script.src != 'undefined') &&
        (script.src != null) && 
        ((script.src.indexOf('cts.js') != -1) ||
         (script.src.indexOf('cts.min.js') != -1))) {
      var param = CTS.Utilities.getUrlParameter('autoload', script.src)
      if (param == 'false') {
        return false;
      } else {
        return true;
      }
    }
  }
  return false;
};

if (CTS.autoloadCheck()) {
  CTS.shouldAutoload = true;

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
}

(function() {
