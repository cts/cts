var Duo = require('duo');
var fs = require('fs');

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

    var duo = Duo(context);
    if (data.development) {
      duo.development();
      duo.copy(true);
    }
    duo.entry(src);
    duo.installTo('components'); // Install path for components
    duo.buildTo(data.outputContext); // Output path
    duo.write(function(err) {
      if (err) {
        grunt.log.error(err);
        done(); 
      } else {
        grunt.log.ok('Duo ' + src);// + ' -> ' + dest);
        done();
      }
    });

    // var data = duo.run(function(err, compiled) {
    //     if (err) {
    //       grunt.log.error(err);
    //       done();
    //     } else {
    //       fs.writeFile(dest, compiled, function (err) {
    //         if (err) {
    //           grunt.log.error(err);
    //           done(); 
    //         } else {
    //           grunt.log.ok('Duo ' + src + ' -> ' + dest);
    //           done();
    //         };
    //       });
    //     }
    //   });

  };

  grunt.registerMultiTask('duo', 'Runs Duo', duoFn);
};