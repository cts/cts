exports.addCORSHeaders = function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
};

exports.preflightHandler = function(req, res) {
  exports.addCORSHeaders(req, res);
  res.status(200).send();
}
