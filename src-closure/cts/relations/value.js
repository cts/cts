goog.require('cts.relations.Relation');

goog.provide('cts.relations.Value');

/**
 * Value rule: equates the children of two selections.
 *
 * @constructor
 * @extends {cts.rules.Rule}
 */
cts.rules.Value= function() {

};
goog.inherits(cts.rules.Rule, cts.rules.Value);

/**
 * Overrides {@link cts.rules.Rule#evaluate} to overwrite one selection with another.
 *
 * @override
 */
cts.rules.Value.prototype.evaluate = function(source, target, mutate) {
  return null;
};

// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('cts.rules.Rule', cts.rules.Rule);
