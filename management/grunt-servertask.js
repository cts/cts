/*
 * Spins up several things at once:
 *   - watching files for changes, and recompiling
 *   - static file server for debugging
 *   - web server
 */
module.exports = function(arg1, arg2) {
  var child_process = require('child_process');
  var child = child_process.exec('grunt web_server');
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
};
