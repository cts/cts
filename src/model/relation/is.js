/*
 * IS
 * ==
 *
 * Intended as a Mix-In to Relation.
 */

var CTS.Relations.Is = {
  execute: function(toward) {
    var from = this.opposite(toward);
    var content = from.getValue(this.optsFor(from));
    toward.setValue(content, this.optsFor(toward));
  }
};

