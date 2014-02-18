_CTSUI.autoload = function() {
  // Load CK Editor
  var s = document.createElement('script');
  s.setAttribute('src', _CTSUI.URLs.Scripts.ckeditor);
  s.setAttribute('type', 'text/javascript');
  document.getElementsByTagName('head')[0].appendChild(s);

  if (typeof CTS != 'undefined') {
    CTS.UI = _CTSUI;
    CTS.status.defaultTreeReady.then(function() {
      CTS.Q.longStackSupport = true;
      CTS.UI.load();
      loadCtsUiFileDownloadPlugin();
    });
  } else {
    // CTS isn't present. Let's create it with a script.
    var s = document.createElement('script');
    s.setAttribute('src', _CTSUI.URLs.Scripts.cts);
    s.setAttribute('type', 'text/javascript');
    s.onload = function() {

      CTS.UI = _CTSUI;
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
    ckeditor.setAttribute('src', _CTSUI.URLs.Scripts.ckeditor);
    ckeditor.setAttribute('type', 'text/javascript');
    document.getElementsByTagName('head')[0].appendChild(ckeditor);
  }
};
_CTSUI.autoload();
