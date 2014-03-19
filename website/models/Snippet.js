var mongoose = require('mongoose');

var snippetSchema = new mongoose.Schema({
  user_id:  mongoose.Schema.Types.ObjectId,
  version_number: { type: Number, default: 0},
  prior_version: {type: mongoose.Schema.Types.ObjectId, default: null},
  name: {type: String, default: "Unnamed Snippet"},
  html: {type: String, default: ""},
  cts: {type: String, default: ""},
  ssheet: {type: String, default: ""},
  kind: {type: String, default: "Snippet"}
});

module.exports = mongoose.model('Snippet', snippetSchema);
