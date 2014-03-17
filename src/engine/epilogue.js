// Cascading Tree Sheets - Epilogue
// ==========================================================================
//
// Assumption:
//   This file is loaded AFTER all CTS Engine files have loaded.
//
CTS.registerNamespace('CTS.Epilogue');

// Set some status bits.
CTS.status._libraryLoaded = Q.defer();
CTS.status.libraryLoaded = CTS.loaded = CTS.status.loaded = CTS.status._libraryLoaded.promise;

CTS.status._defaultTreeReady = Q.defer();
CTS.ready = CTS.status.defaultTreeReady = CTS.status._defaultTreeReady.promise;

CTS.Epilogue.ensureJquery = function() {
  var deferred = Q.defer();
  if (typeof root.jQuery != 'undefined') {
    deferred.resolve(root.jQuery);
  } else if ((typeof exports !== 'undefined') && (typeof require == 'function')) {
    deferred.resolve(require('jquery'));
  } else {
    CTS.Util.loadJavascript(CTS.Constants.jQuery, function() {
      deferred.resolve(jQuery.noConflict());
    });
  }
  return deferred.promise;
}

CTS.Epilogue.maybeAutoload = function() {
  CTS.Log.Info("CTS Epilogue: Autoload check...");
  if (CTS.Util.shouldAutoload()) {
    CTS.$(function() {
      if (CTS.Constants.longstackSupport) {
        CTS.Q.longStackSupport = true;
      }
      CTS.engine = new CTS.Engine();
      CTS.engine.boot().then(
        function() {
          CTS.Util.showDocumentBody();
        }
      ).done();
    });
  }
};

CTS.Util.GSheet._loadGApi();

CTS.Epilogue.ensureJquery().then(
  function(jQuery) {
    CTS.$ = jQuery;
    CTS.Epilogue.maybeAutoload();
    CTS.status._libraryLoaded.resolve();
  },
  function(reason) {
  }
).done();
