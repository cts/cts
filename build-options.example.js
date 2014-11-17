/*
 * Build options
 */

var path = require('path');

module.exports = {
  banner: "/**\n" +
         "* Cascading Tree Sheets\n" +
         " *\n" +
         " * @author Edward Benson <eob@csail.mit.edu> \n" +
         " * @copyright Edward Benson 2014 %>\n" +
         " * @license MIT License\n" +
         " * @link http://www.treesheets.org\n" +
         " */",
  componentDirectory: path.join('.', 'build-tmp', 'components'),
  buildMidpointDirectory: path.join('.', 'build-tmp'),
  buildOutputDirectory: path.join('.', 'build'),
  repoDirectory: path.join('.', '..'),
  variants: {
    'cts-dev': {
      shortname: 'cts', 
      suffix: '.dev.js',
      constantsFile: 'src/part-02.cts-dev.js',
      duoDevelopment: true
    },
    'cts-prod': {
      shortname: 'cts',
      suffix: '-HEAD.js',
      constantsFile: 'src/part-02.cts-prod.js',
      duoDevelopment: false
    }
  }
};