// This is only to be run once we're sure CTS is present.
// (see autoloader.js)
_CTSUI.load = function() {
  console.log("CTS Loaded");
  CTS.$(function() {
    CTS.UI.clipboard = new CTS.UI.Clipboard();
    CTS.UI.switchboard = new CTS.UI.Switchboard(CTS.$, CTS.Q);
    CTS.UI.picker = new _CTSUI.Picker(CTS.$, CTS.Q);
    CTS.UI.modal = new _CTSUI.Modal(CTS.$, CTS.Q);
    CTS.UI.tray = new CTS.UI.Tray();
  });
};
