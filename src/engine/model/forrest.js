// Forrest
// ==========================================================================
// A Forrest contains:
//  * Named trees
//  * Relations between those trees
// ==========================================================================

// Constructor
// -----------
var Forrest = CTS.Forrest = function(opts) {
  var self = this;
  this.forrestSpecs = [];

  this.treeSpecs = {};
  this.trees = {};

  this.relationSpecs = [];
  this.relations= [];

  this.insertionListeners = {};

  this.opts = CTS.Fn.buildOptions(CTS.Forrest.defaultOptions, opts);

  this._defaultTreeReady = Q.defer();

  this.defaultTreeReady = this._defaultTreeReady.promise;

  if (opts && (typeof opts.engine != 'undefined')) {
    this.engine = opts.engine;
    // Default tree was realized.
    // Add callback for DOM change events.
    this.engine.booted.then(function() {
      if (self.opts.listenForNodeInsertionOnBody) {
        self.listenForNodeInsertionsOnTree('body', true);
      }
    });
  }

  this.initialize();
};

CTS.Forrest.defaultOptions = {
  listenForNodeInsertionOnBody: true
};

// Instance Methods
// ----------------
CTS.Fn.extend(Forrest.prototype, {

  /*
   * Initialization Bits
   *
   * -------------------------------------------------------- */

  initialize: function() {
  },

  initializeAsync: function() {
    return this.addAndRealizeDefaultTrees();
  },

  addAndRealizeDefaultTrees: function() {
    var deferred = Q.defer();
    var self = this;
    var pageBody = null;
    if (typeof this.opts.defaultTree != 'undefined') {
      var pageBody = new CTS.Tree.Spec('html', {name: 'body', url: this.opts.defaultTree});
    } else {
      var pageBody = new CTS.Tree.Spec('html', {name: 'body'});
    }
    this.addTreeSpec(pageBody);
    this.realizeTree(pageBody).then(
     function(tree) {
       self._defaultTreeReady.resolve();
       CTS.status._defaultTreeReady.resolve();
       deferred.resolve();
     },
     function(reason) {
       deferred.reject(reason);
     }
    );
    return deferred.promise;
  },

  stopListening: function() {
    CTS.Log.Info("Stop Listening");
    for (var treeName in this.insertionListeners) {
      this.listenForNodeInsertionsOnTree(treeName, false);
    }
  },

  startListening: function() {
    CTS.Log.Info("Start Listening");
    this.listenForNodeInsertionsOnTree('body', true);
  },

  // Removes all dependency specs from the root tree
  removeDependencies: function() {
    for (var j = 0; j < this.forrestSpecs.length; j++) {
      for (var i = 0; i < this.forrestSpecs[j].dependencySpecs.length; i++) {
        var ds = this.forrestSpecs[j].dependencySpecs[i];
        ds.unload();
      }
    }
  },

  /*
   * Adding Specs
   *
   * A forrest is built by adding SPECS (from the language/ package) to it
   * rather than actual objects. These specs are lazily instantiated into
   * model objects as they are needed.  Thus, the addTree method takes a
   * TreeSpec, rather than a Tree, and so on.
   *
   * -------------------------------------------------------- */
  addSpec: function(forrestSpec) {
    var self = this;
    if (typeof this.forrestSpecs == 'undefined') {
      CTS.Log.Error("forrest spec undef");
    }
    this.forrestSpecs.push(forrestSpec);

    var initial = Q.defer();
    var last = initial.promise;

    var i, j;

    // Load all the relation specs
    if (typeof forrestSpec.relationSpecs != 'undefined') {
      for (j = 0; j < forrestSpec.relationSpecs.length; j++) {
        self.addRelationSpec(forrestSpec.relationSpecs[j]);
      }
    }
    // Load all the dependency specs
    if (typeof forrestSpec.dependencySpecs != 'undefined') {
      for (dep in forrestSpec.dependencySpecs) {
        forrestSpec.dependencySpecs[dep].load();
      }
    }

    // Load AND REALIZE all the tree specs
    if (typeof forrestSpec.treeSpecs != 'undefined') {
      var promises = CTS.Fn.map(forrestSpec.treeSpecs, function(treeSpec) {
        self.addTreeSpec(treeSpec);
        return self.realizeTree(treeSpec);
      });
      Q.all(promises).then(function() {
        initial.resolve();
      });
// Why were we doing this?
//      for (i = 0; i < forrestSpec.treeSpecs.length; i++) {
//        (function(treeSpec) {
//          var treeSpec = forrestSpec.treeSpecs[i];
//          self.addTreeSpec(treeSpec);
//          var next = Q.defer();
//          last.then(
//            function() {
//              self.realizeTree(treeSpec).then(
//                function() {
//                  next.resolve();
//                },
//                function(reason) {
//                  next.reject(reason);
//                }
//              );
//            },
//            function(reason) {
//              next.reject(reason);
//            }
//          );
//          last = next.promise;
//        })(forrestSpec.treeSpecs[i])
//      }
    }

    //initial.resolve();
    return last;
  },

  addSpecs: function(specs) {
    var self = this;
    var promises = CTS.Fn.map(specs, function(spec) {
      return self.addSpec(spec);
    });
    return Q.all(promises);
  },

  parseAndAddSpec: function(rawData, kind, fromUrl) {
    var deferred = Q.defer();
    var self = this;
    CTS.Parser.parseForrestSpec(rawData, kind, fromUrl).then(
      function(specs) {
        if (fromUrl != 'undefined') {
          CTS.Fn.each(specs, function(spec) {
            for (i = 0; i < spec.treeSpecs.length; i++) {
              spec.treeSpecs[i].loadedFrom = fromUrl;
            }
            for (i = 0; i < spec.dependencySpecs.length; i++) {
              spec.dependencySpecs[i].loadedFrom = fromUrl;
            }
          });
        }
        self.addSpecs(specs).then(
          function() {
            deferred.resolve();
          },
          function(reason) {
            deferred.reject(reason);
          }
        );
      },
      function(reason) {
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  },

  /*
   * Params:
   *   links -- The output of CTS.Util.getTresheetLinks
   *
   * Returns:
   *   promises
   */
  parseAndAddSpecsFromLinks: function(links) {
    var self = this;
    var promises = CTS.Fn.map(links, function(block) {
      var deferred = Q.defer();
      if (block.type == 'link') {
        CTS.Util.fetchString(block).then(
          function(content) {
            var url = block.url;
            self.parseAndAddSpec(content, block.format, url).then(
              function() {
                deferred.resolve();
             },
             function(reason) {
               CTS.Log.Error("Could not parse and add spec", content, block);
               deferred.resolve();
             }
           );
         },
         function(reason) {
           CTS.Log.Error("Could not fetch CTS link:", block);
           deferred.resolve();
         });
      } else if (block.type == 'block') {
        var url = window.location;
        self.parseAndAddSpec(block.content, block.format, url).then(
          function() {
            deferred.resolve();
          },
          function(reason) {
            CTS.Log.Error("Could not parse and add spec", content, block);
            deferred.resolve();
          }
        );
      } else {
        CTS.Log.Error("Could not load CTS: did not understand block type", block.block, block);
        deferred.resolve();
      }
      return deferred.promise;
    });
    return promises;
  },

  addTreeSpec: function(treeSpec) {
    this.treeSpecs[treeSpec.name] = treeSpec;
  },

  addRelationSpec: function(relationSpec) {
    if (typeof this.relationSpecs == 'undefined') {
      CTS.Log.Error("rel spc undef");
    }
    this.relationSpecs.push(relationSpec);
  },

  addRelationSpecs: function(someRelationSpecs) {
    for (var i = 0; i < someRelationSpecs.length; i++) {
      // Faster than .push()
       if (typeof this.relationSpecs == 'undefined') {
         CTS.Log.Error("relation undefined");
       }

      this.relationSpecs.push(someRelationSpecs[i]);
    }
  },

  realizeTrees: function() {
    var promises = [];
    Fn.each(this.treeSpecs, function(treeSpec, name, list) {
      if (! Fn.has(this.trees, name)) {
        CTS.Log.Info("Promising to realize tree", treeSpec);
        promises.push(this.realizeTree(treeSpec));
      }
    }, this);
    return Q.all(promises);
  },

  realizeDependencies: function() {
    var deferred = Q.defer();
    deferred.resolve();

    Fn.each(this.forrestSpecs, function(fs) {
      Fn.each(fs.dependencySpecs, function(ds) {
        ds.load();
      });
    });

    // A no-op, just to fit in with boot and later potential deps.
    return deferred.promise;
  },

  realizeTree: function(treeSpec) {
    var deferred = Q.defer();
    var self = this;
    if ((treeSpec.url !== null) && (typeof treeSpec.url == "string") && (treeSpec.url.indexOf("alias(") == 0) && (treeSpec.url[treeSpec.url.length - 1] == ")")) {
      var alias = treeSpec.url.substring(6, treeSpec.url.length - 1);
      if (typeof self.trees[alias] != 'undefined') {
        self.trees[treeSpec.name] = self.trees[alias];
        if (treeSpec.receiveEvents) {
          // XXX: Potential bug here, depending on intent. The aliased tree is
          // the same tree! That means we might intend one to receive and the
          // other not to, but in reality they'll both be in lockstep.
          CTS.Log.Info("New tree should receive events", treeSpec);
          self.trees[treeSpec.name].toggleReceiveRelationEvents(true);
        }
        deferred.resolve(self.trees[alias]);
      } else {
        deferred.reject("Trying to alias undefined tree");
      }
    } else if (typeof treeSpec.url == "string") {
      treeSpec.url = CTS.Util.fixRelativeUrl(treeSpec.url, treeSpec.loadedFrom);
      CTS.Factory.Tree(treeSpec, this).then(
        function(tree) {
          self.trees[treeSpec.name] = tree;
          deferred.resolve(tree);
        },
        function(reason) {
          deferred.reject(reason);
        }
      );
    } else {
      // it's a jquery node
      CTS.Factory.Tree(treeSpec, this).then(
        function(tree) {
          self.trees[treeSpec.name] = tree;
          deferred.resolve(tree);
        },
        function(reason) {
          deferred.reject(reason);
        }
      );
    }
    return deferred.promise;
  },

  realizeRelations: function() {
    for (var i = 0; i < this.relationSpecs.length; i++) {
      this.realizeRelation(this.relationSpecs[i]);
    }
  },

  /* The JSON should be of the form:
   * 1. [
   * 2.   ["TreeName", "SelectorName", {"selector1-prop":"selector1-val"}]
   * 3.   ["Relation",  {"prop":"selector1-val"}]
   * 4.   ["TreeName", "SelectorName", {"selector2-prop":"selector1-val"}]
   * 5. ]
   *
   * The outer array (lines 1 and 5) are optional if you only have a single rule.
   *
   */

  //incorporateInlineJson: function(json, node) {
  //  if (json.length == 0) {
  //    return [];
  //  }
  //  if (! CTS.Fn.isArray(json[0])) {
  //    json = [json];
  //  }
  //  var ret = [];
  //  for (var i = 0; i < json.length; i++) {
  //    var s1 = CTS.Parser.Json.parseSelectorSpec(json[i][0], node);
  //    var s2 = CTS.Parser.Json.parseSelectorSpec(json[i][2], node);
  //    var rule = CTS.Parser.Json.parseRelationSpec(json[i][1], s1, s2);
  //    this.relationSpecs.push(rule);
  //    ret.push(rule);
  //  }
  //  return ret;
  //},

  realizeRelation: function(spec) {
    var s1 = spec.selectionSpec1;
    var s2 = spec.selectionSpec2;

    if (typeof s1 == 'undefined') {
      CTS.Log.Error("S1 is undefined", spec);
      return;
    }
    if (typeof s2 == 'undefined') {
      CTS.Log.Error("S2 is undefined", spec);
      return;
    }

    // Note: at this point we assume that all trees are loaded.
    if (! this.containsTree(s1.treeName)) {
      CTS.Log.Error("Can not realize RelationSpec becasue one or more trees are not available", s1.treeName);
      return;
    }
    if (! this.containsTree(s2.treeName)) {
      CTS.Log.Error("Can not realize RelationSpec becasue one or more trees are not available", s2.treeName);
      return;
    }

    // Here we're guaranteed that the trees are available.

    // Now we find all the nodes that this spec matches on each side and
    // take the cross product of all combinations.

    var nodes1 = this.trees[s1.treeName].nodesForSelectionSpec(s1);
    var nodes2 = this.trees[s2.treeName].nodesForSelectionSpec(s2);

    if (nodes1.length == 0) {
      nodes1 = [CTS.NonExistantNode];
      CTS.Log.Info("empty selection -> NonExistantNode!", s1);
    }
    if (nodes2.length == 0) {
      nodes2 = [CTS.NonExistantNode];
      CTS.Log.Info("empty selection -> NonExistantNode!", s2);
    }

    for (var i = 0; i < nodes1.length; i++) {
      for (var j = 0; j < nodes2.length; j++) {
        // Realize a relation between i and j. Creating the relation adds
        // a pointer back to the nodes.
        var relation = new CTS.Relation.CreateFromSpec(nodes1[i], nodes2[j], spec);
        // Tell nodes1 and nodes2 that inline specs have been realized
        nodes1[i].realizedInlineRelationSpecs = true;
        nodes2[j].realizedInlineRelationSpecs = true;

        // Add the relation to the forrest
       if (typeof this.relations == 'undefined') {
         CTS.Log.Error("relations undefined");
       }


        this.relations.push(relation);
      }
    }
  },

  /*
   * Fetching Objects
   *
   * -------------------------------------------------------- */

  containsTree: function(alias) {
    return CTS.Fn.has(this.trees, alias);
  },

  getTree: function(alias) {
    return this.trees[alias];
  },

  getPrimaryTree: function() {
    return this.trees.body;
  },

  /*
   * Event Handlers
   *
   * -------------------------------------------------------- */

  listenForNodeInsertionsOnTree: function(treeName, new_val) {
    // CURRENT STATUS
    var tree = this.trees[treeName];
    var listening = (treeName in this.insertionListeners);
    var self = this;

    // ERROR
    if (typeof tree == 'undefined'){
      CTS.Log.Error("listenForNodeInsertion (" + new_val + "):" +
          "Tree " + treeName + " not present.");
      return false;
    }

    // GET
    if (typeof new_val == 'undefined') {
      return listening;
    }

    // SET
    if (new_val == true) {
      tree.root.toggleThrowDataEvents(true);
      tree.on('ValueChanged', this._onTreeValueChanged, this);
      return true;
    } else if (new_val == false) {
      tree.root.toggleThrowDataEvents(false);
      tree.off('ValueChanged', this._onTreeValueChanged, this);
      delete this.insertionListeners[treeName];
    }
  },

  _onTreeValueChanged: function(evt) {
    CTS.Log.Info("Forrest caught tree value change");
    var node = evt.sourceNode;
    var tree = evt.sourceTree;

    if (node._subclass_shouldRunCtsOnInsertion()) {
      var links = node._subclass_getTreesheetLinks();
      var promises = self.parseAndAddSpecsFromLinks(ctsLinks);
      Q.all(promises).then(
        function() {
          // Creae the CTS tree for this region.
          CTS.Log.Info("Running onChildInserted", prnt);

          var node = prnt._onChildInserted($node);
        }, function(errors) {
          CTS.Log.Error("Couldn't add CTS blocks from inserted dom node", errors);
        }
      );
    }

    // If the tree is the main tree, we might run some CTS.

    // If the tree is the main tree, we want to possibly run any CTS
    var self = this;
    if (typeof evt.ctsHandled == 'undefined') {
      var node = tree.getCtsNode(evt.node);
      if (node == null) {
        if (! evt.node.hasClass("cts-ignore")) {
          CTS.Log.Info("Insertion", evt.node);
          // Get the parent
          var $prnt = evt.node.parent();
          var prnt = tree.getCtsNode($prnt);
          if (prnt == null) {
            // CTS.Log.Error("Node inserted into yet unmapped region of tree", prnt);
          } else {
            // First see if any CTS blocks live in this region
            var ctsLinks = CTS.Util.getTreesheetLinks(evt.node);
            var promises = self.parseAndAddSpecsFromLinks(ctsLinks);
            Q.all(promises).then(
              function() {
                // Create the CTS tree for this region.
                CTS.Log.Info("Running onChildInserted", prnt);
                var node = prnt._onChildInserted(evt.node);
              }, function(errors) {
                CTS.Log.Error("Couldn't add CTS blocks from inserted dom node", errors);
              }
            );
          }
        }
      }
      evt.ctsHandled = true;
    }
  }

});
