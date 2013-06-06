/*
 * IF-EXIST
 * ========
 *
 * Intended as a Mix-In to Relation.
 */

var CTS.Relations.IfNExist = {
  execute: function(toward) {
    var other = this.opposite(toward);
    if (other == CTS.NonExistantNode) {
      this.show();
    } else {
      this.hide();
    }
  }
};

