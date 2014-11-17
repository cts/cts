var Duo = require('duo');
var fs = require('fs');
var touch = require('touch');
var path = require('path');

var exec = require('child_process').exec;

module.exports = function(grunt) {

  var duoFn = function() {
    var done = this.async();
    var target = this.target;
    var data = this.data;
    var context = '.';
    if (data.inputContext) {
      context = data.inputContext;
    }

    var src = data.src;
    var dest = data.dest;

    // var duo = Duo(context);
    // if (data.development) {
    //   duo.development();
    //   duo.copy(true);
    // }

    process.nextTick(function() {
        // For some bizarre reason, you have to touch the file
        // Or duo will refuse to do anything..
        var thePath = path.join(__dirname, data.inputContext);
        var theFile = path.join(__dirname, data.inputContext, src);
        var outputFile = path.join(data.outputContext, src);
        touch.sync(theFile);
        process.nextTick(function() {

            exec('duo ' + theFile + ' > ' + outputFile, {
                cwd: thePath
            }, function (err, stdout, stderr) {
              if (err) {
                grunt.log.error(err);
                done(); 
              } else {
                grunt.log.ok('Duo ' + src);// + ' -> ' + dest);
                done();
              }                
            });
        });
    });
  };

  grunt.registerMultiTask('duo', 'Runs Duo', duoFn);
};