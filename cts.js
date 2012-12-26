// Cascading Tree Sheets
// (c) Edward Benson

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
      this._events || (this._events = {});
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
        if (list = this._events[name]) {
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
        if (! _.contains(this._fsmArcs, arc['from'])) {
          this._fsmArcs[arc['from']] = {};
        }
        this._fsmArcs[arc['from']][arc['to']] = arc['name'];
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
        this.trigger('FsmEdge:' + name);
        this.trigger('FsmEntered:' + to);
      } else {
        throw new Error(
            "Can not make transition " + this._fsmCurrent + " -> " + newState);
      }
    },
  };

  // Model Section
  // ==========================================================================
  //
  // This section contains the main data modeling classes for CTS.
  //
  // Node:
  //  - DOM Node
  //  - JSON Node
  //
  // Selector:
  //  - DOM Selector
  //  - JSON Selector
  //
  // Tree:
  //  - DOM Tree
  //  - JSON Tree
  //
  // Forrest

  // Node
  // --------------------------------------------------------------------------
  // 
  // A Node represents a fragment of a tree which is annotated with CTS.
  //
  // Nodes are responsible for understanding how to behave when acted on
  // by certain relations (in both directions). The differences between
  // different types of trees (JSON, HTML, etc) are concealed at this level.

  // ### Constructor
  var DomNode = CTS.DomNode = function(node, opts) {
    var defaults;
    this.opts = opts || {};
  };

  // ### Instance Methods
  _.extend(DomNode.prototype, {

    valueIncoming: function(otherNode, opts) {
      this._node.html(otherNode.valueOutgoing(this, opts));
    },

    valueOutgoing: function(otherNode, opts) {
      return this._node.html();
    }

  });

  // Rule
  // --------------------------------------------------------------------------
  //
  // A Rule is a named edge (with a dictionary of options) that relates
  // a all selected nodes in one tree to all selected nodes in another tree.

  // ### Constructor
  var Rule = CTS.Rule = function(name, headSelector, tailSelector, opts) {
    this.root = node || CTS.$('body');
    this.headSelector = headSelector;
    this.tailSelector = tailSelector;
    this.opts = opts;
  };

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
      for (var i = 0; i < rules.length; i++) {
        // Faster than .push()
        this.rules[this.rules.length] = someRules[i];
      }
    },

    /* Adds the DOM as a local tree called `body` and the `window` variable as
     * a tree called window.
     */ 
    addDefaultTrees: function() {
      this.addTree('body', new CTS.DomTree());
      this.addTree('window', new CTS.JsonTree(window));
    }
    
  });

  // Selector
  // ==========================================================================
  //
  // ==========================================================================

  // Constructor
  // -----------
  var DomSelector = CTS.DomSelector = function(stringRep, defaultTree, opts, args) {
    this.stringRep = stringRep;
    this.treeAlias = null;
    this.selector = null;
    this.initialize.apply(this, args);
  };

  _.extend(DomSelector.prototype, {
    initialize: function() {
      var trimmed = CTS.$.trim(self.stringRep);
      if (trimmed[0] == "@") {
        var pair = trimmed.split('|');
        if (pair.length == 1) {
          throw new Error("Cound not parse: " + self.stringRep);
        } else {
          this.treeAlias = CTS.$.trim(pair.shift().substring(1));
          this.selector = CTS.$.trim(_.join(pair, ""));
        }
      } else {
      }

      r = r.replace(/\/\*(\r|\n|.)*\*\//g,"");

    }
  });


  // DOM Tree
  // ==========================================================================
  //
  // ==========================================================================

  // Constructor
  // -----------
  var DomTree = CTS.DomTree = function(node, attributes) {
    this.root = node || CTS.$('body');
  };

  // Instance Methods
  // ----------------
  _.extend(DomTree.prototype, {

  });


  var JsonTree = CTS.JsonTree = function(json, attributes) {
    this.root = json || window;
  };

  // Instance Methods
  // ----------------
  _.extend(JsonTree.prototype, {

  });





  // ArcParser
  // ==========================================================================
  var RelationParser = CTS.RelationParser = {
    incorporate: function(rules, selector, block) {
    },

    parse: function(r, ruleset) {
      var self = this;
      var ret = ruleset || {};

      // Remove comments
      r = r.replace(/\/\*(\r|\n|.)*\*\//g,"");

      chunks = r.split('}');
      chunks.pop(); // Get rid of the last one.
      _.each(chunks, function(chunk) {
        pair = chunk.split('{');
        selector = CTS.$.trim(pair[0]);
        if (selector  != "") {
          block = CTS.$.trim(pair[1]);
          block = self.parseBlock(block);
          self.incorporate(ret, selector, block);
        }
      }, this);

      return ret;
    },

    parseBlock: function(b) {
    },

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

    render: function() {
    },

    ingestRules: function(rules) {
    },

    loadRemoteString: function(params, successFn, errorFn) {
      $.ajax({url: params['url'],
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
      CTS.$.each(CTS.$('script[type="text/cts"]'),
        function(idx, elem) {
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
        }
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
      var url = xhr['url'];
      this._fsmCtsLoaded(url);
    },

    _fsmCtsLoadFail: function(xhr, textStatus, errorThrown) {
      var url = xhr['url'];
      this._fsmCtsLoaded(url);
    },

    _fsmTreeLoadSuccess: function(data, textStatus, xhr) {
      //TODO
      var url = xhr['url'];
      this._fsmCtsLoaded(url);
    },

    _fsmTreeLoadFail: function(xhr, textStatus, errorThrown) {
      var url = xhr['url'];
      this._fsmCtsLoaded(url);
    },

    _fsmCtsLoaded: function(filename) {
      delete this._ctsToLoad[filename];
      var done = (this._ctsToLoad.length == 0);
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
