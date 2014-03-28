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
    if (this._forCreationOnly) {
      return;
    }

    var opp = this.opposite(toward);
    var towardOpts = this.optsFor(toward);
    var fromOpts   = this.optsFor(opp);
    if (typeof fromOpts.createNew != 'undefined') {
      return this._creationGraft(toward, towardOpts, opp, fromOpts);
    } else {
      return this._regularGraft(toward, opp);
    }
  },

  _creationGraft: function(toward, towardOpts, from, fromOpts) {
    var d = Q.defer();
    var createOn = null;
    var self = this;
    if (typeof towardOpts.createOn != 'undefined') {
      createOn = toward.find(towardOpts.createOn);
    } else {
      createOn = toward.find('button');
    }
    CTS.Log.Info("Creating on", createOn);
    if ((createOn != null) && (createOn.length> 0)) {
      createOn[0].click(function() {
        self._runCreation(toward, towardOpts, from, fromOpts);
      });
    }

    for (var i = 0; i < toward.children.length; i++) {
      var child = toward.children[i];
      child.markRelationsAsForCreation(true, true);
    }
    d.resolve();
    return d.promise;
  },

  _runCreation: function(toward, towardOpts, from, fromOpts) {
    var d = Q.defer();
    CTS.Log.Info("Run Creation");
    // Step 1: Assume iterable on FROM side.
    var iterables = this._getIterables(from);
    // Create a new one.
    iterables[iterables.length - 1].clone().then(
      function(clone) {
        // Now set relations on to those coming to ME.
        clone.pruneRelations(toward, toward);
        // Now turn OFF creation only.
        clone.markRelationsAsForCreation(false, true);
        // Now RUN relations
        clone._processIncoming().then(
          function() {
            // Turn back ON creation only.
            clone.markRelationsAsForCreation(true, true);
            // Now insert! The insertion handler on an enumerated node should cause
            // any corresponding data structures to also be altered.
            from.insertChild(clone, from.children.length - 1, true);
          },
          function(reason) {
            d.reject(reason);
          }
        );
      },
      function(reason) {
        d.reject(reason);
      }
    );

    return d.promise;
  },

  _regularGraft: function(toward, opp) {
    var d = Q.defer();

    //CTS.Log.Info("Graft from", opp.tree.name, "to", toward.tree.name);
    //CTS.Log.Info("Opp", opp.value.html());
    // CTS.Log.Info("To", toward.value.html());

    if (opp != null) {

      if (CTS.LogLevel.Debug()) {
        CTS.Log.Debug("GRAFT THE FOLLOWING");
        CTS.Debugging.DumpTree(opp);
        CTS.Log.Debug("GRAFT ONTO THE FOLLOWING");
        CTS.Debugging.DumpTree(toward);
      }

      var replacements = [];
      var promises = [];

      for (var i = 0; i < opp.children.length; i++) {
        var kidPromise = Q.defer();
        promises.push(kidPromise.promise);
        opp.children[i].clone().then(
          function(child) {
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
            child._processIncoming().then(
              function() {
                kidPromise.resolve(child);
              },
              function(reason) {
                kidPromise.reject(reason);
              }
            );
          },
          function(reason) {
            kidPromise.reject(reason);
          }
        );
      }
      Q.all(promises).then(
        function (children) {
          for (var i = 0; i < children.length; i++) {
            replacements.push(children[i]);
          }
          if (CTS.LogLevel.Debug()) {
            Fn.map(replacements, function(r) {
              CTS.Log.Debug("replacement", r.value.html());
            });
          }
          toward.replaceChildrenWith(replacements);
          toward.setProvenance(opp.tree, opp);
          toward.trigger('received-bind', {
            target: toward,
            source: opp,
            relation: this
          });
          d.resolve();
        },
        function(reason) {
          d.reject(reason);
        }
      );
    }
    return d.promise;
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
