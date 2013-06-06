/*
 * IF-EXIST
 * ========
 *
 * Intended as a Mix-In to Relation.
 */

var CTS.Relations.IfExist = {
  execute: function(toward) {
    var other = this.opposite(toward);
    if (other == CTS.NonExistantNode) {
      this.hide();
    } else {
      this.show();
    }
  }
};
