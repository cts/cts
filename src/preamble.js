// Initial Setup
// ==========================================================================
// 
// ==========================================================================

// Save a reference to the global object. `this` is `window` in a browser.
var root = this;

// The top-level namespace.
// All CTS classes and modules will be attached to this.
// Exported for both CommonJS and the browser.
var CTS;
if (typeof exports !== 'undefined') {
  CTS = exports;
} else {
  CTS = root.CTS = {};
}

// Current version of the library. Keep in sync with `package.json`
CTS.VERSION = '0.1.0';

// For our purposes, jQuery owns the $ variable.
CTS.$ = root.jQuery;

// For our purposes, Underscore owns the _ variable.
// Require it if on server and not already present.
var _ = root._;
if (!_ && (typeof require !== 'undefined')) _ = require('underscore');
