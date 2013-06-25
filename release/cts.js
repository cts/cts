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
      var n = new CTS.Node.Abstract();
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
      var n = new CTS.Node.Abstract();
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

/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
var Q = CTS.Q = (function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

            try {
                task();

            } catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!

                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }

                    throw e;

                } else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function() {
                       throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        channel.port1.onmessage = flush;
        requestTick = function () {
            channel.port2.postMessage(0);
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }

    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this does have the nice side-effect of reducing the size
// of the code by reducing x.call() to merely x(), eliminating many
// hard-to-minify characters.
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
function uncurryThis(f) {
    var call = Function.call;
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
// engine that has a deployed base of browsers that support generators.
// However, SM's generators use the Python-inspired semantics of
// outdated ES6 drafts.  We would like to support ES6, but we'd also
// like to make it possible to use generators in deployed browsers, so
// we also support Python-style generators.  At some point we can remove
// this block.
var hasES6Generators;
try {
    /* jshint evil: true, nonew: false */
    new Function("(function* (){ yield 1; })");
    hasES6Generators = true;
} catch (e) {
    hasES6Generators = false;
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Creates fulfilled promises from non-thenables,
 * Passes Q promises through,
 * Coerces other thenables to Q promises.
 */
function Q(value) {
    return resolve(value);
}

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = deprecate(function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    }, "valueOf", "inspect");

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(resolve(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }

    var deferred = defer();
    fcall(
        resolver,
        deferred.resolve,
        deferred.reject,
        deferred.notify
    ).fail(deferred.reject);
    return deferred.promise;
}

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = deprecate(function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        });
    }

    return promise;
}

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

Promise.prototype.thenResolve = function (value) {
    return when(this, function () { return value; });
};

Promise.prototype.thenReject = function (reason) {
    return when(this, function () { throw reason; });
};

// Chainable methods
array_reduce(
    [
        "isFulfilled", "isRejected", "isPending",
        "dispatch",
        "when", "spread",
        "get", "set", "del", "delete",
        "post", "send", "mapply", "invoke", "mcall",
        "keys",
        "fapply", "fcall", "fbind",
        "all", "allResolved",
        "timeout", "delay",
        "catch", "finally", "fail", "fin", "progress", "done",
        "nfcall", "nfapply", "nfbind", "denodeify", "nbind",
        "npost", "nsend", "nmapply", "ninvoke", "nmcall",
        "nodeify"
    ],
    function (undefined, name) {
        Promise.prototype[name] = function () {
            return Q[name].apply(
                Q,
                [this].concat(array_slice(arguments))
            );
        };
    },
    void 0
);

Promise.prototype.toSource = function () {
    return this.toString();
};

Promise.prototype.toString = function () {
    return "[object Promise]";
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return isObject(object) &&
        typeof object.promiseDispatch === "function" &&
        typeof object.inspect === "function";
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var unhandledReasonsDisplayed = false;
var trackUnhandledRejections = true;
function displayUnhandledReasons() {
    if (
        !unhandledReasonsDisplayed &&
        typeof window !== "undefined" &&
        !window.Touch &&
        window.console
    ) {
        console.warn("[Q] Unhandled rejection reasons (should be empty):",
                     unhandledReasons);
    }

    unhandledReasonsDisplayed = true;
}

function logUnhandledReasons() {
    for (var i = 0; i < unhandledReasons.length; i++) {
        var reason = unhandledReasons[i];
        if (reason && typeof reason.stack !== "undefined") {
            console.warn("Unhandled rejection reason:", reason.stack);
        } else {
            console.warn("Unhandled rejection reason (no stack):", reason);
        }
    }
}

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;
    unhandledReasonsDisplayed = false;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;

        // Show unhandled rejection reasons if Node exits without handling an
        // outstanding rejection.  (Note that Browserify presently produces a
        // `process` global without the `EventEmitter` `on` method.)
        if (typeof process !== "undefined" && process.on) {
            process.on("exit", logUnhandledReasons);
        }
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }

    unhandledRejections.push(promise);
    unhandledReasons.push(reason);
    displayUnhandledReasons();
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    if (typeof process !== "undefined" && process.on) {
        process.removeListener("exit", logUnhandledReasons);
    }
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisP, args) {
            return value.apply(thisP, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
Q.resolve = resolve;
function resolve(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (isPromise(value)) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return resolve(object).inspect();
    });
}

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(promise, fulfilled, rejected) {
    return when(promise, function (valuesOrPromises) {
        return all(valuesOrPromises).then(function (values) {
            return fulfilled.apply(void 0, values);
        }, rejected);
    }, rejected);
}

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;
            if (hasES6Generators) {
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return result.value;
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return exception.value;
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "send");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q.resolve(a), Q.resolve(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    var deferred = defer();
    nextTick(function () {
        resolve(object).promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
}

/**
 * Constructs a promise method that can be used to safely observe resolution of
 * a promise for an arbitrarily named method like "propfind" in a future turn.
 *
 * "dispatcher" constructs methods like "get(promise, name)" and "set(promise)".
 */
Q.dispatcher = dispatcher;
function dispatcher(op) {
    return function (object) {
        var args = array_slice(arguments, 1);
        return dispatch(object, op, args);
    };
}

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = dispatcher("get");

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = dispatcher("set");

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q["delete"] = // XXX experimental
Q.del = dispatcher("delete");

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
var post = Q.post = dispatcher("post");
Q.mapply = post; // experimental

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = send;
Q.invoke = send; // synonyms
Q.mcall = send; // experimental
function send(value, name) {
    var args = array_slice(arguments, 2);
    return post(value, name, args);
}

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = fapply;
function fapply(value, args) {
    return dispatch(value, "apply", [void 0, args]);
}

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] = fcall; // XXX experimental
Q.fcall = fcall;
function fcall(value) {
    var args = array_slice(arguments, 1);
    return fapply(value, args);
}

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = fbind;
function fbind(value) {
    var args = array_slice(arguments, 1);
    return function fbound() {
        var allArgs = args.concat(array_slice(arguments));
        return dispatch(value, "apply", [this, allArgs]);
    };
}

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = dispatcher("keys");

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var countDown = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++countDown;
                when(promise, function (value) {
                    promises[index] = value;
                    if (--countDown === 0) {
                        deferred.resolve(promises);
                    }
                }, deferred.reject);
            }
        }, void 0);
        if (countDown === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, resolve);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Q.allSettled = allSettled;
function allSettled(values) {
    return when(values, function (values) {
        return all(array_map(values, function (value, i) {
            return when(
                value,
                function (fulfillmentValue) {
                    values[i] = { state: "fulfilled", value: fulfillmentValue };
                    return values[i];
                },
                function (reason) {
                    values[i] = { state: "rejected", reason: reason };
                    return values[i];
                }
            );
        })).thenResolve(values);
    });
}

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q["catch"] = // XXX experimental
Q.fail = fail;
function fail(promise, rejected) {
    return when(promise, void 0, rejected);
}

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(promise, progressed) {
    return when(promise, void 0, void 0, progressed);
}

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q["finally"] = // XXX experimental
Q.fin = fin;
function fin(promise, callback) {
    return when(promise, function (value) {
        return when(callback(), function () {
            return value;
        });
    }, function (exception) {
        return when(callback(), function () {
            return reject(exception);
        });
    });
}

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = done;
function done(promise, fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        nextTick(function () {
            makeStackTraceLong(error, promise);

            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promiseToHandle = fulfilled || rejected || progress ?
        when(promise, fulfilled, rejected, progress) :
        promise;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }
    fail(promiseToHandle, onUnhandledError);
}

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {String} custom error message (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = timeout;
function timeout(promise, ms, msg) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        deferred.reject(new Error(msg || "Timed out after " + ms + " ms"));
    }, ms);

    when(promise, function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
}

/**
 * Returns a promise for the given value (or promised value) after some
 * milliseconds.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after some
 * time has elapsed.
 */
Q.delay = delay;
function delay(promise, timeout) {
    if (timeout === void 0) {
        timeout = promise;
        promise = void 0;
    }

    var deferred = defer();

    when(promise, undefined, undefined, deferred.notify);
    setTimeout(function () {
        deferred.resolve(promise);
    }, timeout);

    return deferred.promise;
}

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = nfapply;
function nfapply(callback, args) {
    var nodeArgs = array_slice(args);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());

    fapply(callback, nodeArgs).fail(deferred.reject);
    return deferred.promise;
}

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 *
 *      Q.nfcall(FS.readFile, __filename)
 *      .then(function (content) {
 *      })
 *
 */
Q.nfcall = nfcall;
function nfcall(callback/*, ...args */) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());

    fapply(callback, nodeArgs).fail(deferred.reject);
    return deferred.promise;
}

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 *
 *      Q.nfbind(FS.readFile, __filename)("utf-8")
 *      .then(console.log)
 *      .done()
 *
 */
Q.nfbind = nfbind;
Q.denodeify = Q.nfbind; // synonyms
function nfbind(callback/*, ...args */) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());

        fapply(callback, nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
}

Q.nbind = nbind;
function nbind(callback, thisArg /*, ... args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());

        function bound() {
            return callback.apply(thisArg, arguments);
        }

        fapply(bound, nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
}

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.npost = npost;
Q.nmapply = npost; // synonyms
function npost(object, name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());

    post(object, name, nodeArgs).fail(deferred.reject);
    return deferred.promise;
}

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = nsend;
Q.ninvoke = Q.nsend; // synonyms
Q.nmcall = Q.nsend; // synonyms
function nsend(object, name /*, ...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    post(object, name, nodeArgs).fail(deferred.reject);
    return deferred.promise;
}

Q.nodeify = nodeify;
function nodeify(promise, nodeback) {
    if (nodeback) {
        promise.then(function (value) {
            nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return promise;
    }
}

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

})();

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
    CTS.Fn.each(CTS.$('script[data-treesheet]'), function(elem) {
      var str = CTS.$(elem).attr('data-treesheet');
      if (str != null) {
        var urls = str.split(";");
        for (var i = 0; i < urls.length; i++) {
          var block = {
            type: 'link',
            format: 'string',
            url: urls[i]
          };
          ret.push(block);
        }
      }
    }, this);
    CTS.Fn.each(CTS.$('script[data-theme]'), function(elem) {
      var str = CTS.$(elem).attr('data-treesheet');
      if (str != null) {
        var block = {
          type: 'link',
          format: 'string',
          url: CTS.Utilities.themeUrl(str)
        };
        ret.push(block);
      }
    }, this);

    CTS.Fn.each(CTS.$('style[type="text/cts"]'), function(elem) {
      var block = {
        type: 'block',
        format: 'string',
        content: CTS.$(elem).html()
      };
      ret.push(block);
    }, this);
    CTS.Fn.each(CTS.$('style[type="json/cts"]'), function(elem) {
      var block = {
        type: 'block',
        format: 'json',
        content: CTS.$(elem).html()
      };
      ret.push(block);
    }, this);
    CTS.Fn.each(CTS.$('link[rel="treesheet"]'), function(elem) {
      var e = CTS.$(elem);
      var type = e.attr('type');
      var format = 'string';
      if (type == 'json/cts') {
        format = 'json';
      }
      var block = {
        type: 'link',
        url: CTS.$(elem).attr('href'),
        format: format
      };
      ret.push(block);
    }, this);
    return ret;
  },

  themeUrl: function(str) {
    // theme urls take the form TYPE/INSTANCE/PAGE 
    // TODO(eob): create more flexible ecosystem
    return "http://treesheets.csail.mit.edu/mockups/" + str + ".cts";
  },

  fetchString: function(params, successFn, errorFn) {
    var deferred = Q.defer();
    var xhr = CTS.$.ajax({
      url: params.url,
      dataType: 'text',
      beforeSend: function(xhr, settings) {
        CTS.Fn.each(params, function(value, key, list) {
          xhr[key] = value;
        }, this);
      }
    });
    xhr.done(function(data, textStatus, jqXhr) {
      deferred.resolve(data, textStatus, jqXhr);
    });
    xhr.fail(function(jqXhr, textStatus, errorThrown) {
      CTS.Log.Error("Couldn't fetch string at:", params.url);
      deferred.reject(jqXhr, textStatus, errorThrown);
    });
    return deferred.promise;
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
CTS.Node = {};

CTS.Node.Base = {

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
      var specStr = this._subclass_getInlineRelationSpecString();
      this.addedMyInlineRelationsToForrest = true;
      if (specStr) {
        if ((typeof this.tree != 'undefined') && (typeof this.tree.forrest != 'undefined')) {
          CTS.Parser.parseInlineSpecs(specStr, this, this.tree.forrest, true);
        } else {
          this.addedMyInlineRelationsToForrest = false;
          if (Fn.isUndefined(this.tree) || (this.tree === null)) {
            CTS.Log.Error("[Node] Could not add inline relns to null tree");
          } else if (Fn.isUndefined(this.tree.forrest) || (this.tree.forrest === null)) {
            CTS.Log.Error("[Node] Could not add inline relns to null forrest");
          }
        }
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
    // But we DO need to clone downstream relations.
    this.recursivelyCloneRelations(c);
    // Note that we DON'T wire up any parent-child relationships
    // because that would result in more than just cloning the node
    // but also modifying other structures, such as the tree which
    // contained the source.
    return c;
  },

  recursivelyCloneRelations: function(to) {
    var i;
    var r = this.getRelations();
    for (i = 0; i < r.length; i++) {
      var n1 = r[i].node1;
      var n2 = r[i].node2;
      if (n1 == this) {
        n1 = to;
      } else if (n2 == this) {
        n2 = to;
      } else {
        CTS.Fatal("Clone failed");
      }
      var relationClone = r[i].clone(n1, n2);
    };

    for (i = 0; i < this.getChildren().length; i++) {
      var myKid = this.children[i];
      var otherKid = to.children[i];
      myKid.recursivelyCloneRelations(otherKid);
    }
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
    var r = this.getRelations();
    this._processIncomingRelations(r, 'if-exist');
    this._processIncomingRelations(r, 'if-nexist');
    this._processIncomingRelations(r, 'is');
    this._processIncomingRelations(r, 'are');

    // Do children
    for (var i = 0; i < this.children.length; i++) {
      this.children[i]._processIncoming();
    }

    // Do graft
    this._processIncomingRelations(r, 'graft', true);
  },

  _processIncomingRelations: function(relations, name, once) {
    for (var i = 0; i < relations.length; i++) {
      if (relations[i].name == name) {
        if (relations[i].node1.equals(this)) {
          relations[i].execute(this);
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
  _subclass_beginClone: function() {},
  _subclass_getInlineRelationSpecString: function() { return null; }


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

CTS.Node.Abstract = function() {
  this.initializeNodeBase();
  this.value = null;
};

CTS.Fn.extend(CTS.Node.Abstract.prototype,
    CTS.Events,
    CTS.Node.Base, {

   _subclass_beginClone: function() {
     var n = new CTS.Node.Abstract();
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

CTS.NonExistantNode = new CTS.Node.Abstract();


// ### Constructor
CTS.Node.Html = function(node, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.kind = "HTML";
  this.value = this._createJqueryNode(node);
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.Html.prototype, CTS.Node.Base, CTS.Events, {

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
       var node = new CTS.Node.Html(child, this.tree, this.opts);
       node.parentNode = this;
       return node;
     }, this);
   },

   /* 
    * Inserts this DOM node after the child at the specified index.
    */
   _subclass_insertChild: function(child, afterIndex) {
     if (afterIndex == -1) {
       if (this.getChildren().length == 0) {
         this.value.append(child.value);
       } else {
         this.value.prepend(child.value)
       }
     } else if (afterIndex > -1) {
       var leftSibling = this.getChildren()[afterIndex];
       leftSibling.value.after(child.value);
     } else {
       CTS.Log.Error("[HTML Node] Afer index shouldn't be ", afterIndex);
     }
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
     var d = new CTS.Node.Html(c, this.tree, this.opts);
     d.realizeChildren();
     return d;
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    if (Fn.isUndefined(opts.attribute)) {
      return this.value.html();
    } else {
      return this.value.attr(opts.attribute);
    }
  },

  setValue: function(value, opts) {
    if (Fn.isUndefined(opts.attribute)) {
      this.value.html(value);
    } else {
      this.value.attr(opts.attribute, value);
    }
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
CTS.Node.Json = function(node, tree, opts) {
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
CTS.Fn.extend(CTS.Node.Json.prototype, CTS.Events, CTS.Node.Base, {

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


var RelationSpec = CTS.RelationSpec = function(selector1, selector2, name, props) {
  this.selectionSpec1 = selector1;
  this.selectionSpec2 = selector2;
  this.name = name;
  this.opts = props || {};
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
    var toRet = {};
    Fn.extend(toRet, this.defaultOpts);
    if (this.node1 === node) {
      Fn.extend(toRet, this.spec.selectionSpec1.props);
    } else if (this.node2 == node) {
      Fn.extend(toRet, this.spec.selectionSpec2.props);
    }
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


// DOM Tree
// ==========================================================================
//
// ==========================================================================

var Tree = CTS.Tree = {};

CTS.Tree.Base = {
  render: function(opts) {
    this.root.render(opts);
  }
};

/*
 * Returns a promise
 */
CTS.Tree.Create = function(spec, forrest) {
  var deferred = Q.defer();
  // Special case
  if ((spec.url == null) && (spec.name = 'body')) {
    var node = CTS.$('body');
    var tree = new CTS.Tree.Html(forrest, node, spec);
    deferred.resolve(tree);
  } else {
    CTS.Utilities.fetchString(spec).then(
      function(content) {
        if ((spec.kind == 'HTML') || (spec.kind == 'html')) {
          //try {
          //  var domNodes = CTS.Parser.Html.HTMLtoDOM(content); 
          //} catch (e) {
          //  console.log(e);
          //  CTS.Debugging.DumpStack();
          //  debugger;
          //}
          var node = CTS.$(content);
          var tree = new CTS.Tree.Html(forrest, node, spec);
          deferred.resolve(tree);
        } else {
          deferred.reject();
        }
      },
      function() {
        deferred.reject();
      }
    );
  }
  return deferred.promise;
};

var TreeSpec = CTS.Tree.Spec = function(kind, name, url, loadedFrom) {
  this.kind = kind;
  this.name = name;
  this.url = url;
  this.loadedFrom = null;
  if (typeof loadedFrom != 'undefined') {
    this.loadedFrom = loadedFrom;
  }
};

// Constructor
// -----------
CTS.Tree.Html = function(forrest, node, spec) {
  CTS.Log.Info("DomTree::Constructor", [forrest, node]);
  this.root = new CTS.Node.Html(node, this);
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
  this.root.realizeChildren();
};

// Instance Methods
// ----------------
CTS.Fn.extend(CTS.Tree.Html.prototype, CTS.Tree.Base, {
  nodesForSelectionSpec: function(spec) {
    console.log("nodes for: " + spec.selectorString);
    if (spec.inline) {
      console.log("Nodes for inline spec", this.inlineObject);
      return [spec.inlineObject];
    } else {
      console.log("nodes for selector string spec");
      var results = this.root.find(spec.selectorString);
      if (results.length == 0) {
        console.log(this.name, spec.selectorString);
        console.log(this.root.value.html());
      }
      return results;
    }
  }

});

// Constructor
// -----------
CTS.Tree.Json = function(forrest, root, spec) {
  this.root = new CTS.JsonNode(root, this);
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
};

// Instance Methods
// ----------------
CTS.Fn.extend(CTS.Tree.Json, CTS.Tree.Base, {
  nodesForSelectionSpec: function(spec) {
    CTS.Log.Fatal("JsonTree::nodesForSelectionSpec - Unimplemented!");
    return [];
  }
});

/* Like a JSON tree but any CTS rules CREATE the keypath upon resolution.
 */
CTS.Tree.Xpando = function(forrest, attributes) {
  this.forrest = forrest;
  this.root = {};
};

// Instance Methods
// ----------------
CTS.Fn.extend(CTS.Tree.Xpando, CTS.Tree.Base, {

  nodesForSelectionSpec: function(spec) {
    alert("unimplemented!");
    return [];
  }


});

var ForrestSpec = CTS.ForrestSpec = function() {
  this.treeSpecs = [];
  this.relationSpecs = [];
  this.dependencySpecs = [];
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
    var pageBody = new CTS.Tree.Spec('HTML', 'body', null);
    this.addTreeSpec(pageBody);
    this.realizeTree(pageBody);
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
      this.addTreeSpec(forrestSpec.treeSpecs[i]);
    }
    for (i = 0; i < forrestSpec.relationSpecs.length; i++) {
      this.addRelationSpec(forrestSpec.relationSpecs[i]);
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

  realizeTrees: function() {
    var promises = [];
    Fn.each(this.treeSpecs, function(treeSpec, name, list) {
      if (! Fn.has(this.trees, name)) {
        promises.push(this.realizeTree(treeSpec));
      }
    }, this);
    return Q.all(promises);
  },

  realizeDependencies: function() {
    Fn.each(this.forrestSpecs, function(fs) {
      Fn.each(fs.dependencySpecs, function(ds) {
        ds.load();
      });
    });
  },

  realizeTree: function(treeSpec) {
    var deferred = Q.defer();
    var self = this;
    if ((treeSpec.url !== null) && (treeSpec.url.indexOf("alias(") == 0) && (treeSpec.url[treeSpec.url.length - 1] == ")")) {
      var alias = treeSpec.url.substring(6, treeSpec.url.length - 1);
      if (typeof self.trees[alias] != 'undefined') {
        self.trees[treeSpec.name] = self.trees[alias];
        deferred.resolve();
      } else {
        deferred.reject();
      }
    } else {
      if ((treeSpec.url !== null) && (treeSpec.url.indexOf("relative(") == 0) && (treeSpec.url[treeSpec.url.length - 1] == ")")) {
        treeSpec.originalUrl = treeSpec.url;
        var fragment = treeSpec.url.substring(9, treeSpec.url.length - 1);
        var prefix = treeSpec.loadedFrom.split("/");
        prefix.pop();
        prefix = prefix.join("/");
        treeSpec.url = prefix + "/" + fragment;
      }
      CTS.Tree.Create(treeSpec, this).then(
        function(tree) {
          self.trees[treeSpec.name] = tree;
          deferred.resolve();
        },
        function() {
          deferred.reject();
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

  realizeRelation: function(spec) {
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
        console.log("Did a relation between", relation, relation.name, nodes1[i], nodes2[j]);
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

});

var SelectionSpec = CTS.SelectionSpec = function(treeName, selectorString, props) {
  this.treeName = treeName;
  this.selectorString = selectorString;
  this.props = props || {};
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

var DependencySpec = CTS.DependencySpec = function(kind, url) {
  this.kind = kind;
  this.url = url;
  this.loaded = false;
};

DependencySpec.prototype.load = function() {
  if (this.loaded == false) {
    if (this.kind == 'css') {
      this.loaded = true;
      var link = document.createElement('link')
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('type', 'text/css');
      link.setAttribute('href', this.url);
      document.getElementsByTagName('head')[0].appendChild(link);
    } else if (this.kind == 'js') {
      this.loaded = true;
      var script = document.createElement('script')
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('src', this.url);
      document.getElementsByTagName('head')[0].appendChild(script);
    } else {
      CTS.Logging.Error("DependencySpec: Unsure how to load", this.kind, this.url);
    }
  } else {
    CTS.Logging.Warn("DependencySpec: Not loading already loaded", this.kind, this.url);
  }
};



CTS.Parser = {
  parseInlineSpecs: function(str, node, intoForrest, realize) {
    var tup = CTS.Parser._typeAndBodyForInline(str);
    var kind = tup[0];
    var body = tup[1];
    if (kind == 'json') {
      return CTS.Parser.Json.parseInlineSpecs(body, node, intoForrest, realize);
    } else if (kind == 'string') {
      return CTS.Parser.Cts.parseInlineSpecs(body, node, intoForrest, realize);
    } else {
      CTS.Log.Error("I don't understand the inline CTS format", kind);
      return null;
    }
  },

  parseForrestSpec: function(str, kind) {
    if (kind == 'json') {
      return CTS.Parser.Json.parseForrestSpec(str);
    } else if (kind == 'string') {
      return CTS.Parser.Cts.parseForrestSpec(str);
    } else {
      CTS.Log.Error("I don't understand the CTS Format", kind);
    }
  },

  parse: function(obj, kind) {
    if (typeof kind == 'undefined') {
      kind = 'string';
    }
    return CTS.Parser.parseForrestSpec(obj, kind);
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
      return [res[1], res[2]];
    }
  }

};

CTS.Parser.Json = {

  parseInlineSpecs: function(json, node, intoForrest, realize) {
    if (typeof json == 'string') {
      json = JSON.parse(json);
    }
    console.log("parse inline specs for", node);

    // Now we build a proper spec document around it.
    var relations = intoForrest.incorporateInlineJson(json, node);
    
    if (realize) {
      for (var i = 0; i < relations.length; i++) {
        console.log("realize", relations[i]);
        intoForrest.realizeRelationSpec(relations[i]);
      }
    }
  },

  parseForrestSpec: function(json) {
    console.log(json);
    if (typeof json == 'string') {
      json = JSON.parse(json);
    }
    var ret = new CTS.ForrestSpec();

    if (! CTS.Fn.isUndefined(json.trees)) {
      CTS.Fn.each(json.trees, function(treeSpecJson) {
        var ts = CTS.Parser.Json.parseTreeSpec(treeSpecJson);
        ret.treeSpecs.push(ts);
      });
    };

    if (! CTS.Fn.isUndefined(json.relations)) {
      CTS.Fn.each(json.relations, function(relationSpecJson) {
        var s1 = CTS.Parser.Json.parseSelectorSpec(relationSpecJson[0]);
        var s2 = CTS.Parser.Json.parseSelectorSpec(relationSpecJson[2]);
        var r  = CTS.Parser.Json.parseRelationSpec(relationSpecJson[1], s1, s2);
        ret.relationSpecs.push(r);
      });
    }

    return ret;
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
    } else if (Fn.isObject(json)) {
      if (!Fn.isUndefined(json.name)) {
        ruleName = json.name;
      }
      if (!Fn.isUndefined(json.props)) {
        ruleProps = json.props;
      }
    } else if (typeof json == 'string') {
      ruleName = json;
    }
    var r = new CTS.RelationSpec(selectorSpec1, selectorSpec2, ruleName, ruleProps);
    console.log("parsed new relation spec", r);
    return r;
  },

  parseTreeSpec: function(json) {
    var ret = new CTS.Tree.Spec();
    ret.kind = json[0];
    ret.name = json[1];
    ret.url = json[2];
    return ret;
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
    } else if (Fn.isObject(json)) {
      if (!Fn.isUndefined(json.treeName)) {
        treeName = json.treeName;
      }
      if (!Fn.isUndefined(json.selectorString)) {
        selectorString = json.selectorString;
      }
      if (!Fn.isUndefined(json.props)) {
        args = json.props;
      }
    } if (typeof json == 'string') {
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

CTS.Parser.Cts = {

  parseInlineSpecs: function(str, node, intoForrest, realize) {
    return null;
  },

  parseForrestSpec: function(str) {
    var json = null;
    try {
      json = CTS.Parser.CtsImpl.parse(str.trim());
    } catch (e) {
      CTS.Log.Error("Parser error: couldn't parse string", str, e);
      return null;
    }
    console.log(json);
    json.trees = [];
    json.css = [];
    json.js = [];
    var i;
    var f = new ForrestSpec();
    if (typeof json.headers != 'undefined') {
      for (i = 0; i < json.headers.length; i++) {
        var h = json.headers[i];
        var kind = h.shift();
        if (kind == 'html') {
          f.treeSpecs.push(new TreeSpec('html', h[0], h[1]));
        } else if (kind == 'css') {
          f.dependencySpecs.push(new DependencySpec('css', h[0]));
        } else if (kind == 'js') {
          f.dependencySpecs.push(new DependencySpec('js', h[1]));
        } else {
          CTS.Log.Error("Don't know CTS header type:", kind);
        }
      }
    }
    f.relationSpecs = json.relations;
    return f;
  }

};

CTS.Parser.CtsImpl = {
  parse: function(str) {

    // First, remove all comments
    str = CTS.Parser.CtsImpl.RemoveComments(str);

    var i = 0;
    var c;
    var relations = [];
    var ats = [];
    while (i < str.length) {
      c = str[i];
      if ((c == ' ') || (c == '\n') || (c == '\t')) {
        i++;
      } else if (c == "@") {
        tup = CTS.Parser.CtsImpl.AT(str, i+1);
        console.log(tup);
        i = tup[0];
        ats.push(tup[1]);
      } else {
        tup = CTS.Parser.CtsImpl.RELATION(str, i);
        i = tup[0];
        relations.push(tup[1]);
      }
    }
    return {headers: ats, relations: relations};
  },

  RemoveComments: function(str) {
    var inQuestion = str;
    var lastChar = '';
    var i = 0;
    var inComment = false;
    var commentOpen = null;
    // no nesting allowed
    while (i < inQuestion.length) {
      if (! inComment) {
        if ((inQuestion[i] == '*') && (lastChar == '/')) {
          inComment = true;
          commentOpen = i-1;
        }
        lastChar = inQuestion[i];
      } else {
        if ((inQuestion[i] == '/') && (lastChar == '*')) {
          var prefix = inQuestion.substring(0, commentOpen);
          inQuestion = prefix + " " + inQuestion.substring(i+1);
          inComment = false;
          i = i - (i - commentOpen) + 1;
          commentOpen = null;
          lastChar = '';
        } else {
          lastChar = inQuestion[i];
        }
      }
      i++;
    }
    if (inComment) {
      inQuestion = inQuestion.substring(0, commentOpen);
    }
    if (inQuestion != str) {
      console.log("BEFORE", str);
      console.log("AFTER", inQuestion);
    }
    return inQuestion;
  },

  AT: function(str, i) {
    var start = i;
    while ((i < str.length) && (str[i] != ';')) {
      i++;
    }
    var s = str.substring(start, i);
    var parts = s.split(" ");
    for (var k = 0; i < parts.length; k++) {
      parts[k].trim();
    }
    return [i+1, parts];
  },

  RELATION: function(str, i) {
    var tup = CTS.Parser.CtsImpl.SELECTOR(str, i, false);
    console.log("RS1", tup);
    i = tup[0];
    var s1 = tup[1];

    tup = CTS.Parser.CtsImpl.RELATOR(str, i);
    i = tup[0];
    var r = tup[1][0];
    var kv = tup[1][1];
    console.log("KV SSSSSTILL", JSON.stringify(kv));

    var tup = CTS.Parser.CtsImpl.SELECTOR(str, i, true);
    i = tup[0];
    var s2 = tup[1];

    return [i, new RelationSpec(s1, s2, r, kv)];
  },

  SELECTOR: function(str, i, second) {
    console.log("Selector ", second ? "two" : "one", str.substring(i));
    var spaceLast = false;
    var spaceThis = false;
    var bracket = 0;
    var kv = null;
    var start = i;
    var treeName = 'body';
    var selector = null;
    var cont = true;

    while ((i < str.length) && cont) {
      if ((kv === null) && (str[i] == '{')) {
        selector = str.substring(start, i).trim();
        var tup = CTS.Parser.CtsImpl.KV(str, i+1);
        i = tup[0] - 1; // Necessary -1
        kv = tup[1];
      } else if (str[i] == '[') {
        bracket++;
      } else if (str[i] == ']') {
        bracket--;
      } else if ((str[i] == '|') && (bracket == 0) && (kv === null)) {
        treeName = str.substring(start, i).trim();
        start = i+1;
      } else if (((!second) && spaceLast && (str[i] == ':')) 
               ||( second && (str[i] == ';'))) {
        if (kv === null) {
          selector = str.substring(start, i).trim();
        }
        cont = false;
      } else if (second && (str[i] == ';')) {
      }
      spaceLast = ((str[i] == ' ') || (str[i] == '\t') || (str[i] == '\n'));
      i++;
    }

    return [i, new SelectionSpec(treeName, selector, kv)];
  },

  KV: function(str, i) {
    console.log("KV", str.substring(i));
    var ret = {};
    while ((i < str.length) && (str[i] != '}')) {
      var t1 = CTS.Parser.CtsImpl.KEY(str, i);
      i = t1[0];
      var t2 = CTS.Parser.CtsImpl.VALUE(str, i);
      i = t2[0];
      ret[t1[1]] = t2[1];
    }
    console.log("KV RES", JSON.stringify(ret), str.substring(i+1));
    return [i+1, ret];
  },

  KEY: function(str, i) {
    console.log("KEY", str);
    var start = i;
    while ((i < str.length) && (str[i] != ':')) {
      i++;
    }
    return [i+1, str.substring(start, i).trim()];
  },

  VALUE: function(str, i) {
    console.log("VAL", str);
    var start = i;
    while ((i < str.length) && (str[i] != ",") && (str[i] != "}")) {
      i++;
    }
    var val = str.substring(start, i).trim();
    if (str[i] == ",") {
      return [i+1, val];
    } else {
      return [i, val]; // Parent needs to see } for terminal condition.
    }
  },

  RELATOR: function(str, i) {
    console.log("relator ", str.substring(i));
    var kv = {};
    var start = i;
    var cont = true;
    while ((i < str.length) && (str[i] != ' ') && (str[i] != '\n') && (str[i] != '\t') && (str[i] != '\r')) {
      i++;
    }
    while ((i < str.length) && ((str[i] == ' ') || (str[i] == '\n') || (str[i] == '\t') || (str[i] == '\r'))) {
      i++;
    }
    if (str[i] == "{") {
      var tup = CTS.Parser.CtsImpl.KV(str, i+1);
      i = tup[0];
      kv = tup[1];
    }
    return [i, [str.substring(start, i).trim(), kv]];
  }
};


CTS.Parser.Html = new (function(){
	// Regular Expressions for parsing tags and attributes
	var startTag = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
		endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
		attr = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
		
	// Empty Elements - HTML 4.01
	var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

	// Block Elements - HTML 4.01
	var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

	// Inline Elements - HTML 4.01
	var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

	// Elements that you can, intentionally, leave open
	// (and which close themselves)
	var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

	// Attributes that have their values filled in disabled="disabled"
	var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

	// Special Elements (can contain anything)
	var special = makeMap("script,style");

	var HTMLParser = this.HTMLParser = function( html, handler ) {
		var index, chars, match, stack = [], last = html;
		stack.last = function(){
			return this[ this.length - 1 ];
		};

		while ( html ) {
			chars = true;

			// Make sure we're not in a script or style element
			if ( !stack.last() || !special[ stack.last() ] ) {

				// Comment
				if ( html.indexOf("<!--") == 0 ) {
					index = html.indexOf("-->");
	
					if ( index >= 0 ) {
						if ( handler.comment )
							handler.comment( html.substring( 4, index ) );
						html = html.substring( index + 3 );
						chars = false;
					}
	
				// end tag
				} else if ( html.indexOf("</") == 0 ) {
					match = html.match( endTag );
	
					if ( match ) {
						html = html.substring( match[0].length );
						match[0].replace( endTag, parseEndTag );
						chars = false;
					}
	
				// start tag
				} else if ( html.indexOf("<") == 0 ) {
					match = html.match( startTag );
	
					if ( match ) {
						html = html.substring( match[0].length );
						match[0].replace( startTag, parseStartTag );
						chars = false;
					}
				}

				if ( chars ) {
					index = html.indexOf("<");
					
					var text = index < 0 ? html : html.substring( 0, index );
					html = index < 0 ? "" : html.substring( index );
					
					if ( handler.chars )
						handler.chars( text );
				}

			} else {
				html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function(all, text){
					text = text.replace(/<!--(.*?)-->/g, "$1")
						.replace(/<!\[CDATA\[(.*?)]]>/g, "$1");

					if ( handler.chars )
						handler.chars( text );

					return "";
				});

				parseEndTag( "", stack.last() );
			}

			if ( html == last )
				throw "Parse Error: " + html;
			last = html;
		}
		
		// Clean up any remaining tags
		parseEndTag();

		function parseStartTag( tag, tagName, rest, unary ) {
			tagName = tagName.toLowerCase();

			if ( block[ tagName ] ) {
				while ( stack.last() && inline[ stack.last() ] ) {
					parseEndTag( "", stack.last() );
				}
			}

			if ( closeSelf[ tagName ] && stack.last() == tagName ) {
				parseEndTag( "", tagName );
			}

			unary = empty[ tagName ] || !!unary;

			if ( !unary )
				stack.push( tagName );
			
			if ( handler.start ) {
				var attrs = [];
	
				rest.replace(attr, function(match, name) {
					var value = arguments[2] ? arguments[2] :
						arguments[3] ? arguments[3] :
						arguments[4] ? arguments[4] :
						fillAttrs[name] ? name : "";
					
					attrs.push({
						name: name,
						value: value,
						escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
					});
				});
	
				if ( handler.start )
					handler.start( tagName, attrs, unary );
			}
		}

		function parseEndTag( tag, tagName ) {
			// If no tag name is provided, clean shop
			if ( !tagName )
				var pos = 0;
				
			// Find the closest opened tag of the same type
			else
				for ( var pos = stack.length - 1; pos >= 0; pos-- )
					if ( stack[ pos ] == tagName )
						break;
			
			if ( pos >= 0 ) {
				// Close all the open elements, up the stack
				for ( var i = stack.length - 1; i >= pos; i-- )
					if ( handler.end )
						handler.end( stack[ i ] );
				
				// Remove the open elements from the stack
				stack.length = pos;
			}
		}
	};
	
	this.HTMLtoXML = function( html ) {
		var results = "";
		
		HTMLParser(html, {
			start: function( tag, attrs, unary ) {
				results += "<" + tag;
		
				for ( var i = 0; i < attrs.length; i++ )
					results += " " + attrs[i].name + '="' + attrs[i].escaped + '"';
		
				results += (unary ? "/" : "") + ">";
			},
			end: function( tag ) {
				results += "</" + tag + ">";
			},
			chars: function( text ) {
				results += text;
			},
			comment: function( text ) {
				results += "<!--" + text + "-->";
			}
		});
		
		return results;
	};
	
	this.HTMLtoDOM = function( html, doc ) {
		// There can be only one of these elements
		var one = makeMap("html,head,body,title");
		
		// Enforce a structure for the document
		var structure = {
			link: "head",
			base: "head"
		};
	
		if ( !doc ) {
			if ( typeof DOMDocument != "undefined" )
				doc = new DOMDocument();
			else if ( typeof document != "undefined" && document.implementation && document.implementation.createDocument )
				doc = document.implementation.createDocument("", "", null);
			else if ( typeof ActiveX != "undefined" )
				doc = new ActiveXObject("Msxml.DOMDocument");
			
		} else
			doc = doc.ownerDocument ||
				doc.getOwnerDocument && doc.getOwnerDocument() ||
				doc;
		
		var elems = [],
			documentElement = doc.documentElement ||
				doc.getDocumentElement && doc.getDocumentElement();
				
		// If we're dealing with an empty document then we
		// need to pre-populate it with the HTML document structure
		if ( !documentElement && doc.createElement ) (function(){
			var html = doc.createElement("html");
			var head = doc.createElement("head");
			head.appendChild( doc.createElement("title") );
			html.appendChild( head );
			html.appendChild( doc.createElement("body") );
			doc.appendChild( html );
		})();
		
		// Find all the unique elements
		if ( doc.getElementsByTagName )
			for ( var i in one )
				one[ i ] = doc.getElementsByTagName( i )[0];
		
		// If we're working with a document, inject contents into
		// the body element
		var curParentNode = one.body;
		
		HTMLParser( html, {
			start: function( tagName, attrs, unary ) {
				// If it's a pre-built element, then we can ignore
				// its construction
				if ( one[ tagName ] ) {
					curParentNode = one[ tagName ];
					if ( !unary ) {
						elems.push( curParentNode );
					}
					return;
				}
			
				var elem = doc.createElement( tagName );
				
				for ( var attr in attrs )
					elem.setAttribute( attrs[ attr ].name, attrs[ attr ].value );
				
				if ( structure[ tagName ] && typeof one[ structure[ tagName ] ] != "boolean" )
					one[ structure[ tagName ] ].appendChild( elem );
				
				else if ( curParentNode && curParentNode.appendChild )
					curParentNode.appendChild( elem );
					
				if ( !unary ) {
					elems.push( elem );
					curParentNode = elem;
				}
			},
			end: function( tag ) {
				elems.length -= 1;
				
				// Init the new parentNode
				curParentNode = elems[ elems.length - 1 ];
			},
			chars: function( text ) {
				curParentNode.appendChild( doc.createTextNode( text ) );
			},
			comment: function( text ) {
				// create comment node
			}
		});
		
		return doc;
	};

	function makeMap(str){
		var obj = {}, items = str.split(",");
		for ( var i = 0; i < items.length; i++ )
			obj[ items[i] ] = true;
		return obj;
	}
})();

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
CTS.Fn.extend(Engine.prototype, Events, {

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
    var pt = this.forrest.getPrimaryTree();
    console.log("rendering primary tree", pt);
    var options = CTS.Fn.extend({}, opts);
    pt.root._processIncoming();
    //pt.render(options);
  },

  boot: function() {
    var self = this;
    var ctsLoaded = this.loadCts();
    var treesLoaded = ctsLoaded.then(
      function() {
        self.forrest.realizeDependencies();
        self.forrest.realizeTrees().then(
          function() {
            self.forrest.realizeRelations();
            self.render();
          },
          function(err) {
            CTS.Log.Error("Couldn't load trees", err);
          }
        ).done();
      },
      function(err) {
        CTS.Log.Error("Couldn't load CTS.", err);
      }
    ).done();

    //    self.loadCts()
//      .then(function() {
//        self.forrest.realizeTrees().then(function() {
//          alert("realized " + this.forrest.trees.length);
//          self.forrest.realizeRelations();
//          self.render();
//        });
//      });
  },

  loadCts: function() {
    var promises = [];
    var self = this;
    Fn.each(Utilities.getTreesheetLinks(), function(block) {
      if (block.type == 'link') {
        var deferred = Q.defer();
        CTS.Utilities.fetchString(block).then(
          function(content) { 
            var spec = CTS.Parser.parseForrestSpec(content, block.format);
            for (var i = 0; i < spec.treeSpecs.length; i++) {
              spec.treeSpecs[i].loadedFrom = block.url;
            }
            self.forrest.addSpec(spec);
            deferred.resolve(); 
          },
          function() {
            CTS.Log.Error("Couldn't fetch string.");
            deferred.reject();
          }
        );
        promises.push(deferred.promise);
      } else if (block.type == 'block') {
        var spec = CTS.Parser.parseForrestSpec(block.content, block.format);
        self.forrest.addSpec(spec);
      }
    }, this);
    return Q.all(promises);
  }

});

CTS.shouldAutoload = function() {
  var foundCtsElement = false;
  var autoload = true;

  // Search through <script> elements to find the CTS element.
  CTS.Fn.each(CTS.$('script'), function(elem) {
    var url = CTS.$(elem).attr('src');
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

CTS.ensureJqueryThenMaybeAutoload = function() {
  if (typeof root.jQuery != 'undefined') {
    CTS.$ = root.jQuery;
    CTS.maybeAutoload();
  } else if ((typeof exports !== 'undefined') && (typeof require == 'function')) {
    // This is only if we're operating inside node.js
    CTS.$ = require('jquery');
    CTS.maybeAutoload();
  } else {
    var s = document.createElement('script');
    s.setAttribute('src', '//ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js');
    s.setAttribute('type', 'text/javascript');
    s.onload = function() {
      CTS.$ = jQuery.noConflict();
      CTS.maybeAutoload();
    };
    document.getElementsByTagName('head')[0].appendChild(s);
  }
};

CTS.maybeAutoload = function() {
  if (CTS.shouldAutoload()) {
    CTS.$(function() {
      CTS.engine = new CTS.Engine();
      CTS.engine.boot();
    });
  }
};

CTS.ensureJqueryThenMaybeAutoload();

}).call(this);
