goog.provide('cts.trees.Forrest');

goog.require('goog.structs.Map');

/**
 * A Forrest contains a set of trees.
 *
 * @constructor
 */
cts.treees.Forrest = function() {

  // Load a default map;
  this.trees_ = new goog.structs.Map();

};

/**
 * Stores a lookup of tree name to tree.
 * @type {goog.structs.Map}
 */
cts.trees.Forrest.prototype.trees_ = null;

/**
 * The central tree in the forrest.
 * @type {cts.Tree}
 */
cts.trees.Forrest.prototype.central_ = null;

/**
 * Fetches a new tree.
 * @param {String} name The name of the tree.
 * @param {String} url The url of the tree.
 * @param {goog.structs.Map?} params The parameters
 */
cts.trees.Forrest.prototype.fetch = function(name, url, params) {
  if (this.trees_.containsKey(name)) {
    // This is an error.
    return;
  } else {
    // TODO(eob)
    return;
  }
};
