var TreeSpec = CTS.Tree.Spec = function(kind, opts) {
  this.kind = kind;
  // name, url, loadedFrom, fixLinks
  this.fixLinks = true;
  this.loadedFrom = null;
  this.name = null;
  this.url = null;
  CTS.Fn.extend(this, opts);
};
