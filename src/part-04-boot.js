// // This part is loaded after the constants (part 2).
CTS.Engine = enginePackage.Engine;
CTS.Factory = enginePackage.Factory;

// Set up bare minimum functionality that we want available for
// all other files.
// --------------------------------------------------------------------------
CTS.status = {};

// Set some status bits.
CTS.status.libraryLoaded = CTS.loaded = CTS.status.loaded = Util.Promise.defer();
CTS.ready = CTS.status.defaultTreeReady = Util.Promise.defer();
CTS.booted = Util.Promise.defer();
CTS.Epilogue = {};

CTS.Epilogue.maybeAutoload = function() {
  if (Util.Helper.shouldAutoload()) {
    Util.$(function() {
      CTS.engine = new CTS.Engine();
      CTS.engine.loaded.then(function() {
        CTS.status.libraryLoaded.resolve();
      }, function(reason) {
        CTS.status.libraryLoaded.reject(reason);        
      });

      CTS.engine.boot().then(
        function() {
          CTS.booted.resolve();
          Util.Helper.showDocumentBody();
        }
      ).done();
    });
  }
};

CTS.on = function(evt, callback) {
  CTS.engine.on(evt, callback);
};

CTS.Epilogue.maybeAutoload();

if (typeof window != 'undefined') {
  window.CTS = CTS;
  window.Stitch = CTS;
}

if ((typeof module != 'undefined') && (typeof module.exports != 'undefined')) {
  module.exports = CTS;  
}