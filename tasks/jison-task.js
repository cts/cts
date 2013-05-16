/*
 * Jison Task
 *
 * Adapted from grunt-jison:
 * https://github.com/rsilve/grunt-jison
 * Copyright (c) 2013 Robert silve
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var task = grunt.task;
  var file = grunt.file;
  var utils = grunt.utils;
  var log = grunt.log;
  var verbose = grunt.verbose;
  var fail = grunt.fail;
  var option = grunt.option;
  var config = grunt.config;
  var template = grunt.template;
  
  var jison = require('jison');

  grunt.registerMultiTask('jison', 'jison parser generator', function() {
	
	var outputType = this.data.outputType || "commonjs";
	var inputType  = this.data.inputType || "jison";
	
	this.files.forEach(function(f) {
		
		var src = f.src.shift();
		var dest = f.dest;
	
		if (!src) {	
			grunt.warn('Missing src property.');
			return false;
		}

		if (!dest) {
			grunt.warn('Missing dest property');
			return false;
		}
		try {
			var data = file.read(src);
      if (inputType == 'json') {
        data = JSON.parse(data);
      }
			var parser = new jison.Parser(data);
			var js = parser.generate({moduleType: outputType});
			file.write(dest, js);
			grunt.log.oklns("generate "+dest);	
			return true;
		} catch (e) {
			grunt.warn(e);
			return false;
		}
    }); 
  });
};
