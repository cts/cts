/*
 * Build options
 */
module.exports = {
  banner: "/**\n" +
         "* Cascading Tree Sheets\n" +
         " *\n" +
         " * @author Edward Benson <eob@csail.mit.edu> \n" +
         " * @copyright Edward Benson 2014 %>\n" +
         " * @license MIT License\n" +
         " * @link http://www.treesheets.org\n" +
         " */",
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
}