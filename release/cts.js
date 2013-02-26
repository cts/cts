/**
* cts
 * Declarative structural remapping for the web.
 *
 * @author Ted Benson <eob@csail.mit.edu>>
 * @copyright Ted Benson 2013
 * @license MIT <http://opensource.org/licenses/mit-license.php>
 * @link http://www.treesheets.org
 * @module cts
 * @version 0.5.0
 */

(function() {

// Initial Setup
// ==========================================================================
// 
// ==========================================================================

// Save a reference to the global object. `this` is `window` in a browser.
var root = this;

// The top-level namespace.
// All CTS classes and modules will be attached to this.
// Exported for both CommonJS and the browser.
var CTS;
if (typeof exports !== 'undefined') {
  CTS = exports;
} else {
  CTS = root.CTS = {};
}

// Current version of the library. Keep in sync with `package.json`
CTS.VERSION = '0.1.0';

// For our purposes, jQuery owns the $ variable.
CTS.$ = root.jQuery;

// For our purposes, Underscore owns the _ variable.
// Require it if on server and not already present.
var _ = root._;
if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

// StateMachine
// ==========================================================================
//
//     var object = {};
//     _.extend(object, CTS.StateMachine);
//
// ==========================================================================


var StateMachine = CTS.StateMachine = {
  /*
   * [{from: _, to: _, name: _}]
   */
  fsmInitialize: function(initialState, arcs, opts) {
    this._fsmCurrent = initialState;
    this._fsmArcs = {};
    _.each(arcs, function(arc) {
      if (! _.contains(this._fsmArcs, arc.from)) {
        this._fsmArcs[arc.from] = {};
      }
      this._fsmArcs[arc.from][arc.to] = arc.name;
    }, this);
  },

  fsmCurrentState: function() {
    return this._fsmCurrent;
  },

  fsmCanTransition: function(toState) {
    if ((this._fsmArcs[this._fsmCurrent]) &&
        (this._fsmArcs[this._fsmCurrent][toState])) {
      return true;
    } else {
      return false;
    }
  },

  fsmTransition: function(newState) {
    // Check to make sure it's possible
    if (this.fsmCanTransition) {
      var from = this._fsmCurrent;
      var to = newState;
      var name = this._fsmArcs[from][to];
      this.trigger('FsmLeft:' + from);
      this._fsmCurrent = to;
      console.log("Transitioning to", to);
      this.trigger('FsmEdge:' + name);
      this.trigger('FsmEntered:' + to);
    } else {
      throw new Error(
          "Can not make transition " + this._fsmCurrent + " -> " + newState);
    }
  }
};

// Events
// ==========================================================================
//
// This is taken completely from Backbone.Events
//
//     var object = {};
//     _.extend(object, CTS.Events);
//     object.on('expand', function(){ alert('expanded'); });
//     object.trigger('expand');
//
// ==========================================================================

// Regular expression used to split event strings.
var eventSplitter = /\s+/;

// Implement fancy features of the Events API such as multiple event
// names `"change blur"` and jQuery-style event maps `{change: action}`
// in terms of the existing API.
var eventsApi = function(obj, action, name, rest) {
  if (!name) return true;
  if (typeof name === 'object') {
    for (var key in name) {
      obj[action].apply(obj, [key, name[key]].concat(rest));
    }
  } else if (eventSplitter.test(name)) {
    var names = name.split(eventSplitter);
    for (var i = 0, l = names.length; i < l; i++) {
      obj[action].apply(obj, [names[i]].concat(rest));
    }
  } else {
    return true;
  }
};

// Optimized internal dispatch function for triggering events. Tries to
// keep the usual cases speedy (most Backbone events have 3 arguments).
var triggerEvents = function(obj, events, args) {
  var ev, i = -1, l = events.length;
  switch (args.length) {
  case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx);
  return;
  case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args[0]);
  return;
  case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args[0], args[1]);
  return;
  case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args[0], args[1], args[2]);
  return;
  default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
  }
};

var Events = CTS.Events = {

  // Bind one or more space separated events, or an events map,
  // to a `callback` function. Passing `"all"` will bind the callback to
  // all events fired.
  on: function(name, callback, context) {
    if (!(eventsApi(this, 'on', name, [callback, context]) && callback)) return this;
    if (_.isUndefined(this._events) || _.isNull(this._events)) {
      this._events = {};
    }
    var list = this._events[name] || (this._events[name] = []);
    list.push({callback: callback, context: context, ctx: context || this});
    return this;
  },

  // Bind events to only be triggered a single time. After the first time
  // the callback is invoked, it will be removed.
  once: function(name, callback, context) {
    if (!(eventsApi(this, 'once', name, [callback, context]) && callback)) return this;
    var self = this;
    var once = _.once(function() {
      self.off(name, once);
      callback.apply(this, arguments);
    });
    once._callback = callback;
    this.on(name, once, context);
    return this;
  },

  // Remove one or many callbacks. If `context` is null, removes all
  // callbacks with that function. If `callback` is null, removes all
  // callbacks for the event. If `events` is null, removes all bound
  // callbacks for all events.
  off: function(name, callback, context) {
    var list, ev, events, names, i, l, j, k;
    if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
    if (!name && !callback && !context) {
      this._events = {};
      return this;
    }

    names = name ? [name] : _.keys(this._events);
    for (i = 0, l = names.length; i < l; i++) {
      name = names[i];
      list = this._events[name];
      if (list) {
        events = [];
        if (callback || context) {
          for (j = 0, k = list.length; j < k; j++) {
            ev = list[j];
            if ((callback && callback !== (ev.callback._callback || ev.callback)) ||
                (context && context !== ev.context)) {
              events.push(ev);
            }
          }
        }
        this._events[name] = events;
      }
    }

    return this;
  },

  // Trigger one or many events, firing all bound callbacks. Callbacks are
  // passed the same arguments as `trigger` is, apart from the event name
  // (unless you're listening on `"all"`, which will cause your callback to
  // receive the true name of the event as the first argument).
  trigger: function(name) {
    if (!this._events) return this;
    var args = [];
    if (arguments.length > 1) {
      args = arguments.slice(1, arguments.length);
    }
    if (!eventsApi(this, 'trigger', name, args)) return this;
    var events = this._events[name];
    var allEvents = this._events.all;
    if (events) triggerEvents(this, events, args);
    if (allEvents) triggerEvents(this, allEvents, arguments);
    return this;
  },

  // An inversion-of-control version of `on`. Tell *this* object to listen to
  // an event in another object ... keeping track of what it's listening to.
  listenTo: function(object, events, callback, context) {
    context = context || this;
    var listeners = this._listeners || (this._listeners = {});
    var id = object._listenerId || (object._listenerId = _.uniqueId('l'));
    listeners[id] = object;
    object.on(events, callback || context, context);
    return this;
  },

  // Tell this object to stop listening to either specific events ... or
  // to every object it's currently listening to.
  stopListening: function(object, events, callback, context) {
    context = context || this;
    var listeners = this._listeners;
    if (!listeners) return;
    if (object) {
      object.off(events, callback, context);
      if (!events && !callback) delete listeners[object._listenerId];
    } else {
      for (var id in listeners) {
        listeners[id].off(null, null, context);
      }
      this._listeners = {};
    }
    return this;
  }
};

// Aliases for backwards compatibility.
Events.bind   = Events.on;
Events.unbind = Events.off;


// Node
// --------------------------------------------------------------------------
// 
// A Node represents a fragment of a tree which is annotated with CTS.
//
// Nodes are responsible for understanding how to behave when acted on
// by certain relations (in both directions). The differences between
// different types of trees (JSON, HTML, etc) are concealed at this level.

CTS.Node = {

  initializeStateMachine: function() {
    this.fsmInitialize(
      'Ready', [
      { 'from':'Ready',
          'to':'BeginRender',
        'name':'BeginRender'},
      { 'from':'BeginRender',
          'to':'ProcessIncoming',
        'name':'ProcessIncoming'},
      { 'from':'ProcessIncoming',
          'to':'ProcessIncomingChildren',
        'name':'ProcessIncomingChildren'},
      { 'from':'ProcessIncomingChildren',
          'to':'ProcessedIncoming',
        'name':'ProcessedIncoming'},
      { 'from':'ProcessIncoming',
          'to':'FailedConditional',
        'name':'FailedConditional'},
      { 'from':'FailedConditional',
          'to':'Finished',
        'name':'Finished_Invisible'},
      { 'from':'ProcessedIncoming',
          'to':'Finished',
        'name':'Finished_NoTemplate'},
      { 'from':'ProcessIncomming',
          'to':'ProcessedIncoming',
        'name':'SkipRecursion'}
    ]);

    this.on('FsmEdge:BeginRender', this._onBeginRender, this);
    this.on('FsmEdge:ProcessIncoming', this._onProcessIncoming, this);
    this.on('FsmEntered:ProcessIncomingChildren', this._onProcessIncomingChildren, this);
    this.on('FsmEdge:ProcessedIncoming', this._onProcessedIncoming, this);
    this.on('FsmEdge:FailedConditional', this._onFailedConditional, this);
    this.on('FsmEntered:Finished', this._onFinished, this);
  },

  render: function() {
    console.log(this, "render");
    this.fsmTransition("BeginRender");
  },

  getChildren: function() {
    if (_.isUndefined(this.children) || _.isNull(this.children)) {
      this.children = this._createChildren();
    }
    return this.children;
  },

  _onBeginRender: function() {
    this.node.css("border", "1px solid red");
    console.log(this, "onBeginRender");
    this.fsmTransition("ProcessIncoming");
  },

  _onProcessIncoming: function() {
    console.log(this, "onProcessIncoming");
    if (! this._performConditional()) {
      console.log("Fail conditional");
      this.fsmTransition("FailedConditional");
    } else {
      if (this._performIs()) {
        // We did a value map, so move to Processed state.
        // TODO(eob): what if we want to interpret the value as cts-laden html?
        this.fsmTransition("ProcessedIncoming");
      } else if (this._performRepeat()) {
        this.fsmTransition("ProcessIncomingChildren");
      } else {
        this.fsmTransition("ProcessIncomingChildren");
      }
    }
  },

  _onProcessIncomingChildren: function() {
    console.log(this, "onProcessChildren");
    this.node.css("border", "1px solid yellow");

    // Now we've created any children we're interested in.
    // Decide how to proceed.
    var kids = this.getChildren();
    this.outstandingChildren = kids.length;
    if (this.outstandingChildren === 0) {
      this.fsmTransition("ProcessedIncoming");
    } else {
      // Listen to finish events
      _.each(kids, function(child) {
        child.on("FsmEntered:Finished", this._onChildFinished, this);
      }, this);
      // Execute children.
      // TODO(eob): Explore parallelization options.
      _.each(kids, function(child) {
        console.log("RENDERING CHILD");
        child.render();
      }, this);
    }
  },

  _onChildFinished: function() {
    this.outstandingChildren = this.outstandingChildren - 1;
    if (this.outstandingChildren === 0) {
      this.fsmTransition("ProcessedIncoming");
    }
  },

  _onProcessedIncoming: function() {
    this.fsmTransition("Finished");
  },

  _onFailedConditional: function() {
    this.node.hide();
    this.fsmTransition("Finished");
  },

  _onFinished: function() {
    this.node.css("border", "1px solid green");
  },

  _performConditional: function() {
    var rules = _.filter(this.rules, function(rule) {
      return ((rule.name == "ifexist") &&
          (rule.head().matches(this)));
    }, this);

    if (rules.length === 0) {
      // No conditionality restrictions
      return true;
    } else {
      return _.all(rules, function(rule) {
        var otherNodes = rule.tail().nodes(this.tree.forrest);
        if ((! _.isUndefined(otherNodes)) && (otherNodes.length > 0)) {
          return true;
        } else {
          return false;
        }
      }, this);
    }
  },

  _performIs: function() {
    console.log("Perform IS on", this, this.node.html(), this.rules);
    // If there is an incoming value node, handle it.
    // Just take the last one.
    var rule = null;
    _.each(this.rules, function(r) {
      if (r.name == "is") {
        if (r.head().matches(this)) {
          rule = r;
        }
      }
    }, this);

    if (rule) {
      console.log("Found IS rule");
      this.isIncoming(rule.tail().nodes(this.tree.forrest));
      return true;
    } else {
      return false;
    }
  },

  _performAre: function() {
    console.log("Perform ARE on", this, this.node.html(), this.rules);
    var rule = null;
    _.each(this.rules, function(r) {
      if (r.name == "are") {
        if (r.head().matches(this)) {
          rule = r;
        }
      }
    }, this);

    if (rule) {
      console.log("Found ARE rule");
      this.areIncoming(rule.tail().nodes(this.tree.forrest));
      return true;
    } else {
      return false;
    }
  },

  _performRepeat: function() {
    var rules = _.filter(this.rules, function(rule) {
      return ((rule.name == "repeat") && (rule.head().matches(this)));
    }, this);

    if (rules.length > 0) {
      // TODO(eob): Figure out what to do if > 1 rule
      var rule = rules[rules.length - 1];
      /*
       * Here is where things get tricky. "repeat" is really a bit of a functor
       * over the relations: it redraws down-tree relations such that each respective
       * item matches up.
       */

      // Get the source selection.
      var sourceSelection = rule.tail().nodes(this.tree.forrest);

      if ((typeof sourceSelection.length != "undefined") && (sourceSelection.length > 0)) {
      } else {
      }

      return true;
    } else {
      return false;
    }

  }

};

// ### Constructor
var DomNode = CTS.DomNode = function(node, tree, rules, opts, args) {
  var defaults;
  this.node = node;
  this.tree = tree;
  this.children = null; 
  this.rules = rules || [];
  this.opts = opts || {};
  this.parentNode = null;
  this.initialize.apply(this, args);
};

// ### Instance Methods
_.extend(CTS.DomNode.prototype, CTS.Events, CTS.StateMachine, CTS.Node, {

  initialize: function(args) {
    this.initializeStateMachine();
  },

  destroy: function(opts) {
    this.node.remove();
  },

  clone: function(opts) {
    var n = this.node.clone();
    
    // Insert after in the dom
    this.node.after(n);

    // TODO(eob): any use in saving args to apply when cloned?
    var c = new DomNode(n, this.tree, this.rules, this.opts);

    // Insert after in CTS hierarchy
    this.parentNode.registerChild(c, {'after': this});
  },

  registerChild: function(child, opts) {
    var didit = false;
    if ((! _.isUndefined(opts)) && (! _.isUndefined(opts.after))) {
      for (var i = this.children.length - 1; i >= 0; i--) {
        if (this.children[i] == opts.after) {
          // First bump forward everything
          for (var j = this.children.length - 1; j > i; j--) {
            this.children[j + 1] = this.children[j];
          }

          // Then set this at i+1
          this.children[i+1] = child;
          child.parentNode = this;
          didit = true;
        }
      }
      // do it after an element
    } 
    
    if (! didit) {
      // do it at end as failback, or if no relative position specified
      this.children[this.children.length] = child;
      child.parentNode = this;
    }
 },

  _createChildren: function() {
    var fringe = this.node.children().toArray();
    var children = [];
    
    while (fringe.length > 0) {
      var first = CTS.$(fringe.shift());
      var child = new DomNode(first, this.tree);
      var relevantRules = this.tree.forrest.rulesForNode(this.tree, child);
      console.log("Found child", child.node, child.node.html(), "with rules", relevantRules);

      if (relevantRules.length > 0) {
        child.rules = relevantRules;
        this.registerChild(child);
      } else {
        fringe = _.union(fringe, first.children().toArray());
      }
    }
    console.log("Create Children Returned: ", children);
    return children;
  },

  /**
   * Replaces the value of this node with the value of the
   * other node provided.
   */
  isIncoming: function(otherNodes, opts) {
    console.log("IS Incoming with otherNodes", otherNodes);
    if (otherNodes.length === 0) {
      console.log("Other nodes empty!");
      this.node.html("");
    } else {
      console.log("Other nodes non empty!");
      this.node.html(otherNodes[otherNodes.length - 1].isOutgoing(opts));
    }
  },

  /**
   * Provides the value of this node.
   */
  isOutgoing: function(opts) {
    return this.node.html();
  },

  /**
   * Performs several functions:
   *  1. Duplicates the itemscope'd child of this node once
   *     per other node.
   *  2. Remaps any down-tree relations such that iterations
   *     align.
   */
  areIncoming: function(otherNodes, opts) {
    // What are we remapping onto
    var others = _.flatten(_.map(otherNodes, function(o) {
      o.areOutgoing(opt);
    }, this));

    // Find the itemscoped children of this node.
    var these = _.filter(gets.node.getChildren(), function(n) {
      n.node.is("[itemscope]");
    }, this);

    // Align the cardinalities of the two
    var diff = Math.abs(these.length - others.length);
    var i;
    if (these.length > others.length) {
      for (i = 0; i < diff; i++) {
        these[these.length - 1].destroy();
      }
    } else if (these.length < others.length) {
      for (i = 0; i < diff; i++) {
        these[these.length] = these[these.length - 1].clone();
      }
    }

  },

  /**
   * Provides the itemscope'd nodes.
   */
  areOutgoing: function(opts) {
    _.filter(this.node.getChildren(), function(n) {
      n.node.is("[itemscope]");
    }, this);
  }

});

// Forrest
// ==========================================================================
//
// ==========================================================================

// Constructor
// -----------
var Forrest = CTS.Forrest = function(opts, args) {
  this.trees = {};
  this.rules = [];
  this.initialize.apply(this, args);
};

// Instance Methods
// ----------------
_.extend(Forrest.prototype, {

  initialize: function() {
    this.addDefaultTrees();
  },

  containsTreeAlias: function(alias) {
    _.has(this.trees, alias);
  },

  addTree: function(alias, tree) {
    this.trees[alias] = tree;
  },

  addRule: function(rule) {
    // Faster than .push()
    this.rules[this.rules.length] = rule;
  },

  addRules: function(someRules) {
    for (var i = 0; i < someRules.length; i++) {
      // Faster than .push()
      this.rules[this.rules.length] = someRules[i];
    }
  },

  nodesForSelection: function(selection) {
    console.log("trees", this.trees, "selection name", selection.treeName);
    // TODO(eob): The commented out line doesn't work.. but
    // I don't know why. That makes me worried.
    //if (_.contains(this.trees, selection.treeName)) {
    if (typeof this.trees[selection.treeName] != "undefined") {
      return this.trees[selection.treeName].nodesForSelection(selection);
    } else {
      console.log("Nodes for selection bailing");
      return [];
    }
  },

  getPrimaryTree: function() {
    return this.trees.body;
  },

  ingestRules: function(someRuleString) {
    var ruleSet = RelationParser.parse(someRuleString);
    this.addRules(ruleSet);
  },

  /* Adds the DOM as a local tree called `body` and the `window` variable as
   * a tree called window.
   */ 
  addDefaultTrees: function() {
    this.addTree('body', new CTS.DomTree(this));
    this.addTree('window', new CTS.JsonTree(this, window));
  },

  rulesForNode: function(tree, node) {
    var ret = [];
    _.each(this.rules, function(rule) {
      console.log("Rule", rule, "for node", node);
      if ((rule.selection1.matches(node)) || 
          (rule.selection2.matches(node))) {
        ret[ret.length] = rule;
      } else {
        console.log("Failed match", rule.selection1.selector);
        console.log("Failed match", rule.selection2.selector);
      }
    }, this);
    console.log("Rules for node: ", ret);
    return ret;
  }
  
});

// DOM Tree
// ==========================================================================
//
// ==========================================================================
var Tree = CTS.Tree = {
  name: "",
  
  render: function(opts) {
    console.log("render root", this.root);
    this.root.render(opts);
  }

};

// Constructor
// -----------
var DomTree = CTS.DomTree = function(forrest, node, attributes) {
  this.root = node || new CTS.DomNode(CTS.$('body'), this);
  this.forrest = forrest;
  this.name = "body";
  if ((typeof attributes != 'undefined') && ('name' in attributes)) {
    this.name = attributes.name;
  }
};

// Instance Methods
// ----------------
_.extend(DomTree.prototype, Tree, {
  nodesForSelection: function(selection) {
    var jqnodes = this.root.node.find(selection.selector).toArray();
    var nodes = _.map(jqnodes, function(n) {
      return new DomNode(CTS.$(n), this);
    }, this);
    console.log("Tree", this, "nodes for selection", selection, nodes);
    return nodes;
  }
});

var JsonTree = CTS.JsonTree = function(forrest, json, attributes) {
  this.forrest = forrest;
  this.root = json || window;
};

// Instance Methods
// ----------------
_.extend(JsonTree.prototype, Tree, {

});

var Selection = CTS.Selection = {
  toString: function() {
    return "<Selection {tree:" + this.treeName +
           ", type:" + this.treeType +
           ", selector:" + this.selector +
           ", variant:" + this.variant + "}>";
  },

  // Returns tuple of [treeName, treeType, stringSpec]
  PreParse: function(selectionString) {
    var treeName = "body";
    var treeType = "html";
    var selector = null;

    var trimmed = CTS.$.trim(selectionString);
    if (trimmed[0] == "@") {
      var pair = trimmed.split('|');
      if (pair.length == 1) {
        throw new Error("Cound not parse: " + self.stringSpec);
      } else {
        treeName = CTS.$.trim(pair.shift().substring(1));
        // TODO(eob): set tree type
        selector = CTS.$.trim(_.join(pair, ""));
      }
    } else {
      selector = selectionString;
    }
    return [treeName, treeType, selector];
  },

  // Factory for new selections
  Create: function(selectionString) {
    var parts = this.PreParse(selectionString);
    var selection = null;

    if (parts[1] == "html") {
      selection = new DomSelection(parts[2]);
    } 

    console.log("s", selection);
    if (selection !== null) {
      selection.treeName = parts[0];
      selection.treeType = parts[1];
      selection.originalString = selectionString;
    }

    return selection;
  }

};



var DomSelection = CTS.DomSelection = function(selector) {
  this.treeName = null;
  this.treeType = null;
  this.originalString = null;
  this._nodes = null;
  this.selector = selector;
};

_.extend(DomSelection.prototype, Selection, {
  matches: function(node) {
    console.log("this treename", this.treeName, "node", node.tree.name);
    console.log("node is <", this.selector, ">", node.node.is(this.selector));
    return (
      (this.treeName == node.tree.name) &&
      (node.node.is(this.selector)));
  },

  nodes: function(forrest) {
    if (this._nodes === null) {
      // First time; compute.
      this._nodes = forrest.nodesForSelection(this);
    }
    return this._nodes;
  }
});

var Rule = CTS.Rule = function(selection1, selection2, name, opts) {
  this.selection1 = selection1;
  this.selection2 = selection2;
  this.name = name;
  this.opts = opts || {};
};

_.extend(Rule.prototype, {
  addOption: function(key, value) {
    this.opts[key] = value;
  },

  head: function() {
    return this.selection1;
  },

  tail: function() {
    return this.selection2;
  }

});

// RelationParser
// ==========================================================================
var RelationParser = CTS.RelationParser = {
  incorporate: function(ruleMap, selector, block) {
    console.log("hi");
    var rules = block.split(";");
    _.each(rules, function(ruleString) {
      var parts = ruleString.split(":");
      if (parts.length == 2) {
        var target = "";
        var name = "";
        var variant = "";
        var key = CTS.$.trim(parts[0]);
        var value = CTS.$.trim(parts[1]);
        var section = 0;
        for (var i = 0; i < key.length; i++) {
          if ((key[i] == "-") && (section === 0)) {
            section = 1;
          } else if (key[i] == "(") {
            section = 2;
          } else if ((key[i] == ")") && (section == 2)) {
            break;
          } else {
            // append string
            if (section === 0) {
              name += key[i];
            } else if (section == 1) {
              variant += key[i];
            } else if (section == 2) {
              target += key[i];
            }
          }
        }

        console.log("selector", selector, "key", key, "value", value);

        // Now add or accomodate the rule
        var selection1 = Selection.Create(selector);

        if (target.length > 0) {
          selection1.variant = target;
        }
        var selection1String = selection1.toString();

        console.log("selection1", selection1, selection1String);

        if (! _.contains(ruleMap, selection1String)) {
          // Ensure we know about this selector
          console.log("Creating slot for selection 1", selection1);
          ruleMap[selection1String] = {};
        }
        if (! _.contains(ruleMap[selection1String], name)) {
          console.log("Creating new rule for selection 1 :: name", selection1, name);
          ruleMap[selection1String][name] = new Rule(selection1, null, name, {});
        }

        if (variant.length === 0) {
          // We're setting selection 2
          var selection2 = Selection.Create(value);
          console.log("selection2", selection2, value);
          ruleMap[selection1String][name].selection2 = selection2;
        } else {
          // We're setting an option
          ruleMap[selection1String][name].addOption(variant, value);
        }

        console.log("Final after adding rule", ruleMap[selection1String][name]);
      } // if (parts.length == 2)
    }, this);
  },

  parse: function(ctsString) {
    var self = this;
    var relations = {};

    // Remove comments
    r = ctsString.replace(/\/\*(\r|\n|.)*\*\//g,"");

    var bracketDepth = 0;
    var openBracket = -1;
    var closeBracket = 0;
    var previousClose = 0;

    function peelChunk() {
      var selector = CTS.$.trim(r.substr(previousClose, openBracket - previousClose - 1));
      var block = CTS.$.trim(r.substr(openBracket + 1, closeBracket - openBracket - 1));
      previousClose = closeBracket + 1;
      self.incorporate(relations, selector, block);
    }

    for (var i = 0; i < r.length; i++) {
      if (r[i] == '{') {
        bracketDepth++;
        if (bracketDepth == 1) {
          console.log(r[i]);
          openBracket = i;
        }
      } else if (r[i] == '}') {
        bracketDepth--;
        if (bracketDepth === 0) {
          closeBracket = i;
          peelChunk();
        }
      }
    }

    var ret = [];
    _.each(_.values(relations), function(valueHash) {
      ret = _.union(ret, _.values(valueHash));
    });
    console.log(ret);
    return ret;
  }

};

// Engine
// ==========================================================================

// Constructor
// -----------
var Engine = CTS.Engine = function(opts, args) {
  var defaults;
  this.opts = opts || {};

  // The main tree.
  this.forrest = null;

  this.initialize.apply(this, args);
};

// Instance Methods
// ----------------
_.extend(Engine.prototype, Events, StateMachine, {

  initialize: function() {
    this.forrest = new CTS.Forrest();
  },

  /**
   * Rendering picks a primary tree. For each node in the tree, we:
   *  1: Process any *incoming* relations for its subtree.
   *  2: Process any *outgoing* tempalte operations
   *  3: 
   */
  render: function() {
    var pt = this.forrest.getPrimaryTree();
    pt.render();
  },

  ingestRules: function(rules) {
    this.forrest.ingestRules(rules);
  },

  loadRemoteString: function(params, successFn, errorFn) {
    $.ajax({url: params.url,
            dataType: 'text',
            success: success,
            error: error,
            beforeSend: function(xhr, settings) {
              _.each(params, function(value, key, list) {
                xhr[key] = value;
              }, this);
            }
    });
  },

  /** 
   * Walks CTS through a full page bootup.
   */
  boot: function() {
    console.log("Boot");
    // Boot sequence
    this.fsmInitialize(
      'Start', [
      { 'from':'Start',
          'to':'QueueingCTS',
        'name':'Begin' },
      { 'from':'QueueingCTS',
          'to':'LoadingCTS',
        'name':'QueuedCTS' },
      { 'from':'LoadingCTS',
          'to':'QueueingTrees',
        'name':'LoadedCTS'},
      { 'from':'QueueingTrees',
          'to':'LoadingTrees',
        'name':'QueuedTrees'},
      { 'from':'LoadingTrees',
          'to':'Rendering',
        'name':'LoadedTrees'},
      { 'from':'Rendering',
          'to':'Rendered',
        'name':'Rendered' }
      ]);
    this.on('FsmEdge:Begin', this._fsmQueueCts, this);
    this.on('FsmEdge:LoadedCTS', this._fsmQueueTrees, this);
    this.on('FsmEdge:LoadedTrees', this._fsmRender, this);
    this.fsmTransition('QueueingCTS');
  },

  /**
   * Finds all CTS links and queues their load.
   */
  _fsmQueueCts: function() {
    // Finds all CTS links and queues their load.
    console.log("FSM Queue CTS");
    this.fsmTransition("LoadingCTS");
    this._ctsToLoad = {};
    var hasRemote = false;
    _.each(CTS.$('script[type="text/cts"]'),
      function(elem) {
        var e = CTS.$(elem);
        if (! e.attr('src')) {
          // Load the contents
          this.ingestRules(e.html());
        } else {
          // Queue load
          this._ctsToLoad[e.attr('src')] = true;
          hasRemote = true;
          this.loadRemoteString({'url':e.attr('src')}, _fsmCtsLoadSuccess, _fsmCtsLoadFail);
        }
      }, this
    );
    if (! hasRemote) {
      this.fsmTransition("QueueingTrees");
    } 
  },

  _fsmQueueTrees: function() {
    console.log("FSM Queue Trees");
    this.fsmTransition("LoadingTrees");
    this._treesToLoad = {};
    var hasRemote = false;
    _.each(this.forrest.trees, function(value, key, list) {
      console.log("TREE");
      // Todo
    }, this);
    if (! hasRemote) {
      this.fsmTransition("Rendering");
    }
  },

  _fsmRender: function() {
    console.log("FSM Render");
    this.render();
    this.fsmTransition("Rendered");
  },

  _fsmCtsLoadSuccess: function(data, textStatus, xhr) {
    this.ingestRules(data);
    this._fsmCtsLoaded(xhr.url);
  },

  _fsmCtsLoadFail: function(xhr, textStatus, errorThrown) {
    this._fsmCtsLoaded(xhr.url);
  },

  _fsmTreeLoadSuccess: function(data, textStatus, xhr) {
    //TODO
    this._fsmCtsLoaded(xhr.url);
  },

  _fsmTreeLoadFail: function(xhr, textStatus, errorThrown) {
    this._fsmCtsLoaded(xhr.url);
  },

  _fsmCtsLoaded: function(filename) {
    delete this._ctsToLoad[filename];
    var done = (this._ctsToLoad.length === 0);
    if (done) {
      _fsmTransition("QueueingTrees");
    }
  },

  _fsmTreeLoaded: function(filename) {
    if (done) {
      _fsmTransition("Rendering");
    }
  }
});

}).call(this);
