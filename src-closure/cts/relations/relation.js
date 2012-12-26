goog.provide('cts.relations.Relation');

/**
 * Default implementation of Relation.
 *
 * @constructor
 */
cts.relations.Relation = function() {
  // have a Source, Target
};

cts.relations.Relation.prototype.swapDirection = function() {
  t = source;
  source= target;
  target = t;
}

/**
 * Runs the rule.
 */
cts.relations.Relation.evaluate = function() {
  return null;
};

// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('cts.rules.Rule', cts.rules.Rule);
