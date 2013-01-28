goog.require('goog.debug.Logger');
goog.provide('cts.Engine'); 

/**
 * The CTS Engine
 *
 * @constructor
 */
cts.Engine = function() {
};

/**
 * Renders a node.
 * @param {Node} node The node to render.
 */
cts.Engine.prototype.render = function(node) {
  goog.debug.Logger.getLogger().info("Rendering");
};
