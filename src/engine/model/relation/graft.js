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

    //CTS.Log.Info("Graft from", opp.tree.name, "to", toward.tree.name);
    //CTS.Log.Info("Opp", opp.value.html());
    // CTS.Log.Info("To", toward.value.html());

    if (opp != null) {

      //console.log("GRAFT THE FOLLOWING");
      //CTS.Debugging.DumpTree(opp);
      //console.log("GRAFT ONTO THE FOLLOWING");
      //CTS.Debugging.DumpTree(toward);

      var replacements = [];
      for (var i = 0; i < opp.children.length; i++) {
        var child = opp.children[i].clone();

        // TODO(eob): This is a subtle bug. It means that you can't graft-map anything outside
        // the toward node that is being grafted. But if this isn't done, then ALL of the things
        // grafting one thing will overwrite each other (i.e., all users of a button widget will
        // get the label of the last widget.
        child.pruneRelations(toward);

        // TODO(eob): We were pruning before because of geometric duplication of relations
        // when graft happened multiple times, and took out the pruneRelations above because it
        // also removed relations from grafts of grafts (i.e., when one theme includes components of
        // a common libray). So.. need to make sure that the fix to _subclass_begin_clone in Node (where
        // nonzero starting .relations[] is cleared) fixes the original reason we were pruning)

        child._processIncoming();
        replacements.push(child);
      }
      Fn.map(replacements, function(r) {
        console.log("replacement", r.value.html());
      });
      toward.replaceChildrenWith(replacements);
      toward.setProvenance(opp.tree, opp);
    }
    toward.trigger('received-bind', {
      target: toward,
      source: opp,
      relation: this
    });
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

