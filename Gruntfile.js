/**
 * Grunt Buildfile for Cascading Tree Sheets
 * node --harmony $(which grunt) task
 */
var fs = require('fs');
var path = require('path');

var options;
if (fs.existsSync(path.join('.', 'build-options.js'))) {
  options = require('./build-options.js');
} else {
  console.log("Using EXAMPLE options");
  options = require('./build-options.example.js');
}

var gruntConfig = {
  pkg: "Cascading Tree Sheets",
  meta: { banner: options.banner },
  concat: {},
  duo: {},
  release: {},
  projectsetup: {
    opts: {
      componentDirectory: path.resolve(options.componentDirectory),
      repoDirectory: path.resolve(options.repoDirectory)      
    }
  }
};

for (var variant in options.variants) {
  var particulars = options.variants[variant];

  gruntConfig.concat[variant] = {
    src: [
      'lib/gapi.js',
      'src/part-01-preamble.js',
      particulars.constantsFile,
      'src/part-03-constants.js',
      'src/part-04-boot.js'
    ],
    dest: path.join(options.buildMidpointDirectory, particulars.shortname + particulars.suffix)
  };

  gruntConfig.duo[variant] = {
    src: particulars.shortname + particulars.suffix,
    inputContext: path.resolve(options.buildMidpointDirectory),
    outputContext: path.resolve(options.buildOutputDirectory),
    development: particulars.duoDevelopment
  };
  gruntConfig.release[variant] = {
    src: particulars.shortname + particulars.suffix,
    inputContext: path.resolve(options.buildMidpointDirectory),
    outputContext: path.resolve(options.buildOutputDirectory),
    development: particulars.duoDevelopment
  };
  gruntConfig.copy = {
    'variant': {
      expand: true,
      cwd: 'build-tmp/build',
      src: ['*.js'],
      dest: 'build/'
    }
  };

  gruntConfig.aws_s3 = {
    'deploy': {
      options: {
        region: 'us-west-2',
        uploadConcurrency: 5, // 5 simultaneous uploads
        downloadConcurrency: 5, // 5 simultaneous downloads
        excludeFromGzip: ['*.png', '*.jpg', '*.jpeg'],        
        bucket: 'static.cloudstitch.io',
        params: {},
        gzip: true,
        differential: false
      },
      files: [
        {expand: true, cwd: 'build', src: ['**'], dest: '', params: {CacheControl: '2000'}}
      ]
    }
  };
}

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-aws-s3');

  require('./src/build-scripts/grunt-contrib-duo')(grunt);
  require('./src/build-scripts/grunt-contrib-projectsetup')(grunt);
  require('./src/build-scripts/grunt-contrib-release')(grunt);
  grunt.initConfig(gruntConfig);

  grunt.file.mkdir( options.buildMidpointDirectory );
  grunt.file.mkdir( options.buildOutputDirectory );
  
  grunt.registerTask('default', ['concat', 'duo', 'copy']);
  grunt.registerTask('setup', ['default', 'projectsetup']);
  grunt.registerTask('deploy', ['aws_s3:deploy'])
};
