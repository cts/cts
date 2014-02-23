/*
 * This is only to be run once we're sure CTS is present.
 */
CTS.UI.load = function() {
  console.log("CTS Loaded");
  CTS.$(function() {
    CTS.UI.clipboard = new CTS.UI.Clipboard();
    CTS.UI.switchboard = new CTS.UI.Switchboard(CTS.$, CTS.Q);
    CTS.UI.picker = new CTS.UI.Picker(CTS.$, CTS.Q);
    CTS.UI.modal = new CTS.UI.Modal(CTS.$, CTS.Q);
    CTS.UI.tray = new CTS.UI.Tray();
  });
};

/*
 *
 */
CTS.UI.autoload = function() {
  // Load CK Editor
  var s = document.createElement('script');
  s.setAttribute('src', CTS.UI.URLs.Scripts.ckeditor);
  s.setAttribute('type', 'text/javascript');
  document.getElementsByTagName('head')[0].appendChild(s);

  if (typeof CTS != 'undefined') {
    CTS.UI = CTS.UI;
    CTS.status.defaultTreeReady.then(function() {
      CTS.Q.longStackSupport = true;
      CTS.UI.load();
      loadCtsUiFileDownloadPlugin();
    });
  } else {
    // CTS isn't present. Let's create it with a script.
    var s = document.createElement('script');
    s.setAttribute('src', CTS.UI.URLs.Scripts.cts);
    s.setAttribute('type', 'text/javascript');
    s.onload = function() {

      // Now we have to wait for $ to load
      CTS.status.defaultTreeReady.then(function() {
        CTS.Q.longStackSupport = true;
        CTS.engine.booted.then(function() {
          CTS.UI.load();
          loadCtsUiFileDownloadPlugin();
        });
      });
    };
    document.getElementsByTagName('head')[0].appendChild(s);
  }

  // Inject CK Editor
  if (typeof CKEDITOR == 'undefined') {
    var ckeditor = document.createElement('script');
    ckeditor.setAttribute('src', CTS.UI.URLs.Scripts.ckeditor);
    ckeditor.setAttribute('type', 'text/javascript');
    document.getElementsByTagName('head')[0].appendChild(ckeditor);
  }
};

CTS.UI.autoload();

