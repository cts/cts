/*
 * Spins up several things at once:
 *   - watching files for changes, and recompiling
 *   - static file server for debugging
 *   - web server
 */
module.exports = function(arg1, arg2) {

  var child_process = require('child_process');
  var path = require('path');

  // The web server on 3000
  var docserver = child_process.exec('PORT=3000 node app-docs.js', {
    cwd: path.join(__dirname, 'website')
  });
  docserver.stdout.pipe(process.stdout);
  docserver.stderr.pipe(process.stderr);

  var quiltserver = child_process.exec('PORT=5000 node app-quilted.js', {
    cwd: path.join(__dirname, 'website')
  });
  quiltserver.stdout.pipe(process.stdout);
  quiltserver.stderr.pipe(process.stderr);

  // The file server on 3001
  var fileserver = child_process.exec('grunt web_server');
  fileserver.stdout.pipe(process.stdout);
  fileserver.stderr.pipe(process.stderr);

};
