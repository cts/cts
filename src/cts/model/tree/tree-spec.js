var TreeSpec = CTS.Tree.Spec = function(kind, name, url, loadedFrom) {
  this.kind = kind;
  this.name = name;
  this.url = url;
  this.fixLinks = true;
  this.loadedFrom = null;
  if (typeof loadedFrom != 'undefined') {
    this.loadedFrom = loadedFrom;
  }
};
