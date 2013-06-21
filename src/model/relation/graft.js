/*
 * GRAFT
 * =====
 *
 * Intended as a Mix-In to Relation.
 *
 * Graft does the following:
 *
 *  1. Copy the subtree of the FROM node.
 *  2. Run all (FROM -> TOWARD) rules in the direction TOWARD->FROM
 *  3. Replace TOWARD subtree with the result of 1 and 2.
 */

CTS.Relation.Graft = function(node1, node2, spec) {
  if (CTS.Fn.isUndefined(spec)) {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
  this.name = 'graft';
  this.initializeBase();
};

CTS.Fn.extend(CTS.Relation.Graft.prototype, CTS.Relation.Base, {
  execute: function(toward) {
    var opp = this.opposite(toward);
    if (opp != null) {

      //console.log("GRAFT THE FOLLOWING");
      //CTS.Debugging.DumpTree(opp);
      //console.log("GRAFT ONTO THE FOLLOWING");
      //CTS.Debugging.DumpTree(toward);

      var replacements = [];
      for (var i = 0; i < opp.children.length; i++) {
        var child = opp.children[i].clone();
        // TODO(eob): This is a subtle bug. It means that you can't graft-map anything outside
        // the toward node that is being grafted.
        child.pruneRelations(toward);
        child._processIncoming();
        replacements.push(child);
      }
      toward.replaceChildrenWith(replacements);
    }
  },
 
  clone: function(n1, n2) {
    if (CTS.Fn.isUndefined(n1)) {
      n1 = this.node1;
    }
    if (CTS.Fn.isUndefined(n2)) {
      n2 = this.node2;
    }
    return new CTS.Relation.Graft(n1, n2, this.spec);
  }


});

