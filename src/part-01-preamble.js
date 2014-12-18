var Util = require('cts/util');
var Model = require('cts/model');

/*
 * CTS is structured, from the user's perspective, roughly like jQuery.
 * It is both a namespace containing lots of global classes and helpers, but also
 * a function that can be used to access a Monad which represents collections of
 * nodes that comprise the page.
 *
 * - Passing a string evaluates a selector query and returns a Selection object.
 * - Passing a function executes the function when rendering is complete.
 */
var CTS = function(arg) {
  if (typeof arg == 'string') {
    if (CTS.engine) {
      if (CTS.engine.forrest) {
        return CTS.engine.forrest.find(arg);
      } else {
        Util.Log.Warn("Forrest is not loaded yet.");
        return new Model.Selection([]);
      }
    } else {
      Util.Log.Warn("Engine is not loaded yet.");
      return new Model.Selection([]);
    }    
  } else if (typeof arg == 'function') {
    CTS.booted.then(arg);
  }
};

CTS.VERSION = '0.9.1';
CTS.Constants = {};
CTS.Util = Util;
