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
  var webserver = child_process.exec('node app.js', {
    cwd: path.join(__dirname, 'website')
  });
  webserver.stdout.pipe(process.stdout);
  webserver.stderr.pipe(process.stderr);

  // The file server on 3001
  var fileserver = child_process.exec('grunt web_server');
  fileserver.stdout.pipe(process.stdout);
  fileserver.stderr.pipe(process.stderr);

};
