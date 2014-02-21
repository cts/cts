var DependencySpec = CTS.DependencySpec = function(kind, url) {
  this.kind = kind;
  this.url = url;
  this.loaded = false;
};

DependencySpec.prototype.load = function() {
  this.url = CTS.Util.fixRelativeUrl(this.url, this.loadedFrom);
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
    } else if (this.kind == 'cts') {
      // Ignore
    } else {
      CTS.Log.Error("DependencySpec: Unsure how to load: ", this.kind, this.url);
    }
  } else {
    CTS.Log.Warn("DependencySpec: Not loading already loaded", this.kind, this.url);
  }
};

DependencySpec.prototype.unload = function() {
  if (this.loaded) {
    this.url = CTS.Util.fixRelativeUrl(this.url, this.loadedFrom);
    if (this.kind == 'css') {
      var links = document.getElementsByTagName('link');
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (typeof link.attributes != "undefined") {
          if (typeof link.attributes["href"] != "undefined") {
            if (link.attributes["href"].value == this.url) {
              link.parentNode.removeChild(link);
              this.loaded = false;
            }
          }
        }
      }

    } else if (this.kind == 'js') {
      // Can't unload a JS link.
    }
  } else {
    CTS.Log.Warn("Tried to unload DependencySpec that wasn't loaded", this);
  }
};
