var Util = require('cts/util');

var CTS = function(selectorStr) {
  if (CTS.engine) {
    if (CTS.engine.forrest) {
      return CTS.engine.forrest.find(selectorStr);
    } else {
      Util.Log.Warn("Forrest is not loaded yet.");
      return [];
    }
  } else {
    Util.Log.Warn("Engine is not loaded yet.");
    return [];
  }
};

CTS.VERSION = '0.9.1';
CTS.Constants = {};
CTS.Util = Util;
