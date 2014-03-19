var mongoose = require('mongoose');

var snippetSchema = new mongoose.Schema({
  user_id:  mongoose.Schema.Types.ObjectId,
  version_number: { type: Number, default: 0},
  prior_version: {type: mongoose.Schema.Types.ObjectId, default: null},
  name: {type: String, default: "Unnamed Snippet"},
  html: {type: String, default: ""},
  cts: {type: String, default: ""},
  ssheet: {type: String, default: ""},
  kind: {type: String, default: "Snippet"},
  latestVersion: {type: Boolean, default: true}
});

snippetSchema.methods.duplicateForUser = function(user, params, cb) {
  var duplicate = new Snippet({
    version_number: 0,
    name: this.name,
    user_id: user.id,
    prior_version: this.prior_version,
    html: this.html,
    cts: this.cts,
    ssheet: this.ssheet,
    kind: this.kind,
    latestVersion: true
  });
  if (params.html) duplicate.html = params.html;
  if (params.name) duplicate.name = params.name;
  if (params.cts) duplicate.cts = params.cts;
  if (params.ssheet) duplicate.ssheet = params.ssheet;
  duplicate.save(cb);
};

snippetSchema.methods.advanceVersion = function(params, cb) {
  var self = this;
  this.emitPriorVersion(function(err, prior) {
    if (err) {
      return cb(err);
    }
    if (prior == null) {
      return cb("Could not save prior version");
    }
    self.version_number = self.version_number + 1;
    self.prior_version = prior.id;
    if (params.html) self.html = params.html;
    if (params.name) self.name = params.name;
    if (params.cts) self.cts = params.cts;
    if (params.ssheet) self.ssheet = params.ssheet;
    self.save(cb);
  });
};

snippetSchema.methods.emitPriorVersion = function(cb) {
  var priorSnippet = new Snippet({
    version_number: this.version_number,
    name: this.name,
    user_id: this.user_id,
    prior_version: this.prior_version,
    html: this.html,
    cts: this.cts,
    ssheet: this.ssheet,
    kind: this.kind,
    latestVersion: false
  });
  priorSnippet.save(cb);
};

var Snippet = mongoose.model('Snippet', snippetSchema);

module.exports = Snippet;
