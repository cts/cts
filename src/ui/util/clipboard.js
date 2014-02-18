_CTSUI.Clipboard = function(server) {
  this._key = "cts-clipboard";
  this._server = server;
  if (typeof server == "undefined") {
    this._server = CTS.UI.URLs.Services.clipboard;
  }
  this._deferred = CTS.$.Deferred();
  this._serverWindow = null;
  var self = this;
  window.addEventListener("message", function(e) { self.onLoad(e) }, false);
  this.addIframe();
};

_CTSUI.Clipboard.prototype.addIframe = function() {
  this._iframe = CTS.$("<iframe class='cts-ignore cts-ui' src='" + this._server + "'></iframe>");
  this._iframe.hide();
  CTS.$('body').append(this._iframe);
};

_CTSUI.Clipboard.prototype.onLoad = function(evt) {
  if (evt.source == this._iframe.get(0).contentWindow) {
    window.removeEventListener("message", this._onLoad);
    this._serverWindow = evt.source;
    this._deferred.resolve();
  }
};

_CTSUI.Clipboard.prototype.copy = function(text) {
  var self = this;
  this._deferred.done(function() {
    self._serverWindow.postMessage({
      cmd: "set",
      name: self._key,
      value: text,
      days: 7}, "*");
  });
};


_CTSUI.Clipboard.prototype.paste = function(callback) {
  var self = this;

  var returnData = function(evt) {
    if (typeof(evt) != "undefined") {
      if (evt.source == self._serverWindow) {
        window.removeEventListener("message", returnData);
        if (typeof callback != "undefined") {
          callback(evt.data);
        }
      }
    }
  };

  this._deferred.done(function() {
    window.addEventListener("message", returnData, false);
    self._serverWindow.postMessage({
      cmd: "get",
      name: self._key}, "*"
    );
  });
};
