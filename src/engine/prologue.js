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
  // Don't autoload if there is a ?autoload=false
  if (typeof document == 'undefined') {
    return false;
  }
  if (CTS.Util.getUrlParameter('autoload') == 'false') {
    return false;
  }
  if (typeof document.body.dataset != 'undefined') {
    if (typeof document.body.dataset.ctsautoload != 'undefined') {
      if (document.body.dataset.ctsautoload == 'false') {
        return false;
      }
    }
  }
  return true;
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
