/*  Cascading Tree Sheets
 *  ==========================================================================
 * 
 *  Assumption:
 * 
 *    This is the one file that must ALWAYS be loaded before any other CTS file
 *    has loaded. In other words, other files can count on
 *    `CTS.registerNamespace` being around.
 *
 *    This file is also designed to be able to load multiple times. So CTS-UI
 *    can load it if it loads before CTS.
 * 
 *  Set up CTS root object
 *  --------------------------------------------------------------------------
 */

var root = this;

// Define Root CTS Namespace if CTS doesn't exist.
if (typeof CTS == 'undefined') {
  if (typeof exports !== 'undefined') {
    CTS = exports;
  } else {
    CTS = root.CTS = {};
  }
} else if (typeof CTS != 'object') {
  console.error("Something appears to already occupy the CTS namespace");
}
CTS.VERSION = '0.6.0';

// Set up bare minimum functionality that we want available for
// all other files.
// --------------------------------------------------------------------------

if (typeof CTS.registerNamespace == 'undefined') {
  CTS.registerNamespace = function(s) {
    var parts = s.split('.');
    var ptr = root;
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (typeof ptr != 'object') {
        throw "Can not register namespace segment " + part + " in nonobject.";
      }
      if (typeof ptr[part] == 'undefined') {
        ptr[part] = {};
      }
      ptr = ptr[part];
    }
  };
}

CTS.registerNamespace('CTS.status');

if (typeof CTS.Fn == 'undefined') {
  CTS.registerNamespace('CTS.Fn');
  CTS.Fn.breaker = {};

  CTS.Fn.each = function(obj, iterator, context) {
    if (obj == null) return;
    if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === CTS.Fn.breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === CTS.Fn.breaker) return;
        }
      }
    }
  };
  
  CTS.Fn.extend = function(obj) {
    CTS.Fn.each(Array.prototype.slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };
}
