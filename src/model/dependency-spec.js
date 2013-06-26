var DependencySpec = CTS.DependencySpec = function(kind, url) {
  this.kind = kind;
  this.url = url;
  this.loaded = false;
};

DependencySpec.prototype.load = function() {
  this.url = CTS.Utilities.fixRelativeUrl(this.url, this.loadedFrom);
  if (this.loaded == false) {
    if (this.kind == 'css') {
      this.loaded = true;
      var link = document.createElement('link')
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('type', 'text/css');
      link.setAttribute('href', this.url);
      document.getElementsByTagName('head')[0].appendChild(link);
    } else if (this.kind == 'js') {
      this.loaded = true;
      var script = document.createElement('script')
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('src', this.url);
      document.getElementsByTagName('head')[0].appendChild(script);
    } else {
      CTS.Logging.Error("DependencySpec: Unsure how to load", this.kind, this.url);
    }
  } else {
    CTS.Logging.Warn("DependencySpec: Not loading already loaded", this.kind, this.url);
  }
};


