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
