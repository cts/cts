var Duo = require('duo');
var fs = require('fs');

module.exports = function(grunt) {

  var duoFn = function() {
    console.log('using duo %s', require('duo/package.json').version);
    var done = this.async();
    var target = this.target;
    var data = this.data;
    var context = __dirname;
    if (data.inputContext) {
      context = data.inputContext;
    }

    var src = data.src; 
    var dest = data.dest;

    var duo = new Duo(context);
    console.log('context', context);
    console.log('op context', data.outputContext);
    
    // if (data.development) {
    //   duo.development();
    //   duo.copy(true);
    // }
    console.log('entry', src);
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