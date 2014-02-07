CTS._ready = Q.defer();
// You can use this to trigger things that depend on CTS and
// all its dependencies (e.g., CTS.$)
CTS.ready = CTS._ready.promise; 

CTS.status = {
  _libraryLoaded: Q.defer(),
  _defaultTreeReady: Q.defer()
};


CTS.status.libraryLoaded = CTS.status._libraryLoaded.promise;
CTS.status.defaultTreeReady = CTS.status._defaultTreeReady.promise;
CTS.status.defaultTreeReady.then(
  function() { CTS._ready.resolve() },
  function(reason) { CTS._ready.reject(reason); }
);

CTS.ensureJqueryThenMaybeAutoload = function() {
  if (typeof root.jQuery != 'undefined') {
    CTS.$ = root.jQuery;
    CTS.maybeAutoload();
    CTS.status._libraryLoaded.resolve();
  } else if ((typeof exports !== 'undefined') && (typeof require == 'function')) {
    // This is only if we're operating inside node.js
    CTS.$ = require('jquery');
    CTS.maybeAutoload();
    CTS.status._libraryLoaded.resolve();
  } else {
    var s = document.createElement('script');
    var jquery = CTS.Constants.jQuery;
    var proto = '';
    if ((typeof window != 'undefined') && 
        (typeof window.location != 'undefined') &&
        (window.location.protocol == 'file:')) {
      proto = 'http:';
    }
    s.setAttribute('src', proto + jquery);
    s.setAttribute('type', 'text/javascript');
    s.onload = function() {
      CTS.$ = jQuery.noConflict();
      CTS.maybeAutoload();
      CTS.status._libraryLoaded.resolve();
    };
    document.getElementsByTagName('head')[0].appendChild(s);
  }
};

CTS.maybeAutoload = function() {
  console.log("CTS Autoload check...");
  if (typeof CTS.shouldAutoload == 'undefined') {
    CTS.shouldAutoload = CTS.autoloadCheck();
  }
  if (CTS.shouldAutoload) {
    CTS.$(function() {
      CTS.engine = new CTS.Engine();
      CTS.engine.boot().then(
        function() {
          CTS.showForLoading();
        }
      );
    });
  }
};

CTS.ensureJqueryThenMaybeAutoload();

