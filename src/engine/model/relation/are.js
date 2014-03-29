/*
 * ARE
 * ===
 *
 * Intended as a Mix-In to Relation.
 */

CTS.Relation.Are = function(node1, node2, spec) {
  if (typeof spec == 'undefined') {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
  this.initializeBase();
  this.name = 'are';
};

CTS.Fn.extend(CTS.Relation.Are.prototype, CTS.Relation.Base, {
  getDefaultOpts: function() {
    return {
      prefix: 0,
      suffix: 0,
      step: 0
    };
  },

  execute: function(toward) {
    if (this._forCreationOnly) {
      var d = Q.defer();
      d.resolve();
      return d.promise;
    }

    return this._Are_AlignCardinalities(toward);
//    toward.trigger('received-are', {
//      target: toward,
//      source: this.opposite(toward),
//      relation: this
//    });
  },

  clone: function(n1, n2) {
    if (CTS.Fn.isUndefined(n1)) {
      n1 = this.node1;
    }
    if (CTS.Fn.isUndefined(n2)) {
      n2 = this.node2;
    }
    return new CTS.Relation.Are(n1, n2, this.spec);
  },

  _Are_AlignCardinalities: function(toward) {
    var myOpts = this.optsFor(toward);
    var other = this.opposite(toward);
    var otherIterables = this._getIterables(other);
    var myIterables = this._getIterables(toward);
    var d = Q.defer();

    if (myIterables.length > 0) {
      while (myIterables.length > 1) {
        var bye = myIterables.pop();
        bye.destroy();
      }

      if (CTS.LogLevel.Debug()) {
        CTS.Log.Debug("After prune to 1");
        CTS.Debugging.DumpTree(toward);
      }

      // Now build it back up.
      if (otherIterables.length == 0) {
        myIterables[0].destroy();
        d.resolve();
      } else if (otherIterables.length > 1) {
        var lastIndex = myOpts.prefix;
        // WARNING: Note that i starts at 1
        var promises = [];
        for (var i = 1; i < otherIterables.length; i++) {
          // Clone the iterable.
          promises.push(myIterables[0].clone());
        }
        Q.all(promises).then(
          function(clones) {
            myIterables[0].pruneRelations(otherIterables[0], other);
            for (var i = 0; i < clones.length; i++) {
              var clone = clones[i];
              toward.insertChild(clone, lastIndex, false);
              // the ith clone here is the i+1th element! (because 0th is the clone origin)
              clone.pruneRelations(otherIterables[i+1], other);
              lastIndex++;
            }
            if (CTS.LogLevel.Debug()) {
              CTS.Log.Debug("After Align");
              CTS.Debugging.DumpTree(toward);
            }
            d.resolve();
          },
          function(reason) {
            d.reject(reason);
          }
        );
      }
    } else {
      d.resolve();
    }
    return d.promise;
  },

  /*
   * Returns the number of items in the set rooted by this node,
   * respecting the prefix and suffix settings provided to the relation.
   *
   * An assumption is made here that the tree structure already takes
   * into an account the step size, using intermediate nodes.
   */
  _Are_GetCardinality: function(node) {
    var opts = this.optsFor(node);
    return node.getChildren().length - opts.prefix - opts.suffix;
  },

});
