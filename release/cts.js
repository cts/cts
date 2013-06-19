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

/*
 * Helper functions. Many of these are taken from Underscore.js
 */
var Fn = CTS.Fn = {
  breaker: {},

  arrDelete: function(arr, from, to) {
    var rest = arr.slice((to || from) + 1 || arr.length);
    arr.length = from < 0 ? arr.length + from : from;
    return arr.push.apply(arr, rest);
  },

  any: function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (Array.prototype.some && obj.some === Array.prototype.some) return obj.some(iterator, context);
    CTS.Fn.each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return CTS.Fn.breaker;
    });
    return !!result;
  },

  every: function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (Array.prototype.every && obj.every === Array.prototype.every) return obj.every(iterator, context);
    CTS.Fn.each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return CTS.Fn.breaker;
    });
    return !!result;
  },

  each: function(obj, iterator, context) {
    if (obj == null) return;
    if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === CTS.Fn.breaker) return;
      }
    } else {
      for (var key in obj) {
        if (CTS.Fn.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === CTS.Fn.breaker) return;
        }
      }
    }
  },

  map: function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (Array.prototype.map && obj.map === Array.prototype.map) return obj.map(iterator, context);
    CTS.Fn.each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  },

  extend: function(obj) {
    CTS.Fn.each(Array.prototype.slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  },

  isObject: function(obj) {
    return obj === Object(obj);
  },

  isUndefined: function(obj) {
    return obj === void 0;
  },

  isNull: function(obj) {
    return obj === null;
  },

  has: function(obj, key) {
    return hasOwnProperty.call(obj, key);
  },

  contains: function(obj, target) {
    if (obj == null) return false;
    if (Array.prototype.indexOf && obj.indexOf === Array.prototype.indexOf) return obj.indexOf(target) != -1;
    return CTS.Fn.any(obj, function(value) {
      return value === target;
    });
  },

  once: function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  },

  uniqueId: function(prefix) {
    var id = ++CTS.Fn.idCounter + '';
    return prefix ? prefix + id : id;
  },

  union: function() {
    return CTS.Fn.uniq(Array.prototype.concat.apply(Array.prototype, arguments));
  },

  unique: function(array, isSorted, iterator, context) {
    if (CTS.Fn.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? CTS.Fn.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    CTS.Fn.each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !CTS.Fn.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  },
  
  without: function(array) {
    return CTS.Fn.difference(array, Array.prototype.slice.call(arguments, 1));
  },

  difference: function(array) {
    var rest = Array.prototype.concat.apply(Array.prorotype, Array.prototype.slice.call(arguments, 1));
    return CTS.Fn.filter(array, function(value){ return !CTS.Fn.contains(rest, value); });
  },

  filter: function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (Array.prototype.filter && obj.filter === Array.prototype.filter) return obj.filter(iterator, context);
    CTS.Fn.each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  },

  flattenWithOutput: function(input, shallow, output) {
    CTS.Fn.each(input, function(value) {
      if (CTS.Fn.isArray(value)) {
        shallow ? push.apply(output, value) : flattenWithOutput(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  },

  flatten: function(array, shallow) {
    return flattenWithOutput(array, shallow, []);
  },

  zip: function() {
    var args = Array.prototype.slice.call(arguments);
    var length = CTS.Fn.max(CTS.Fn.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = CTS.Fn.pluck(args, "" + i);
    }
    return results;
  },

  max:function(obj, iterator, context) {
    if (!iterator && CTS.Fn.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    CTS.Fn.each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  },
  
  pluck: function(obj, key) {
    return CTS.Fn.map(obj, function(value){ return value[key]; });
  }

};

CTS.Fn.isArray = Array.isArray || function(obj) {
  return toString.call(obj) == '[object Array]';
};

CTS.Fn.keys = Object.keys || function(obj) {
  if (obj !== Object(obj)) throw new TypeError('Invalid object');
  var keys = [];
  for (var key in obj) if (CTS.Fn.has(obj, key)) keys[keys.length] = key;
  return keys;
};

CTS.Fn.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
  CTS.Fn['is' + name] = function(obj) {
    return toString.call(obj) == '[object ' + name + ']';
  };
});

if (typeof (/./) !== 'function') {
  CTS.Fn.isFunction = function(obj) {
    return typeof obj === 'function';
  };
}

CTS.Fn.idCounter = 0;


CTS.Log = {

  Fatal: function(msg) {
    alert(msg);
    CTS.Log.LogWithLevel("FATAL", arguments);
  },

  Error: function(message) {
    CTS.Log.LogWithLevel("ERROR", arguments);
  },

  Warn: function(message) {
    CTS.Log.LogWithLevel("WARN", arguments);
  },

  Debug: function(message) {
    CTS.Log.LogWithLevel("DEBUG", arguments);
  },

  Info: function(message) {
    CTS.Log.LogWithLevel("INFO", arguments);
  },

  LogWithLevel: function(level, args) {
    if (console) {
      var args = Array.prototype.slice.call(args);
      args.unshift(level);
      console.log.apply(console, args);
    }
  }

};



CTS.Debugging = {
  DumpStack: function() {
    var e = new Error('dummy');
    var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
        .replace(/^\s+at\s+/gm, '')
        .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
        .split('\n');
    console.log(stack);
  },

  DumpTree: function(node, indent) {
    if (typeof indent == 'undefined') {
      indent = 0;
    }
    var indentSp = "";
    var i;
    for (i = 0; i < indent; i++) {
      indentSp += " ";
    }

    console.log(indentSp + "+ " + node.getValue());

    indentSp += "  ";

    for (i = 0; i < node.relations.length; i++) {
      console.log(indentSp + "- " + node.relations[i].name + " " +
        node.relations[i].opposite(node).getValue());
    }
    for (i = 0; i < node.children.length; i++) {
      CTS.Debugging.DumpTree(node.children[i], indent + 2);
    }
  },

  NodesToString: function(node) {
    var ret = node.getValue();
    if (node.children.length > 0) {
      ret += "(";
      ret += CTS.Fn.map(node.children, function(child) {
        return CTS.Debugging.NodesToString(child);
      }).join(" ");
      ret += ")";
    }
    return ret;
  },

  RenameTree: function(node, dir) {
    if (typeof dir == 'undefined') {
      dir = {};
    }
    
    var v = node.getValue();
    if (typeof dir[v] == 'undefined') {
      dir[v] = 1;
    } else {
      dir[v]++;
      node.setValue(v + dir[v]);
    }

    for (var i = 0; i < node.children.length; i++) {
      CTS.Debugging.RenameTree(node.children[i], dir);
    }
    return node;
  },

  // NODES := <null> | NODE | NODE NODES
  // NODE := NODE_WO_KIDS | NODE_W_KIDS
  // NODE_WO_KIDS := name
  // NDOE_W_KIDS := name(NODES)
  StringToNodes: function(str) {
    var ret = [];
    var name, parens, firstParen, secondParen;

    var reset = function() {
      name = "";
      parens = 0;
      firstParen = -1;
      secondParen = -1;
    };

    var pop = function() {
      var n = new CTS.AbstractNode();
      n.setValue(name);
      if (firstParen != -1) {
        // Handle innards.
        var substr = str.substring(firstParen + 1, secondParen);
        CTS.Fn.each(CTS.Debugging.StringToNodes(substr), function(c) {
          n.insertChild(c);
        });
      }
      ret.push(n);
    };

    reset();

    var i = 0;
    var last = null;
    while (i < str.length) {
      var c = str[i++];
      if (c == '(') {
        if (firstParen == -1) {
          firstParen = i - 1;
        }
        parens++;
      } else if (c == ')') {
        secondParen = i - 1;
        parens--;
        if (parens == 0) {
          pop();
          reset();
        }
      } else if ((c == ' ') && (parens == 0)) {
        if (last != ')') {
          pop();
          reset();
        }
      } else {
        if (firstParen == -1) {
          name += c;
        }
      }
      last = c;
    }
    if (name != "") {
      var n = new CTS.AbstractNode();
      n.setValue(name);
      ret.push(n);
    }
    return ret;
  },

  StringsToRelations: function(root1, others, strs) {
    if (! CTS.Fn.isArray(others)) {
      var item = others;
      others = [item];
    }
    others.push(root1);

    if (typeof strs == 'string') {
      strs = strs.split(";");
    } else if (! CTS.Fn.isArray(strs)) {
      strs = [];
    }

    if ((! CTS.Fn.isUndefined(strs)) && (strs != null)) {
      var rules = CTS.Fn.map(strs, function(str) {
        var parts = str.split(" ");
        var v1 = parts[0];
        var p  = parts[1];
        var v2 = parts[2];
        var n1 = null;
        var n2 = null;
        for (var i = 0; i < others.length; i++) {
          var nn = CTS.Debugging.NodeWithValue(others[i], v2);
          if (nn != null) {
            n2 = nn;
            break;
          }
        }
        for (var i = 0; i < others.length; i++) {
          var nn = CTS.Debugging.NodeWithValue(others[i], v1);
          if (nn != null) {
            n1 = nn;
            break;
          }
        }


        var r = null;
        if (p == "is") {
          r = new CTS.Relation.Is(n1, n2);
        } else if (p == "if-exist") {
          r = new CTS.Relation.IfExist(n1, n2);
        } else if (p == "if-nexist") {
          r = new CTS.Relation.IfNexist(n1, n2);
        } else if (p == "are") {
          r = new CTS.Relation.Are(n1, n2);
        } else if (p == "graft") {
          r = new CTS.Relation.Graft(n1, n2);
        }
        return r;
      });
      return CTS.Fn.filter(rules, function(x) {
        return x != null;
      });
    } else {
      return [];
    }
  },

  NodeWithValue: function(root, value) {
    if (root.getValue() == value) {
      return root;
    } else {
      for (var i = 0; i < root.children.length; i++) {
        var ret = CTS.Debugging.NodeWithValue(root.children[i], value);
        if (ret != null) {
          return ret;
        }
      }
    }
    return null;
  },

  QuickCombine: function(treeStr1, treeStr2, rules, ruleToRun, executeAll) {
    var n1 = CTS.Debugging.StringToNodes(treeStr1)[0];
    var n2 = CTS.Debugging.StringToNodes(treeStr2)[0];
    var rules = CTS.Debugging.StringsToRelations(n1, n2, rules);
    var rulesToRun = CTS.Debugging.StringsToRelations(n1, n2, ruleToRun);

    CTS.Debugging.DumpTree(n1);
    CTS.Debugging.DumpTree(n2);

    var rulesToExecute = rules;

    if (rulesToRun.length > 0) {
      rulesToExecute = rulesToRun;
    }


    if (executeAll) {
      var execRules = function(n) {
        for (var i = 0; i < n.relations.length; i++) {
          n.relations[i].execute(n);
          break;
        }
        for (var j = 0; j < n.children.length; j++) {
          execRules(n.children[j]);
        }
      };
      execRules(n1);
    } else {
      for (var i = 0; i < rulesToExecute.length; i++) {
        rulesToExecute[i].execute(rulesToExecute[i].node1);
      }
    }

    return n1;
  },

  RuleStringForTree: function(node) {
    var ret = [];
    var i;

    for (i = 0; i < node.relations.length; i++) {
      // XXX(eob): Note: ordering is random! Testers take note!
      var r = node.relations[i];
      var rstr = r.node1.getValue() + " "
               + r.name + " " 
               + r.node2.getValue();
      ret.push(rstr);
    }

    for (var i = 0; i < node.children.length; i++) {
      var str = CTS.Debugging.RuleStringForTree(node.children[i]);
      if (str.length > 0) {
        ret.push(str);
      }
    }

    return ret.join(";");
  },

  TreeTest: function(treeStr1, treeStr2, rules, rulesToRun) {
    var n = CTS.Debugging.QuickCombine(treeStr1, treeStr2, rules, rulesToRun);
    return CTS.Debugging.NodesToString(CTS.Debugging.RenameTree(n));
  },

  ForrestTest: function(tree, otherTrees, rules) {
    if (! CTS.Fn.isArray(otherTrees)) {
      otherTrees = [otherTrees];
    }
    var primary = CTS.Debugging.StringToNodes(tree)[0];
    var others = CTS.Fn.map(otherTrees, function(t) {
      return CTS.Debugging.StringToNodes(t)[0];
    }, self);
    CTS.Fn.map(rules, function(r) {
      CTS.Debugging.StringsToRelations(primary, others, r);
    });

    CTS.Log.Info("Beginning Forrest Test")
    CTS.Debugging.DumpTree(primary);
    primary._processIncoming();
    primary = CTS.Debugging.RenameTree(primary);
    CTS.Log.Info("Finished Forrest Test")
    CTS.Debugging.DumpTree(primary);
    return CTS.Debugging.NodesToString(primary);
  },

  RuleTest: function(treeStr1, treeStr2, rules, rulesToRun, executeAll) {
    var n = CTS.Debugging.QuickCombine(treeStr1, treeStr2, rules, rulesToRun, executeAll);
    var n2 = CTS.Debugging.RenameTree(n);
    CTS.Debugging.DumpTree(n2);
    return CTS.Debugging.RuleStringForTree(n2);
  }

};

var TreeViz = CTS.Debugging.TreeViz = function(forrest) {
  this.forrest = forrest;
  this.init();
  this.finish();
};

CTS.Fn.extend(TreeViz.prototype, {

  write: function(html) {
    this.win.document.write(html);
  },
  
  init:  function() {
    this.win = window.open(
        "",
        "CTS Tree Visualization",
        "width=1000,height=800,scrollbars=1,resizable=1"
    );
    this.win.document.open();
    this.write("<html><head>");
    this.write('<script src="http://d3js.org/d3.v3.min.js"></script>');
    this.write('<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>');
    this.write('<script src="http://people.csail.mit.edu/eob/files/cts/extras/tree.js"></script>');
    this.write('<link rel="stylesheet" href="http://people.csail.mit.edu/eob/files/cts/extras/tree.css"></script>');
    this.writeTree(this.forrest.getPrimaryTree());
    this.write('</head><body><div id="chart"></div>');
  },

  finish: function() {
    this.write("</body><html>");
    this.win.document.close();
  },
  
  writeTree: function(tree) {
    this.write("<script>");
    this.write("window.treeData = ");
    this.writeNode(tree.root); 
    this.write(";");
    this.write("</script>");
  },

  writeNode: function(node) {
    this.write("{");
    this.write('name:"' + node.debugName() + '"');
    var kids = node.getChildren();
    console.log(kids);
    console.log("Kids size for node", node, kids.length);
    if ((typeof kids != "undefined") && (kids.length > 0)) {
      this.write(', children: [');
      for (var i = 0; i < kids.length; i++) {
        this.writeNode(kids[i]);
        if (i < kids.length - 1) {
          this.write(",");
        }
      }
      this.write(']');
    }
    this.write("}");
  }
});

// StateMachine
// ==========================================================================
//
//     var object = {};
//     CTS.Fn.extend(object, CTS.StateMachine);
//
// ==========================================================================


var StateMachine = CTS.StateMachine = {
  /*
   * [{from: _, to: _, name: _}]
   */
  fsmInitialize: function(initialState, arcs, opts) {
    this._fsmCurrent = initialState;
    this._fsmArcs = {};
    CTS.Fn.each(arcs, function(arc) {
      if (! CTS.Fn.contains(this._fsmArcs, arc.from)) {
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
      console.log(this, "Transitioning to", to);
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
//     CTS.Fn.extend(object, CTS.Events);
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
    if (CTS.Fn.isUndefined(this._events) || CTS.Fn.isNull(this._events)) {
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
    var once = CTS.Fn.once(function() {
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

    names = name ? [name] : CTS.Fn.keys(this._events);
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
    var id = object._listenerId || (object._listenerId = CTS.Fn.uniqueId('l'));
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


var Utilities = CTS.Utilities = {
  getUrlParameter: function(param, url) {
    if (typeof url == 'undefined') {
      url = window.location.search;
    }

    var p = param.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + p + "=([^&#]*)";
    var regex = new RegExp(regexS);

    var results = regex.exec(url)
    if (results == null) {
      return null;
    } else {
      return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
  },

  /**
   * Returns array of objects with keys:
   *  type: (link or inline)
   *  content: the cts content for inline
   *  url: the url for links
   *  args: any other args
   *
   * TODO(eob): Provide a root element as optional argument
   * to support ingestion of cts rules from transcluded content.
   */ 
  getTreesheetLinks: function() {
    var ret = [];
    CTS.Fn.each(CTS.$('style[type="text/cts"]'), function(elem) {
      var block = {
        type: 'inline',
        content: $(elem).html()
      };
      ret.append(block);
    }, this);
    CTS.Fn.each(CTS.$('link[rel="treesheet"]'), function(elem) {
      var block = {
        type: 'link',
        url: $(elem).attr('href')
      };
      ret.append(block);
    }, this);
    return ret;
  },

  loadRemoteString: function(params, successFn, errorFn) {
    $.ajax({url: params.url,
            dataType: 'text',
            success: success,
            error: error,
            beforeSend: function(xhr, settings) {
              CTS.Fn
      .each(params, function(value, key, list) {
                xhr[key] = value;
              }, this);
            }
    });
  },

  fetchTree: function(spec, callback, context) {
    if ((spec.url == null) && (spec.name == 'body')) {
      callback.call(context, null, CTS.$('body'));
    } else {
      CTS.Log.Fatal("FETCH TREE NOT IMPLEMENTED");
      callback.call(context, "Not Implemented");
    }
  }

};
 

// Node
// --------------------------------------------------------------------------
// 
// A Node represents a fragment of a tree which is annotated with CTS.
//
// Nodes are responsible for understanding how to behave when acted on
// by certain relations (in both directions). The differences between
// different types of trees (JSON, HTML, etc) are concealed at this level.

CTS.Node = {

  initializeNodeBase: function(tree, opts) {
    this.opts = opts;
    this.tree = tree;
    this.kind = null;
    this.children = [];
    this.parentNode = null;
    this.relations = [];
    this.value = null;
    this.addedMyInlineRelationsToForrest = false;
    //this.initializeStateMachine();
  },

  getChildren: function() {
    return this.children;
  },

  registerRelation: function(relation) {
    console.log("Registering Relation", self, relation);
    if (! CTS.Fn.contains(this.relations, relation)) {
      this.relations.push(relation);
    }
  },

  unregisterRelation: function(relation) {
    this.relations = CTS.Fn.filter(this.relations,
        function(r) { return r != relation; });
  },

  getRelations: function() {
    if (! this.addedMyInlineRelationsToForrest) {
      this.registerInlineRelationSpecs();
    }
    return this.relations;
  },

  registerInlineRelationSpecs: function() {
    if (this.addedMyInlineRelationsToForrest) {
      CTS.Log.Warn("Not registering inline relations: have already done so.");
    } else {
      if ((typeof this.tree != 'undefined') && (typeof this.tree.forrest != 'undefined')) {
        var specStr = this._subclass_getInlineRelationSpecString();
        if (specStr) {
          CTS.Parser.parseInlineSpecs(specStr, this, this.tree.forrest, true);
        }
        this.addedMyInlineRelationsToForrest = true;
      } else {
        CTS.Log.Warn("Could not add inline relations to null tree.forrest");
      }
    }
  },

  getSubtreeRelations: function() {
    return CTS.Fn.union(this.getRelations(), CTS.Fn.flatten(
      CTS.Fn.map(this.getChildren(), function(kid) {
        return kid.getSubtreeRelations();
      }))
    );
  },
  
  insertChild: function(node, afterIndex, log) {
    if (typeof afterIndex == 'undefined') {
      afterIndex = this.children.length - 1;
    }

    this.children[this.children.length] = null;
    for (var i = this.children.length - 1; i > afterIndex; i--) {
      if (i == (afterIndex + 1)) {
        this.children[i] = node;
      } else {
        this.children[i] = this.children[i - 1];
      }
    }
    if (log) {
      console.log("Adding", node, "to", this);
    }

    node.parentNode = this;

    //TODO(eob) Have this be an event
    this._subclass_insertChild(node, afterIndex);
  },

  isDescendantOf: function(other) {
    var p = this.parentNode;
    while (p != null) {
      if (p.equals(other)) {
        return true;
      }
      p = p.parentNode;
    }
    return false;
  },

  replaceChildrenWith: function(nodes) {
    var goodbye = this.children;
    this.children = [];
    for (var i = 0; i < goodbye.length; i++) {
      goodbye[i]._subclass_destroy();
    }

    for (var j = 0; j < nodes.length; j++) {
      this.insertChild(nodes[j]);
    }
  },

  // TODO(eob): potentially override later
  equals: function(other) {
    return this == other;
  },

  destroy: function() {
    var gotIt = false;
    if (this.parentNode) {
      for (var i = 0; i < this.parentNode.children.length; i++) {
        if (this.parentNode.children[i] == this) {
          CTS.Fn.arrDelete(this.parentNode.children, i, i);
          gotIt = true;
          break;
        }
      }
    }
    // No need to log if we don't have it. That means it's root.
    // TODO(eob) log error if not tree root
    this._subclass_destroy();
  },

  undestroy: function() {
  },

  realizeChildren: function() {
    if (this.children.length != 0) {
      CTS.Log.Fatal("Trying to realize children when already have some.");
    }
    this._subclass_realizeChildren();
    CTS.Fn.each(this.children, function(child) {
      child.realizeChildren();
    });
  },

  clone: function() {
    var c = this._subclass_beginClone();

    // Note: because the subclass constructs it's own subtree,
    // that means it is also responsible for cloning downstream nodes.
    // thus we only take care of THIS NODE's relations.
    var r = this.getRelations();
    for (var i = 0; i < r.length; i++) {
      var n1 = r[i].node1;
      var n2 = r[i].node2;
      if (n1 == this) {
        n1 = c;
      } else if (n2 == this) {
        n2 = c;
      } else {
        CTS.Fatal("Clone failed");
      }
      var relationClone = r[i].clone(n1, n2);
      console.log("Cloning", r[i].name, "for", this.getValue());
    };
    // Note that we DON'T wire up any parent-child relationships
    // because that would result in more than just cloning the node
    // but also modifying other structures, such as the tree which
    // contained the source.
    return c;
  },

  pruneRelations: function(otherParent, otherContainer) {
    var self = this;
    this.relations = CTS.Fn.filter(this.getRelations(), function(r) {
      var other = r.opposite(self);
      // If the rule ISN'T subtree of this iterable
      // But it IS inside the other container
      // Remove it
      if ((! (other.equals(otherParent) || other.isDescendantOf(otherParent))) 
         && ((typeof otherContainer == 'undefined') || other.isDescendantOf(otherContainer)))
        { 
        r.destroy();
        return false;
      } else {
        return true;
      }
    });
    
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].pruneRelations(otherParent, otherContainer);
    }
  },

  _processIncoming: function() {
    // Do incoming nodes except graft
    this._processIncomingRelations('if-exist');
    this._processIncomingRelations('if-nexist');
    this._processIncomingRelations('is');
    this._processIncomingRelations('are');

    CTS.Log.Info("Dump Pre");
    CTS.Debugging.DumpTree(this);
    // Do children
    for (var i = 0; i < this.children.length; i++) {
      this.children[i]._processIncoming();
    }
    CTS.Log.Info("Dump Post");
    CTS.Debugging.DumpTree(this);

    // Do graft
    this._processIncomingRelations('graft', true);
  },

  _processIncomingRelations: function(name, once) {
    console.log("proc inc from node", this.getValue(), name);
    for (var i = 0; i < this.relations.length; i++) {
      if (this.relations[i].name == name) {
        if (this.relations[i].node1.equals(this)) {
          this.relations[i].execute(this);
          console.log("found one " + this.relations[i].name, name);
          if (once) {
            break;
          }
        }
      }
    }
  },

  /************************************************************************
   **
   ** Methods to be overridden by subclasses
   **
   ************************************************************************/

  getValue: function(opts) {
    return this.value;
  },

  setValue: function(v, opts) {
    this.value = v;
  },

  descendantOf: function(other) {
    return false;
  },

  _subclass_realizeChildren: function() {},
  _subclass_insertChild: function(child, afterIndex) {},
  _subclass_destroy: function() {},
  _subclass_getInlineRelations: function() {},
  _subclass_beginClone: function() {}

};

/*
 * State Machine for Node Rendering 
 * ================================
 *
 * Intended as a Mix-In to Node.
 */

CTS.NodeStateMachine = {  

//  initializeStateMachine: function() {
//      this.fsmInitialize(
//        'Ready', [
//        { 'from':'Ready',
//            'to':'BeginRender',
//          'name':'BeginRender'},
//        { 'from':'BeginRender',
//            'to':'ProcessIncoming',
//          'name':'ProcessIncoming'},
//        { 'from':'ProcessIncoming',
//            'to':'ProcessIncomingChildren',
//          'name':'ProcessIncomingChildren'},
//        { 'from':'ProcessIncomingChildren',
//            'to':'ProcessedIncoming',
//          'name':'ProcessedIncoming'},
//        { 'from':'ProcessIncoming',
//            'to':'FailedConditional',
//          'name':'FailedConditional'},
//        { 'from':'FailedConditional',
//            'to':'Finished',
//          'name':'Finished_Invisible'},
//        { 'from':'ProcessedIncoming',
//            'to':'Finished',
//          'name':'Finished_NoTemplate'},
//        { 'from':'ProcessIncomming',
//            'to':'ProcessedIncoming',
//          'name':'SkipRecursion'}
//      ]);
//  
//      this.on('FsmEdge:BeginRender', this._onBeginRender, this);
//      this.on('FsmEdge:ProcessIncoming', this._onProcessIncoming, this);
//      this.on('FsmEntered:ProcessIncomingChildren', this._onProcessIncomingChildren, this);
//      this.on('FsmEntered:ProcessedIncoming', this._onProcessedIncoming, this);
//      this.on('FsmEdge:FailedConditional', this._onFailedConditional, this);
//      this.on('FsmEntered:Finished', this._onFinished, this);
//   },
//
//  render: function(opts) {
//    console.log(this, "render");
//
//    if (! CTS.Fn.isUndefined(opts)) {
//      if (CTS.Fn.has(opts, 'callback')) {
//        var scope = this;
//        if (CTS.Fn.has(opts, 'callbackScope')) {
//          scope = opts.callbackScope;
//        }
//        this.once('FsmEntered:Finished', opts.callback, scope);
//      }
//    }
//
//    this.fsmTransition("BeginRender");
//  },
//
//
//  _onBeginRender: function() {
//    console.log(this, "onBeginRender");
//    this.fsmTransition("ProcessIncoming");
//  },
//
//  _onProcessIncoming: function() {
//    console.log(this, "onProcessIncoming");
//    if (! this._performConditional()) {
//      console.log("Fail conditional");
//      this.fsmTransition("FailedConditional");
//    } else {
//      if (this._performIs()) {
//        console.log("Performed is");
//        // We did a value map, so move to Processed state.
//        // TODO(eob): what if we want to interpret the value as cts-laden html?
//        this.fsmTransition("ProcessedIncoming");
//      } else if (this._performAre()) {
//        this.fsmTransition("ProcessIncomingChildren");
//      } else {
//        this.fsmTransition("ProcessIncomingChildren");
//      }
//    }
//  },
//
//  _onProcessIncomingChildren: function() {
//    console.log(this, "onProcessChildren");
//
//    // Now we've created any children we're interested in.
//    // Decide how to proceed.
//    var kids = this.getChildren();
//    this.outstandingChildren = kids.length;
//    if (this.outstandingChildren === 0) {
//      this.fsmTransition("ProcessedIncoming");
//    } else {
//      // Listen to finish events
//      CTS.Fn.each(kids, function(child) {
//        child.on("FsmEntered:Finished", this._onChildFinished, this);
//      }, this);
//      // Execute children.
//      // TODO(eob): Explore parallelization options.
//      CTS.Fn.each(kids, function(child) {
//        console.log("RENDERING CHILD");
//        child.render();
//      }, this);
//    }
//  },
//
//  _onChildFinished: function() {
//    this.outstandingChildren = this.outstandingChildren - 1;
//    if (this.outstandingChildren === 0) {
//      this.fsmTransition("ProcessedIncoming");
//    }
//  },
//
//  _onProcessedIncoming: function() {
//    console.log("Trans to finish");
//    this.fsmTransition("Finished");
//  },
//
//  _onFailedConditional: function() {
//    this.failedConditional();
//    this.fsmTransition("Finished");
//  },
//
//  _onFinished: function() {
//  },

  /***********************/

};

var AbstractNode = CTS.AbstractNode = function() {
  this.initializeNodeBase();
  this.value = null;
};

CTS.Fn.extend(CTS.AbstractNode.prototype,
    CTS.Events,
    CTS.Node, {

   _subclass_beginClone: function() {
     var n = new AbstractNode ();
     n.setValue(this.getValue());

     for (var i = 0; i < this.children.length; i++) {
       var k = this.children[i].clone();
       n.insertChild(k);
     }

     return n;
   }

//   descendantOf: function(other) {
//     var p = this.parentNode;
//     var foundIt = false;
//     if (this == other) {
//       return true;
//     }
//     while ((!foundIt) && (p != null)) {
//       if (p == other) {
//         foundIt = true;
//       }
//       p = p.parentNode;
//     }
//     return foundIt;
//   }

});

CTS.NonExistantNode = new CTS.AbstractNode();


// ### Constructor
var DomNode = CTS.DomNode = function(node, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.kind = "HTML";
  this.value = this._createJqueryNode(node);
};

// ### Instance Methods
CTS.Fn.extend(CTS.DomNode.prototype, CTS.Node, CTS.Events, {

  debugName: function() {
    return CTS.Fn.map(this.siblings, function(node) {
      return node[0].nodeName; }
    ).join(', ');
  },

  // Horrendously inefficient.
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    if (this.value.is(selector)) {
      ret.push(this);
    }
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].find(selector, ret);
    }
    return ret;
  },

  /************************************************************************
   **
   ** Required by Node base class
   **
   ************************************************************************/

   descendantOf: function(other) {
     // jQuery trick
     // this.value is a jQuery node
     return this.value.closest(other.value).length != 0;
   },

   /*
    * Precondition: this.children.length == 0
    *
    * Realizes all children.
    */
   _subclass_realizeChildren: function() {
     this.children = CTS.Fn.map(this.value.children(), function(child) {
       var node = new DomNode(child, this.tree, this.opts);
       node.parentNode = this;
       return node;
     }, this);
   },

   /* 
    * Inserts this DOM node after the child at the specified index.
    */
   _subclass_insertChild: function(child, afterIndex) {
     var leftSibling = this.getChildren()[afterIndex];
     leftSibling.value.after(this.value);
   },

   /* 
    *  Removes this DOM node from the DOM tree it is in.
    */
   _subclass_destroy: function() {
     this.value.remove();
   },

   _subclass_getInlineRelationSpecString: function() {
     if (this.value !== null) {
       var inline = this.value.attr('data-cts');
       return inline;
     }
   },

   _subclass_beginClone: function() {
     var c = this.value.clone();
     var d = new DomNode(c, this.tree, this.opts);
     d.realizeChildren();
     return d;
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    return this.value.html();
  },

  setValue: function(value, opts) {
    this.value.html(value);
  },

  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

  _createJqueryNode: function(node) {
    // A Node contains multiple DOM Nodes
    var n = null;
    if (typeof node == 'object') {
      if (! CTS.Fn.isUndefined(node.jquery)) {
        CTS.Debugging.DumpStack();
        n = node;
      } else if (node instanceof Array) {
        n = node[0];
      } else if (node instanceof Element) {
        n = CTS.$(node);
      } else {
        n = null;
      }
    } else if (typeof node == 'string') {
      //console.log("SIBLINGS E", node);
      n = $(node);
    } else {
      n = null;
    }

    if (n !== null) {
      // n is now a jqnode.
      // place a little link to us.
      n.data('ctsnode', this);
    }

    return n;
  }

});

// ### Constructor
var JsonNode = CTS.JsonNode = function(node, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.kind = "JSON";
  this.value = null;
  this.dataType = null;
  if (opts.property) {
    this.value = opts.property;
    this.dataType = 'property'
  } else {
    this.value = node;
    this.updateDataType();
  }
};
 
// ### Instance Methods
CTS.Fn.extend(CTS.JsonNode.prototype, CTS.Events, CTS.Node, {

  updateDataType: function() {
    if (CTS.Fn.isNull(this.value)) {
      this.dataType = 'null';
    } else if (CTS.Fn.isUndefined(this.value)) {
      this.dataType = 'null';
    } else if (CTS.Fn.isArray(this.value)) {
      this.dataType = 'array';
    } else if (CTS.Fn.isObject(this.value)) {
      this.dataType = 'object';
    } else {
      this.dataType = typeof this.value;
    }
  },

  toJSON: function() {
    if (this.dataType == 'set') {
      return CTS.Fn.map(this.children, function(kid) {
        return kid.toJSON();
      });
    } else if (this.dataType == 'object') {
      var ret = {};
      CTS.Fn.each(this.children, function(kid) {
        ret[kid.value] = kid.toJSON();
      }, this);
      return ret;
    } else if (this.dataType == 'property') {
      if (this.children.length == 0) {
        return null;
      } else if (this.children.length > 1) {
        CTS.Debugging.Error("More than one child of property", [this]);
        return null;
      } else {
        return this.children[0].toJSON();
      }
    } else {
      return value;
    }
  },

  debugName: function() {
    return "<JsonNode " + this.dataType + " :: " + this.value + ">"
  },

  /************************************************************************
   **
   ** Required by Node base class
   **
   ************************************************************************/

  /*
   * Precondition: this.children.length == 0
   *
   * Realizes all children.
   */
  _subclass_realizeChildren: function() {
    this.children = [];
  },

  /* 
   * Inserts this DOM node after the child at the specified index.
   */
  _subclass_insertChild: function(child, afterIndex) {
    var leftSibling = this.getChildren()[afterIndex];
  },

  /* 
   *  Removes this DOM node from the DOM tree it is in.
   */
  _subclass_destroy: function() {
    this.jQueryNode.remove();
  },

  _subclass_getInlineRelationSpecs: function() {
    return null;
  },

  _subclass_beginClone: function() {
    var c = this.originalJson;
    var d = new JsonNode(c, this.tree, this.opts);
    d.realizeChildren();
    return d;
  },

 /************************************************************************
  **
  ** Required by Relation classes
  **
  ************************************************************************/

  getValue: function(opts) {
    if (this.dataType == 'set') {
      return JSON.stringify(this.toJSON());
    } else if (this.dataType == 'object') {
      return JSON.stringify(this.toJSON());
    } else if (this.dataType == 'property') {
      return this.children[0].value;
    } else {
      return value;
    }
  },

  setValue: function(value, opts) {
    if (this.dataType == 'property') {
      CTS.Log.Warn("Should not be setting the value of a property.");
    }
    this.value = value;
  }
  
  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

});


CTS.RelationSpec = function(selector1, selector2, name, props1, props2, propsMiddle) {
  this.selectionSpec1 = selector1;
  this.selectionSpec2 = selector2;
  this.name = name;
  this.opts1 = props1;
  this.opts2 = props2;
  this.opts = propsMiddle || {};
};

CTS.Fn.extend(CTS.RelationSpec.prototype, {
  head: function() {
    return this.selectionSpec1;
  },

  tail: function() {
    return this.selectionSpec2;
  },
});

/**
 * A Relation is a connection between two tree nodes.
 * Relations are the actual arcs between nodes.
 * Rules are the language which specify relations.
 */

CTS.Relation = {};

CTS.Relation.CreateFromSpec = function(node1, node2, spec) {
  if (spec.name == 'is') {
    return new CTS.Relation.Is(node1, node2, spec);
  } else if (spec.name == 'are') {
    return new CTS.Relation.Are(node1, node2, spec);
  } else if (spec.name == 'graft') {
    return new CTS.Relation.Graft(node1, node2, spec);
  } else if (spec.name == 'if-exist') {
    return new CTS.Relation.IfExist(node1, node2, spec);
  } else if (spec.name == 'if-nexist') {
    return new CTS.Relation.Are(node1, node2, spec);
    return new CTS.Relation.IfNexist(node1, node2, spec);
  } else {
    CTS.Log.Fatal("Unsure what kind of relation this is:", spec.name);
    return null;
  }
};

CTS.Relation.Base = {

  initializeBase: function() {
    if (this.node1 != null) {
      this.node1.registerRelation(this);
    }
    if (this.node2 != null) {
      this.node2.registerRelation(this);
    }
    this.defaultOpts = this.getDefaultOpts();
  },

  getDefaultOpts: function() {
    return {};
  },

  addOption: function(key, value) {
    this.opts[key] = value;
  },

  head: function() {
    return this.selection1;
  },

  tail: function() {
    return this.selection2;
  },

  opposite: function(node) {
    return (node == this.node1) ? this.node2 : this.node1;
  },

  /*
   * removes this relation from both node1 and node2
   */
  destroy: function() {
    if (this.node1 != null) {
      this.node1.unregisterRelation(this);
    }
    if (this.node2 != null) {
      this.node2.unregisterRelation(this);
    }
  },

  rebind: function(source, destination) {
    if (source == this.node1) {
      this.node1.registerRelation(this);
      this.node1 = destination;
    } else if (source == this.node2) {
      this.node2.registerRelation(this);
      this.node2 = destination;
    } else {
      CTS.Log.Error("Asked to rebind but no match.");
    }
  },

  optsFor: function(node) {
    var toRet;
    if (this.node1 === node) {
      toRet = this.spec.opts1;
    } else if (this.node2 == node) {
      toRet = this.spec.opts2;
    }
    if (CTS.Fn.isUndefined(toRet)) {
      toRet = {};
    }
    CTS.Fn.extend(toRet, this.defaultOpts);
    return toRet;
  },

  clone: function() {
    return new CTS.Relation.Relation(this.node1, this.node2, this.spec);
  },

  signature: function() {
    return "<" + this.name + " " + CTS.Fn.map(this.opts, function(v, k) { return k + ":" + v}).join(";") + ">";
  }
};

/*
 * IS
 * ==
 *
 * Intended as a Mix-In to Relation.
 */
CTS.Relation.Is = function(node1, node2, spec) {
  if (typeof spec == 'undefined') {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
  this.name = 'is';
  this.initializeBase();
};

CTS.Fn.extend(CTS.Relation.Is.prototype, CTS.Relation.Base, {
  execute: function(toward) {
    var from = this.opposite(toward);
    var content = from.getValue(this.optsFor(from));
    toward.setValue(content, this.optsFor(toward));
  },

  clone: function(n1, n2) {
    if (CTS.Fn.isUndefined(n1)) {
      n1 = this.node1;
    }
    if (CTS.Fn.isUndefined(n2)) {
      n2 = this.node2;
    }
    return new CTS.Relation.Is(n1, n2, this.spec);
  }


});


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
    this._Are_AlignCardinalities(toward);
    CTS.Debugging.DumpTree(toward);
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
    var otherIterables = this._Are_GetIterables(other);
    var myIterables = this._Are_GetIterables(toward);
 
    if (myIterables.length > 0) {
      while (myIterables.length > 1) {
        var bye = myIterables.pop();
        bye.destroy();
      }
  
      // Now build it back up.
      if (otherIterables.length == 0) {
        myIterables[0].destroy();
      } else if (otherIterables.length > 1) {
        var lastIndex = myOpts.prefix;
        // WARNING: Note that i starts at 1

        for (var i = 1; i < otherIterables.length; i++) {
          // Clone the iterable.
          var clone = myIterables[0].clone();
          toward.insertChild(clone, lastIndex, true);
          clone.pruneRelations(otherIterables[i], other);
          lastIndex++;
        }
        myIterables[0].pruneRelations(otherIterables[0], other);
      }
    }
  },

  _Are_GetIterables: function(node) {
    var opts = this.optsFor(node);
    var kids = node.getChildren();
    var iterables = kids.slice(opts.prefix, kids.length - opts.suffix);
    return iterables;
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

/*
 * IF-EXIST
 * ========
 *
 * Intended as a Mix-In to Relation.
 */

CTS.Relation.IfExist = function(node1, node2, spec) {
  if (typeof spec == 'undefined') {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
  this.name = 'if-exist';
  this.initializeBase();
};

CTS.Fn.extend(CTS.Relation.IfExist.prototype, CTS.Relation.Base, {
  execute: function(toward) {
    var other = this.opposite(toward);
    if ((other == CTS.NonExistantNode) || (other == null) || (CTS.Fn.isUndefined(other))) {
      toward.destroy();
    } else {
      toward.undestroy();
    }
  },

  clone: function(n1, n2) {
    if (CTS.Fn.isUndefined(n1)) {
      n1 = this.node1;
    }
    if (CTS.Fn.isUndefined(n2)) {
      n2 = this.node2;
    }
    return new CTS.Relation.IfExist(n1, n2, this.spec);
  }


});

/*
 * IF-EXIST
 * ========
 *
 * Intended as a Mix-In to Relation.
 */

CTS.Relation.IfNexist = function(node1, node2, spec) {
  if (typeof spec == 'undefined') {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
  this.name = 'if-nexist';
  this.initializeBase();
};

CTS.Fn.extend(CTS.Relation.IfNexist.prototype, CTS.Relation.Base, {
  execute: function(toward) {
    var other = this.opposite(toward);
    if ((other == CTS.NonExistantNode) || (other == null) || (CTS.Fn.isUndefined(other))) {
      toward.undestroy();
    } else {
      toward.destroy();
    }
  },

  clone: function(n1, n2) {
    if (CTS.Fn.isUndefined(n1)) {
      n1 = this.node1;
    }
    if (CTS.Fn.isUndefined(n2)) {
      n2 = this.node2;
    }
    return new CTS.Relation.IfNexist(n1, n2, this.spec);
  }


});

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

      console.log("GRAFT THE FOLLOWING");
      CTS.Debugging.DumpTree(opp);
      console.log("GRAFT ONTO THE FOLLOWING");
      CTS.Debugging.DumpTree(toward);

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


var TreeSpec = CTS.TreeSpec = function(kind, name, url) {
  this.kind = kind;
  this.name = name;
  this.url = url;
};

// DOM Tree
// ==========================================================================
//
// ==========================================================================


var Tree = CTS.Tree = {
  name: "",
  
  render: function(opts) {
    console.log("render root", this.root);
    this.root.render(opts);
  },

};

// Constructor
// -----------
var DomTree = CTS.DomTree = function(forrest, node, spec) {
  CTS.Log.Info("DomTree::Constructor", [forrest, node]);
  this.root = new CTS.DomNode(node, this);
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
  this.root.realizeChildren();
};

// Instance Methods
// ----------------
CTS.Fn.extend(DomTree.prototype, Tree, {
  nodesForSelectionSpec: function(spec) {
    if (spec.inline) {
      console.log("Nodes for inline spec", this.inlineObject);
      return [spec.inlineObject];
    } else {
      console.log("nodes for selector string spec");
      return this.root.find(spec.selectorString);
    }
  }

});

// Constructor
// -----------
var JsonTree = CTS.JsonTree = function(forrest, root, spec) {
  this.root = new CTS.JsonNode(root, this);
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
};

// Instance Methods
// ----------------
CTS.Fn.extend(JsonTree.prototype, Tree, {
  nodesForSelectionSpec: function(spec) {
    CTS.Log.Fatal("JsonTree::nodesForSelectionSpec - Unimplemented!");
    return [];
  }
});

/* Like a JSON tree but any CTS rules CREATE the keypath upon resolution.
 */
var ScraperTree = CTS.ScraperTree = function(forrest, attributes) {
  this.forrest = forrest;
  this.root = {};
};

// Instance Methods
// ----------------
CTS.Fn.extend(JsonTree.prototype, Tree, {

  nodesForSelectionSpec: function(spec) {
    alert("unimplemented!");
    return [];
  }


});

var ForrestSpec = CTS.ForrestSpec = function() {
  this.treeSpeecs = [];
  this.relationSpecs = [];
};

CTS.Fn.extend(ForrestSpec.prototype, {
  incorporateJson: function(json) {
    if (typeof json.relations != 'undefined') {
      for (var i = 0; i < json.relations.length; i++) {
        if (json.relations[i].length == 3) {
          var s1 = CTS.Parser.Json.parseSelectorSpec(json.relations[i][0]);
          var s2 = CTS.Parser.Json.parseSelectorSpec(json.relations[i][2]);
          var rule = CTS.Parser.Json.parseRelationSpec(json.relations[i][1], s1, s2);
          this.relationSpecs.push(rule);
        }
      }
    }

    if (typeof json.trees != 'undefined') {
      for (var i = 0; i < json.trees.length; i++) {
        if (json.trees[i].length == 3) {
          this.treeSpecs.push(new CTS.TreeSpec(
            json.trees[i][0],
            json.trees[i][1],
            json.trees[i][2]));
        }
      }
    }
  },






});

// Forrest
// ==========================================================================
// A Forrest contains:
//  * Named trees
//  * Relations between those trees
// ==========================================================================

// Constructor
// -----------
var Forrest = CTS.Forrest = function(opts) {
  this.forrestSpecs = [];

  this.treeSpecs = {};
  this.trees = {};
  
  this.relationSpecs = [];
  this.relations= [];

  this.opts = opts || {};
  this.initialize();
};

// Instance Methods
// ----------------
CTS.Fn.extend(Forrest.prototype, {

  /*
   * Initialization Bits
   *
   * -------------------------------------------------------- */

  initialize: function() {
    this.addAndRealizeDefaultTrees();
    // If there is a forrest spec in the opts, we'll use it
    if (typeof this.opts.spec != 'undefined') {
      this.addSpec(this.opts.spec);
    }
  },

  addAndRealizeDefaultTrees: function() {
    var pageBody = new CTS.TreeSpec('HTML', 'body', null);
    this.addTreeSpec(pageBody);
    this.realizeTreeSpec(pageBody);
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
    this.forrestSpecs.push(forrestSpec);
    var i;
    for (i = 0; i < forrestSpec.treeSpecs.length; i++) {
      this.addTree(forrestSpec.treeSpecs[i]);
    }
    for (i = 0; i < forrestSpec.relationSpecs.length; i++) {
      this.addRelation(forrestSpec.relationSpecs[i]);
    }
  },

  addTreeSpec: function(treeSpec) {
    this.treeSpecs[treeSpec.name] = treeSpec;
  },

  addRelationSpec: function(relationSpec) {
    this.relationSpecs.push(relationSpec);
  },

  addRelationSpecs: function(someRelationSpecs) {
    for (var i = 0; i < someRelationSpecs.length; i++) {
      // Faster than .push()
      this.relationSpecs.push(someRelationSpecs[i]);
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
  incorporateInlineJson: function(json, node) {
    if (json.length == 0) {
      return [];
    }
    if (! CTS.Fn.isArray(json[0])) {
      json = [json];
    }
    var ret = [];
    for (var i = 0; i < json.length; i++) {
      var s1 = CTS.Parser.Json.parseSelectorSpec(json[i][0], node);
      var s2 = CTS.Parser.Json.parseSelectorSpec(json[i][2], node);
      var rule = CTS.Parser.Json.parseRelationSpec(json[i][1], s1, s2);
      this.relationSpecs.push(rule);
      ret.push(rule);
    }
    return ret;
  },

  /*
   * Realizing Specs
   *
   * Here, we take specs (ideally those that we've already added, but
   * currently that constraint isn't enforced) and actually transform them
   * into model objects such as Tree and Relation objects.
   *
   * Note that realizing a relation depends upon the prior realization of the
   * trees that the relation references. 
   *
   * -------------------------------------------------------- */

  realizeTreeSpec: function(spec) {
    var self = this;
    CTS.Utilities.fetchTree(spec, function(error, root) {
      if (error) {
        CTS.Log.Error("Could not fetch Tree for Spec " + alias);
      } else {
        if (spec.kind == 'HTML') {
          var tree = new CTS.DomTree(self, root, spec);
          this.trees[spec.name] = tree;
        } else if (spec.kind == 'JSON') {
          var tree = new CTS.JsonTree(self, root, spec);
          this.trees[spec.name] = tree;
        } else {
          CTS.Log.Error("Unknown kind of Tree in Spec " + alias); 
        }
      }
    }, this);
  },

  realizeRelationSpec: function(spec) {
    var s1 = spec.selectionSpec1;
    var s2 = spec.selectionSpec2;

    // Realizing a relation spec has a dependency on the realization of
    // the realization of the treespecs.
    // TODO(eob): One day, having a nice dependency DAG would be nice.
    // For now, we'll error if deps aren't met.
    if (! (this.containsTree(s1.treeName) && this.containsTree(s2.treeName))) {
      if (! this.containsTree(s1.treeName)) {
        CTS.Log.Error("Can not realize RelationSpec becasue one or more trees are not available", s1.treeName);
      }
      if (! this.containsTree(s2.treeName)) {
        CTS.Log.Error("Can not realize RelationSpec becasue one or more trees are not available", s2.treeName);
      }
      return;
    }

    // Here we're guaranteed that the trees are available.

    // Now we find all the nodes that this spec matches on each side and
    // take the cross product of all combinations.

    var nodes1 = this.trees[s1.treeName].nodesForSelectionSpec(s1);
    var nodes2 = this.trees[s2.treeName].nodesForSelectionSpec(s2);

    for (var i = 0; i < nodes1.length; i++) {
      for (var j = 0; j < nodes2.length; j++) {
        // Realize a relation between i and j. Creating the relation adds
        // a pointer back to the nodes.
        var relation = new CTS.Relation.CreateFromSpec(nodes1[i], nodes2[j], spec);
        console.log("Created relation", relation);
        // Add the relation to the forrest
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
  }

  /*
   * NOTE:
   *  All the below code was very clever, but a premature optimization aimed at lazy-loading.
   *  Consider bringing it back once we achieve (slow) functionality.
   */

  //nodesForSelectionSpec: function(spec) {
  //  if (typeof this.trees[spec.treeName] != "undefined") {
  //    return this.trees[spec.treeName].nodesForSelectionSpec(spec);
  //  } else {
  //    return [];
  //  }
  //},

  //rulesForNode: function(node) {
  //  console.log("Forrest:::rulesForNode");
  //  var ret = [];
  //  CTS.Fn.each(this.rules, function(rule) {
  //    console.log("Forrest::rulesForNode Rule", rule, "for node", node);
  //    if ((rule.selector1.matches(node)) || 
  //        (rule.selector2.matches(node))) {
  //      ret[ret.length] = rule;
  //    } else {
  //      console.log("Failed match", rule.selector1.selector);
  //      console.log("Failed match", rule.selector2.selector);
  //    }
  //  }, this);

  //  var inlineRules = node.getInlineRules();
  // 
  //  if (inlineRules !== null) {
  //    var ruleSet = RuleParser.parseInline(node, inlineRules);
  //    if (typeof ruleSet != "undefined") {
  //      ret = CTS.Fn.union(ret, ruleSet);
  //    }
  //  }
  //  return ret;
  //},

  //registerRelationsForNode: function(node) {
  //  console.log("Forrest::RelationsForNode");
  //  var rules = this.rulesForNode(node);
  //  console.log("Rules for", node.siblings[0].html(), rules);
  //  var relations = CTS.Fn.map(rules, function(rule) {
  //    var selection1 = null;
  //    var selection2 = null;
  //    var selector = null;
  //    var other = null;
  //    if (rule.selector1.matches(node)) {
  //      selection1 = new CTS.Selection([node]);
  //      selection2 = rule.selector2.toSelection(this);
  //      other = selection2;
  //    } else {
  //      selection2 = new CTS.Selection([node]);
  //      selection1 = rule.selector1.toSelection(this);
  //      other = selection1;
  //    }
  //    var relation = new Relation(selection1, selection2, rule.name, rule.opts, rule.opts1, rule.opts2);
  //    node.registerRelation(relation);
  //    // Make sure that we wire up the relations,
  //    // since some might come in from inline.
  //    CTS.Fn.each(other.nodes, function(n) {
  //      n.registerRelation(relation);
  //    }, this);
  //  }, this);
  //  console.log("Returning Relations for", node.siblings[0].html(), relations);
  //  return relations;
  //}

});

var SelectionSpec = CTS.SelectionSpec = function(treeName, selectorString, props) {
  this.treeName = treeName;
  this.selectorString = selectorString;
  this.props = props;
  this.inline = false;
  this.inlineObject = null;
};

CTS.Fn.extend(SelectionSpec.prototype, {
  toString: function() {
    return "<Selector {tree:" + this.treeName +
           ", type:" + this.treeType +
           ", selector:" + this.selector +
           ", variant:" + this.variant + "}>";
  },

  matches: function(node) {
    if (CTS.Fn.isUndefined(node._kind)) {
      CTS.Debugging.Error("Node has no kind", [node]); 
      return false;
    } else if (node._kind != this._kind) {
      CTS.Debugging.Error("Node has wrong kind", [node]);
      return false;
    } else {
      if (this.inline) {
        return (this.inlineNode == node);
      } else {
        var res = ((this.treeName == node.tree.name) && (node.node.is(this.selector)));
        return res;
      }
    }
  },

  // Returns tuple of [treeName, treeType, stringSpec]
  PreParse: function(selectorString) {
    var treeName = "body";
    var treeType = "html";
    var selector = null;

    var trimmed = CTS.$.trim(selectorString);
    if (trimmed[0] == "@") {
      var pair = trimmed.split('|');
      if (pair.length == 1) {
        throw new Error("Cound not parse: " + self.stringSpec);
      } else {
        treeName = CTS.$.trim(pair.shift().substring(1));
        // TODO(eob): set tree type
        selector = CTS.$.trim(pair);
      }
    } else {
      selector = selectorString;
    }
    return [treeName, treeType, selector];
  },

  // Factory for new selectors
  Create: function(selectorString) {
    var parts = this.PreParse(selectorString);
    var selector = null;

    if (parts[1] == "html") {
      selector = new DomSelector(parts[2]);
    } 

    console.log("s", selector);
    if (selector !== null) {
      selector.treeName = parts[0];
      selector.treeType = parts[1];
      selector.originalString = selectorString;
    }

    return selector;
  }
});

/**
 * A Relation is a connection between two tree nodes.
 * Relations are the actual arcs between nodes.
 * Rules are the language which specify relations.
 */

var Selection = CTS.Selection = function(nodes, opts) {
  this.nodes = nodes;
  this.opts = {};
  if (typeof opts != 'undefined') {
    this.opts = CTS.Fn.extend(this.opts, opts);
  }
};

CTS.Fn.extend(Selection.prototype, {
  contains: function(node) {
    return CTS.Fn.contains(this.nodes, node);
  },

  clone: function() {
    // not a deep clone of the selection. we don't want duplicate nodes
    // running around.
    return new CTS.Selection(CTS.Fn.union([], this.nodes), this.opts);
  },

  fromSelectionSpec: function(selectionSpec, forrest) {
    if (selectionSpec.inline === true) {
      if (this.inlineNode === null) {
        this.nodes = [];
      } else {
        this.nodes = [selectionSpec.inlineObject];
      }
    } else {
      if (this._selection === null) {
        this.nodes = forrest.nodesForSelectionSpec(selectionSpec);
      }
    }
    this.spec = selectionSpec;
  },

  matchesArray: function(arr, exactly, orArrayAncestor) {
    if (typeof backoffToAncestor == 'undefined') {
      backoffToAncestor = false;
    }

    for (var i = 0; i < this.nodes.length; i++) {
      if (! CTS.Fn.contains(arr, this.nodes[i])) {
        if (backoffToAncestor) {
          // 
        } else {
          return false;
        }
      }
    }
    if ((typeof exactly != 'undefined') && (exactly === true)) {
      return (arr.length = self.nodes.length);
    } else {
      return true;
    }
  }

});

CTS.Parser = {
  parseInlineSpecs: function(str, node, intoForrest, realize) {
    var tup = CTS.Parser._typeAndBodyForInline(str);
    var kind = tup[0];
    var body = tup[1];
    if (kind == 'json') {
      return CTS.Parser.Json.parseInlineSpecs(body, node, intoForrest, realize);
    } else if (kind == 'string') {
      return CTS.Parser.String.parseInlineSpecs(body, node, intoForrest, realize);
    } else {
      CTS.Log.Error("I don't understand the inline CTS format", kind);
      return null;
    }
  },

  /* Inline specs can take the form:
   *  1.  <syntax>:<cts string>
   *  2.  <cts string>
   *
   * Syntax may be one of {string, json}
   *
   * If no syntax is specified, string will be assumed.
   */
  _typeAndBodyForInline: function(str) {
    var res = /^([a-zA-Z]+):(.*)$/.exec(str);
    if (res === null) {
      return ['string', str];
    } else {
      console.log(res);
      return [res[1], res[2]];
    }
  }
};

CTS.Parser.Json = {

  parseInlineSpecs: function(json, node, intoForrest, realize) {
    if (typeof json == 'string') {
      console.log("string", json);
      json = JSON.parse(json);
      console.log("parsed", json);
    }
    console.log("parse inline specs for", node);

    // Now we build a proper spec document around it.
    var relations = intoForrest.incorporateInlineJson(json, node);
    console.log("relns");
    
    if (realize) {
      for (var i = 0; i < relations.length; i++) {
        console.log("realize", relations[i]);
        intoForrest.realizeRelationSpec(relations[i]);
      }
    }
  },

  /* 
   * Returns a Forrest.
   *
   * Arguments:
   *  json - Either a string or JSON object containing CTS.
   *
   */
  parseTreeSheet: function(json, intoForrestSpec) {
    if (typeof json == 'string') {
      json = JSON.parse(json);
    }

    if ((typeof intoForrestSpec == 'undefined') || (intoForrestSpec == null)) {
      intoForrestSpec = new CTS.ForrestSpec();
    }

    intoForrestSpec.incorporate(json);
  },

  parseRelationSpec: function(json, selectorSpec1, selectorSpec2) {
    console.log("j2r", json);
    var ruleName = null;
    var ruleProps = {};
    if (CTS.Fn.isArray(json)) {
      if (json.length == 2) {
        CTS.Fn.extend(ruleProps, json[1]);
      }
      if (json.length > 0) {
        ruleName = json[0];
      }
    } else if (typeof json == 'string') {
      ruleName = json;
    }
    var r = new CTS.RelationSpec(selectorSpec1, selectorSpec2, ruleName, ruleProps);
    console.log("parsed new relation spec", r);
    return r;
  },

  parseSelectorSpec: function(json, inlineNode) {
    console.log("json to selec", json);
    var treeName = null;
    var selectorString = null;
    var args = {};

    if ((json === null) && (inlineNode)) {
      treeName = inlineNode.tree.name;
    } else if (CTS.Fn.isArray(json)) {
      if (json.length == 1) {
        selectorString = json[0];
      } else if (json.length == 2) {
        treeName = json[0];
        selectorString = json[1];
      } else if (json.length == 3) {
        treeName = json[0];
        selectorString = json[1];
        args = json[2];
      }
    } else if (typeof json == 'string') {
      selectorString = json;
    }

    if (treeName == null) {
      treeName = 'body';
    }

    var s = new CTS.SelectionSpec(treeName, selectorString, args);
    if ((json === null) && (inlineNode)) {
      console.log("setting inline", inlineNode);
      s.inline = true;
      s.inlineObject = inlineNode;
    }
    return s;
  }

};

/*
 * Bootstrapper
 * ==========================================================================
 * 
 * Intended to be mixed into the Engine.
 * 
 * As such, it assumes it is part of the Engine with access to StateMachine
 * and Events.
 * 
 * Methods for mix-in:
 *  * boot
 *
 * "Private" Methods:
 *  All begin with '_bootstrap'
 */
var Bootstrapper = CTS.Bootstrapper = {

  /** 
   * Walks CTS through a full page bootup.
   *
   * Dependencies:
   *  Must be mixed into Engine with StateMachine and Events
   */
  boot: function() {
    CTS.Log.Debug("Bootstrap: Booting up");
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

    this.on('FsmEdge:Begin', this._bootstrap_queue_cts, this);
    this.on('FsmEdge:LoadedCTS', this._bootstrap_queue_trees, this);
    this.on('FsmEdge:LoadedTrees', this._bootstrap_render, this);

    // VROOOOOMMMM!
    this.fsmTransition('QueueingCTS');
  },

  /**
   * Finds all CTS links and queues their load.
   */
  _bootstrap_queue_cts: function() {
    // Finds all CTS links and queues their load.
    CTS.Log.Debug("Bootstrap: Loading CTS");
    this.fsmTransition("LoadingCTS");
    this._bootstrap_cts_to_load = {};
    var hasRemote = false;

    var blocks = CTS.Utilities.getTreesheetLinks();
    CTS.Fn.each(blocks, function(block) {
      if (block.type == 'inline') {
        this.ingestRules(block.content);
      } else if (block.type == 'link') {
        // Queue Load
        this._bootstrap_cts_to_load[block.url] = true;
        hasRemote = true;
        CTS.Utilities.loadRemoteString(block,
          this._bootstrap_cts_load_success, this._bootstrap_cts_load_fail);
      }
    }, this);
    
    if (! hasRemote) {
      this.fsmTransition("QueueingTrees"); // Edge name: LoadedCTS
    } 
  },

  _bootstrap_queue_trees: function() {
    CTS.Log.Debug("Bootstrap: Loading Trees");
    this.fsmTransition("LoadingTrees");
    this._bootstrap_trees_to_load = {};
    var hasRemote = false;
    CTS.Fn.each(this.forrest.trees, function(value, key, list) {
      // Todo
    }, this);
    if (! hasRemote) {
      this.fsmTransition("Rendering");
    }
  },

  _bootstrap_render: function() {
    CTS.Log.Debug("Bootstrap: Rendering");
    this.render();
    this.fsmTransition("Rendered");
  },

  _bootstrap_cts_load_success: function(data, textStatus, xhr) {
    CTS.Log.Debug("Bootstrap: Loaded treesheet", xhr.url);
    this.ingestRules(data);
    this._bootstrap_cts_loaded(xhr.url);
  },

  _bootstrap_cts_load_fail: function(xhr, textStatus, errorThrown) {
    CTS.Log.Error("Bootstrap: CTS Load Failed", xhr.url);
    this._bootstrap_cts_loaded(xhr.url);
  },

  _bootstrap_tree_load_success: function(data, textStatus, xhr) {
    CTS.Log.Debug("Bootstrap: Loaded tree", xhr.url);
    //TODO
    this._bootstrap_tree_loaded(xhr.url);
  },

  _bootstrap_tree_load_fail: function(xhr, textStatus, errorThrown) {
    CTS.Log.Error("Bootstrap: Tree Load Failed", xhr.url);
    this._bootstrap_tree_loaded(xhr.url);
  },

  _bootstrap_cts_loaded: function(filename) {
    delete this._bootstrap_cts_to_load[filename];
    var done = (this._bootstrap_cts_to_load.length === 0);
    if (done) {
      _fsmTransition("QueueingTrees"); // Edge: LoadedCTS
    }
  },

  _bootstrap_tree_loaded: function(filename) {
    delete this._bootstrap_trees_to_load[filename];
    var done = (this._bootstrap_trees_to_load.length === 0);
    if (done) {
      _fsmTransition("Rendering");
    }
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
CTS.Fn.extend(Engine.prototype, Events, StateMachine, Bootstrapper, {

  initialize: function() {
    this.forrest = new CTS.Forrest();
  },

  /**
   * Rendering picks a primary tree. For each node in the tree, we:
   *  1: Process any *incoming* relations for its subtree.
   *  2: Process any *outgoing* tempalte operations
   *  3: 
   */
  render: function(opts) {
    console.log(pt);
    var pt = this.forrest.getPrimaryTree();
    var options = CTS.Fn.extend({}, opts);
    pt.root._processIncoming();
    //pt.render(options);
  },

  ingestRules: function(rules) {
    this.forrest.ingestRules(rules);
  },

});

CTS.shouldAutoload = function() {
  var foundCtsElement = false;
  var autoload = true;

  // Search through <script> elements to find the CTS element.
  CTS.Fn.each(CTS.$('script'), function(elem) {
    var url = $(elem).attr('src');
    if ((!CTS.Fn.isUndefined(url)) && (url != null) && (url.indexOf('cts.js') != 1)) {
      foundCtsElement = true;
      var param = CTS.Utilities.getUrlParameter('autoload', url);
      if (param == 'false') {
        autoload = false;
      }
    }
  }, this);

  return (foundCtsElement && autoload);
};

if (CTS.shouldAutoload()) {
  CTS.engine = new CTS.Engine();
  CTS.engine.boot();
}

}).call(this);
