// Constructor
// -----------
CTS.Tree.Json = function(forrest, root, spec) {
  this.root = new CTS.JsonNode(root, this);
  this.root.setProvenance(this);
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
};

// Instance Methods
// ----------------
CTS.Fn.extend(CTS.Tree.Json, CTS.Tree.Base, {
});
