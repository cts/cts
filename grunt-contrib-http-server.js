/*
 * grunt-contrib-http-server
 */ 
var http = require('http'),
    url  = require('url'),
    path = require('path'),
    fs   = require('fs');

module.exports = function(grunt) {
  'use strict';

  var server = function(target) {
    var self = this;
    var mimeTypes = {
        "html": "text/html",
        "jpeg": "image/jpeg",
        "jpg" : "image/jpeg",
        "png" : "image/png",
        "js"  : "text/javascript",
        "css" : "text/css"};
    
    var port = 1337;
    var cors = false;
    if (typeof target != 'undefined') {
      if (typeof target.port != 'undefined') {
        port = target.port;
      }
      if (typeof target.cors != 'undefined') {
        if (target.true == true) {
          cors = true;
        }
      }
    }
    var corsStr = cors ? "on".green : "off".red;

    grunt.log.writeln('');
    grunt.log.writeln(('Starting HTTP Server on port ' + port).cyan);
    grunt.log.writeln('- Cross-Origin Resource Sharing is ' + corsStr);
   
    http.createServer(function(req, res) {
 
      grunt.log.writeln('Starting HTTP Server'.cyan);

      var uri = url.parse(req.url).pathname;
      var filename = path.join(process.cwd(), unescape(uri));
      var stats;
    
      try {
        stats = fs.lstatSync(filename); // throws if path doesn't exist
      } catch (e) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write('404 Not Found\n');
        res.end();
        return;
      }
    
      if (stats.isFile()) {
        // path exists, is a file
        var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
        res.writeHead(200, {'Content-Type': mimeType} );
    
        var fileStream = fs.createReadStream(filename);
        fileStream.pipe(res);
      } else if (stats.isDirectory()) {
        // path exists, is a directory
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('Index of '+uri+'\n');
        res.write('TODO, show index?\n');
        res.end();
      } else {
        // Symbolic link, other?
        // TODO: follow symlinks?  security?
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.write('500 Internal server error\n');
        res.end();
        // This is a test
      }
    }).listen(port);

    // Keep it alive
    this.async();
  };

  grunt.registerTask('http-server', 'Run a simple HTTP server', server);
};

