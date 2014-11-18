Util._.extend(CTS.Constants, {
  Domains: {
    server: '//local-cloudstitch.io:3001/',
    static: '//local-cloudstitch.io:3000/',
    web: '//local-cloudstitch.io:3000/'
  },
  Socket: {
    library: '//local-cloudstitch.io:3001/primus/primus.js'
  }
});

var enginePackage = require('cloudstitch/engine');
