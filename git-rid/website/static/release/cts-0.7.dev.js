(function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @param {Boolean} jumped
   * @api public
   */

  function require(name, jumped){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require){
    var m = cache[id] = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];

    fn.call(m.exports, function(req){
      var dep = modules[id][1][req];
      return require(dep ? dep : req);
    }, m, m.exports, outer, modules, cache, entries);

    // expose as `name`.
    if (name) cache[name] = cache[id];

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

   return require;
})({
1: [function(require, module, exports) {
/*  Cascading Tree Sheets
 *  ==========================================================================
 */

// This is safe because we're compiling with Duo.
var Util = require('cts/util');

var CTS = {
  VERSION: '0.8.0',
  Constants: {}
};

Util._.extend(CTS.Constants, {
  Domains: {
    server: '//localhost:3000/'
  }
});
Util._.extend(CTS.Constants, {
  Google: {
    ApiKey: 'AIzaSyBpNbbqKrk21n6rI8Nw2R6JSz6faN7OiWc',
    ClientId: '459454183971-3rhp3qnfrdane1hnoa23eom28qoo146f.apps.googleusercontent.com'
  },
  UI: {
  }
});
// // This part is loaded after the constants (part 2).

var enginePackage = require('cts/engine');

CTS.Engine = enginePackage.Engine;
CTS.Factory = enginePackage.Factory;
CTS.Util   = require('cts/util');

// Set up bare minimum functionality that we want available for
// all other files.
// --------------------------------------------------------------------------
CTS.status = {};

// Set some status bits.
CTS.status.libraryLoaded = CTS.loaded = CTS.status.loaded = Util.Promise.defer();
CTS.ready = CTS.status.defaultTreeReady = Util.Promise.defer();

CTS.Epilogue = {};

CTS.Epilogue.maybeAutoload = function() {
  Util.Log.Info("CTS Epilogue: Autoload check...");
  if (Util.Helper.shouldAutoload()) {
    Util.$(function() {
      CTS.engine = new CTS.Engine();
      CTS.engine.boot().then(
        function() {
          Util.Helper.showDocumentBody();
        }
      ).done();
    });
  }
};

CTS.Epilogue.maybeAutoload();

CTS.status.libraryLoaded.resolve();

window.CTS = CTS;
module.exports = CTS;
}, {"cts/util":2,"cts/engine":3}],
2: [function(require, module, exports) {
/**
 * CTS Utilities
 *
 * (C) 2014 Edward Benson
 */
exports._ = require('components/underscore'); // An odd one
exports.$ = require('component/jquery')

exports.Promise = require('./promise');
exports.Events = require('./events');
exports.Helper = require('./helper');
exports.Net = require('./net');

var log = require('./log');

exports.LogLevel = log.LogLevel;
exports.Log = log.Log;

}, {"components/underscore":4,"component/jquery":5,"./promise":6,"./events":7,"./helper":8,"./net":9,"./log":10}],
4: [function(require, module, exports) {
//     Underscore.js 1.7.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.7.0';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var createCallback = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  _.iteratee = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return createCallback(value, context, argCount);
    if (_.isObject(value)) return _.matches(value);
    return _.property(value);
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    if (obj == null) return obj;
    iteratee = createCallback(iteratee, context);
    var i, length = obj.length;
    if (length === +length) {
      for (i = 0; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    if (obj == null) return [];
    iteratee = _.iteratee(iteratee, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index = 0, currentKey;
    if (arguments.length < 3) {
      if (!length) throw new TypeError(reduceError);
      memo = obj[keys ? keys[index++] : index++];
    }
    for (; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== + obj.length && _.keys(obj),
        index = (keys || obj).length,
        currentKey;
    if (arguments.length < 3) {
      if (!index) throw new TypeError(reduceError);
      memo = obj[keys ? keys[--index] : --index];
    }
    while (index--) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    predicate = _.iteratee(predicate, context);
    _.some(obj, function(value, index, list) {
      if (predicate(value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    predicate = _.iteratee(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(_.iteratee(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    if (obj == null) return true;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (obj.length !== +obj.length) obj = _.values(obj);
    return _.indexOf(obj, target) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = low + high >>> 1;
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = _.iteratee(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (!_.isArray(value) && !_.isArguments(value)) {
        if (!strict) output.push(value);
      } else if (shallow) {
        push.apply(output, value);
      } else {
        flatten(value, shallow, strict, output);
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = _.iteratee(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (isSorted) {
        if (!i || seen !== value) result.push(value);
        seen = value;
      } else if (iteratee) {
        var computed = iteratee(value, i, array);
        if (_.indexOf(seen, computed) < 0) {
          seen.push(computed);
          result.push(value);
        }
      } else if (_.indexOf(result, value) < 0) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, true, []);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function(array) {
    if (array == null) return [];
    var length = _.max(arguments, 'length').length;
    var results = Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var idx = array.length;
    if (typeof from == 'number') {
      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
    }
    while (--idx >= 0) if (array[idx] === item) return idx;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var Ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      Ctor.prototype = func.prototype;
      var self = new Ctor;
      Ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (_.isObject(result)) return result;
      return self;
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = hasher ? hasher.apply(this, arguments) : key;
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed before being called N times.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    if (!_.isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj, iteratee, context) {
    var result = {}, key;
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      iteratee = createCallback(iteratee, context);
      for (key in obj) {
        var value = obj[key];
        if (iteratee(value, key, obj)) result[key] = value;
      }
    } else {
      var keys = concat.apply([], slice.call(arguments, 1));
      obj = new Object(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        key = keys[i];
        if (key in obj) result[key] = obj[key];
      }
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    if (!_.isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (
      aCtor !== bCtor &&
      // Handle Object.create(x) cases
      'constructor' in a && 'constructor' in b &&
      !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor)
    ) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size, result;
    // Recursively compare objects and arrays.
    if (className === '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size === b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      size = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      result = _.keys(b).length === size;
      if (result) {
        while (size--) {
          // Deep compare each member
          key = keys[size];
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
  if (typeof /./ !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    var pairs = _.pairs(attrs), length = pairs.length;
    return function(obj) {
      if (obj == null) return !length;
      obj = new Object(obj);
      for (var i = 0; i < length; i++) {
        var pair = pairs[i], key = pair[0];
        if (pair[1] !== obj[key] || !(key in obj)) return false;
      }
      return true;
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = createCallback(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? object[property]() : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

}, {}],
5: [function(require, module, exports) {
/*!
 * jQuery JavaScript Library v1.11.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-05-01T17:42Z
 */

(function( global, factory ) {

  if ( typeof module === "object" && typeof module.exports === "object" ) {
    // For CommonJS and CommonJS-like environments where a proper window is present,
    // execute the factory and get jQuery
    // For environments that do not inherently posses a window with a document
    // (such as Node.js), expose a jQuery-making factory as module.exports
    // This accentuates the need for the creation of a real window
    // e.g. var jQuery = require("jquery")(window);
    // See ticket #14549 for more info
    module.exports = global.document ?
      factory( global, true ) :
      function( w ) {
        if ( !w.document ) {
          throw new Error( "jQuery requires a window with a document" );
        }
        return factory( w );
      };
  } else {
    factory( global );
  }

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//

var deletedIds = [];

var slice = deletedIds.slice;

var concat = deletedIds.concat;

var push = deletedIds.push;

var indexOf = deletedIds.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
  version = "1.11.1",

  // Define a local copy of jQuery
  jQuery = function( selector, context ) {
    // The jQuery object is actually just the init constructor 'enhanced'
    // Need init if jQuery is called (just allow error to be thrown if not included)
    return new jQuery.fn.init( selector, context );
  },

  // Support: Android<4.1, IE<9
  // Make sure we trim BOM and NBSP
  rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

  // Matches dashed string for camelizing
  rmsPrefix = /^-ms-/,
  rdashAlpha = /-([\da-z])/gi,

  // Used by jQuery.camelCase as callback to replace()
  fcamelCase = function( all, letter ) {
    return letter.toUpperCase();
  };

jQuery.fn = jQuery.prototype = {
  // The current version of jQuery being used
  jquery: version,

  constructor: jQuery,

  // Start with an empty selector
  selector: "",

  // The default length of a jQuery object is 0
  length: 0,

  toArray: function() {
    return slice.call( this );
  },

  // Get the Nth element in the matched element set OR
  // Get the whole matched element set as a clean array
  get: function( num ) {
    return num != null ?

      // Return just the one element from the set
      ( num < 0 ? this[ num + this.length ] : this[ num ] ) :

      // Return all the elements in a clean array
      slice.call( this );
  },

  // Take an array of elements and push it onto the stack
  // (returning the new matched element set)
  pushStack: function( elems ) {

    // Build a new jQuery matched element set
    var ret = jQuery.merge( this.constructor(), elems );

    // Add the old object onto the stack (as a reference)
    ret.prevObject = this;
    ret.context = this.context;

    // Return the newly-formed element set
    return ret;
  },

  // Execute a callback for every element in the matched set.
  // (You can seed the arguments with an array of args, but this is
  // only used internally.)
  each: function( callback, args ) {
    return jQuery.each( this, callback, args );
  },

  map: function( callback ) {
    return this.pushStack( jQuery.map(this, function( elem, i ) {
      return callback.call( elem, i, elem );
    }));
  },

  slice: function() {
    return this.pushStack( slice.apply( this, arguments ) );
  },

  first: function() {
    return this.eq( 0 );
  },

  last: function() {
    return this.eq( -1 );
  },

  eq: function( i ) {
    var len = this.length,
      j = +i + ( i < 0 ? len : 0 );
    return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
  },

  end: function() {
    return this.prevObject || this.constructor(null);
  },

  // For internal use only.
  // Behaves like an Array's method, not like a jQuery method.
  push: push,
  sort: deletedIds.sort,
  splice: deletedIds.splice
};

jQuery.extend = jQuery.fn.extend = function() {
  var src, copyIsArray, copy, name, options, clone,
    target = arguments[0] || {},
    i = 1,
    length = arguments.length,
    deep = false;

  // Handle a deep copy situation
  if ( typeof target === "boolean" ) {
    deep = target;

    // skip the boolean and the target
    target = arguments[ i ] || {};
    i++;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
    target = {};
  }

  // extend jQuery itself if only one argument is passed
  if ( i === length ) {
    target = this;
    i--;
  }

  for ( ; i < length; i++ ) {
    // Only deal with non-null/undefined values
    if ( (options = arguments[ i ]) != null ) {
      // Extend the base object
      for ( name in options ) {
        src = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if ( target === copy ) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
          if ( copyIsArray ) {
            copyIsArray = false;
            clone = src && jQuery.isArray(src) ? src : [];

          } else {
            clone = src && jQuery.isPlainObject(src) ? src : {};
          }

          // Never move original objects, clone them
          target[ name ] = jQuery.extend( deep, clone, copy );

        // Don't bring in undefined values
        } else if ( copy !== undefined ) {
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

jQuery.extend({
  // Unique for each copy of jQuery on the page
  expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

  // Assume jQuery is ready without the ready module
  isReady: true,

  error: function( msg ) {
    throw new Error( msg );
  },

  noop: function() {},

  // See test/unit/core.js for details concerning isFunction.
  // Since version 1.3, DOM methods and functions like alert
  // aren't supported. They return false on IE (#2968).
  isFunction: function( obj ) {
    return jQuery.type(obj) === "function";
  },

  isArray: Array.isArray || function( obj ) {
    return jQuery.type(obj) === "array";
  },

  isWindow: function( obj ) {
    /* jshint eqeqeq: false */
    return obj != null && obj == obj.window;
  },

  isNumeric: function( obj ) {
    // parseFloat NaNs numeric-cast false positives (null|true|false|"")
    // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
    // subtraction forces infinities to NaN
    return !jQuery.isArray( obj ) && obj - parseFloat( obj ) >= 0;
  },

  isEmptyObject: function( obj ) {
    var name;
    for ( name in obj ) {
      return false;
    }
    return true;
  },

  isPlainObject: function( obj ) {
    var key;

    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don't pass through, as well
    if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
      return false;
    }

    try {
      // Not own constructor property must be Object
      if ( obj.constructor &&
        !hasOwn.call(obj, "constructor") &&
        !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
        return false;
      }
    } catch ( e ) {
      // IE8,9 Will throw exceptions on certain host objects #9897
      return false;
    }

    // Support: IE<9
    // Handle iteration over inherited properties before own properties.
    if ( support.ownLast ) {
      for ( key in obj ) {
        return hasOwn.call( obj, key );
      }
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.
    for ( key in obj ) {}

    return key === undefined || hasOwn.call( obj, key );
  },

  type: function( obj ) {
    if ( obj == null ) {
      return obj + "";
    }
    return typeof obj === "object" || typeof obj === "function" ?
      class2type[ toString.call(obj) ] || "object" :
      typeof obj;
  },

  // Evaluates a script in a global context
  // Workarounds based on findings by Jim Driscoll
  // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
  globalEval: function( data ) {
    if ( data && jQuery.trim( data ) ) {
      // We use execScript on Internet Explorer
      // We use an anonymous function so that context is window
      // rather than jQuery in Firefox
      ( window.execScript || function( data ) {
        window[ "eval" ].call( window, data );
      } )( data );
    }
  },

  // Convert dashed to camelCase; used by the css and data modules
  // Microsoft forgot to hump their vendor prefix (#9572)
  camelCase: function( string ) {
    return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
  },

  nodeName: function( elem, name ) {
    return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
  },

  // args is for internal usage only
  each: function( obj, callback, args ) {
    var value,
      i = 0,
      length = obj.length,
      isArray = isArraylike( obj );

    if ( args ) {
      if ( isArray ) {
        for ( ; i < length; i++ ) {
          value = callback.apply( obj[ i ], args );

          if ( value === false ) {
            break;
          }
        }
      } else {
        for ( i in obj ) {
          value = callback.apply( obj[ i ], args );

          if ( value === false ) {
            break;
          }
        }
      }

    // A special, fast, case for the most common use of each
    } else {
      if ( isArray ) {
        for ( ; i < length; i++ ) {
          value = callback.call( obj[ i ], i, obj[ i ] );

          if ( value === false ) {
            break;
          }
        }
      } else {
        for ( i in obj ) {
          value = callback.call( obj[ i ], i, obj[ i ] );

          if ( value === false ) {
            break;
          }
        }
      }
    }

    return obj;
  },

  // Support: Android<4.1, IE<9
  trim: function( text ) {
    return text == null ?
      "" :
      ( text + "" ).replace( rtrim, "" );
  },

  // results is for internal usage only
  makeArray: function( arr, results ) {
    var ret = results || [];

    if ( arr != null ) {
      if ( isArraylike( Object(arr) ) ) {
        jQuery.merge( ret,
          typeof arr === "string" ?
          [ arr ] : arr
        );
      } else {
        push.call( ret, arr );
      }
    }

    return ret;
  },

  inArray: function( elem, arr, i ) {
    var len;

    if ( arr ) {
      if ( indexOf ) {
        return indexOf.call( arr, elem, i );
      }

      len = arr.length;
      i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

      for ( ; i < len; i++ ) {
        // Skip accessing in sparse arrays
        if ( i in arr && arr[ i ] === elem ) {
          return i;
        }
      }
    }

    return -1;
  },

  merge: function( first, second ) {
    var len = +second.length,
      j = 0,
      i = first.length;

    while ( j < len ) {
      first[ i++ ] = second[ j++ ];
    }

    // Support: IE<9
    // Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)
    if ( len !== len ) {
      while ( second[j] !== undefined ) {
        first[ i++ ] = second[ j++ ];
      }
    }

    first.length = i;

    return first;
  },

  grep: function( elems, callback, invert ) {
    var callbackInverse,
      matches = [],
      i = 0,
      length = elems.length,
      callbackExpect = !invert;

    // Go through the array, only saving the items
    // that pass the validator function
    for ( ; i < length; i++ ) {
      callbackInverse = !callback( elems[ i ], i );
      if ( callbackInverse !== callbackExpect ) {
        matches.push( elems[ i ] );
      }
    }

    return matches;
  },

  // arg is for internal usage only
  map: function( elems, callback, arg ) {
    var value,
      i = 0,
      length = elems.length,
      isArray = isArraylike( elems ),
      ret = [];

    // Go through the array, translating each of the items to their new values
    if ( isArray ) {
      for ( ; i < length; i++ ) {
        value = callback( elems[ i ], i, arg );

        if ( value != null ) {
          ret.push( value );
        }
      }

    // Go through every key on the object,
    } else {
      for ( i in elems ) {
        value = callback( elems[ i ], i, arg );

        if ( value != null ) {
          ret.push( value );
        }
      }
    }

    // Flatten any nested arrays
    return concat.apply( [], ret );
  },

  // A global GUID counter for objects
  guid: 1,

  // Bind a function to a context, optionally partially applying any
  // arguments.
  proxy: function( fn, context ) {
    var args, proxy, tmp;

    if ( typeof context === "string" ) {
      tmp = fn[ context ];
      context = fn;
      fn = tmp;
    }

    // Quick check to determine if target is callable, in the spec
    // this throws a TypeError, but we will just return undefined.
    if ( !jQuery.isFunction( fn ) ) {
      return undefined;
    }

    // Simulated bind
    args = slice.call( arguments, 2 );
    proxy = function() {
      return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
    };

    // Set the guid of unique handler to the same of original handler, so it can be removed
    proxy.guid = fn.guid = fn.guid || jQuery.guid++;

    return proxy;
  },

  now: function() {
    return +( new Date() );
  },

  // jQuery.support is not used in Core but other projects attach their
  // properties to it so it needs to exist.
  support: support
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
  class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
  var length = obj.length,
    type = jQuery.type( obj );

  if ( type === "function" || jQuery.isWindow( obj ) ) {
    return false;
  }

  if ( obj.nodeType === 1 && length ) {
    return true;
  }

  return type === "array" || length === 0 ||
    typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v1.10.19
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-04-18
 */
(function( window ) {

var i,
  support,
  Expr,
  getText,
  isXML,
  tokenize,
  compile,
  select,
  outermostContext,
  sortInput,
  hasDuplicate,

  // Local document vars
  setDocument,
  document,
  docElem,
  documentIsHTML,
  rbuggyQSA,
  rbuggyMatches,
  matches,
  contains,

  // Instance-specific data
  expando = "sizzle" + -(new Date()),
  preferredDoc = window.document,
  dirruns = 0,
  done = 0,
  classCache = createCache(),
  tokenCache = createCache(),
  compilerCache = createCache(),
  sortOrder = function( a, b ) {
    if ( a === b ) {
      hasDuplicate = true;
    }
    return 0;
  },

  // General-purpose constants
  strundefined = typeof undefined,
  MAX_NEGATIVE = 1 << 31,

  // Instance methods
  hasOwn = ({}).hasOwnProperty,
  arr = [],
  pop = arr.pop,
  push_native = arr.push,
  push = arr.push,
  slice = arr.slice,
  // Use a stripped-down indexOf if we can't use a native one
  indexOf = arr.indexOf || function( elem ) {
    var i = 0,
      len = this.length;
    for ( ; i < len; i++ ) {
      if ( this[i] === elem ) {
        return i;
      }
    }
    return -1;
  },

  booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

  // Regular expressions

  // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
  whitespace = "[\\x20\\t\\r\\n\\f]",
  // http://www.w3.org/TR/css3-syntax/#characters
  characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

  // Loosely modeled on CSS identifier characters
  // An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
  // Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
  identifier = characterEncoding.replace( "w", "w#" ),

  // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
  attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace +
    // Operator (capture 2)
    "*([*^$|!~]?=)" + whitespace +
    // "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
    "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
    "*\\]",

  pseudos = ":(" + characterEncoding + ")(?:\\((" +
    // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
    // 1. quoted (capture 3; capture 4 or capture 5)
    "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
    // 2. simple (capture 6)
    "((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
    // 3. anything else (capture 2)
    ".*" +
    ")\\)|)",

  // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
  rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

  rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
  rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

  rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

  rpseudo = new RegExp( pseudos ),
  ridentifier = new RegExp( "^" + identifier + "$" ),

  matchExpr = {
    "ID": new RegExp( "^#(" + characterEncoding + ")" ),
    "CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
    "TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
    "ATTR": new RegExp( "^" + attributes ),
    "PSEUDO": new RegExp( "^" + pseudos ),
    "CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
      "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
      "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
    "bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
    // For use in libraries implementing .is()
    // We use this for POS matching in `select`
    "needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
      whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
  },

  rinputs = /^(?:input|select|textarea|button)$/i,
  rheader = /^h\d$/i,

  rnative = /^[^{]+\{\s*\[native \w/,

  // Easily-parseable/retrievable ID or TAG or CLASS selectors
  rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

  rsibling = /[+~]/,
  rescape = /'|\\/g,

  // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
  runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
  funescape = function( _, escaped, escapedWhitespace ) {
    var high = "0x" + escaped - 0x10000;
    // NaN means non-codepoint
    // Support: Firefox<24
    // Workaround erroneous numeric interpretation of +"0x"
    return high !== high || escapedWhitespace ?
      escaped :
      high < 0 ?
        // BMP codepoint
        String.fromCharCode( high + 0x10000 ) :
        // Supplemental Plane codepoint (surrogate pair)
        String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
  };

// Optimize for push.apply( _, NodeList )
try {
  push.apply(
    (arr = slice.call( preferredDoc.childNodes )),
    preferredDoc.childNodes
  );
  // Support: Android<4.0
  // Detect silently failing push.apply
  arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
  push = { apply: arr.length ?

    // Leverage slice if possible
    function( target, els ) {
      push_native.apply( target, slice.call(els) );
    } :

    // Support: IE<9
    // Otherwise append directly
    function( target, els ) {
      var j = target.length,
        i = 0;
      // Can't trust NodeList.length
      while ( (target[j++] = els[i++]) ) {}
      target.length = j - 1;
    }
  };
}

function Sizzle( selector, context, results, seed ) {
  var match, elem, m, nodeType,
    // QSA vars
    i, groups, old, nid, newContext, newSelector;

  if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
    setDocument( context );
  }

  context = context || document;
  results = results || [];

  if ( !selector || typeof selector !== "string" ) {
    return results;
  }

  if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
    return [];
  }

  if ( documentIsHTML && !seed ) {

    // Shortcuts
    if ( (match = rquickExpr.exec( selector )) ) {
      // Speed-up: Sizzle("#ID")
      if ( (m = match[1]) ) {
        if ( nodeType === 9 ) {
          elem = context.getElementById( m );
          // Check parentNode to catch when Blackberry 4.6 returns
          // nodes that are no longer in the document (jQuery #6963)
          if ( elem && elem.parentNode ) {
            // Handle the case where IE, Opera, and Webkit return items
            // by name instead of ID
            if ( elem.id === m ) {
              results.push( elem );
              return results;
            }
          } else {
            return results;
          }
        } else {
          // Context is not a document
          if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
            contains( context, elem ) && elem.id === m ) {
            results.push( elem );
            return results;
          }
        }

      // Speed-up: Sizzle("TAG")
      } else if ( match[2] ) {
        push.apply( results, context.getElementsByTagName( selector ) );
        return results;

      // Speed-up: Sizzle(".CLASS")
      } else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
        push.apply( results, context.getElementsByClassName( m ) );
        return results;
      }
    }

    // QSA path
    if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
      nid = old = expando;
      newContext = context;
      newSelector = nodeType === 9 && selector;

      // qSA works strangely on Element-rooted queries
      // We can work around this by specifying an extra ID on the root
      // and working up from there (Thanks to Andrew Dupont for the technique)
      // IE 8 doesn't work on object elements
      if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
        groups = tokenize( selector );

        if ( (old = context.getAttribute("id")) ) {
          nid = old.replace( rescape, "\\$&" );
        } else {
          context.setAttribute( "id", nid );
        }
        nid = "[id='" + nid + "'] ";

        i = groups.length;
        while ( i-- ) {
          groups[i] = nid + toSelector( groups[i] );
        }
        newContext = rsibling.test( selector ) && testContext( context.parentNode ) || context;
        newSelector = groups.join(",");
      }

      if ( newSelector ) {
        try {
          push.apply( results,
            newContext.querySelectorAll( newSelector )
          );
          return results;
        } catch(qsaError) {
        } finally {
          if ( !old ) {
            context.removeAttribute("id");
          }
        }
      }
    }
  }

  // All others
  return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *  property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *  deleting the oldest entry
 */
function createCache() {
  var keys = [];

  function cache( key, value ) {
    // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
    if ( keys.push( key + " " ) > Expr.cacheLength ) {
      // Only keep the most recent entries
      delete cache[ keys.shift() ];
    }
    return (cache[ key + " " ] = value);
  }
  return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
  fn[ expando ] = true;
  return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
  var div = document.createElement("div");

  try {
    return !!fn( div );
  } catch (e) {
    return false;
  } finally {
    // Remove from its parent by default
    if ( div.parentNode ) {
      div.parentNode.removeChild( div );
    }
    // release memory in IE
    div = null;
  }
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
  var arr = attrs.split("|"),
    i = attrs.length;

  while ( i-- ) {
    Expr.attrHandle[ arr[i] ] = handler;
  }
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
  var cur = b && a,
    diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
      ( ~b.sourceIndex || MAX_NEGATIVE ) -
      ( ~a.sourceIndex || MAX_NEGATIVE );

  // Use IE sourceIndex if available on both nodes
  if ( diff ) {
    return diff;
  }

  // Check if b follows a
  if ( cur ) {
    while ( (cur = cur.nextSibling) ) {
      if ( cur === b ) {
        return -1;
      }
    }
  }

  return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
  return function( elem ) {
    var name = elem.nodeName.toLowerCase();
    return name === "input" && elem.type === type;
  };
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
  return function( elem ) {
    var name = elem.nodeName.toLowerCase();
    return (name === "input" || name === "button") && elem.type === type;
  };
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
  return markFunction(function( argument ) {
    argument = +argument;
    return markFunction(function( seed, matches ) {
      var j,
        matchIndexes = fn( [], seed.length, argument ),
        i = matchIndexes.length;

      // Match elements found at the specified indexes
      while ( i-- ) {
        if ( seed[ (j = matchIndexes[i]) ] ) {
          seed[j] = !(matches[j] = seed[j]);
        }
      }
    });
  });
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
  return context && typeof context.getElementsByTagName !== strundefined && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
  // documentElement is verified for cases where it doesn't yet exist
  // (such as loading iframes in IE - #4833)
  var documentElement = elem && (elem.ownerDocument || elem).documentElement;
  return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
  var hasCompare,
    doc = node ? node.ownerDocument || node : preferredDoc,
    parent = doc.defaultView;

  // If no document and documentElement is available, return
  if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
    return document;
  }

  // Set our document
  document = doc;
  docElem = doc.documentElement;

  // Support tests
  documentIsHTML = !isXML( doc );

  // Support: IE>8
  // If iframe document is assigned to "document" variable and if iframe has been reloaded,
  // IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
  // IE6-8 do not support the defaultView property so parent will be undefined
  if ( parent && parent !== parent.top ) {
    // IE11 does not have attachEvent, so all must suffer
    if ( parent.addEventListener ) {
      parent.addEventListener( "unload", function() {
        setDocument();
      }, false );
    } else if ( parent.attachEvent ) {
      parent.attachEvent( "onunload", function() {
        setDocument();
      });
    }
  }

  /* Attributes
  ---------------------------------------------------------------------- */

  // Support: IE<8
  // Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
  support.attributes = assert(function( div ) {
    div.className = "i";
    return !div.getAttribute("className");
  });

  /* getElement(s)By*
  ---------------------------------------------------------------------- */

  // Check if getElementsByTagName("*") returns only elements
  support.getElementsByTagName = assert(function( div ) {
    div.appendChild( doc.createComment("") );
    return !div.getElementsByTagName("*").length;
  });

  // Check if getElementsByClassName can be trusted
  support.getElementsByClassName = rnative.test( doc.getElementsByClassName ) && assert(function( div ) {
    div.innerHTML = "<div class='a'></div><div class='a i'></div>";

    // Support: Safari<4
    // Catch class over-caching
    div.firstChild.className = "i";
    // Support: Opera<10
    // Catch gEBCN failure to find non-leading classes
    return div.getElementsByClassName("i").length === 2;
  });

  // Support: IE<10
  // Check if getElementById returns elements by name
  // The broken getElementById methods don't pick up programatically-set names,
  // so use a roundabout getElementsByName test
  support.getById = assert(function( div ) {
    docElem.appendChild( div ).id = expando;
    return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
  });

  // ID find and filter
  if ( support.getById ) {
    Expr.find["ID"] = function( id, context ) {
      if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
        var m = context.getElementById( id );
        // Check parentNode to catch when Blackberry 4.6 returns
        // nodes that are no longer in the document #6963
        return m && m.parentNode ? [ m ] : [];
      }
    };
    Expr.filter["ID"] = function( id ) {
      var attrId = id.replace( runescape, funescape );
      return function( elem ) {
        return elem.getAttribute("id") === attrId;
      };
    };
  } else {
    // Support: IE6/7
    // getElementById is not reliable as a find shortcut
    delete Expr.find["ID"];

    Expr.filter["ID"] =  function( id ) {
      var attrId = id.replace( runescape, funescape );
      return function( elem ) {
        var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
        return node && node.value === attrId;
      };
    };
  }

  // Tag
  Expr.find["TAG"] = support.getElementsByTagName ?
    function( tag, context ) {
      if ( typeof context.getElementsByTagName !== strundefined ) {
        return context.getElementsByTagName( tag );
      }
    } :
    function( tag, context ) {
      var elem,
        tmp = [],
        i = 0,
        results = context.getElementsByTagName( tag );

      // Filter out possible comments
      if ( tag === "*" ) {
        while ( (elem = results[i++]) ) {
          if ( elem.nodeType === 1 ) {
            tmp.push( elem );
          }
        }

        return tmp;
      }
      return results;
    };

  // Class
  Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
    if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
      return context.getElementsByClassName( className );
    }
  };

  /* QSA/matchesSelector
  ---------------------------------------------------------------------- */

  // QSA and matchesSelector support

  // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
  rbuggyMatches = [];

  // qSa(:focus) reports false when true (Chrome 21)
  // We allow this because of a bug in IE8/9 that throws an error
  // whenever `document.activeElement` is accessed on an iframe
  // So, we allow :focus to pass through QSA all the time to avoid the IE error
  // See http://bugs.jquery.com/ticket/13378
  rbuggyQSA = [];

  if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
    // Build QSA regex
    // Regex strategy adopted from Diego Perini
    assert(function( div ) {
      // Select is set to empty string on purpose
      // This is to test IE's treatment of not explicitly
      // setting a boolean content attribute,
      // since its presence should be enough
      // http://bugs.jquery.com/ticket/12359
      div.innerHTML = "<select msallowclip=''><option selected=''></option></select>";

      // Support: IE8, Opera 11-12.16
      // Nothing should be selected when empty strings follow ^= or $= or *=
      // The test attribute must be unknown in Opera but "safe" for WinRT
      // http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
      if ( div.querySelectorAll("[msallowclip^='']").length ) {
        rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
      }

      // Support: IE8
      // Boolean attributes and "value" are not treated correctly
      if ( !div.querySelectorAll("[selected]").length ) {
        rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
      }

      // Webkit/Opera - :checked should return selected option elements
      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
      // IE8 throws error here and will not see later tests
      if ( !div.querySelectorAll(":checked").length ) {
        rbuggyQSA.push(":checked");
      }
    });

    assert(function( div ) {
      // Support: Windows 8 Native Apps
      // The type and name attributes are restricted during .innerHTML assignment
      var input = doc.createElement("input");
      input.setAttribute( "type", "hidden" );
      div.appendChild( input ).setAttribute( "name", "D" );

      // Support: IE8
      // Enforce case-sensitivity of name attribute
      if ( div.querySelectorAll("[name=d]").length ) {
        rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
      }

      // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
      // IE8 throws error here and will not see later tests
      if ( !div.querySelectorAll(":enabled").length ) {
        rbuggyQSA.push( ":enabled", ":disabled" );
      }

      // Opera 10-11 does not throw on post-comma invalid pseudos
      div.querySelectorAll("*,:x");
      rbuggyQSA.push(",.*:");
    });
  }

  if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
    docElem.webkitMatchesSelector ||
    docElem.mozMatchesSelector ||
    docElem.oMatchesSelector ||
    docElem.msMatchesSelector) )) ) {

    assert(function( div ) {
      // Check to see if it's possible to do matchesSelector
      // on a disconnected node (IE 9)
      support.disconnectedMatch = matches.call( div, "div" );

      // This should fail with an exception
      // Gecko does not error, returns false instead
      matches.call( div, "[s!='']:x" );
      rbuggyMatches.push( "!=", pseudos );
    });
  }

  rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
  rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

  /* Contains
  ---------------------------------------------------------------------- */
  hasCompare = rnative.test( docElem.compareDocumentPosition );

  // Element contains another
  // Purposefully does not implement inclusive descendent
  // As in, an element does not contain itself
  contains = hasCompare || rnative.test( docElem.contains ) ?
    function( a, b ) {
      var adown = a.nodeType === 9 ? a.documentElement : a,
        bup = b && b.parentNode;
      return a === bup || !!( bup && bup.nodeType === 1 && (
        adown.contains ?
          adown.contains( bup ) :
          a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
      ));
    } :
    function( a, b ) {
      if ( b ) {
        while ( (b = b.parentNode) ) {
          if ( b === a ) {
            return true;
          }
        }
      }
      return false;
    };

  /* Sorting
  ---------------------------------------------------------------------- */

  // Document order sorting
  sortOrder = hasCompare ?
  function( a, b ) {

    // Flag for duplicate removal
    if ( a === b ) {
      hasDuplicate = true;
      return 0;
    }

    // Sort on method existence if only one input has compareDocumentPosition
    var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
    if ( compare ) {
      return compare;
    }

    // Calculate position if both inputs belong to the same document
    compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
      a.compareDocumentPosition( b ) :

      // Otherwise we know they are disconnected
      1;

    // Disconnected nodes
    if ( compare & 1 ||
      (!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

      // Choose the first element that is related to our preferred document
      if ( a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
        return -1;
      }
      if ( b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
        return 1;
      }

      // Maintain original order
      return sortInput ?
        ( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
        0;
    }

    return compare & 4 ? -1 : 1;
  } :
  function( a, b ) {
    // Exit early if the nodes are identical
    if ( a === b ) {
      hasDuplicate = true;
      return 0;
    }

    var cur,
      i = 0,
      aup = a.parentNode,
      bup = b.parentNode,
      ap = [ a ],
      bp = [ b ];

    // Parentless nodes are either documents or disconnected
    if ( !aup || !bup ) {
      return a === doc ? -1 :
        b === doc ? 1 :
        aup ? -1 :
        bup ? 1 :
        sortInput ?
        ( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
        0;

    // If the nodes are siblings, we can do a quick check
    } else if ( aup === bup ) {
      return siblingCheck( a, b );
    }

    // Otherwise we need full lists of their ancestors for comparison
    cur = a;
    while ( (cur = cur.parentNode) ) {
      ap.unshift( cur );
    }
    cur = b;
    while ( (cur = cur.parentNode) ) {
      bp.unshift( cur );
    }

    // Walk down the tree looking for a discrepancy
    while ( ap[i] === bp[i] ) {
      i++;
    }

    return i ?
      // Do a sibling check if the nodes have a common ancestor
      siblingCheck( ap[i], bp[i] ) :

      // Otherwise nodes in our document sort first
      ap[i] === preferredDoc ? -1 :
      bp[i] === preferredDoc ? 1 :
      0;
  };

  return doc;
};

Sizzle.matches = function( expr, elements ) {
  return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
  // Set document vars if needed
  if ( ( elem.ownerDocument || elem ) !== document ) {
    setDocument( elem );
  }

  // Make sure that attribute selectors are quoted
  expr = expr.replace( rattributeQuotes, "='$1']" );

  if ( support.matchesSelector && documentIsHTML &&
    ( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
    ( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

    try {
      var ret = matches.call( elem, expr );

      // IE 9's matchesSelector returns false on disconnected nodes
      if ( ret || support.disconnectedMatch ||
          // As well, disconnected nodes are said to be in a document
          // fragment in IE 9
          elem.document && elem.document.nodeType !== 11 ) {
        return ret;
      }
    } catch(e) {}
  }

  return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
  // Set document vars if needed
  if ( ( context.ownerDocument || context ) !== document ) {
    setDocument( context );
  }
  return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
  // Set document vars if needed
  if ( ( elem.ownerDocument || elem ) !== document ) {
    setDocument( elem );
  }

  var fn = Expr.attrHandle[ name.toLowerCase() ],
    // Don't get fooled by Object.prototype properties (jQuery #13807)
    val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
      fn( elem, name, !documentIsHTML ) :
      undefined;

  return val !== undefined ?
    val :
    support.attributes || !documentIsHTML ?
      elem.getAttribute( name ) :
      (val = elem.getAttributeNode(name)) && val.specified ?
        val.value :
        null;
};

Sizzle.error = function( msg ) {
  throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
  var elem,
    duplicates = [],
    j = 0,
    i = 0;

  // Unless we *know* we can detect duplicates, assume their presence
  hasDuplicate = !support.detectDuplicates;
  sortInput = !support.sortStable && results.slice( 0 );
  results.sort( sortOrder );

  if ( hasDuplicate ) {
    while ( (elem = results[i++]) ) {
      if ( elem === results[ i ] ) {
        j = duplicates.push( i );
      }
    }
    while ( j-- ) {
      results.splice( duplicates[ j ], 1 );
    }
  }

  // Clear input after sorting to release objects
  // See https://github.com/jquery/sizzle/pull/225
  sortInput = null;

  return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
  var node,
    ret = "",
    i = 0,
    nodeType = elem.nodeType;

  if ( !nodeType ) {
    // If no nodeType, this is expected to be an array
    while ( (node = elem[i++]) ) {
      // Do not traverse comment nodes
      ret += getText( node );
    }
  } else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
    // Use textContent for elements
    // innerText usage removed for consistency of new lines (jQuery #11153)
    if ( typeof elem.textContent === "string" ) {
      return elem.textContent;
    } else {
      // Traverse its children
      for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
        ret += getText( elem );
      }
    }
  } else if ( nodeType === 3 || nodeType === 4 ) {
    return elem.nodeValue;
  }
  // Do not include comment or processing instruction nodes

  return ret;
};

Expr = Sizzle.selectors = {

  // Can be adjusted by the user
  cacheLength: 50,

  createPseudo: markFunction,

  match: matchExpr,

  attrHandle: {},

  find: {},

  relative: {
    ">": { dir: "parentNode", first: true },
    " ": { dir: "parentNode" },
    "+": { dir: "previousSibling", first: true },
    "~": { dir: "previousSibling" }
  },

  preFilter: {
    "ATTR": function( match ) {
      match[1] = match[1].replace( runescape, funescape );

      // Move the given value to match[3] whether quoted or unquoted
      match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

      if ( match[2] === "~=" ) {
        match[3] = " " + match[3] + " ";
      }

      return match.slice( 0, 4 );
    },

    "CHILD": function( match ) {
      /* matches from matchExpr["CHILD"]
        1 type (only|nth|...)
        2 what (child|of-type)
        3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
        4 xn-component of xn+y argument ([+-]?\d*n|)
        5 sign of xn-component
        6 x of xn-component
        7 sign of y-component
        8 y of y-component
      */
      match[1] = match[1].toLowerCase();

      if ( match[1].slice( 0, 3 ) === "nth" ) {
        // nth-* requires argument
        if ( !match[3] ) {
          Sizzle.error( match[0] );
        }

        // numeric x and y parameters for Expr.filter.CHILD
        // remember that false/true cast respectively to 0/1
        match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
        match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

      // other types prohibit arguments
      } else if ( match[3] ) {
        Sizzle.error( match[0] );
      }

      return match;
    },

    "PSEUDO": function( match ) {
      var excess,
        unquoted = !match[6] && match[2];

      if ( matchExpr["CHILD"].test( match[0] ) ) {
        return null;
      }

      // Accept quoted arguments as-is
      if ( match[3] ) {
        match[2] = match[4] || match[5] || "";

      // Strip excess characters from unquoted arguments
      } else if ( unquoted && rpseudo.test( unquoted ) &&
        // Get excess from tokenize (recursively)
        (excess = tokenize( unquoted, true )) &&
        // advance to the next closing parenthesis
        (excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

        // excess is a negative index
        match[0] = match[0].slice( 0, excess );
        match[2] = unquoted.slice( 0, excess );
      }

      // Return only captures needed by the pseudo filter method (type and argument)
      return match.slice( 0, 3 );
    }
  },

  filter: {

    "TAG": function( nodeNameSelector ) {
      var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
      return nodeNameSelector === "*" ?
        function() { return true; } :
        function( elem ) {
          return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
        };
    },

    "CLASS": function( className ) {
      var pattern = classCache[ className + " " ];

      return pattern ||
        (pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
        classCache( className, function( elem ) {
          return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
        });
    },

    "ATTR": function( name, operator, check ) {
      return function( elem ) {
        var result = Sizzle.attr( elem, name );

        if ( result == null ) {
          return operator === "!=";
        }
        if ( !operator ) {
          return true;
        }

        result += "";

        return operator === "=" ? result === check :
          operator === "!=" ? result !== check :
          operator === "^=" ? check && result.indexOf( check ) === 0 :
          operator === "*=" ? check && result.indexOf( check ) > -1 :
          operator === "$=" ? check && result.slice( -check.length ) === check :
          operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
          operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
          false;
      };
    },

    "CHILD": function( type, what, argument, first, last ) {
      var simple = type.slice( 0, 3 ) !== "nth",
        forward = type.slice( -4 ) !== "last",
        ofType = what === "of-type";

      return first === 1 && last === 0 ?

        // Shortcut for :nth-*(n)
        function( elem ) {
          return !!elem.parentNode;
        } :

        function( elem, context, xml ) {
          var cache, outerCache, node, diff, nodeIndex, start,
            dir = simple !== forward ? "nextSibling" : "previousSibling",
            parent = elem.parentNode,
            name = ofType && elem.nodeName.toLowerCase(),
            useCache = !xml && !ofType;

          if ( parent ) {

            // :(first|last|only)-(child|of-type)
            if ( simple ) {
              while ( dir ) {
                node = elem;
                while ( (node = node[ dir ]) ) {
                  if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
                    return false;
                  }
                }
                // Reverse direction for :only-* (if we haven't yet done so)
                start = dir = type === "only" && !start && "nextSibling";
              }
              return true;
            }

            start = [ forward ? parent.firstChild : parent.lastChild ];

            // non-xml :nth-child(...) stores cache data on `parent`
            if ( forward && useCache ) {
              // Seek `elem` from a previously-cached index
              outerCache = parent[ expando ] || (parent[ expando ] = {});
              cache = outerCache[ type ] || [];
              nodeIndex = cache[0] === dirruns && cache[1];
              diff = cache[0] === dirruns && cache[2];
              node = nodeIndex && parent.childNodes[ nodeIndex ];

              while ( (node = ++nodeIndex && node && node[ dir ] ||

                // Fallback to seeking `elem` from the start
                (diff = nodeIndex = 0) || start.pop()) ) {

                // When found, cache indexes on `parent` and break
                if ( node.nodeType === 1 && ++diff && node === elem ) {
                  outerCache[ type ] = [ dirruns, nodeIndex, diff ];
                  break;
                }
              }

            // Use previously-cached element index if available
            } else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
              diff = cache[1];

            // xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
            } else {
              // Use the same loop as above to seek `elem` from the start
              while ( (node = ++nodeIndex && node && node[ dir ] ||
                (diff = nodeIndex = 0) || start.pop()) ) {

                if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
                  // Cache the index of each encountered element
                  if ( useCache ) {
                    (node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
                  }

                  if ( node === elem ) {
                    break;
                  }
                }
              }
            }

            // Incorporate the offset, then check against cycle size
            diff -= last;
            return diff === first || ( diff % first === 0 && diff / first >= 0 );
          }
        };
    },

    "PSEUDO": function( pseudo, argument ) {
      // pseudo-class names are case-insensitive
      // http://www.w3.org/TR/selectors/#pseudo-classes
      // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
      // Remember that setFilters inherits from pseudos
      var args,
        fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
          Sizzle.error( "unsupported pseudo: " + pseudo );

      // The user may use createPseudo to indicate that
      // arguments are needed to create the filter function
      // just as Sizzle does
      if ( fn[ expando ] ) {
        return fn( argument );
      }

      // But maintain support for old signatures
      if ( fn.length > 1 ) {
        args = [ pseudo, pseudo, "", argument ];
        return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
          markFunction(function( seed, matches ) {
            var idx,
              matched = fn( seed, argument ),
              i = matched.length;
            while ( i-- ) {
              idx = indexOf.call( seed, matched[i] );
              seed[ idx ] = !( matches[ idx ] = matched[i] );
            }
          }) :
          function( elem ) {
            return fn( elem, 0, args );
          };
      }

      return fn;
    }
  },

  pseudos: {
    // Potentially complex pseudos
    "not": markFunction(function( selector ) {
      // Trim the selector passed to compile
      // to avoid treating leading and trailing
      // spaces as combinators
      var input = [],
        results = [],
        matcher = compile( selector.replace( rtrim, "$1" ) );

      return matcher[ expando ] ?
        markFunction(function( seed, matches, context, xml ) {
          var elem,
            unmatched = matcher( seed, null, xml, [] ),
            i = seed.length;

          // Match elements unmatched by `matcher`
          while ( i-- ) {
            if ( (elem = unmatched[i]) ) {
              seed[i] = !(matches[i] = elem);
            }
          }
        }) :
        function( elem, context, xml ) {
          input[0] = elem;
          matcher( input, null, xml, results );
          return !results.pop();
        };
    }),

    "has": markFunction(function( selector ) {
      return function( elem ) {
        return Sizzle( selector, elem ).length > 0;
      };
    }),

    "contains": markFunction(function( text ) {
      return function( elem ) {
        return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
      };
    }),

    // "Whether an element is represented by a :lang() selector
    // is based solely on the element's language value
    // being equal to the identifier C,
    // or beginning with the identifier C immediately followed by "-".
    // The matching of C against the element's language value is performed case-insensitively.
    // The identifier C does not have to be a valid language name."
    // http://www.w3.org/TR/selectors/#lang-pseudo
    "lang": markFunction( function( lang ) {
      // lang value must be a valid identifier
      if ( !ridentifier.test(lang || "") ) {
        Sizzle.error( "unsupported lang: " + lang );
      }
      lang = lang.replace( runescape, funescape ).toLowerCase();
      return function( elem ) {
        var elemLang;
        do {
          if ( (elemLang = documentIsHTML ?
            elem.lang :
            elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

            elemLang = elemLang.toLowerCase();
            return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
          }
        } while ( (elem = elem.parentNode) && elem.nodeType === 1 );
        return false;
      };
    }),

    // Miscellaneous
    "target": function( elem ) {
      var hash = window.location && window.location.hash;
      return hash && hash.slice( 1 ) === elem.id;
    },

    "root": function( elem ) {
      return elem === docElem;
    },

    "focus": function( elem ) {
      return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
    },

    // Boolean properties
    "enabled": function( elem ) {
      return elem.disabled === false;
    },

    "disabled": function( elem ) {
      return elem.disabled === true;
    },

    "checked": function( elem ) {
      // In CSS3, :checked should return both checked and selected elements
      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
      var nodeName = elem.nodeName.toLowerCase();
      return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
    },

    "selected": function( elem ) {
      // Accessing this property makes selected-by-default
      // options in Safari work properly
      if ( elem.parentNode ) {
        elem.parentNode.selectedIndex;
      }

      return elem.selected === true;
    },

    // Contents
    "empty": function( elem ) {
      // http://www.w3.org/TR/selectors/#empty-pseudo
      // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
      //   but not by others (comment: 8; processing instruction: 7; etc.)
      // nodeType < 6 works because attributes (2) do not appear as children
      for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
        if ( elem.nodeType < 6 ) {
          return false;
        }
      }
      return true;
    },

    "parent": function( elem ) {
      return !Expr.pseudos["empty"]( elem );
    },

    // Element/input types
    "header": function( elem ) {
      return rheader.test( elem.nodeName );
    },

    "input": function( elem ) {
      return rinputs.test( elem.nodeName );
    },

    "button": function( elem ) {
      var name = elem.nodeName.toLowerCase();
      return name === "input" && elem.type === "button" || name === "button";
    },

    "text": function( elem ) {
      var attr;
      return elem.nodeName.toLowerCase() === "input" &&
        elem.type === "text" &&

        // Support: IE<8
        // New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
        ( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
    },

    // Position-in-collection
    "first": createPositionalPseudo(function() {
      return [ 0 ];
    }),

    "last": createPositionalPseudo(function( matchIndexes, length ) {
      return [ length - 1 ];
    }),

    "eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
      return [ argument < 0 ? argument + length : argument ];
    }),

    "even": createPositionalPseudo(function( matchIndexes, length ) {
      var i = 0;
      for ( ; i < length; i += 2 ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    }),

    "odd": createPositionalPseudo(function( matchIndexes, length ) {
      var i = 1;
      for ( ; i < length; i += 2 ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    }),

    "lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
      var i = argument < 0 ? argument + length : argument;
      for ( ; --i >= 0; ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    }),

    "gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
      var i = argument < 0 ? argument + length : argument;
      for ( ; ++i < length; ) {
        matchIndexes.push( i );
      }
      return matchIndexes;
    })
  }
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
  Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
  Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
  var matched, match, tokens, type,
    soFar, groups, preFilters,
    cached = tokenCache[ selector + " " ];

  if ( cached ) {
    return parseOnly ? 0 : cached.slice( 0 );
  }

  soFar = selector;
  groups = [];
  preFilters = Expr.preFilter;

  while ( soFar ) {

    // Comma and first run
    if ( !matched || (match = rcomma.exec( soFar )) ) {
      if ( match ) {
        // Don't consume trailing commas as valid
        soFar = soFar.slice( match[0].length ) || soFar;
      }
      groups.push( (tokens = []) );
    }

    matched = false;

    // Combinators
    if ( (match = rcombinators.exec( soFar )) ) {
      matched = match.shift();
      tokens.push({
        value: matched,
        // Cast descendant combinators to space
        type: match[0].replace( rtrim, " " )
      });
      soFar = soFar.slice( matched.length );
    }

    // Filters
    for ( type in Expr.filter ) {
      if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
        (match = preFilters[ type ]( match ))) ) {
        matched = match.shift();
        tokens.push({
          value: matched,
          type: type,
          matches: match
        });
        soFar = soFar.slice( matched.length );
      }
    }

    if ( !matched ) {
      break;
    }
  }

  // Return the length of the invalid excess
  // if we're just parsing
  // Otherwise, throw an error or return tokens
  return parseOnly ?
    soFar.length :
    soFar ?
      Sizzle.error( selector ) :
      // Cache the tokens
      tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
  var i = 0,
    len = tokens.length,
    selector = "";
  for ( ; i < len; i++ ) {
    selector += tokens[i].value;
  }
  return selector;
}

function addCombinator( matcher, combinator, base ) {
  var dir = combinator.dir,
    checkNonElements = base && dir === "parentNode",
    doneName = done++;

  return combinator.first ?
    // Check against closest ancestor/preceding element
    function( elem, context, xml ) {
      while ( (elem = elem[ dir ]) ) {
        if ( elem.nodeType === 1 || checkNonElements ) {
          return matcher( elem, context, xml );
        }
      }
    } :

    // Check against all ancestor/preceding elements
    function( elem, context, xml ) {
      var oldCache, outerCache,
        newCache = [ dirruns, doneName ];

      // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
      if ( xml ) {
        while ( (elem = elem[ dir ]) ) {
          if ( elem.nodeType === 1 || checkNonElements ) {
            if ( matcher( elem, context, xml ) ) {
              return true;
            }
          }
        }
      } else {
        while ( (elem = elem[ dir ]) ) {
          if ( elem.nodeType === 1 || checkNonElements ) {
            outerCache = elem[ expando ] || (elem[ expando ] = {});
            if ( (oldCache = outerCache[ dir ]) &&
              oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

              // Assign to newCache so results back-propagate to previous elements
              return (newCache[ 2 ] = oldCache[ 2 ]);
            } else {
              // Reuse newcache so results back-propagate to previous elements
              outerCache[ dir ] = newCache;

              // A match means we're done; a fail means we have to keep checking
              if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
                return true;
              }
            }
          }
        }
      }
    };
}

function elementMatcher( matchers ) {
  return matchers.length > 1 ?
    function( elem, context, xml ) {
      var i = matchers.length;
      while ( i-- ) {
        if ( !matchers[i]( elem, context, xml ) ) {
          return false;
        }
      }
      return true;
    } :
    matchers[0];
}

function multipleContexts( selector, contexts, results ) {
  var i = 0,
    len = contexts.length;
  for ( ; i < len; i++ ) {
    Sizzle( selector, contexts[i], results );
  }
  return results;
}

function condense( unmatched, map, filter, context, xml ) {
  var elem,
    newUnmatched = [],
    i = 0,
    len = unmatched.length,
    mapped = map != null;

  for ( ; i < len; i++ ) {
    if ( (elem = unmatched[i]) ) {
      if ( !filter || filter( elem, context, xml ) ) {
        newUnmatched.push( elem );
        if ( mapped ) {
          map.push( i );
        }
      }
    }
  }

  return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
  if ( postFilter && !postFilter[ expando ] ) {
    postFilter = setMatcher( postFilter );
  }
  if ( postFinder && !postFinder[ expando ] ) {
    postFinder = setMatcher( postFinder, postSelector );
  }
  return markFunction(function( seed, results, context, xml ) {
    var temp, i, elem,
      preMap = [],
      postMap = [],
      preexisting = results.length,

      // Get initial elements from seed or context
      elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

      // Prefilter to get matcher input, preserving a map for seed-results synchronization
      matcherIn = preFilter && ( seed || !selector ) ?
        condense( elems, preMap, preFilter, context, xml ) :
        elems,

      matcherOut = matcher ?
        // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
        postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

          // ...intermediate processing is necessary
          [] :

          // ...otherwise use results directly
          results :
        matcherIn;

    // Find primary matches
    if ( matcher ) {
      matcher( matcherIn, matcherOut, context, xml );
    }

    // Apply postFilter
    if ( postFilter ) {
      temp = condense( matcherOut, postMap );
      postFilter( temp, [], context, xml );

      // Un-match failing elements by moving them back to matcherIn
      i = temp.length;
      while ( i-- ) {
        if ( (elem = temp[i]) ) {
          matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
        }
      }
    }

    if ( seed ) {
      if ( postFinder || preFilter ) {
        if ( postFinder ) {
          // Get the final matcherOut by condensing this intermediate into postFinder contexts
          temp = [];
          i = matcherOut.length;
          while ( i-- ) {
            if ( (elem = matcherOut[i]) ) {
              // Restore matcherIn since elem is not yet a final match
              temp.push( (matcherIn[i] = elem) );
            }
          }
          postFinder( null, (matcherOut = []), temp, xml );
        }

        // Move matched elements from seed to results to keep them synchronized
        i = matcherOut.length;
        while ( i-- ) {
          if ( (elem = matcherOut[i]) &&
            (temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

            seed[temp] = !(results[temp] = elem);
          }
        }
      }

    // Add elements to results, through postFinder if defined
    } else {
      matcherOut = condense(
        matcherOut === results ?
          matcherOut.splice( preexisting, matcherOut.length ) :
          matcherOut
      );
      if ( postFinder ) {
        postFinder( null, results, matcherOut, xml );
      } else {
        push.apply( results, matcherOut );
      }
    }
  });
}

function matcherFromTokens( tokens ) {
  var checkContext, matcher, j,
    len = tokens.length,
    leadingRelative = Expr.relative[ tokens[0].type ],
    implicitRelative = leadingRelative || Expr.relative[" "],
    i = leadingRelative ? 1 : 0,

    // The foundational matcher ensures that elements are reachable from top-level context(s)
    matchContext = addCombinator( function( elem ) {
      return elem === checkContext;
    }, implicitRelative, true ),
    matchAnyContext = addCombinator( function( elem ) {
      return indexOf.call( checkContext, elem ) > -1;
    }, implicitRelative, true ),
    matchers = [ function( elem, context, xml ) {
      return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
        (checkContext = context).nodeType ?
          matchContext( elem, context, xml ) :
          matchAnyContext( elem, context, xml ) );
    } ];

  for ( ; i < len; i++ ) {
    if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
      matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
    } else {
      matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

      // Return special upon seeing a positional matcher
      if ( matcher[ expando ] ) {
        // Find the next relative operator (if any) for proper handling
        j = ++i;
        for ( ; j < len; j++ ) {
          if ( Expr.relative[ tokens[j].type ] ) {
            break;
          }
        }
        return setMatcher(
          i > 1 && elementMatcher( matchers ),
          i > 1 && toSelector(
            // If the preceding token was a descendant combinator, insert an implicit any-element `*`
            tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
          ).replace( rtrim, "$1" ),
          matcher,
          i < j && matcherFromTokens( tokens.slice( i, j ) ),
          j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
          j < len && toSelector( tokens )
        );
      }
      matchers.push( matcher );
    }
  }

  return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
  var bySet = setMatchers.length > 0,
    byElement = elementMatchers.length > 0,
    superMatcher = function( seed, context, xml, results, outermost ) {
      var elem, j, matcher,
        matchedCount = 0,
        i = "0",
        unmatched = seed && [],
        setMatched = [],
        contextBackup = outermostContext,
        // We must always have either seed elements or outermost context
        elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
        // Use integer dirruns iff this is the outermost matcher
        dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
        len = elems.length;

      if ( outermost ) {
        outermostContext = context !== document && context;
      }

      // Add elements passing elementMatchers directly to results
      // Keep `i` a string if there are no elements so `matchedCount` will be "00" below
      // Support: IE<9, Safari
      // Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
      for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
        if ( byElement && elem ) {
          j = 0;
          while ( (matcher = elementMatchers[j++]) ) {
            if ( matcher( elem, context, xml ) ) {
              results.push( elem );
              break;
            }
          }
          if ( outermost ) {
            dirruns = dirrunsUnique;
          }
        }

        // Track unmatched elements for set filters
        if ( bySet ) {
          // They will have gone through all possible matchers
          if ( (elem = !matcher && elem) ) {
            matchedCount--;
          }

          // Lengthen the array for every element, matched or not
          if ( seed ) {
            unmatched.push( elem );
          }
        }
      }

      // Apply set filters to unmatched elements
      matchedCount += i;
      if ( bySet && i !== matchedCount ) {
        j = 0;
        while ( (matcher = setMatchers[j++]) ) {
          matcher( unmatched, setMatched, context, xml );
        }

        if ( seed ) {
          // Reintegrate element matches to eliminate the need for sorting
          if ( matchedCount > 0 ) {
            while ( i-- ) {
              if ( !(unmatched[i] || setMatched[i]) ) {
                setMatched[i] = pop.call( results );
              }
            }
          }

          // Discard index placeholder values to get only actual matches
          setMatched = condense( setMatched );
        }

        // Add matches to results
        push.apply( results, setMatched );

        // Seedless set matches succeeding multiple successful matchers stipulate sorting
        if ( outermost && !seed && setMatched.length > 0 &&
          ( matchedCount + setMatchers.length ) > 1 ) {

          Sizzle.uniqueSort( results );
        }
      }

      // Override manipulation of globals by nested matchers
      if ( outermost ) {
        dirruns = dirrunsUnique;
        outermostContext = contextBackup;
      }

      return unmatched;
    };

  return bySet ?
    markFunction( superMatcher ) :
    superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
  var i,
    setMatchers = [],
    elementMatchers = [],
    cached = compilerCache[ selector + " " ];

  if ( !cached ) {
    // Generate a function of recursive functions that can be used to check each element
    if ( !match ) {
      match = tokenize( selector );
    }
    i = match.length;
    while ( i-- ) {
      cached = matcherFromTokens( match[i] );
      if ( cached[ expando ] ) {
        setMatchers.push( cached );
      } else {
        elementMatchers.push( cached );
      }
    }

    // Cache the compiled function
    cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

    // Save selector and tokenization
    cached.selector = selector;
  }
  return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
  var i, tokens, token, type, find,
    compiled = typeof selector === "function" && selector,
    match = !seed && tokenize( (selector = compiled.selector || selector) );

  results = results || [];

  // Try to minimize operations if there is no seed and only one group
  if ( match.length === 1 ) {

    // Take a shortcut and set the context if the root selector is an ID
    tokens = match[0] = match[0].slice( 0 );
    if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
        support.getById && context.nodeType === 9 && documentIsHTML &&
        Expr.relative[ tokens[1].type ] ) {

      context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
      if ( !context ) {
        return results;

      // Precompiled matchers will still verify ancestry, so step up a level
      } else if ( compiled ) {
        context = context.parentNode;
      }

      selector = selector.slice( tokens.shift().value.length );
    }

    // Fetch a seed set for right-to-left matching
    i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
    while ( i-- ) {
      token = tokens[i];

      // Abort if we hit a combinator
      if ( Expr.relative[ (type = token.type) ] ) {
        break;
      }
      if ( (find = Expr.find[ type ]) ) {
        // Search, expanding context for leading sibling combinators
        if ( (seed = find(
          token.matches[0].replace( runescape, funescape ),
          rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
        )) ) {

          // If seed is empty or no tokens remain, we can return early
          tokens.splice( i, 1 );
          selector = seed.length && toSelector( tokens );
          if ( !selector ) {
            push.apply( results, seed );
            return results;
          }

          break;
        }
      }
    }
  }

  // Compile and execute a filtering function if one is not provided
  // Provide `match` to avoid retokenization if we modified the selector above
  ( compiled || compile( selector, match ) )(
    seed,
    context,
    !documentIsHTML,
    results,
    rsibling.test( selector ) && testContext( context.parentNode ) || context
  );
  return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome<14
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
  // Should return 1, but returns 4 (following)
  return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
  div.innerHTML = "<a href='#'></a>";
  return div.firstChild.getAttribute("href") === "#" ;
}) ) {
  addHandle( "type|href|height|width", function( elem, name, isXML ) {
    if ( !isXML ) {
      return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
    }
  });
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
  div.innerHTML = "<input/>";
  div.firstChild.setAttribute( "value", "" );
  return div.firstChild.getAttribute( "value" ) === "";
}) ) {
  addHandle( "value", function( elem, name, isXML ) {
    if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
      return elem.defaultValue;
    }
  });
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
  return div.getAttribute("disabled") == null;
}) ) {
  addHandle( booleans, function( elem, name, isXML ) {
    var val;
    if ( !isXML ) {
      return elem[ name ] === true ? name.toLowerCase() :
          (val = elem.getAttributeNode( name )) && val.specified ?
          val.value :
        null;
    }
  });
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
  if ( jQuery.isFunction( qualifier ) ) {
    return jQuery.grep( elements, function( elem, i ) {
      /* jshint -W018 */
      return !!qualifier.call( elem, i, elem ) !== not;
    });

  }

  if ( qualifier.nodeType ) {
    return jQuery.grep( elements, function( elem ) {
      return ( elem === qualifier ) !== not;
    });

  }

  if ( typeof qualifier === "string" ) {
    if ( risSimple.test( qualifier ) ) {
      return jQuery.filter( qualifier, elements, not );
    }

    qualifier = jQuery.filter( qualifier, elements );
  }

  return jQuery.grep( elements, function( elem ) {
    return ( jQuery.inArray( elem, qualifier ) >= 0 ) !== not;
  });
}

jQuery.filter = function( expr, elems, not ) {
  var elem = elems[ 0 ];

  if ( not ) {
    expr = ":not(" + expr + ")";
  }

  return elems.length === 1 && elem.nodeType === 1 ?
    jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
    jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
      return elem.nodeType === 1;
    }));
};

jQuery.fn.extend({
  find: function( selector ) {
    var i,
      ret = [],
      self = this,
      len = self.length;

    if ( typeof selector !== "string" ) {
      return this.pushStack( jQuery( selector ).filter(function() {
        for ( i = 0; i < len; i++ ) {
          if ( jQuery.contains( self[ i ], this ) ) {
            return true;
          }
        }
      }) );
    }

    for ( i = 0; i < len; i++ ) {
      jQuery.find( selector, self[ i ], ret );
    }

    // Needed because $( selector, context ) becomes $( context ).find( selector )
    ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
    ret.selector = this.selector ? this.selector + " " + selector : selector;
    return ret;
  },
  filter: function( selector ) {
    return this.pushStack( winnow(this, selector || [], false) );
  },
  not: function( selector ) {
    return this.pushStack( winnow(this, selector || [], true) );
  },
  is: function( selector ) {
    return !!winnow(
      this,

      // If this is a positional/relative selector, check membership in the returned set
      // so $("p:first").is("p:last") won't return true for a doc with two "p".
      typeof selector === "string" && rneedsContext.test( selector ) ?
        jQuery( selector ) :
        selector || [],
      false
    ).length;
  }
});


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

  // Use the correct document accordingly with window argument (sandbox)
  document = window.document,

  // A simple way to check for HTML strings
  // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
  // Strict HTML recognition (#11290: must start with <)
  rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

  init = jQuery.fn.init = function( selector, context ) {
    var match, elem;

    // HANDLE: $(""), $(null), $(undefined), $(false)
    if ( !selector ) {
      return this;
    }

    // Handle HTML strings
    if ( typeof selector === "string" ) {
      if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
        // Assume that strings that start and end with <> are HTML and skip the regex check
        match = [ null, selector, null ];

      } else {
        match = rquickExpr.exec( selector );
      }

      // Match html or make sure no context is specified for #id
      if ( match && (match[1] || !context) ) {

        // HANDLE: $(html) -> $(array)
        if ( match[1] ) {
          context = context instanceof jQuery ? context[0] : context;

          // scripts is true for back-compat
          // Intentionally let the error be thrown if parseHTML is not present
          jQuery.merge( this, jQuery.parseHTML(
            match[1],
            context && context.nodeType ? context.ownerDocument || context : document,
            true
          ) );

          // HANDLE: $(html, props)
          if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
            for ( match in context ) {
              // Properties of context are called as methods if possible
              if ( jQuery.isFunction( this[ match ] ) ) {
                this[ match ]( context[ match ] );

              // ...and otherwise set as attributes
              } else {
                this.attr( match, context[ match ] );
              }
            }
          }

          return this;

        // HANDLE: $(#id)
        } else {
          elem = document.getElementById( match[2] );

          // Check parentNode to catch when Blackberry 4.6 returns
          // nodes that are no longer in the document #6963
          if ( elem && elem.parentNode ) {
            // Handle the case where IE and Opera return items
            // by name instead of ID
            if ( elem.id !== match[2] ) {
              return rootjQuery.find( selector );
            }

            // Otherwise, we inject the element directly into the jQuery object
            this.length = 1;
            this[0] = elem;
          }

          this.context = document;
          this.selector = selector;
          return this;
        }

      // HANDLE: $(expr, $(...))
      } else if ( !context || context.jquery ) {
        return ( context || rootjQuery ).find( selector );

      // HANDLE: $(expr, context)
      // (which is just equivalent to: $(context).find(expr)
      } else {
        return this.constructor( context ).find( selector );
      }

    // HANDLE: $(DOMElement)
    } else if ( selector.nodeType ) {
      this.context = this[0] = selector;
      this.length = 1;
      return this;

    // HANDLE: $(function)
    // Shortcut for document ready
    } else if ( jQuery.isFunction( selector ) ) {
      return typeof rootjQuery.ready !== "undefined" ?
        rootjQuery.ready( selector ) :
        // Execute immediately if ready is not present
        selector( jQuery );
    }

    if ( selector.selector !== undefined ) {
      this.selector = selector.selector;
      this.context = selector.context;
    }

    return jQuery.makeArray( selector, this );
  };

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,
  // methods guaranteed to produce a unique set when starting from a unique set
  guaranteedUnique = {
    children: true,
    contents: true,
    next: true,
    prev: true
  };

jQuery.extend({
  dir: function( elem, dir, until ) {
    var matched = [],
      cur = elem[ dir ];

    while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
      if ( cur.nodeType === 1 ) {
        matched.push( cur );
      }
      cur = cur[dir];
    }
    return matched;
  },

  sibling: function( n, elem ) {
    var r = [];

    for ( ; n; n = n.nextSibling ) {
      if ( n.nodeType === 1 && n !== elem ) {
        r.push( n );
      }
    }

    return r;
  }
});

jQuery.fn.extend({
  has: function( target ) {
    var i,
      targets = jQuery( target, this ),
      len = targets.length;

    return this.filter(function() {
      for ( i = 0; i < len; i++ ) {
        if ( jQuery.contains( this, targets[i] ) ) {
          return true;
        }
      }
    });
  },

  closest: function( selectors, context ) {
    var cur,
      i = 0,
      l = this.length,
      matched = [],
      pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
        jQuery( selectors, context || this.context ) :
        0;

    for ( ; i < l; i++ ) {
      for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
        // Always skip document fragments
        if ( cur.nodeType < 11 && (pos ?
          pos.index(cur) > -1 :

          // Don't pass non-elements to Sizzle
          cur.nodeType === 1 &&
            jQuery.find.matchesSelector(cur, selectors)) ) {

          matched.push( cur );
          break;
        }
      }
    }

    return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
  },

  // Determine the position of an element within
  // the matched set of elements
  index: function( elem ) {

    // No argument, return index in parent
    if ( !elem ) {
      return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
    }

    // index in selector
    if ( typeof elem === "string" ) {
      return jQuery.inArray( this[0], jQuery( elem ) );
    }

    // Locate the position of the desired element
    return jQuery.inArray(
      // If it receives a jQuery object, the first element is used
      elem.jquery ? elem[0] : elem, this );
  },

  add: function( selector, context ) {
    return this.pushStack(
      jQuery.unique(
        jQuery.merge( this.get(), jQuery( selector, context ) )
      )
    );
  },

  addBack: function( selector ) {
    return this.add( selector == null ?
      this.prevObject : this.prevObject.filter(selector)
    );
  }
});

function sibling( cur, dir ) {
  do {
    cur = cur[ dir ];
  } while ( cur && cur.nodeType !== 1 );

  return cur;
}

jQuery.each({
  parent: function( elem ) {
    var parent = elem.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  },
  parents: function( elem ) {
    return jQuery.dir( elem, "parentNode" );
  },
  parentsUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "parentNode", until );
  },
  next: function( elem ) {
    return sibling( elem, "nextSibling" );
  },
  prev: function( elem ) {
    return sibling( elem, "previousSibling" );
  },
  nextAll: function( elem ) {
    return jQuery.dir( elem, "nextSibling" );
  },
  prevAll: function( elem ) {
    return jQuery.dir( elem, "previousSibling" );
  },
  nextUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "nextSibling", until );
  },
  prevUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "previousSibling", until );
  },
  siblings: function( elem ) {
    return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
  },
  children: function( elem ) {
    return jQuery.sibling( elem.firstChild );
  },
  contents: function( elem ) {
    return jQuery.nodeName( elem, "iframe" ) ?
      elem.contentDocument || elem.contentWindow.document :
      jQuery.merge( [], elem.childNodes );
  }
}, function( name, fn ) {
  jQuery.fn[ name ] = function( until, selector ) {
    var ret = jQuery.map( this, fn, until );

    if ( name.slice( -5 ) !== "Until" ) {
      selector = until;
    }

    if ( selector && typeof selector === "string" ) {
      ret = jQuery.filter( selector, ret );
    }

    if ( this.length > 1 ) {
      // Remove duplicates
      if ( !guaranteedUnique[ name ] ) {
        ret = jQuery.unique( ret );
      }

      // Reverse order for parents* and prev-derivatives
      if ( rparentsprev.test( name ) ) {
        ret = ret.reverse();
      }
    }

    return this.pushStack( ret );
  };
});
var rnotwhite = (/\S+/g);



// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
  var object = optionsCache[ options ] = {};
  jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
    object[ flag ] = true;
  });
  return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *  options: an optional list of space-separated options that will change how
 *      the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *  once:     will ensure the callback list can only be fired once (like a Deferred)
 *
 *  memory:     will keep track of previous values and will call any callback added
 *          after the list has been fired right away with the latest "memorized"
 *          values (like a Deferred)
 *
 *  unique:     will ensure a callback can only be added once (no duplicate in the list)
 *
 *  stopOnFalse:  interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

  // Convert options from String-formatted to Object-formatted if needed
  // (we check in cache first)
  options = typeof options === "string" ?
    ( optionsCache[ options ] || createOptions( options ) ) :
    jQuery.extend( {}, options );

  var // Flag to know if list is currently firing
    firing,
    // Last fire value (for non-forgettable lists)
    memory,
    // Flag to know if list was already fired
    fired,
    // End of the loop when firing
    firingLength,
    // Index of currently firing callback (modified by remove if needed)
    firingIndex,
    // First callback to fire (used internally by add and fireWith)
    firingStart,
    // Actual callback list
    list = [],
    // Stack of fire calls for repeatable lists
    stack = !options.once && [],
    // Fire callbacks
    fire = function( data ) {
      memory = options.memory && data;
      fired = true;
      firingIndex = firingStart || 0;
      firingStart = 0;
      firingLength = list.length;
      firing = true;
      for ( ; list && firingIndex < firingLength; firingIndex++ ) {
        if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
          memory = false; // To prevent further calls using add
          break;
        }
      }
      firing = false;
      if ( list ) {
        if ( stack ) {
          if ( stack.length ) {
            fire( stack.shift() );
          }
        } else if ( memory ) {
          list = [];
        } else {
          self.disable();
        }
      }
    },
    // Actual Callbacks object
    self = {
      // Add a callback or a collection of callbacks to the list
      add: function() {
        if ( list ) {
          // First, we save the current length
          var start = list.length;
          (function add( args ) {
            jQuery.each( args, function( _, arg ) {
              var type = jQuery.type( arg );
              if ( type === "function" ) {
                if ( !options.unique || !self.has( arg ) ) {
                  list.push( arg );
                }
              } else if ( arg && arg.length && type !== "string" ) {
                // Inspect recursively
                add( arg );
              }
            });
          })( arguments );
          // Do we need to add the callbacks to the
          // current firing batch?
          if ( firing ) {
            firingLength = list.length;
          // With memory, if we're not firing then
          // we should call right away
          } else if ( memory ) {
            firingStart = start;
            fire( memory );
          }
        }
        return this;
      },
      // Remove a callback from the list
      remove: function() {
        if ( list ) {
          jQuery.each( arguments, function( _, arg ) {
            var index;
            while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
              list.splice( index, 1 );
              // Handle firing indexes
              if ( firing ) {
                if ( index <= firingLength ) {
                  firingLength--;
                }
                if ( index <= firingIndex ) {
                  firingIndex--;
                }
              }
            }
          });
        }
        return this;
      },
      // Check if a given callback is in the list.
      // If no argument is given, return whether or not list has callbacks attached.
      has: function( fn ) {
        return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
      },
      // Remove all callbacks from the list
      empty: function() {
        list = [];
        firingLength = 0;
        return this;
      },
      // Have the list do nothing anymore
      disable: function() {
        list = stack = memory = undefined;
        return this;
      },
      // Is it disabled?
      disabled: function() {
        return !list;
      },
      // Lock the list in its current state
      lock: function() {
        stack = undefined;
        if ( !memory ) {
          self.disable();
        }
        return this;
      },
      // Is it locked?
      locked: function() {
        return !stack;
      },
      // Call all callbacks with the given context and arguments
      fireWith: function( context, args ) {
        if ( list && ( !fired || stack ) ) {
          args = args || [];
          args = [ context, args.slice ? args.slice() : args ];
          if ( firing ) {
            stack.push( args );
          } else {
            fire( args );
          }
        }
        return this;
      },
      // Call all the callbacks with the given arguments
      fire: function() {
        self.fireWith( this, arguments );
        return this;
      },
      // To know if the callbacks have already been called at least once
      fired: function() {
        return !!fired;
      }
    };

  return self;
};


jQuery.extend({

  Deferred: function( func ) {
    var tuples = [
        // action, add listener, listener list, final state
        [ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
        [ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
        [ "notify", "progress", jQuery.Callbacks("memory") ]
      ],
      state = "pending",
      promise = {
        state: function() {
          return state;
        },
        always: function() {
          deferred.done( arguments ).fail( arguments );
          return this;
        },
        then: function( /* fnDone, fnFail, fnProgress */ ) {
          var fns = arguments;
          return jQuery.Deferred(function( newDefer ) {
            jQuery.each( tuples, function( i, tuple ) {
              var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
              // deferred[ done | fail | progress ] for forwarding actions to newDefer
              deferred[ tuple[1] ](function() {
                var returned = fn && fn.apply( this, arguments );
                if ( returned && jQuery.isFunction( returned.promise ) ) {
                  returned.promise()
                    .done( newDefer.resolve )
                    .fail( newDefer.reject )
                    .progress( newDefer.notify );
                } else {
                  newDefer[ tuple[ 0 ] + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
                }
              });
            });
            fns = null;
          }).promise();
        },
        // Get a promise for this deferred
        // If obj is provided, the promise aspect is added to the object
        promise: function( obj ) {
          return obj != null ? jQuery.extend( obj, promise ) : promise;
        }
      },
      deferred = {};

    // Keep pipe for back-compat
    promise.pipe = promise.then;

    // Add list-specific methods
    jQuery.each( tuples, function( i, tuple ) {
      var list = tuple[ 2 ],
        stateString = tuple[ 3 ];

      // promise[ done | fail | progress ] = list.add
      promise[ tuple[1] ] = list.add;

      // Handle state
      if ( stateString ) {
        list.add(function() {
          // state = [ resolved | rejected ]
          state = stateString;

        // [ reject_list | resolve_list ].disable; progress_list.lock
        }, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
      }

      // deferred[ resolve | reject | notify ]
      deferred[ tuple[0] ] = function() {
        deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
        return this;
      };
      deferred[ tuple[0] + "With" ] = list.fireWith;
    });

    // Make the deferred a promise
    promise.promise( deferred );

    // Call given func if any
    if ( func ) {
      func.call( deferred, deferred );
    }

    // All done!
    return deferred;
  },

  // Deferred helper
  when: function( subordinate /* , ..., subordinateN */ ) {
    var i = 0,
      resolveValues = slice.call( arguments ),
      length = resolveValues.length,

      // the count of uncompleted subordinates
      remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

      // the master Deferred. If resolveValues consist of only a single Deferred, just use that.
      deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

      // Update function for both resolve and progress values
      updateFunc = function( i, contexts, values ) {
        return function( value ) {
          contexts[ i ] = this;
          values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
          if ( values === progressValues ) {
            deferred.notifyWith( contexts, values );

          } else if ( !(--remaining) ) {
            deferred.resolveWith( contexts, values );
          }
        };
      },

      progressValues, progressContexts, resolveContexts;

    // add listeners to Deferred subordinates; treat others as resolved
    if ( length > 1 ) {
      progressValues = new Array( length );
      progressContexts = new Array( length );
      resolveContexts = new Array( length );
      for ( ; i < length; i++ ) {
        if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
          resolveValues[ i ].promise()
            .done( updateFunc( i, resolveContexts, resolveValues ) )
            .fail( deferred.reject )
            .progress( updateFunc( i, progressContexts, progressValues ) );
        } else {
          --remaining;
        }
      }
    }

    // if we're not waiting on anything, resolve the master
    if ( !remaining ) {
      deferred.resolveWith( resolveContexts, resolveValues );
    }

    return deferred.promise();
  }
});


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {
  // Add the callback
  jQuery.ready.promise().done( fn );

  return this;
};

jQuery.extend({
  // Is the DOM ready to be used? Set to true once it occurs.
  isReady: false,

  // A counter to track how many items to wait for before
  // the ready event fires. See #6781
  readyWait: 1,

  // Hold (or release) the ready event
  holdReady: function( hold ) {
    if ( hold ) {
      jQuery.readyWait++;
    } else {
      jQuery.ready( true );
    }
  },

  // Handle when the DOM is ready
  ready: function( wait ) {

    // Abort if there are pending holds or we're already ready
    if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
      return;
    }

    // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
    if ( !document.body ) {
      return setTimeout( jQuery.ready );
    }

    // Remember that the DOM is ready
    jQuery.isReady = true;

    // If a normal DOM Ready event fired, decrement, and wait if need be
    if ( wait !== true && --jQuery.readyWait > 0 ) {
      return;
    }

    // If there are functions bound, to execute
    readyList.resolveWith( document, [ jQuery ] );

    // Trigger any bound ready events
    if ( jQuery.fn.triggerHandler ) {
      jQuery( document ).triggerHandler( "ready" );
      jQuery( document ).off( "ready" );
    }
  }
});

/**
 * Clean-up method for dom ready events
 */
function detach() {
  if ( document.addEventListener ) {
    document.removeEventListener( "DOMContentLoaded", completed, false );
    window.removeEventListener( "load", completed, false );

  } else {
    document.detachEvent( "onreadystatechange", completed );
    window.detachEvent( "onload", completed );
  }
}

/**
 * The ready event handler and self cleanup method
 */
function completed() {
  // readyState === "complete" is good enough for us to call the dom ready in oldIE
  if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
    detach();
    jQuery.ready();
  }
}

jQuery.ready.promise = function( obj ) {
  if ( !readyList ) {

    readyList = jQuery.Deferred();

    // Catch cases where $(document).ready() is called after the browser event has already occurred.
    // we once tried to use readyState "interactive" here, but it caused issues like the one
    // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
    if ( document.readyState === "complete" ) {
      // Handle it asynchronously to allow scripts the opportunity to delay ready
      setTimeout( jQuery.ready );

    // Standards-based browsers support DOMContentLoaded
    } else if ( document.addEventListener ) {
      // Use the handy event callback
      document.addEventListener( "DOMContentLoaded", completed, false );

      // A fallback to window.onload, that will always work
      window.addEventListener( "load", completed, false );

    // If IE event model is used
    } else {
      // Ensure firing before onload, maybe late but safe also for iframes
      document.attachEvent( "onreadystatechange", completed );

      // A fallback to window.onload, that will always work
      window.attachEvent( "onload", completed );

      // If IE and not a frame
      // continually check to see if the document is ready
      var top = false;

      try {
        top = window.frameElement == null && document.documentElement;
      } catch(e) {}

      if ( top && top.doScroll ) {
        (function doScrollCheck() {
          if ( !jQuery.isReady ) {

            try {
              // Use the trick by Diego Perini
              // http://javascript.nwbox.com/IEContentLoaded/
              top.doScroll("left");
            } catch(e) {
              return setTimeout( doScrollCheck, 50 );
            }

            // detach all dom ready events
            detach();

            // and execute any waiting functions
            jQuery.ready();
          }
        })();
      }
    }
  }
  return readyList.promise( obj );
};


var strundefined = typeof undefined;



// Support: IE<9
// Iteration over object's inherited properties before its own
var i;
for ( i in jQuery( support ) ) {
  break;
}
support.ownLast = i !== "0";

// Note: most support tests are defined in their respective modules.
// false until the test is run
support.inlineBlockNeedsLayout = false;

// Execute ASAP in case we need to set body.style.zoom
jQuery(function() {
  // Minified: var a,b,c,d
  var val, div, body, container;

  body = document.getElementsByTagName( "body" )[ 0 ];
  if ( !body || !body.style ) {
    // Return for frameset docs that don't have a body
    return;
  }

  // Setup
  div = document.createElement( "div" );
  container = document.createElement( "div" );
  container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
  body.appendChild( container ).appendChild( div );

  if ( typeof div.style.zoom !== strundefined ) {
    // Support: IE<8
    // Check if natively block-level elements act like inline-block
    // elements when setting their display to 'inline' and giving
    // them layout
    div.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1";

    support.inlineBlockNeedsLayout = val = div.offsetWidth === 3;
    if ( val ) {
      // Prevent IE 6 from affecting layout for positioned elements #11048
      // Prevent IE from shrinking the body in IE 7 mode #12869
      // Support: IE<8
      body.style.zoom = 1;
    }
  }

  body.removeChild( container );
});




(function() {
  var div = document.createElement( "div" );

  // Execute the test only if not already executed in another module.
  if (support.deleteExpando == null) {
    // Support: IE<9
    support.deleteExpando = true;
    try {
      delete div.test;
    } catch( e ) {
      support.deleteExpando = false;
    }
  }

  // Null elements to avoid leaks in IE.
  div = null;
})();


/**
 * Determines whether an object can have data
 */
jQuery.acceptData = function( elem ) {
  var noData = jQuery.noData[ (elem.nodeName + " ").toLowerCase() ],
    nodeType = +elem.nodeType || 1;

  // Do not set data on non-element DOM nodes because it will not be cleared (#8335).
  return nodeType !== 1 && nodeType !== 9 ?
    false :

    // Nodes accept data unless otherwise specified; rejection can be conditional
    !noData || noData !== true && elem.getAttribute("classid") === noData;
};


var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
  rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {
  // If nothing was found internally, try to fetch any
  // data from the HTML5 data-* attribute
  if ( data === undefined && elem.nodeType === 1 ) {

    var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

    data = elem.getAttribute( name );

    if ( typeof data === "string" ) {
      try {
        data = data === "true" ? true :
          data === "false" ? false :
          data === "null" ? null :
          // Only convert to a number if it doesn't change the string
          +data + "" === data ? +data :
          rbrace.test( data ) ? jQuery.parseJSON( data ) :
          data;
      } catch( e ) {}

      // Make sure we set the data so it isn't changed later
      jQuery.data( elem, key, data );

    } else {
      data = undefined;
    }
  }

  return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
  var name;
  for ( name in obj ) {

    // if the public data object is empty, the private is still empty
    if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
      continue;
    }
    if ( name !== "toJSON" ) {
      return false;
    }
  }

  return true;
}

function internalData( elem, name, data, pvt /* Internal Use Only */ ) {
  if ( !jQuery.acceptData( elem ) ) {
    return;
  }

  var ret, thisCache,
    internalKey = jQuery.expando,

    // We have to handle DOM nodes and JS objects differently because IE6-7
    // can't GC object references properly across the DOM-JS boundary
    isNode = elem.nodeType,

    // Only DOM nodes need the global jQuery cache; JS object data is
    // attached directly to the object so GC can occur automatically
    cache = isNode ? jQuery.cache : elem,

    // Only defining an ID for JS objects if its cache already exists allows
    // the code to shortcut on the same path as a DOM node with no cache
    id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

  // Avoid doing any more work than we need to when trying to get data on an
  // object that has no data at all
  if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && data === undefined && typeof name === "string" ) {
    return;
  }

  if ( !id ) {
    // Only DOM nodes need a new unique ID for each element since their data
    // ends up in the global cache
    if ( isNode ) {
      id = elem[ internalKey ] = deletedIds.pop() || jQuery.guid++;
    } else {
      id = internalKey;
    }
  }

  if ( !cache[ id ] ) {
    // Avoid exposing jQuery metadata on plain JS objects when the object
    // is serialized using JSON.stringify
    cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
  }

  // An object can be passed to jQuery.data instead of a key/value pair; this gets
  // shallow copied over onto the existing cache
  if ( typeof name === "object" || typeof name === "function" ) {
    if ( pvt ) {
      cache[ id ] = jQuery.extend( cache[ id ], name );
    } else {
      cache[ id ].data = jQuery.extend( cache[ id ].data, name );
    }
  }

  thisCache = cache[ id ];

  // jQuery data() is stored in a separate object inside the object's internal data
  // cache in order to avoid key collisions between internal data and user-defined
  // data.
  if ( !pvt ) {
    if ( !thisCache.data ) {
      thisCache.data = {};
    }

    thisCache = thisCache.data;
  }

  if ( data !== undefined ) {
    thisCache[ jQuery.camelCase( name ) ] = data;
  }

  // Check for both converted-to-camel and non-converted data property names
  // If a data property was specified
  if ( typeof name === "string" ) {

    // First Try to find as-is property data
    ret = thisCache[ name ];

    // Test for null|undefined property data
    if ( ret == null ) {

      // Try to find the camelCased property
      ret = thisCache[ jQuery.camelCase( name ) ];
    }
  } else {
    ret = thisCache;
  }

  return ret;
}

function internalRemoveData( elem, name, pvt ) {
  if ( !jQuery.acceptData( elem ) ) {
    return;
  }

  var thisCache, i,
    isNode = elem.nodeType,

    // See jQuery.data for more information
    cache = isNode ? jQuery.cache : elem,
    id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

  // If there is already no cache entry for this object, there is no
  // purpose in continuing
  if ( !cache[ id ] ) {
    return;
  }

  if ( name ) {

    thisCache = pvt ? cache[ id ] : cache[ id ].data;

    if ( thisCache ) {

      // Support array or space separated string names for data keys
      if ( !jQuery.isArray( name ) ) {

        // try the string as a key before any manipulation
        if ( name in thisCache ) {
          name = [ name ];
        } else {

          // split the camel cased version by spaces unless a key with the spaces exists
          name = jQuery.camelCase( name );
          if ( name in thisCache ) {
            name = [ name ];
          } else {
            name = name.split(" ");
          }
        }
      } else {
        // If "name" is an array of keys...
        // When data is initially created, via ("key", "val") signature,
        // keys will be converted to camelCase.
        // Since there is no way to tell _how_ a key was added, remove
        // both plain key and camelCase key. #12786
        // This will only penalize the array argument path.
        name = name.concat( jQuery.map( name, jQuery.camelCase ) );
      }

      i = name.length;
      while ( i-- ) {
        delete thisCache[ name[i] ];
      }

      // If there is no data left in the cache, we want to continue
      // and let the cache object itself get destroyed
      if ( pvt ? !isEmptyDataObject(thisCache) : !jQuery.isEmptyObject(thisCache) ) {
        return;
      }
    }
  }

  // See jQuery.data for more information
  if ( !pvt ) {
    delete cache[ id ].data;

    // Don't destroy the parent cache unless the internal data object
    // had been the only thing left in it
    if ( !isEmptyDataObject( cache[ id ] ) ) {
      return;
    }
  }

  // Destroy the cache
  if ( isNode ) {
    jQuery.cleanData( [ elem ], true );

  // Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
  /* jshint eqeqeq: false */
  } else if ( support.deleteExpando || cache != cache.window ) {
    /* jshint eqeqeq: true */
    delete cache[ id ];

  // When all else fails, null
  } else {
    cache[ id ] = null;
  }
}

jQuery.extend({
  cache: {},

  // The following elements (space-suffixed to avoid Object.prototype collisions)
  // throw uncatchable exceptions if you attempt to set expando properties
  noData: {
    "applet ": true,
    "embed ": true,
    // ...but Flash objects (which have this classid) *can* handle expandos
    "object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
  },

  hasData: function( elem ) {
    elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
    return !!elem && !isEmptyDataObject( elem );
  },

  data: function( elem, name, data ) {
    return internalData( elem, name, data );
  },

  removeData: function( elem, name ) {
    return internalRemoveData( elem, name );
  },

  // For internal use only.
  _data: function( elem, name, data ) {
    return internalData( elem, name, data, true );
  },

  _removeData: function( elem, name ) {
    return internalRemoveData( elem, name, true );
  }
});

jQuery.fn.extend({
  data: function( key, value ) {
    var i, name, data,
      elem = this[0],
      attrs = elem && elem.attributes;

    // Special expections of .data basically thwart jQuery.access,
    // so implement the relevant behavior ourselves

    // Gets all values
    if ( key === undefined ) {
      if ( this.length ) {
        data = jQuery.data( elem );

        if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
          i = attrs.length;
          while ( i-- ) {

            // Support: IE11+
            // The attrs elements can be null (#14894)
            if ( attrs[ i ] ) {
              name = attrs[ i ].name;
              if ( name.indexOf( "data-" ) === 0 ) {
                name = jQuery.camelCase( name.slice(5) );
                dataAttr( elem, name, data[ name ] );
              }
            }
          }
          jQuery._data( elem, "parsedAttrs", true );
        }
      }

      return data;
    }

    // Sets multiple values
    if ( typeof key === "object" ) {
      return this.each(function() {
        jQuery.data( this, key );
      });
    }

    return arguments.length > 1 ?

      // Sets one value
      this.each(function() {
        jQuery.data( this, key, value );
      }) :

      // Gets one value
      // Try to fetch any internally stored data first
      elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : undefined;
  },

  removeData: function( key ) {
    return this.each(function() {
      jQuery.removeData( this, key );
    });
  }
});


jQuery.extend({
  queue: function( elem, type, data ) {
    var queue;

    if ( elem ) {
      type = ( type || "fx" ) + "queue";
      queue = jQuery._data( elem, type );

      // Speed up dequeue by getting out quickly if this is just a lookup
      if ( data ) {
        if ( !queue || jQuery.isArray(data) ) {
          queue = jQuery._data( elem, type, jQuery.makeArray(data) );
        } else {
          queue.push( data );
        }
      }
      return queue || [];
    }
  },

  dequeue: function( elem, type ) {
    type = type || "fx";

    var queue = jQuery.queue( elem, type ),
      startLength = queue.length,
      fn = queue.shift(),
      hooks = jQuery._queueHooks( elem, type ),
      next = function() {
        jQuery.dequeue( elem, type );
      };

    // If the fx queue is dequeued, always remove the progress sentinel
    if ( fn === "inprogress" ) {
      fn = queue.shift();
      startLength--;
    }

    if ( fn ) {

      // Add a progress sentinel to prevent the fx queue from being
      // automatically dequeued
      if ( type === "fx" ) {
        queue.unshift( "inprogress" );
      }

      // clear up the last queue stop function
      delete hooks.stop;
      fn.call( elem, next, hooks );
    }

    if ( !startLength && hooks ) {
      hooks.empty.fire();
    }
  },

  // not intended for public consumption - generates a queueHooks object, or returns the current one
  _queueHooks: function( elem, type ) {
    var key = type + "queueHooks";
    return jQuery._data( elem, key ) || jQuery._data( elem, key, {
      empty: jQuery.Callbacks("once memory").add(function() {
        jQuery._removeData( elem, type + "queue" );
        jQuery._removeData( elem, key );
      })
    });
  }
});

jQuery.fn.extend({
  queue: function( type, data ) {
    var setter = 2;

    if ( typeof type !== "string" ) {
      data = type;
      type = "fx";
      setter--;
    }

    if ( arguments.length < setter ) {
      return jQuery.queue( this[0], type );
    }

    return data === undefined ?
      this :
      this.each(function() {
        var queue = jQuery.queue( this, type, data );

        // ensure a hooks for this queue
        jQuery._queueHooks( this, type );

        if ( type === "fx" && queue[0] !== "inprogress" ) {
          jQuery.dequeue( this, type );
        }
      });
  },
  dequeue: function( type ) {
    return this.each(function() {
      jQuery.dequeue( this, type );
    });
  },
  clearQueue: function( type ) {
    return this.queue( type || "fx", [] );
  },
  // Get a promise resolved when queues of a certain type
  // are emptied (fx is the type by default)
  promise: function( type, obj ) {
    var tmp,
      count = 1,
      defer = jQuery.Deferred(),
      elements = this,
      i = this.length,
      resolve = function() {
        if ( !( --count ) ) {
          defer.resolveWith( elements, [ elements ] );
        }
      };

    if ( typeof type !== "string" ) {
      obj = type;
      type = undefined;
    }
    type = type || "fx";

    while ( i-- ) {
      tmp = jQuery._data( elements[ i ], type + "queueHooks" );
      if ( tmp && tmp.empty ) {
        count++;
        tmp.empty.add( resolve );
      }
    }
    resolve();
    return defer.promise( obj );
  }
});
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;

var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {
    // isHidden might be called from jQuery#filter function;
    // in that case, element will be second argument
    elem = el || elem;
    return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
  };



// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = jQuery.access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
  var i = 0,
    length = elems.length,
    bulk = key == null;

  // Sets many values
  if ( jQuery.type( key ) === "object" ) {
    chainable = true;
    for ( i in key ) {
      jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
    }

  // Sets one value
  } else if ( value !== undefined ) {
    chainable = true;

    if ( !jQuery.isFunction( value ) ) {
      raw = true;
    }

    if ( bulk ) {
      // Bulk operations run against the entire set
      if ( raw ) {
        fn.call( elems, value );
        fn = null;

      // ...except when executing function values
      } else {
        bulk = fn;
        fn = function( elem, key, value ) {
          return bulk.call( jQuery( elem ), value );
        };
      }
    }

    if ( fn ) {
      for ( ; i < length; i++ ) {
        fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
      }
    }
  }

  return chainable ?
    elems :

    // Gets
    bulk ?
      fn.call( elems ) :
      length ? fn( elems[0], key ) : emptyGet;
};
var rcheckableType = (/^(?:checkbox|radio)$/i);



(function() {
  // Minified: var a,b,c
  var input = document.createElement( "input" ),
    div = document.createElement( "div" ),
    fragment = document.createDocumentFragment();

  // Setup
  div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

  // IE strips leading whitespace when .innerHTML is used
  support.leadingWhitespace = div.firstChild.nodeType === 3;

  // Make sure that tbody elements aren't automatically inserted
  // IE will insert them into empty tables
  support.tbody = !div.getElementsByTagName( "tbody" ).length;

  // Make sure that link elements get serialized correctly by innerHTML
  // This requires a wrapper element in IE
  support.htmlSerialize = !!div.getElementsByTagName( "link" ).length;

  // Makes sure cloning an html5 element does not cause problems
  // Where outerHTML is undefined, this still works
  support.html5Clone =
    document.createElement( "nav" ).cloneNode( true ).outerHTML !== "<:nav></:nav>";

  // Check if a disconnected checkbox will retain its checked
  // value of true after appended to the DOM (IE6/7)
  input.type = "checkbox";
  input.checked = true;
  fragment.appendChild( input );
  support.appendChecked = input.checked;

  // Make sure textarea (and checkbox) defaultValue is properly cloned
  // Support: IE6-IE11+
  div.innerHTML = "<textarea>x</textarea>";
  support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

  // #11217 - WebKit loses check when the name is after the checked attribute
  fragment.appendChild( div );
  div.innerHTML = "<input type='radio' checked='checked' name='t'/>";

  // Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
  // old WebKit doesn't clone checked state correctly in fragments
  support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

  // Support: IE<9
  // Opera does not clone events (and typeof div.attachEvent === undefined).
  // IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
  support.noCloneEvent = true;
  if ( div.attachEvent ) {
    div.attachEvent( "onclick", function() {
      support.noCloneEvent = false;
    });

    div.cloneNode( true ).click();
  }

  // Execute the test only if not already executed in another module.
  if (support.deleteExpando == null) {
    // Support: IE<9
    support.deleteExpando = true;
    try {
      delete div.test;
    } catch( e ) {
      support.deleteExpando = false;
    }
  }
})();


(function() {
  var i, eventName,
    div = document.createElement( "div" );

  // Support: IE<9 (lack submit/change bubble), Firefox 23+ (lack focusin event)
  for ( i in { submit: true, change: true, focusin: true }) {
    eventName = "on" + i;

    if ( !(support[ i + "Bubbles" ] = eventName in window) ) {
      // Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
      div.setAttribute( eventName, "t" );
      support[ i + "Bubbles" ] = div.attributes[ eventName ].expando === false;
    }
  }

  // Null elements to avoid leaks in IE.
  div = null;
})();


var rformElems = /^(?:input|select|textarea)$/i,
  rkeyEvent = /^key/,
  rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
  rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
  rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
  return true;
}

function returnFalse() {
  return false;
}

function safeActiveElement() {
  try {
    return document.activeElement;
  } catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

  global: {},

  add: function( elem, types, handler, data, selector ) {
    var tmp, events, t, handleObjIn,
      special, eventHandle, handleObj,
      handlers, type, namespaces, origType,
      elemData = jQuery._data( elem );

    // Don't attach events to noData or text/comment nodes (but allow plain objects)
    if ( !elemData ) {
      return;
    }

    // Caller can pass in an object of custom data in lieu of the handler
    if ( handler.handler ) {
      handleObjIn = handler;
      handler = handleObjIn.handler;
      selector = handleObjIn.selector;
    }

    // Make sure that the handler has a unique ID, used to find/remove it later
    if ( !handler.guid ) {
      handler.guid = jQuery.guid++;
    }

    // Init the element's event structure and main handler, if this is the first
    if ( !(events = elemData.events) ) {
      events = elemData.events = {};
    }
    if ( !(eventHandle = elemData.handle) ) {
      eventHandle = elemData.handle = function( e ) {
        // Discard the second event of a jQuery.event.trigger() and
        // when an event is called after a page has unloaded
        return typeof jQuery !== strundefined && (!e || jQuery.event.triggered !== e.type) ?
          jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
          undefined;
      };
      // Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
      eventHandle.elem = elem;
    }

    // Handle multiple events separated by a space
    types = ( types || "" ).match( rnotwhite ) || [ "" ];
    t = types.length;
    while ( t-- ) {
      tmp = rtypenamespace.exec( types[t] ) || [];
      type = origType = tmp[1];
      namespaces = ( tmp[2] || "" ).split( "." ).sort();

      // There *must* be a type, no attaching namespace-only handlers
      if ( !type ) {
        continue;
      }

      // If event changes its type, use the special event handlers for the changed type
      special = jQuery.event.special[ type ] || {};

      // If selector defined, determine special event api type, otherwise given type
      type = ( selector ? special.delegateType : special.bindType ) || type;

      // Update special based on newly reset type
      special = jQuery.event.special[ type ] || {};

      // handleObj is passed to all event handlers
      handleObj = jQuery.extend({
        type: type,
        origType: origType,
        data: data,
        handler: handler,
        guid: handler.guid,
        selector: selector,
        needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
        namespace: namespaces.join(".")
      }, handleObjIn );

      // Init the event handler queue if we're the first
      if ( !(handlers = events[ type ]) ) {
        handlers = events[ type ] = [];
        handlers.delegateCount = 0;

        // Only use addEventListener/attachEvent if the special events handler returns false
        if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
          // Bind the global event handler to the element
          if ( elem.addEventListener ) {
            elem.addEventListener( type, eventHandle, false );

          } else if ( elem.attachEvent ) {
            elem.attachEvent( "on" + type, eventHandle );
          }
        }
      }

      if ( special.add ) {
        special.add.call( elem, handleObj );

        if ( !handleObj.handler.guid ) {
          handleObj.handler.guid = handler.guid;
        }
      }

      // Add to the element's handler list, delegates in front
      if ( selector ) {
        handlers.splice( handlers.delegateCount++, 0, handleObj );
      } else {
        handlers.push( handleObj );
      }

      // Keep track of which events have ever been used, for event optimization
      jQuery.event.global[ type ] = true;
    }

    // Nullify elem to prevent memory leaks in IE
    elem = null;
  },

  // Detach an event or set of events from an element
  remove: function( elem, types, handler, selector, mappedTypes ) {
    var j, handleObj, tmp,
      origCount, t, events,
      special, handlers, type,
      namespaces, origType,
      elemData = jQuery.hasData( elem ) && jQuery._data( elem );

    if ( !elemData || !(events = elemData.events) ) {
      return;
    }

    // Once for each type.namespace in types; type may be omitted
    types = ( types || "" ).match( rnotwhite ) || [ "" ];
    t = types.length;
    while ( t-- ) {
      tmp = rtypenamespace.exec( types[t] ) || [];
      type = origType = tmp[1];
      namespaces = ( tmp[2] || "" ).split( "." ).sort();

      // Unbind all events (on this namespace, if provided) for the element
      if ( !type ) {
        for ( type in events ) {
          jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
        }
        continue;
      }

      special = jQuery.event.special[ type ] || {};
      type = ( selector ? special.delegateType : special.bindType ) || type;
      handlers = events[ type ] || [];
      tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

      // Remove matching events
      origCount = j = handlers.length;
      while ( j-- ) {
        handleObj = handlers[ j ];

        if ( ( mappedTypes || origType === handleObj.origType ) &&
          ( !handler || handler.guid === handleObj.guid ) &&
          ( !tmp || tmp.test( handleObj.namespace ) ) &&
          ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
          handlers.splice( j, 1 );

          if ( handleObj.selector ) {
            handlers.delegateCount--;
          }
          if ( special.remove ) {
            special.remove.call( elem, handleObj );
          }
        }
      }

      // Remove generic event handler if we removed something and no more handlers exist
      // (avoids potential for endless recursion during removal of special event handlers)
      if ( origCount && !handlers.length ) {
        if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
          jQuery.removeEvent( elem, type, elemData.handle );
        }

        delete events[ type ];
      }
    }

    // Remove the expando if it's no longer used
    if ( jQuery.isEmptyObject( events ) ) {
      delete elemData.handle;

      // removeData also checks for emptiness and clears the expando if empty
      // so use it instead of delete
      jQuery._removeData( elem, "events" );
    }
  },

  trigger: function( event, data, elem, onlyHandlers ) {
    var handle, ontype, cur,
      bubbleType, special, tmp, i,
      eventPath = [ elem || document ],
      type = hasOwn.call( event, "type" ) ? event.type : event,
      namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

    cur = tmp = elem = elem || document;

    // Don't do events on text and comment nodes
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
      return;
    }

    // focus/blur morphs to focusin/out; ensure we're not firing them right now
    if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
      return;
    }

    if ( type.indexOf(".") >= 0 ) {
      // Namespaced trigger; create a regexp to match event type in handle()
      namespaces = type.split(".");
      type = namespaces.shift();
      namespaces.sort();
    }
    ontype = type.indexOf(":") < 0 && "on" + type;

    // Caller can pass in a jQuery.Event object, Object, or just an event type string
    event = event[ jQuery.expando ] ?
      event :
      new jQuery.Event( type, typeof event === "object" && event );

    // Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
    event.isTrigger = onlyHandlers ? 2 : 3;
    event.namespace = namespaces.join(".");
    event.namespace_re = event.namespace ?
      new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
      null;

    // Clean up the event in case it is being reused
    event.result = undefined;
    if ( !event.target ) {
      event.target = elem;
    }

    // Clone any incoming data and prepend the event, creating the handler arg list
    data = data == null ?
      [ event ] :
      jQuery.makeArray( data, [ event ] );

    // Allow special events to draw outside the lines
    special = jQuery.event.special[ type ] || {};
    if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
      return;
    }

    // Determine event propagation path in advance, per W3C events spec (#9951)
    // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
    if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

      bubbleType = special.delegateType || type;
      if ( !rfocusMorph.test( bubbleType + type ) ) {
        cur = cur.parentNode;
      }
      for ( ; cur; cur = cur.parentNode ) {
        eventPath.push( cur );
        tmp = cur;
      }

      // Only add window if we got to document (e.g., not plain obj or detached DOM)
      if ( tmp === (elem.ownerDocument || document) ) {
        eventPath.push( tmp.defaultView || tmp.parentWindow || window );
      }
    }

    // Fire handlers on the event path
    i = 0;
    while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

      event.type = i > 1 ?
        bubbleType :
        special.bindType || type;

      // jQuery handler
      handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
      if ( handle ) {
        handle.apply( cur, data );
      }

      // Native handler
      handle = ontype && cur[ ontype ];
      if ( handle && handle.apply && jQuery.acceptData( cur ) ) {
        event.result = handle.apply( cur, data );
        if ( event.result === false ) {
          event.preventDefault();
        }
      }
    }
    event.type = type;

    // If nobody prevented the default action, do it now
    if ( !onlyHandlers && !event.isDefaultPrevented() ) {

      if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
        jQuery.acceptData( elem ) ) {

        // Call a native DOM method on the target with the same name name as the event.
        // Can't use an .isFunction() check here because IE6/7 fails that test.
        // Don't do default actions on window, that's where global variables be (#6170)
        if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

          // Don't re-trigger an onFOO event when we call its FOO() method
          tmp = elem[ ontype ];

          if ( tmp ) {
            elem[ ontype ] = null;
          }

          // Prevent re-triggering of the same event, since we already bubbled it above
          jQuery.event.triggered = type;
          try {
            elem[ type ]();
          } catch ( e ) {
            // IE<9 dies on focus/blur to hidden element (#1486,#12518)
            // only reproducible on winXP IE8 native, not IE9 in IE8 mode
          }
          jQuery.event.triggered = undefined;

          if ( tmp ) {
            elem[ ontype ] = tmp;
          }
        }
      }
    }

    return event.result;
  },

  dispatch: function( event ) {

    // Make a writable jQuery.Event from the native event object
    event = jQuery.event.fix( event );

    var i, ret, handleObj, matched, j,
      handlerQueue = [],
      args = slice.call( arguments ),
      handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
      special = jQuery.event.special[ event.type ] || {};

    // Use the fix-ed jQuery.Event rather than the (read-only) native event
    args[0] = event;
    event.delegateTarget = this;

    // Call the preDispatch hook for the mapped type, and let it bail if desired
    if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
      return;
    }

    // Determine handlers
    handlerQueue = jQuery.event.handlers.call( this, event, handlers );

    // Run delegates first; they may want to stop propagation beneath us
    i = 0;
    while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
      event.currentTarget = matched.elem;

      j = 0;
      while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

        // Triggered event must either 1) have no namespace, or
        // 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
        if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

          event.handleObj = handleObj;
          event.data = handleObj.data;

          ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
              .apply( matched.elem, args );

          if ( ret !== undefined ) {
            if ( (event.result = ret) === false ) {
              event.preventDefault();
              event.stopPropagation();
            }
          }
        }
      }
    }

    // Call the postDispatch hook for the mapped type
    if ( special.postDispatch ) {
      special.postDispatch.call( this, event );
    }

    return event.result;
  },

  handlers: function( event, handlers ) {
    var sel, handleObj, matches, i,
      handlerQueue = [],
      delegateCount = handlers.delegateCount,
      cur = event.target;

    // Find delegate handlers
    // Black-hole SVG <use> instance trees (#13180)
    // Avoid non-left-click bubbling in Firefox (#3861)
    if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

      /* jshint eqeqeq: false */
      for ( ; cur != this; cur = cur.parentNode || this ) {
        /* jshint eqeqeq: true */

        // Don't check non-elements (#13208)
        // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
        if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
          matches = [];
          for ( i = 0; i < delegateCount; i++ ) {
            handleObj = handlers[ i ];

            // Don't conflict with Object.prototype properties (#13203)
            sel = handleObj.selector + " ";

            if ( matches[ sel ] === undefined ) {
              matches[ sel ] = handleObj.needsContext ?
                jQuery( sel, this ).index( cur ) >= 0 :
                jQuery.find( sel, this, null, [ cur ] ).length;
            }
            if ( matches[ sel ] ) {
              matches.push( handleObj );
            }
          }
          if ( matches.length ) {
            handlerQueue.push({ elem: cur, handlers: matches });
          }
        }
      }
    }

    // Add the remaining (directly-bound) handlers
    if ( delegateCount < handlers.length ) {
      handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
    }

    return handlerQueue;
  },

  fix: function( event ) {
    if ( event[ jQuery.expando ] ) {
      return event;
    }

    // Create a writable copy of the event object and normalize some properties
    var i, prop, copy,
      type = event.type,
      originalEvent = event,
      fixHook = this.fixHooks[ type ];

    if ( !fixHook ) {
      this.fixHooks[ type ] = fixHook =
        rmouseEvent.test( type ) ? this.mouseHooks :
        rkeyEvent.test( type ) ? this.keyHooks :
        {};
    }
    copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

    event = new jQuery.Event( originalEvent );

    i = copy.length;
    while ( i-- ) {
      prop = copy[ i ];
      event[ prop ] = originalEvent[ prop ];
    }

    // Support: IE<9
    // Fix target property (#1925)
    if ( !event.target ) {
      event.target = originalEvent.srcElement || document;
    }

    // Support: Chrome 23+, Safari?
    // Target should not be a text node (#504, #13143)
    if ( event.target.nodeType === 3 ) {
      event.target = event.target.parentNode;
    }

    // Support: IE<9
    // For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
    event.metaKey = !!event.metaKey;

    return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
  },

  // Includes some event props shared by KeyEvent and MouseEvent
  props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

  fixHooks: {},

  keyHooks: {
    props: "char charCode key keyCode".split(" "),
    filter: function( event, original ) {

      // Add which for key events
      if ( event.which == null ) {
        event.which = original.charCode != null ? original.charCode : original.keyCode;
      }

      return event;
    }
  },

  mouseHooks: {
    props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
    filter: function( event, original ) {
      var body, eventDoc, doc,
        button = original.button,
        fromElement = original.fromElement;

      // Calculate pageX/Y if missing and clientX/Y available
      if ( event.pageX == null && original.clientX != null ) {
        eventDoc = event.target.ownerDocument || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
        event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
      }

      // Add relatedTarget, if necessary
      if ( !event.relatedTarget && fromElement ) {
        event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
      }

      // Add which for click: 1 === left; 2 === middle; 3 === right
      // Note: button is not normalized, so don't use it
      if ( !event.which && button !== undefined ) {
        event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
      }

      return event;
    }
  },

  special: {
    load: {
      // Prevent triggered image.load events from bubbling to window.load
      noBubble: true
    },
    focus: {
      // Fire native event if possible so blur/focus sequence is correct
      trigger: function() {
        if ( this !== safeActiveElement() && this.focus ) {
          try {
            this.focus();
            return false;
          } catch ( e ) {
            // Support: IE<9
            // If we error on focus to hidden element (#1486, #12518),
            // let .trigger() run the handlers
          }
        }
      },
      delegateType: "focusin"
    },
    blur: {
      trigger: function() {
        if ( this === safeActiveElement() && this.blur ) {
          this.blur();
          return false;
        }
      },
      delegateType: "focusout"
    },
    click: {
      // For checkbox, fire native event so checked state will be right
      trigger: function() {
        if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
          this.click();
          return false;
        }
      },

      // For cross-browser consistency, don't fire native .click() on links
      _default: function( event ) {
        return jQuery.nodeName( event.target, "a" );
      }
    },

    beforeunload: {
      postDispatch: function( event ) {

        // Support: Firefox 20+
        // Firefox doesn't alert if the returnValue field is not set.
        if ( event.result !== undefined && event.originalEvent ) {
          event.originalEvent.returnValue = event.result;
        }
      }
    }
  },

  simulate: function( type, elem, event, bubble ) {
    // Piggyback on a donor event to simulate a different one.
    // Fake originalEvent to avoid donor's stopPropagation, but if the
    // simulated event prevents default then we do the same on the donor.
    var e = jQuery.extend(
      new jQuery.Event(),
      event,
      {
        type: type,
        isSimulated: true,
        originalEvent: {}
      }
    );
    if ( bubble ) {
      jQuery.event.trigger( e, null, elem );
    } else {
      jQuery.event.dispatch.call( elem, e );
    }
    if ( e.isDefaultPrevented() ) {
      event.preventDefault();
    }
  }
};

jQuery.removeEvent = document.removeEventListener ?
  function( elem, type, handle ) {
    if ( elem.removeEventListener ) {
      elem.removeEventListener( type, handle, false );
    }
  } :
  function( elem, type, handle ) {
    var name = "on" + type;

    if ( elem.detachEvent ) {

      // #8545, #7054, preventing memory leaks for custom events in IE6-8
      // detachEvent needed property on element, by name of that event, to properly expose it to GC
      if ( typeof elem[ name ] === strundefined ) {
        elem[ name ] = null;
      }

      elem.detachEvent( name, handle );
    }
  };

jQuery.Event = function( src, props ) {
  // Allow instantiation without the 'new' keyword
  if ( !(this instanceof jQuery.Event) ) {
    return new jQuery.Event( src, props );
  }

  // Event object
  if ( src && src.type ) {
    this.originalEvent = src;
    this.type = src.type;

    // Events bubbling up the document may have been marked as prevented
    // by a handler lower down the tree; reflect the correct value.
    this.isDefaultPrevented = src.defaultPrevented ||
        src.defaultPrevented === undefined &&
        // Support: IE < 9, Android < 4.0
        src.returnValue === false ?
      returnTrue :
      returnFalse;

  // Event type
  } else {
    this.type = src;
  }

  // Put explicitly provided properties onto the event object
  if ( props ) {
    jQuery.extend( this, props );
  }

  // Create a timestamp if incoming event doesn't have one
  this.timeStamp = src && src.timeStamp || jQuery.now();

  // Mark it as fixed
  this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
  isDefaultPrevented: returnFalse,
  isPropagationStopped: returnFalse,
  isImmediatePropagationStopped: returnFalse,

  preventDefault: function() {
    var e = this.originalEvent;

    this.isDefaultPrevented = returnTrue;
    if ( !e ) {
      return;
    }

    // If preventDefault exists, run it on the original event
    if ( e.preventDefault ) {
      e.preventDefault();

    // Support: IE
    // Otherwise set the returnValue property of the original event to false
    } else {
      e.returnValue = false;
    }
  },
  stopPropagation: function() {
    var e = this.originalEvent;

    this.isPropagationStopped = returnTrue;
    if ( !e ) {
      return;
    }
    // If stopPropagation exists, run it on the original event
    if ( e.stopPropagation ) {
      e.stopPropagation();
    }

    // Support: IE
    // Set the cancelBubble property of the original event to true
    e.cancelBubble = true;
  },
  stopImmediatePropagation: function() {
    var e = this.originalEvent;

    this.isImmediatePropagationStopped = returnTrue;

    if ( e && e.stopImmediatePropagation ) {
      e.stopImmediatePropagation();
    }

    this.stopPropagation();
  }
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
  mouseenter: "mouseover",
  mouseleave: "mouseout",
  pointerenter: "pointerover",
  pointerleave: "pointerout"
}, function( orig, fix ) {
  jQuery.event.special[ orig ] = {
    delegateType: fix,
    bindType: fix,

    handle: function( event ) {
      var ret,
        target = this,
        related = event.relatedTarget,
        handleObj = event.handleObj;

      // For mousenter/leave call the handler if related is outside the target.
      // NB: No relatedTarget if the mouse left/entered the browser window
      if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
        event.type = handleObj.origType;
        ret = handleObj.handler.apply( this, arguments );
        event.type = fix;
      }
      return ret;
    }
  };
});

// IE submit delegation
if ( !support.submitBubbles ) {

  jQuery.event.special.submit = {
    setup: function() {
      // Only need this for delegated form submit events
      if ( jQuery.nodeName( this, "form" ) ) {
        return false;
      }

      // Lazy-add a submit handler when a descendant form may potentially be submitted
      jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
        // Node name check avoids a VML-related crash in IE (#9807)
        var elem = e.target,
          form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
        if ( form && !jQuery._data( form, "submitBubbles" ) ) {
          jQuery.event.add( form, "submit._submit", function( event ) {
            event._submit_bubble = true;
          });
          jQuery._data( form, "submitBubbles", true );
        }
      });
      // return undefined since we don't need an event listener
    },

    postDispatch: function( event ) {
      // If form was submitted by the user, bubble the event up the tree
      if ( event._submit_bubble ) {
        delete event._submit_bubble;
        if ( this.parentNode && !event.isTrigger ) {
          jQuery.event.simulate( "submit", this.parentNode, event, true );
        }
      }
    },

    teardown: function() {
      // Only need this for delegated form submit events
      if ( jQuery.nodeName( this, "form" ) ) {
        return false;
      }

      // Remove delegated handlers; cleanData eventually reaps submit handlers attached above
      jQuery.event.remove( this, "._submit" );
    }
  };
}

// IE change delegation and checkbox/radio fix
if ( !support.changeBubbles ) {

  jQuery.event.special.change = {

    setup: function() {

      if ( rformElems.test( this.nodeName ) ) {
        // IE doesn't fire change on a check/radio until blur; trigger it on click
        // after a propertychange. Eat the blur-change in special.change.handle.
        // This still fires onchange a second time for check/radio after blur.
        if ( this.type === "checkbox" || this.type === "radio" ) {
          jQuery.event.add( this, "propertychange._change", function( event ) {
            if ( event.originalEvent.propertyName === "checked" ) {
              this._just_changed = true;
            }
          });
          jQuery.event.add( this, "click._change", function( event ) {
            if ( this._just_changed && !event.isTrigger ) {
              this._just_changed = false;
            }
            // Allow triggered, simulated change events (#11500)
            jQuery.event.simulate( "change", this, event, true );
          });
        }
        return false;
      }
      // Delegated event; lazy-add a change handler on descendant inputs
      jQuery.event.add( this, "beforeactivate._change", function( e ) {
        var elem = e.target;

        if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "changeBubbles" ) ) {
          jQuery.event.add( elem, "change._change", function( event ) {
            if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
              jQuery.event.simulate( "change", this.parentNode, event, true );
            }
          });
          jQuery._data( elem, "changeBubbles", true );
        }
      });
    },

    handle: function( event ) {
      var elem = event.target;

      // Swallow native change events from checkbox/radio, we already triggered them above
      if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
        return event.handleObj.handler.apply( this, arguments );
      }
    },

    teardown: function() {
      jQuery.event.remove( this, "._change" );

      return !rformElems.test( this.nodeName );
    }
  };
}

// Create "bubbling" focus and blur events
if ( !support.focusinBubbles ) {
  jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

    // Attach a single capturing handler on the document while someone wants focusin/focusout
    var handler = function( event ) {
        jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
      };

    jQuery.event.special[ fix ] = {
      setup: function() {
        var doc = this.ownerDocument || this,
          attaches = jQuery._data( doc, fix );

        if ( !attaches ) {
          doc.addEventListener( orig, handler, true );
        }
        jQuery._data( doc, fix, ( attaches || 0 ) + 1 );
      },
      teardown: function() {
        var doc = this.ownerDocument || this,
          attaches = jQuery._data( doc, fix ) - 1;

        if ( !attaches ) {
          doc.removeEventListener( orig, handler, true );
          jQuery._removeData( doc, fix );
        } else {
          jQuery._data( doc, fix, attaches );
        }
      }
    };
  });
}

jQuery.fn.extend({

  on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
    var type, origFn;

    // Types can be a map of types/handlers
    if ( typeof types === "object" ) {
      // ( types-Object, selector, data )
      if ( typeof selector !== "string" ) {
        // ( types-Object, data )
        data = data || selector;
        selector = undefined;
      }
      for ( type in types ) {
        this.on( type, selector, data, types[ type ], one );
      }
      return this;
    }

    if ( data == null && fn == null ) {
      // ( types, fn )
      fn = selector;
      data = selector = undefined;
    } else if ( fn == null ) {
      if ( typeof selector === "string" ) {
        // ( types, selector, fn )
        fn = data;
        data = undefined;
      } else {
        // ( types, data, fn )
        fn = data;
        data = selector;
        selector = undefined;
      }
    }
    if ( fn === false ) {
      fn = returnFalse;
    } else if ( !fn ) {
      return this;
    }

    if ( one === 1 ) {
      origFn = fn;
      fn = function( event ) {
        // Can use an empty set, since event contains the info
        jQuery().off( event );
        return origFn.apply( this, arguments );
      };
      // Use same guid so caller can remove using origFn
      fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
    }
    return this.each( function() {
      jQuery.event.add( this, types, fn, data, selector );
    });
  },
  one: function( types, selector, data, fn ) {
    return this.on( types, selector, data, fn, 1 );
  },
  off: function( types, selector, fn ) {
    var handleObj, type;
    if ( types && types.preventDefault && types.handleObj ) {
      // ( event )  dispatched jQuery.Event
      handleObj = types.handleObj;
      jQuery( types.delegateTarget ).off(
        handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
        handleObj.selector,
        handleObj.handler
      );
      return this;
    }
    if ( typeof types === "object" ) {
      // ( types-object [, selector] )
      for ( type in types ) {
        this.off( type, selector, types[ type ] );
      }
      return this;
    }
    if ( selector === false || typeof selector === "function" ) {
      // ( types [, fn] )
      fn = selector;
      selector = undefined;
    }
    if ( fn === false ) {
      fn = returnFalse;
    }
    return this.each(function() {
      jQuery.event.remove( this, types, fn, selector );
    });
  },

  trigger: function( type, data ) {
    return this.each(function() {
      jQuery.event.trigger( type, data, this );
    });
  },
  triggerHandler: function( type, data ) {
    var elem = this[0];
    if ( elem ) {
      return jQuery.event.trigger( type, data, elem, true );
    }
  }
});


function createSafeFragment( document ) {
  var list = nodeNames.split( "|" ),
    safeFrag = document.createDocumentFragment();

  if ( safeFrag.createElement ) {
    while ( list.length ) {
      safeFrag.createElement(
        list.pop()
      );
    }
  }
  return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
    "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
  rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
  rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
  rleadingWhitespace = /^\s+/,
  rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
  rtagName = /<([\w:]+)/,
  rtbody = /<tbody/i,
  rhtml = /<|&#?\w+;/,
  rnoInnerhtml = /<(?:script|style|link)/i,
  // checked="checked" or checked
  rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
  rscriptType = /^$|\/(?:java|ecma)script/i,
  rscriptTypeMasked = /^true\/(.*)/,
  rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

  // We have to close these tags to support XHTML (#13200)
  wrapMap = {
    option: [ 1, "<select multiple='multiple'>", "</select>" ],
    legend: [ 1, "<fieldset>", "</fieldset>" ],
    area: [ 1, "<map>", "</map>" ],
    param: [ 1, "<object>", "</object>" ],
    thead: [ 1, "<table>", "</table>" ],
    tr: [ 2, "<table><tbody>", "</tbody></table>" ],
    col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
    td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

    // IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
    // unless wrapped in a div with non-breaking characters in front of it.
    _default: support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>"  ]
  },
  safeFragment = createSafeFragment( document ),
  fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

function getAll( context, tag ) {
  var elems, elem,
    i = 0,
    found = typeof context.getElementsByTagName !== strundefined ? context.getElementsByTagName( tag || "*" ) :
      typeof context.querySelectorAll !== strundefined ? context.querySelectorAll( tag || "*" ) :
      undefined;

  if ( !found ) {
    for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {
      if ( !tag || jQuery.nodeName( elem, tag ) ) {
        found.push( elem );
      } else {
        jQuery.merge( found, getAll( elem, tag ) );
      }
    }
  }

  return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
    jQuery.merge( [ context ], found ) :
    found;
}

// Used in buildFragment, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
  if ( rcheckableType.test( elem.type ) ) {
    elem.defaultChecked = elem.checked;
  }
}

// Support: IE<8
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
  return jQuery.nodeName( elem, "table" ) &&
    jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

    elem.getElementsByTagName("tbody")[0] ||
      elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
    elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
  elem.type = (jQuery.find.attr( elem, "type" ) !== null) + "/" + elem.type;
  return elem;
}
function restoreScript( elem ) {
  var match = rscriptTypeMasked.exec( elem.type );
  if ( match ) {
    elem.type = match[1];
  } else {
    elem.removeAttribute("type");
  }
  return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
  var elem,
    i = 0;
  for ( ; (elem = elems[i]) != null; i++ ) {
    jQuery._data( elem, "globalEval", !refElements || jQuery._data( refElements[i], "globalEval" ) );
  }
}

function cloneCopyEvent( src, dest ) {

  if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
    return;
  }

  var type, i, l,
    oldData = jQuery._data( src ),
    curData = jQuery._data( dest, oldData ),
    events = oldData.events;

  if ( events ) {
    delete curData.handle;
    curData.events = {};

    for ( type in events ) {
      for ( i = 0, l = events[ type ].length; i < l; i++ ) {
        jQuery.event.add( dest, type, events[ type ][ i ] );
      }
    }
  }

  // make the cloned public data object a copy from the original
  if ( curData.data ) {
    curData.data = jQuery.extend( {}, curData.data );
  }
}

function fixCloneNodeIssues( src, dest ) {
  var nodeName, e, data;

  // We do not need to do anything for non-Elements
  if ( dest.nodeType !== 1 ) {
    return;
  }

  nodeName = dest.nodeName.toLowerCase();

  // IE6-8 copies events bound via attachEvent when using cloneNode.
  if ( !support.noCloneEvent && dest[ jQuery.expando ] ) {
    data = jQuery._data( dest );

    for ( e in data.events ) {
      jQuery.removeEvent( dest, e, data.handle );
    }

    // Event data gets referenced instead of copied if the expando gets copied too
    dest.removeAttribute( jQuery.expando );
  }

  // IE blanks contents when cloning scripts, and tries to evaluate newly-set text
  if ( nodeName === "script" && dest.text !== src.text ) {
    disableScript( dest ).text = src.text;
    restoreScript( dest );

  // IE6-10 improperly clones children of object elements using classid.
  // IE10 throws NoModificationAllowedError if parent is null, #12132.
  } else if ( nodeName === "object" ) {
    if ( dest.parentNode ) {
      dest.outerHTML = src.outerHTML;
    }

    // This path appears unavoidable for IE9. When cloning an object
    // element in IE9, the outerHTML strategy above is not sufficient.
    // If the src has innerHTML and the destination does not,
    // copy the src.innerHTML into the dest.innerHTML. #10324
    if ( support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {
      dest.innerHTML = src.innerHTML;
    }

  } else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
    // IE6-8 fails to persist the checked state of a cloned checkbox
    // or radio button. Worse, IE6-7 fail to give the cloned element
    // a checked appearance if the defaultChecked value isn't also set

    dest.defaultChecked = dest.checked = src.checked;

    // IE6-7 get confused and end up setting the value of a cloned
    // checkbox/radio button to an empty string instead of "on"
    if ( dest.value !== src.value ) {
      dest.value = src.value;
    }

  // IE6-8 fails to return the selected option to the default selected
  // state when cloning options
  } else if ( nodeName === "option" ) {
    dest.defaultSelected = dest.selected = src.defaultSelected;

  // IE6-8 fails to set the defaultValue to the correct value when
  // cloning other types of input fields
  } else if ( nodeName === "input" || nodeName === "textarea" ) {
    dest.defaultValue = src.defaultValue;
  }
}

jQuery.extend({
  clone: function( elem, dataAndEvents, deepDataAndEvents ) {
    var destElements, node, clone, i, srcElements,
      inPage = jQuery.contains( elem.ownerDocument, elem );

    if ( support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
      clone = elem.cloneNode( true );

    // IE<=8 does not properly clone detached, unknown element nodes
    } else {
      fragmentDiv.innerHTML = elem.outerHTML;
      fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
    }

    if ( (!support.noCloneEvent || !support.noCloneChecked) &&
        (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {

      // We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
      destElements = getAll( clone );
      srcElements = getAll( elem );

      // Fix all IE cloning issues
      for ( i = 0; (node = srcElements[i]) != null; ++i ) {
        // Ensure that the destination node is not null; Fixes #9587
        if ( destElements[i] ) {
          fixCloneNodeIssues( node, destElements[i] );
        }
      }
    }

    // Copy the events from the original to the clone
    if ( dataAndEvents ) {
      if ( deepDataAndEvents ) {
        srcElements = srcElements || getAll( elem );
        destElements = destElements || getAll( clone );

        for ( i = 0; (node = srcElements[i]) != null; i++ ) {
          cloneCopyEvent( node, destElements[i] );
        }
      } else {
        cloneCopyEvent( elem, clone );
      }
    }

    // Preserve script evaluation history
    destElements = getAll( clone, "script" );
    if ( destElements.length > 0 ) {
      setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
    }

    destElements = srcElements = node = null;

    // Return the cloned set
    return clone;
  },

  buildFragment: function( elems, context, scripts, selection ) {
    var j, elem, contains,
      tmp, tag, tbody, wrap,
      l = elems.length,

      // Ensure a safe fragment
      safe = createSafeFragment( context ),

      nodes = [],
      i = 0;

    for ( ; i < l; i++ ) {
      elem = elems[ i ];

      if ( elem || elem === 0 ) {

        // Add nodes directly
        if ( jQuery.type( elem ) === "object" ) {
          jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

        // Convert non-html into a text node
        } else if ( !rhtml.test( elem ) ) {
          nodes.push( context.createTextNode( elem ) );

        // Convert html into DOM nodes
        } else {
          tmp = tmp || safe.appendChild( context.createElement("div") );

          // Deserialize a standard representation
          tag = (rtagName.exec( elem ) || [ "", "" ])[ 1 ].toLowerCase();
          wrap = wrapMap[ tag ] || wrapMap._default;

          tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[2];

          // Descend through wrappers to the right content
          j = wrap[0];
          while ( j-- ) {
            tmp = tmp.lastChild;
          }

          // Manually add leading whitespace removed by IE
          if ( !support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
            nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );
          }

          // Remove IE's autoinserted <tbody> from table fragments
          if ( !support.tbody ) {

            // String was a <table>, *may* have spurious <tbody>
            elem = tag === "table" && !rtbody.test( elem ) ?
              tmp.firstChild :

              // String was a bare <thead> or <tfoot>
              wrap[1] === "<table>" && !rtbody.test( elem ) ?
                tmp :
                0;

            j = elem && elem.childNodes.length;
            while ( j-- ) {
              if ( jQuery.nodeName( (tbody = elem.childNodes[j]), "tbody" ) && !tbody.childNodes.length ) {
                elem.removeChild( tbody );
              }
            }
          }

          jQuery.merge( nodes, tmp.childNodes );

          // Fix #12392 for WebKit and IE > 9
          tmp.textContent = "";

          // Fix #12392 for oldIE
          while ( tmp.firstChild ) {
            tmp.removeChild( tmp.firstChild );
          }

          // Remember the top-level container for proper cleanup
          tmp = safe.lastChild;
        }
      }
    }

    // Fix #11356: Clear elements from fragment
    if ( tmp ) {
      safe.removeChild( tmp );
    }

    // Reset defaultChecked for any radios and checkboxes
    // about to be appended to the DOM in IE 6/7 (#8060)
    if ( !support.appendChecked ) {
      jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
    }

    i = 0;
    while ( (elem = nodes[ i++ ]) ) {

      // #4087 - If origin and destination elements are the same, and this is
      // that element, do not do anything
      if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
        continue;
      }

      contains = jQuery.contains( elem.ownerDocument, elem );

      // Append to fragment
      tmp = getAll( safe.appendChild( elem ), "script" );

      // Preserve script evaluation history
      if ( contains ) {
        setGlobalEval( tmp );
      }

      // Capture executables
      if ( scripts ) {
        j = 0;
        while ( (elem = tmp[ j++ ]) ) {
          if ( rscriptType.test( elem.type || "" ) ) {
            scripts.push( elem );
          }
        }
      }
    }

    tmp = null;

    return safe;
  },

  cleanData: function( elems, /* internal */ acceptData ) {
    var elem, type, id, data,
      i = 0,
      internalKey = jQuery.expando,
      cache = jQuery.cache,
      deleteExpando = support.deleteExpando,
      special = jQuery.event.special;

    for ( ; (elem = elems[i]) != null; i++ ) {
      if ( acceptData || jQuery.acceptData( elem ) ) {

        id = elem[ internalKey ];
        data = id && cache[ id ];

        if ( data ) {
          if ( data.events ) {
            for ( type in data.events ) {
              if ( special[ type ] ) {
                jQuery.event.remove( elem, type );

              // This is a shortcut to avoid jQuery.event.remove's overhead
              } else {
                jQuery.removeEvent( elem, type, data.handle );
              }
            }
          }

          // Remove cache only if it was not already removed by jQuery.event.remove
          if ( cache[ id ] ) {

            delete cache[ id ];

            // IE does not allow us to delete expando properties from nodes,
            // nor does it have a removeAttribute function on Document nodes;
            // we must handle all of these cases
            if ( deleteExpando ) {
              delete elem[ internalKey ];

            } else if ( typeof elem.removeAttribute !== strundefined ) {
              elem.removeAttribute( internalKey );

            } else {
              elem[ internalKey ] = null;
            }

            deletedIds.push( id );
          }
        }
      }
    }
  }
});

jQuery.fn.extend({
  text: function( value ) {
    return access( this, function( value ) {
      return value === undefined ?
        jQuery.text( this ) :
        this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
    }, null, value, arguments.length );
  },

  append: function() {
    return this.domManip( arguments, function( elem ) {
      if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
        var target = manipulationTarget( this, elem );
        target.appendChild( elem );
      }
    });
  },

  prepend: function() {
    return this.domManip( arguments, function( elem ) {
      if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
        var target = manipulationTarget( this, elem );
        target.insertBefore( elem, target.firstChild );
      }
    });
  },

  before: function() {
    return this.domManip( arguments, function( elem ) {
      if ( this.parentNode ) {
        this.parentNode.insertBefore( elem, this );
      }
    });
  },

  after: function() {
    return this.domManip( arguments, function( elem ) {
      if ( this.parentNode ) {
        this.parentNode.insertBefore( elem, this.nextSibling );
      }
    });
  },

  remove: function( selector, keepData /* Internal Use Only */ ) {
    var elem,
      elems = selector ? jQuery.filter( selector, this ) : this,
      i = 0;

    for ( ; (elem = elems[i]) != null; i++ ) {

      if ( !keepData && elem.nodeType === 1 ) {
        jQuery.cleanData( getAll( elem ) );
      }

      if ( elem.parentNode ) {
        if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
          setGlobalEval( getAll( elem, "script" ) );
        }
        elem.parentNode.removeChild( elem );
      }
    }

    return this;
  },

  empty: function() {
    var elem,
      i = 0;

    for ( ; (elem = this[i]) != null; i++ ) {
      // Remove element nodes and prevent memory leaks
      if ( elem.nodeType === 1 ) {
        jQuery.cleanData( getAll( elem, false ) );
      }

      // Remove any remaining nodes
      while ( elem.firstChild ) {
        elem.removeChild( elem.firstChild );
      }

      // If this is a select, ensure that it displays empty (#12336)
      // Support: IE<9
      if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
        elem.options.length = 0;
      }
    }

    return this;
  },

  clone: function( dataAndEvents, deepDataAndEvents ) {
    dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
    deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

    return this.map(function() {
      return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
    });
  },

  html: function( value ) {
    return access( this, function( value ) {
      var elem = this[ 0 ] || {},
        i = 0,
        l = this.length;

      if ( value === undefined ) {
        return elem.nodeType === 1 ?
          elem.innerHTML.replace( rinlinejQuery, "" ) :
          undefined;
      }

      // See if we can take a shortcut and just use innerHTML
      if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
        ( support.htmlSerialize || !rnoshimcache.test( value )  ) &&
        ( support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
        !wrapMap[ (rtagName.exec( value ) || [ "", "" ])[ 1 ].toLowerCase() ] ) {

        value = value.replace( rxhtmlTag, "<$1></$2>" );

        try {
          for (; i < l; i++ ) {
            // Remove element nodes and prevent memory leaks
            elem = this[i] || {};
            if ( elem.nodeType === 1 ) {
              jQuery.cleanData( getAll( elem, false ) );
              elem.innerHTML = value;
            }
          }

          elem = 0;

        // If using innerHTML throws an exception, use the fallback method
        } catch(e) {}
      }

      if ( elem ) {
        this.empty().append( value );
      }
    }, null, value, arguments.length );
  },

  replaceWith: function() {
    var arg = arguments[ 0 ];

    // Make the changes, replacing each context element with the new content
    this.domManip( arguments, function( elem ) {
      arg = this.parentNode;

      jQuery.cleanData( getAll( this ) );

      if ( arg ) {
        arg.replaceChild( elem, this );
      }
    });

    // Force removal if there was no new content (e.g., from empty arguments)
    return arg && (arg.length || arg.nodeType) ? this : this.remove();
  },

  detach: function( selector ) {
    return this.remove( selector, true );
  },

  domManip: function( args, callback ) {

    // Flatten any nested arrays
    args = concat.apply( [], args );

    var first, node, hasScripts,
      scripts, doc, fragment,
      i = 0,
      l = this.length,
      set = this,
      iNoClone = l - 1,
      value = args[0],
      isFunction = jQuery.isFunction( value );

    // We can't cloneNode fragments that contain checked, in WebKit
    if ( isFunction ||
        ( l > 1 && typeof value === "string" &&
          !support.checkClone && rchecked.test( value ) ) ) {
      return this.each(function( index ) {
        var self = set.eq( index );
        if ( isFunction ) {
          args[0] = value.call( this, index, self.html() );
        }
        self.domManip( args, callback );
      });
    }

    if ( l ) {
      fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
      first = fragment.firstChild;

      if ( fragment.childNodes.length === 1 ) {
        fragment = first;
      }

      if ( first ) {
        scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
        hasScripts = scripts.length;

        // Use the original fragment for the last item instead of the first because it can end up
        // being emptied incorrectly in certain situations (#8070).
        for ( ; i < l; i++ ) {
          node = fragment;

          if ( i !== iNoClone ) {
            node = jQuery.clone( node, true, true );

            // Keep references to cloned scripts for later restoration
            if ( hasScripts ) {
              jQuery.merge( scripts, getAll( node, "script" ) );
            }
          }

          callback.call( this[i], node, i );
        }

        if ( hasScripts ) {
          doc = scripts[ scripts.length - 1 ].ownerDocument;

          // Reenable scripts
          jQuery.map( scripts, restoreScript );

          // Evaluate executable scripts on first document insertion
          for ( i = 0; i < hasScripts; i++ ) {
            node = scripts[ i ];
            if ( rscriptType.test( node.type || "" ) &&
              !jQuery._data( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

              if ( node.src ) {
                // Optional AJAX dependency, but won't run scripts if not present
                if ( jQuery._evalUrl ) {
                  jQuery._evalUrl( node.src );
                }
              } else {
                jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
              }
            }
          }
        }

        // Fix #11809: Avoid leaking memory
        fragment = first = null;
      }
    }

    return this;
  }
});

jQuery.each({
  appendTo: "append",
  prependTo: "prepend",
  insertBefore: "before",
  insertAfter: "after",
  replaceAll: "replaceWith"
}, function( name, original ) {
  jQuery.fn[ name ] = function( selector ) {
    var elems,
      i = 0,
      ret = [],
      insert = jQuery( selector ),
      last = insert.length - 1;

    for ( ; i <= last; i++ ) {
      elems = i === last ? this : this.clone(true);
      jQuery( insert[i] )[ original ]( elems );

      // Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
      push.apply( ret, elems.get() );
    }

    return this.pushStack( ret );
  };
});


var iframe,
  elemdisplay = {};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */
// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
  var style,
    elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

    // getDefaultComputedStyle might be reliably used only on attached element
    display = window.getDefaultComputedStyle && ( style = window.getDefaultComputedStyle( elem[ 0 ] ) ) ?

      // Use of this method is a temporary fix (more like optmization) until something better comes along,
      // since it was removed from specification and supported only in FF
      style.display : jQuery.css( elem[ 0 ], "display" );

  // We don't have any data stored on the element,
  // so use "detach" method as fast way to get rid of the element
  elem.detach();

  return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
  var doc = document,
    display = elemdisplay[ nodeName ];

  if ( !display ) {
    display = actualDisplay( nodeName, doc );

    // If the simple way fails, read from inside an iframe
    if ( display === "none" || !display ) {

      // Use the already-created iframe if possible
      iframe = (iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" )).appendTo( doc.documentElement );

      // Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
      doc = ( iframe[ 0 ].contentWindow || iframe[ 0 ].contentDocument ).document;

      // Support: IE
      doc.write();
      doc.close();

      display = actualDisplay( nodeName, doc );
      iframe.detach();
    }

    // Store the correct default display
    elemdisplay[ nodeName ] = display;
  }

  return display;
}


(function() {
  var shrinkWrapBlocksVal;

  support.shrinkWrapBlocks = function() {
    if ( shrinkWrapBlocksVal != null ) {
      return shrinkWrapBlocksVal;
    }

    // Will be changed later if needed.
    shrinkWrapBlocksVal = false;

    // Minified: var b,c,d
    var div, body, container;

    body = document.getElementsByTagName( "body" )[ 0 ];
    if ( !body || !body.style ) {
      // Test fired too early or in an unsupported environment, exit.
      return;
    }

    // Setup
    div = document.createElement( "div" );
    container = document.createElement( "div" );
    container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
    body.appendChild( container ).appendChild( div );

    // Support: IE6
    // Check if elements with layout shrink-wrap their children
    if ( typeof div.style.zoom !== strundefined ) {
      // Reset CSS: box-sizing; display; margin; border
      div.style.cssText =
        // Support: Firefox<29, Android 2.3
        // Vendor-prefix box-sizing
        "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
        "box-sizing:content-box;display:block;margin:0;border:0;" +
        "padding:1px;width:1px;zoom:1";
      div.appendChild( document.createElement( "div" ) ).style.width = "5px";
      shrinkWrapBlocksVal = div.offsetWidth !== 3;
    }

    body.removeChild( container );

    return shrinkWrapBlocksVal;
  };

})();
var rmargin = (/^margin/);

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );



var getStyles, curCSS,
  rposition = /^(top|right|bottom|left)$/;

if ( window.getComputedStyle ) {
  getStyles = function( elem ) {
    return elem.ownerDocument.defaultView.getComputedStyle( elem, null );
  };

  curCSS = function( elem, name, computed ) {
    var width, minWidth, maxWidth, ret,
      style = elem.style;

    computed = computed || getStyles( elem );

    // getPropertyValue is only needed for .css('filter') in IE9, see #12537
    ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

    if ( computed ) {

      if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
        ret = jQuery.style( elem, name );
      }

      // A tribute to the "awesome hack by Dean Edwards"
      // Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
      // Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
      // this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
      if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

        // Remember the original values
        width = style.width;
        minWidth = style.minWidth;
        maxWidth = style.maxWidth;

        // Put in the new values to get a computed value out
        style.minWidth = style.maxWidth = style.width = ret;
        ret = computed.width;

        // Revert the changed values
        style.width = width;
        style.minWidth = minWidth;
        style.maxWidth = maxWidth;
      }
    }

    // Support: IE
    // IE returns zIndex value as an integer.
    return ret === undefined ?
      ret :
      ret + "";
  };
} else if ( document.documentElement.currentStyle ) {
  getStyles = function( elem ) {
    return elem.currentStyle;
  };

  curCSS = function( elem, name, computed ) {
    var left, rs, rsLeft, ret,
      style = elem.style;

    computed = computed || getStyles( elem );
    ret = computed ? computed[ name ] : undefined;

    // Avoid setting ret to empty string here
    // so we don't default to auto
    if ( ret == null && style && style[ name ] ) {
      ret = style[ name ];
    }

    // From the awesome hack by Dean Edwards
    // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

    // If we're not dealing with a regular pixel number
    // but a number that has a weird ending, we need to convert it to pixels
    // but not position css attributes, as those are proportional to the parent element instead
    // and we can't measure the parent instead because it might trigger a "stacking dolls" problem
    if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

      // Remember the original values
      left = style.left;
      rs = elem.runtimeStyle;
      rsLeft = rs && rs.left;

      // Put in the new values to get a computed value out
      if ( rsLeft ) {
        rs.left = elem.currentStyle.left;
      }
      style.left = name === "fontSize" ? "1em" : ret;
      ret = style.pixelLeft + "px";

      // Revert the changed values
      style.left = left;
      if ( rsLeft ) {
        rs.left = rsLeft;
      }
    }

    // Support: IE
    // IE returns zIndex value as an integer.
    return ret === undefined ?
      ret :
      ret + "" || "auto";
  };
}




function addGetHookIf( conditionFn, hookFn ) {
  // Define the hook, we'll check on the first run if it's really needed.
  return {
    get: function() {
      var condition = conditionFn();

      if ( condition == null ) {
        // The test was not ready at this point; screw the hook this time
        // but check again when needed next time.
        return;
      }

      if ( condition ) {
        // Hook not needed (or it's not possible to use it due to missing dependency),
        // remove it.
        // Since there are no other hooks for marginRight, remove the whole object.
        delete this.get;
        return;
      }

      // Hook needed; redefine it so that the support test is not executed again.

      return (this.get = hookFn).apply( this, arguments );
    }
  };
}


(function() {
  // Minified: var b,c,d,e,f,g, h,i
  var div, style, a, pixelPositionVal, boxSizingReliableVal,
    reliableHiddenOffsetsVal, reliableMarginRightVal;

  // Setup
  div = document.createElement( "div" );
  div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
  a = div.getElementsByTagName( "a" )[ 0 ];
  style = a && a.style;

  // Finish early in limited (non-browser) environments
  if ( !style ) {
    return;
  }

  style.cssText = "float:left;opacity:.5";

  // Support: IE<9
  // Make sure that element opacity exists (as opposed to filter)
  support.opacity = style.opacity === "0.5";

  // Verify style float existence
  // (IE uses styleFloat instead of cssFloat)
  support.cssFloat = !!style.cssFloat;

  div.style.backgroundClip = "content-box";
  div.cloneNode( true ).style.backgroundClip = "";
  support.clearCloneStyle = div.style.backgroundClip === "content-box";

  // Support: Firefox<29, Android 2.3
  // Vendor-prefix box-sizing
  support.boxSizing = style.boxSizing === "" || style.MozBoxSizing === "" ||
    style.WebkitBoxSizing === "";

  jQuery.extend(support, {
    reliableHiddenOffsets: function() {
      if ( reliableHiddenOffsetsVal == null ) {
        computeStyleTests();
      }
      return reliableHiddenOffsetsVal;
    },

    boxSizingReliable: function() {
      if ( boxSizingReliableVal == null ) {
        computeStyleTests();
      }
      return boxSizingReliableVal;
    },

    pixelPosition: function() {
      if ( pixelPositionVal == null ) {
        computeStyleTests();
      }
      return pixelPositionVal;
    },

    // Support: Android 2.3
    reliableMarginRight: function() {
      if ( reliableMarginRightVal == null ) {
        computeStyleTests();
      }
      return reliableMarginRightVal;
    }
  });

  function computeStyleTests() {
    // Minified: var b,c,d,j
    var div, body, container, contents;

    body = document.getElementsByTagName( "body" )[ 0 ];
    if ( !body || !body.style ) {
      // Test fired too early or in an unsupported environment, exit.
      return;
    }

    // Setup
    div = document.createElement( "div" );
    container = document.createElement( "div" );
    container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
    body.appendChild( container ).appendChild( div );

    div.style.cssText =
      // Support: Firefox<29, Android 2.3
      // Vendor-prefix box-sizing
      "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
      "box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
      "border:1px;padding:1px;width:4px;position:absolute";

    // Support: IE<9
    // Assume reasonable values in the absence of getComputedStyle
    pixelPositionVal = boxSizingReliableVal = false;
    reliableMarginRightVal = true;

    // Check for getComputedStyle so that this code is not run in IE<9.
    if ( window.getComputedStyle ) {
      pixelPositionVal = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
      boxSizingReliableVal =
        ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

      // Support: Android 2.3
      // Div with explicit width and no margin-right incorrectly
      // gets computed margin-right based on width of container (#3333)
      // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
      contents = div.appendChild( document.createElement( "div" ) );

      // Reset CSS: box-sizing; display; margin; border; padding
      contents.style.cssText = div.style.cssText =
        // Support: Firefox<29, Android 2.3
        // Vendor-prefix box-sizing
        "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
        "box-sizing:content-box;display:block;margin:0;border:0;padding:0";
      contents.style.marginRight = contents.style.width = "0";
      div.style.width = "1px";

      reliableMarginRightVal =
        !parseFloat( ( window.getComputedStyle( contents, null ) || {} ).marginRight );
    }

    // Support: IE8
    // Check if table cells still have offsetWidth/Height when they are set
    // to display:none and there are still other visible table cells in a
    // table row; if so, offsetWidth/Height are not reliable for use when
    // determining if an element has been hidden directly using
    // display:none (it is still safe to use offsets if a parent element is
    // hidden; don safety goggles and see bug #4512 for more information).
    div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
    contents = div.getElementsByTagName( "td" );
    contents[ 0 ].style.cssText = "margin:0;border:0;padding:0;display:none";
    reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
    if ( reliableHiddenOffsetsVal ) {
      contents[ 0 ].style.display = "";
      contents[ 1 ].style.display = "none";
      reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
    }

    body.removeChild( container );
  }

})();


// A method for quickly swapping in/out CSS properties to get correct calculations.
jQuery.swap = function( elem, options, callback, args ) {
  var ret, name,
    old = {};

  // Remember the old values, and insert the new ones
  for ( name in options ) {
    old[ name ] = elem.style[ name ];
    elem.style[ name ] = options[ name ];
  }

  ret = callback.apply( elem, args || [] );

  // Revert the old values
  for ( name in options ) {
    elem.style[ name ] = old[ name ];
  }

  return ret;
};


var
    ralpha = /alpha\([^)]*\)/i,
  ropacity = /opacity\s*=\s*([^)]*)/,

  // swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
  // see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
  rdisplayswap = /^(none|table(?!-c[ea]).+)/,
  rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),
  rrelNum = new RegExp( "^([+-])=(" + pnum + ")", "i" ),

  cssShow = { position: "absolute", visibility: "hidden", display: "block" },
  cssNormalTransform = {
    letterSpacing: "0",
    fontWeight: "400"
  },

  cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];


// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

  // shortcut for names that are not vendor prefixed
  if ( name in style ) {
    return name;
  }

  // check for vendor prefixed names
  var capName = name.charAt(0).toUpperCase() + name.slice(1),
    origName = name,
    i = cssPrefixes.length;

  while ( i-- ) {
    name = cssPrefixes[ i ] + capName;
    if ( name in style ) {
      return name;
    }
  }

  return origName;
}

function showHide( elements, show ) {
  var display, elem, hidden,
    values = [],
    index = 0,
    length = elements.length;

  for ( ; index < length; index++ ) {
    elem = elements[ index ];
    if ( !elem.style ) {
      continue;
    }

    values[ index ] = jQuery._data( elem, "olddisplay" );
    display = elem.style.display;
    if ( show ) {
      // Reset the inline display of this element to learn if it is
      // being hidden by cascaded rules or not
      if ( !values[ index ] && display === "none" ) {
        elem.style.display = "";
      }

      // Set elements which have been overridden with display: none
      // in a stylesheet to whatever the default browser style is
      // for such an element
      if ( elem.style.display === "" && isHidden( elem ) ) {
        values[ index ] = jQuery._data( elem, "olddisplay", defaultDisplay(elem.nodeName) );
      }
    } else {
      hidden = isHidden( elem );

      if ( display && display !== "none" || !hidden ) {
        jQuery._data( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
      }
    }
  }

  // Set the display of most of the elements in a second loop
  // to avoid the constant reflow
  for ( index = 0; index < length; index++ ) {
    elem = elements[ index ];
    if ( !elem.style ) {
      continue;
    }
    if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
      elem.style.display = show ? values[ index ] || "" : "none";
    }
  }

  return elements;
}

function setPositiveNumber( elem, value, subtract ) {
  var matches = rnumsplit.exec( value );
  return matches ?
    // Guard against undefined "subtract", e.g., when used as in cssHooks
    Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
    value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
  var i = extra === ( isBorderBox ? "border" : "content" ) ?
    // If we already have the right measurement, avoid augmentation
    4 :
    // Otherwise initialize for horizontal or vertical properties
    name === "width" ? 1 : 0,

    val = 0;

  for ( ; i < 4; i += 2 ) {
    // both box models exclude margin, so add it if we want it
    if ( extra === "margin" ) {
      val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
    }

    if ( isBorderBox ) {
      // border-box includes padding, so remove it if we want content
      if ( extra === "content" ) {
        val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
      }

      // at this point, extra isn't border nor margin, so remove border
      if ( extra !== "margin" ) {
        val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
      }
    } else {
      // at this point, extra isn't content, so add padding
      val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

      // at this point, extra isn't content nor padding, so add border
      if ( extra !== "padding" ) {
        val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
      }
    }
  }

  return val;
}

function getWidthOrHeight( elem, name, extra ) {

  // Start with offset property, which is equivalent to the border-box value
  var valueIsBorderBox = true,
    val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
    styles = getStyles( elem ),
    isBorderBox = support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

  // some non-html elements return undefined for offsetWidth, so check for null/undefined
  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
  if ( val <= 0 || val == null ) {
    // Fall back to computed then uncomputed css if necessary
    val = curCSS( elem, name, styles );
    if ( val < 0 || val == null ) {
      val = elem.style[ name ];
    }

    // Computed unit is not pixels. Stop here and return.
    if ( rnumnonpx.test(val) ) {
      return val;
    }

    // we need the check for style in case a browser which returns unreliable values
    // for getComputedStyle silently falls back to the reliable elem.style
    valueIsBorderBox = isBorderBox && ( support.boxSizingReliable() || val === elem.style[ name ] );

    // Normalize "", auto, and prepare for extra
    val = parseFloat( val ) || 0;
  }

  // use the active box-sizing model to add/subtract irrelevant styles
  return ( val +
    augmentWidthOrHeight(
      elem,
      name,
      extra || ( isBorderBox ? "border" : "content" ),
      valueIsBorderBox,
      styles
    )
  ) + "px";
}

jQuery.extend({
  // Add in style property hooks for overriding the default
  // behavior of getting and setting a style property
  cssHooks: {
    opacity: {
      get: function( elem, computed ) {
        if ( computed ) {
          // We should always get a number back from opacity
          var ret = curCSS( elem, "opacity" );
          return ret === "" ? "1" : ret;
        }
      }
    }
  },

  // Don't automatically add "px" to these possibly-unitless properties
  cssNumber: {
    "columnCount": true,
    "fillOpacity": true,
    "flexGrow": true,
    "flexShrink": true,
    "fontWeight": true,
    "lineHeight": true,
    "opacity": true,
    "order": true,
    "orphans": true,
    "widows": true,
    "zIndex": true,
    "zoom": true
  },

  // Add in properties whose names you wish to fix before
  // setting or getting the value
  cssProps: {
    // normalize float css property
    "float": support.cssFloat ? "cssFloat" : "styleFloat"
  },

  // Get and set the style property on a DOM Node
  style: function( elem, name, value, extra ) {
    // Don't set styles on text and comment nodes
    if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
      return;
    }

    // Make sure that we're working with the right name
    var ret, type, hooks,
      origName = jQuery.camelCase( name ),
      style = elem.style;

    name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

    // gets hook for the prefixed version
    // followed by the unprefixed version
    hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

    // Check if we're setting a value
    if ( value !== undefined ) {
      type = typeof value;

      // convert relative number strings (+= or -=) to relative numbers. #7345
      if ( type === "string" && (ret = rrelNum.exec( value )) ) {
        value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
        // Fixes bug #9237
        type = "number";
      }

      // Make sure that null and NaN values aren't set. See: #7116
      if ( value == null || value !== value ) {
        return;
      }

      // If a number was passed in, add 'px' to the (except for certain CSS properties)
      if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
        value += "px";
      }

      // Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
      // but it would mean to define eight (for every problematic property) identical functions
      if ( !support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
        style[ name ] = "inherit";
      }

      // If a hook was provided, use that value, otherwise just set the specified value
      if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {

        // Support: IE
        // Swallow errors from 'invalid' CSS values (#5509)
        try {
          style[ name ] = value;
        } catch(e) {}
      }

    } else {
      // If a hook was provided get the non-computed value from there
      if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
        return ret;
      }

      // Otherwise just get the value from the style object
      return style[ name ];
    }
  },

  css: function( elem, name, extra, styles ) {
    var num, val, hooks,
      origName = jQuery.camelCase( name );

    // Make sure that we're working with the right name
    name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

    // gets hook for the prefixed version
    // followed by the unprefixed version
    hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

    // If a hook was provided get the computed value from there
    if ( hooks && "get" in hooks ) {
      val = hooks.get( elem, true, extra );
    }

    // Otherwise, if a way to get the computed value exists, use that
    if ( val === undefined ) {
      val = curCSS( elem, name, styles );
    }

    //convert "normal" to computed value
    if ( val === "normal" && name in cssNormalTransform ) {
      val = cssNormalTransform[ name ];
    }

    // Return, converting to number if forced or a qualifier was provided and val looks numeric
    if ( extra === "" || extra ) {
      num = parseFloat( val );
      return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
    }
    return val;
  }
});

jQuery.each([ "height", "width" ], function( i, name ) {
  jQuery.cssHooks[ name ] = {
    get: function( elem, computed, extra ) {
      if ( computed ) {
        // certain elements can have dimension info if we invisibly show them
        // however, it must have a current display style that would benefit from this
        return rdisplayswap.test( jQuery.css( elem, "display" ) ) && elem.offsetWidth === 0 ?
          jQuery.swap( elem, cssShow, function() {
            return getWidthOrHeight( elem, name, extra );
          }) :
          getWidthOrHeight( elem, name, extra );
      }
    },

    set: function( elem, value, extra ) {
      var styles = extra && getStyles( elem );
      return setPositiveNumber( elem, value, extra ?
        augmentWidthOrHeight(
          elem,
          name,
          extra,
          support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
          styles
        ) : 0
      );
    }
  };
});

if ( !support.opacity ) {
  jQuery.cssHooks.opacity = {
    get: function( elem, computed ) {
      // IE uses filters for opacity
      return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
        ( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
        computed ? "1" : "";
    },

    set: function( elem, value ) {
      var style = elem.style,
        currentStyle = elem.currentStyle,
        opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
        filter = currentStyle && currentStyle.filter || style.filter || "";

      // IE has trouble with opacity if it does not have layout
      // Force it by setting the zoom level
      style.zoom = 1;

      // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
      // if value === "", then remove inline opacity #12685
      if ( ( value >= 1 || value === "" ) &&
          jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
          style.removeAttribute ) {

        // Setting style.filter to null, "" & " " still leave "filter:" in the cssText
        // if "filter:" is present at all, clearType is disabled, we want to avoid this
        // style.removeAttribute is IE Only, but so apparently is this code path...
        style.removeAttribute( "filter" );

        // if there is no filter style applied in a css rule or unset inline opacity, we are done
        if ( value === "" || currentStyle && !currentStyle.filter ) {
          return;
        }
      }

      // otherwise, set new filter values
      style.filter = ralpha.test( filter ) ?
        filter.replace( ralpha, opacity ) :
        filter + " " + opacity;
    }
  };
}

jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
  function( elem, computed ) {
    if ( computed ) {
      // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
      // Work around by temporarily setting element display to inline-block
      return jQuery.swap( elem, { "display": "inline-block" },
        curCSS, [ elem, "marginRight" ] );
    }
  }
);

// These hooks are used by animate to expand properties
jQuery.each({
  margin: "",
  padding: "",
  border: "Width"
}, function( prefix, suffix ) {
  jQuery.cssHooks[ prefix + suffix ] = {
    expand: function( value ) {
      var i = 0,
        expanded = {},

        // assumes a single number if not a string
        parts = typeof value === "string" ? value.split(" ") : [ value ];

      for ( ; i < 4; i++ ) {
        expanded[ prefix + cssExpand[ i ] + suffix ] =
          parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
      }

      return expanded;
    }
  };

  if ( !rmargin.test( prefix ) ) {
    jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
  }
});

jQuery.fn.extend({
  css: function( name, value ) {
    return access( this, function( elem, name, value ) {
      var styles, len,
        map = {},
        i = 0;

      if ( jQuery.isArray( name ) ) {
        styles = getStyles( elem );
        len = name.length;

        for ( ; i < len; i++ ) {
          map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
        }

        return map;
      }

      return value !== undefined ?
        jQuery.style( elem, name, value ) :
        jQuery.css( elem, name );
    }, name, value, arguments.length > 1 );
  },
  show: function() {
    return showHide( this, true );
  },
  hide: function() {
    return showHide( this );
  },
  toggle: function( state ) {
    if ( typeof state === "boolean" ) {
      return state ? this.show() : this.hide();
    }

    return this.each(function() {
      if ( isHidden( this ) ) {
        jQuery( this ).show();
      } else {
        jQuery( this ).hide();
      }
    });
  }
});


function Tween( elem, options, prop, end, easing ) {
  return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
  constructor: Tween,
  init: function( elem, options, prop, end, easing, unit ) {
    this.elem = elem;
    this.prop = prop;
    this.easing = easing || "swing";
    this.options = options;
    this.start = this.now = this.cur();
    this.end = end;
    this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
  },
  cur: function() {
    var hooks = Tween.propHooks[ this.prop ];

    return hooks && hooks.get ?
      hooks.get( this ) :
      Tween.propHooks._default.get( this );
  },
  run: function( percent ) {
    var eased,
      hooks = Tween.propHooks[ this.prop ];

    if ( this.options.duration ) {
      this.pos = eased = jQuery.easing[ this.easing ](
        percent, this.options.duration * percent, 0, 1, this.options.duration
      );
    } else {
      this.pos = eased = percent;
    }
    this.now = ( this.end - this.start ) * eased + this.start;

    if ( this.options.step ) {
      this.options.step.call( this.elem, this.now, this );
    }

    if ( hooks && hooks.set ) {
      hooks.set( this );
    } else {
      Tween.propHooks._default.set( this );
    }
    return this;
  }
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
  _default: {
    get: function( tween ) {
      var result;

      if ( tween.elem[ tween.prop ] != null &&
        (!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
        return tween.elem[ tween.prop ];
      }

      // passing an empty string as a 3rd parameter to .css will automatically
      // attempt a parseFloat and fallback to a string if the parse fails
      // so, simple values such as "10px" are parsed to Float.
      // complex values such as "rotate(1rad)" are returned as is.
      result = jQuery.css( tween.elem, tween.prop, "" );
      // Empty strings, null, undefined and "auto" are converted to 0.
      return !result || result === "auto" ? 0 : result;
    },
    set: function( tween ) {
      // use step hook for back compat - use cssHook if its there - use .style if its
      // available and use plain properties where available
      if ( jQuery.fx.step[ tween.prop ] ) {
        jQuery.fx.step[ tween.prop ]( tween );
      } else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
        jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
      } else {
        tween.elem[ tween.prop ] = tween.now;
      }
    }
  }
};

// Support: IE <=9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
  set: function( tween ) {
    if ( tween.elem.nodeType && tween.elem.parentNode ) {
      tween.elem[ tween.prop ] = tween.now;
    }
  }
};

jQuery.easing = {
  linear: function( p ) {
    return p;
  },
  swing: function( p ) {
    return 0.5 - Math.cos( p * Math.PI ) / 2;
  }
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
  fxNow, timerId,
  rfxtypes = /^(?:toggle|show|hide)$/,
  rfxnum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" ),
  rrun = /queueHooks$/,
  animationPrefilters = [ defaultPrefilter ],
  tweeners = {
    "*": [ function( prop, value ) {
      var tween = this.createTween( prop, value ),
        target = tween.cur(),
        parts = rfxnum.exec( value ),
        unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

        // Starting value computation is required for potential unit mismatches
        start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
          rfxnum.exec( jQuery.css( tween.elem, prop ) ),
        scale = 1,
        maxIterations = 20;

      if ( start && start[ 3 ] !== unit ) {
        // Trust units reported by jQuery.css
        unit = unit || start[ 3 ];

        // Make sure we update the tween properties later on
        parts = parts || [];

        // Iteratively approximate from a nonzero starting point
        start = +target || 1;

        do {
          // If previous iteration zeroed out, double until we get *something*
          // Use a string for doubling factor so we don't accidentally see scale as unchanged below
          scale = scale || ".5";

          // Adjust and apply
          start = start / scale;
          jQuery.style( tween.elem, prop, start + unit );

        // Update scale, tolerating zero or NaN from tween.cur()
        // And breaking the loop if scale is unchanged or perfect, or if we've just had enough
        } while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
      }

      // Update tween properties
      if ( parts ) {
        start = tween.start = +start || +target || 0;
        tween.unit = unit;
        // If a +=/-= token was provided, we're doing a relative animation
        tween.end = parts[ 1 ] ?
          start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
          +parts[ 2 ];
      }

      return tween;
    } ]
  };

// Animations created synchronously will run synchronously
function createFxNow() {
  setTimeout(function() {
    fxNow = undefined;
  });
  return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
  var which,
    attrs = { height: type },
    i = 0;

  // if we include width, step value is 1 to do all cssExpand values,
  // if we don't include width, step value is 2 to skip over Left and Right
  includeWidth = includeWidth ? 1 : 0;
  for ( ; i < 4 ; i += 2 - includeWidth ) {
    which = cssExpand[ i ];
    attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
  }

  if ( includeWidth ) {
    attrs.opacity = attrs.width = type;
  }

  return attrs;
}

function createTween( value, prop, animation ) {
  var tween,
    collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
    index = 0,
    length = collection.length;
  for ( ; index < length; index++ ) {
    if ( (tween = collection[ index ].call( animation, prop, value )) ) {

      // we're done with this property
      return tween;
    }
  }
}

function defaultPrefilter( elem, props, opts ) {
  /* jshint validthis: true */
  var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
    anim = this,
    orig = {},
    style = elem.style,
    hidden = elem.nodeType && isHidden( elem ),
    dataShow = jQuery._data( elem, "fxshow" );

  // handle queue: false promises
  if ( !opts.queue ) {
    hooks = jQuery._queueHooks( elem, "fx" );
    if ( hooks.unqueued == null ) {
      hooks.unqueued = 0;
      oldfire = hooks.empty.fire;
      hooks.empty.fire = function() {
        if ( !hooks.unqueued ) {
          oldfire();
        }
      };
    }
    hooks.unqueued++;

    anim.always(function() {
      // doing this makes sure that the complete handler will be called
      // before this completes
      anim.always(function() {
        hooks.unqueued--;
        if ( !jQuery.queue( elem, "fx" ).length ) {
          hooks.empty.fire();
        }
      });
    });
  }

  // height/width overflow pass
  if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
    // Make sure that nothing sneaks out
    // Record all 3 overflow attributes because IE does not
    // change the overflow attribute when overflowX and
    // overflowY are set to the same value
    opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

    // Set display property to inline-block for height/width
    // animations on inline elements that are having width/height animated
    display = jQuery.css( elem, "display" );

    // Test default display if display is currently "none"
    checkDisplay = display === "none" ?
      jQuery._data( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

    if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {

      // inline-level elements accept inline-block;
      // block-level elements need to be inline with layout
      if ( !support.inlineBlockNeedsLayout || defaultDisplay( elem.nodeName ) === "inline" ) {
        style.display = "inline-block";
      } else {
        style.zoom = 1;
      }
    }
  }

  if ( opts.overflow ) {
    style.overflow = "hidden";
    if ( !support.shrinkWrapBlocks() ) {
      anim.always(function() {
        style.overflow = opts.overflow[ 0 ];
        style.overflowX = opts.overflow[ 1 ];
        style.overflowY = opts.overflow[ 2 ];
      });
    }
  }

  // show/hide pass
  for ( prop in props ) {
    value = props[ prop ];
    if ( rfxtypes.exec( value ) ) {
      delete props[ prop ];
      toggle = toggle || value === "toggle";
      if ( value === ( hidden ? "hide" : "show" ) ) {

        // If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
        if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
          hidden = true;
        } else {
          continue;
        }
      }
      orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

    // Any non-fx value stops us from restoring the original display value
    } else {
      display = undefined;
    }
  }

  if ( !jQuery.isEmptyObject( orig ) ) {
    if ( dataShow ) {
      if ( "hidden" in dataShow ) {
        hidden = dataShow.hidden;
      }
    } else {
      dataShow = jQuery._data( elem, "fxshow", {} );
    }

    // store state if its toggle - enables .stop().toggle() to "reverse"
    if ( toggle ) {
      dataShow.hidden = !hidden;
    }
    if ( hidden ) {
      jQuery( elem ).show();
    } else {
      anim.done(function() {
        jQuery( elem ).hide();
      });
    }
    anim.done(function() {
      var prop;
      jQuery._removeData( elem, "fxshow" );
      for ( prop in orig ) {
        jQuery.style( elem, prop, orig[ prop ] );
      }
    });
    for ( prop in orig ) {
      tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

      if ( !( prop in dataShow ) ) {
        dataShow[ prop ] = tween.start;
        if ( hidden ) {
          tween.end = tween.start;
          tween.start = prop === "width" || prop === "height" ? 1 : 0;
        }
      }
    }

  // If this is a noop like .hide().hide(), restore an overwritten display value
  } else if ( (display === "none" ? defaultDisplay( elem.nodeName ) : display) === "inline" ) {
    style.display = display;
  }
}

function propFilter( props, specialEasing ) {
  var index, name, easing, value, hooks;

  // camelCase, specialEasing and expand cssHook pass
  for ( index in props ) {
    name = jQuery.camelCase( index );
    easing = specialEasing[ name ];
    value = props[ index ];
    if ( jQuery.isArray( value ) ) {
      easing = value[ 1 ];
      value = props[ index ] = value[ 0 ];
    }

    if ( index !== name ) {
      props[ name ] = value;
      delete props[ index ];
    }

    hooks = jQuery.cssHooks[ name ];
    if ( hooks && "expand" in hooks ) {
      value = hooks.expand( value );
      delete props[ name ];

      // not quite $.extend, this wont overwrite keys already present.
      // also - reusing 'index' from above because we have the correct "name"
      for ( index in value ) {
        if ( !( index in props ) ) {
          props[ index ] = value[ index ];
          specialEasing[ index ] = easing;
        }
      }
    } else {
      specialEasing[ name ] = easing;
    }
  }
}

function Animation( elem, properties, options ) {
  var result,
    stopped,
    index = 0,
    length = animationPrefilters.length,
    deferred = jQuery.Deferred().always( function() {
      // don't match elem in the :animated selector
      delete tick.elem;
    }),
    tick = function() {
      if ( stopped ) {
        return false;
      }
      var currentTime = fxNow || createFxNow(),
        remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
        // archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
        temp = remaining / animation.duration || 0,
        percent = 1 - temp,
        index = 0,
        length = animation.tweens.length;

      for ( ; index < length ; index++ ) {
        animation.tweens[ index ].run( percent );
      }

      deferred.notifyWith( elem, [ animation, percent, remaining ]);

      if ( percent < 1 && length ) {
        return remaining;
      } else {
        deferred.resolveWith( elem, [ animation ] );
        return false;
      }
    },
    animation = deferred.promise({
      elem: elem,
      props: jQuery.extend( {}, properties ),
      opts: jQuery.extend( true, { specialEasing: {} }, options ),
      originalProperties: properties,
      originalOptions: options,
      startTime: fxNow || createFxNow(),
      duration: options.duration,
      tweens: [],
      createTween: function( prop, end ) {
        var tween = jQuery.Tween( elem, animation.opts, prop, end,
            animation.opts.specialEasing[ prop ] || animation.opts.easing );
        animation.tweens.push( tween );
        return tween;
      },
      stop: function( gotoEnd ) {
        var index = 0,
          // if we are going to the end, we want to run all the tweens
          // otherwise we skip this part
          length = gotoEnd ? animation.tweens.length : 0;
        if ( stopped ) {
          return this;
        }
        stopped = true;
        for ( ; index < length ; index++ ) {
          animation.tweens[ index ].run( 1 );
        }

        // resolve when we played the last frame
        // otherwise, reject
        if ( gotoEnd ) {
          deferred.resolveWith( elem, [ animation, gotoEnd ] );
        } else {
          deferred.rejectWith( elem, [ animation, gotoEnd ] );
        }
        return this;
      }
    }),
    props = animation.props;

  propFilter( props, animation.opts.specialEasing );

  for ( ; index < length ; index++ ) {
    result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
    if ( result ) {
      return result;
    }
  }

  jQuery.map( props, createTween, animation );

  if ( jQuery.isFunction( animation.opts.start ) ) {
    animation.opts.start.call( elem, animation );
  }

  jQuery.fx.timer(
    jQuery.extend( tick, {
      elem: elem,
      anim: animation,
      queue: animation.opts.queue
    })
  );

  // attach callbacks from options
  return animation.progress( animation.opts.progress )
    .done( animation.opts.done, animation.opts.complete )
    .fail( animation.opts.fail )
    .always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {
  tweener: function( props, callback ) {
    if ( jQuery.isFunction( props ) ) {
      callback = props;
      props = [ "*" ];
    } else {
      props = props.split(" ");
    }

    var prop,
      index = 0,
      length = props.length;

    for ( ; index < length ; index++ ) {
      prop = props[ index ];
      tweeners[ prop ] = tweeners[ prop ] || [];
      tweeners[ prop ].unshift( callback );
    }
  },

  prefilter: function( callback, prepend ) {
    if ( prepend ) {
      animationPrefilters.unshift( callback );
    } else {
      animationPrefilters.push( callback );
    }
  }
});

jQuery.speed = function( speed, easing, fn ) {
  var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
    complete: fn || !fn && easing ||
      jQuery.isFunction( speed ) && speed,
    duration: speed,
    easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
  };

  opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
    opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

  // normalize opt.queue - true/undefined/null -> "fx"
  if ( opt.queue == null || opt.queue === true ) {
    opt.queue = "fx";
  }

  // Queueing
  opt.old = opt.complete;

  opt.complete = function() {
    if ( jQuery.isFunction( opt.old ) ) {
      opt.old.call( this );
    }

    if ( opt.queue ) {
      jQuery.dequeue( this, opt.queue );
    }
  };

  return opt;
};

jQuery.fn.extend({
  fadeTo: function( speed, to, easing, callback ) {

    // show any hidden elements after setting opacity to 0
    return this.filter( isHidden ).css( "opacity", 0 ).show()

      // animate to the value specified
      .end().animate({ opacity: to }, speed, easing, callback );
  },
  animate: function( prop, speed, easing, callback ) {
    var empty = jQuery.isEmptyObject( prop ),
      optall = jQuery.speed( speed, easing, callback ),
      doAnimation = function() {
        // Operate on a copy of prop so per-property easing won't be lost
        var anim = Animation( this, jQuery.extend( {}, prop ), optall );

        // Empty animations, or finishing resolves immediately
        if ( empty || jQuery._data( this, "finish" ) ) {
          anim.stop( true );
        }
      };
      doAnimation.finish = doAnimation;

    return empty || optall.queue === false ?
      this.each( doAnimation ) :
      this.queue( optall.queue, doAnimation );
  },
  stop: function( type, clearQueue, gotoEnd ) {
    var stopQueue = function( hooks ) {
      var stop = hooks.stop;
      delete hooks.stop;
      stop( gotoEnd );
    };

    if ( typeof type !== "string" ) {
      gotoEnd = clearQueue;
      clearQueue = type;
      type = undefined;
    }
    if ( clearQueue && type !== false ) {
      this.queue( type || "fx", [] );
    }

    return this.each(function() {
      var dequeue = true,
        index = type != null && type + "queueHooks",
        timers = jQuery.timers,
        data = jQuery._data( this );

      if ( index ) {
        if ( data[ index ] && data[ index ].stop ) {
          stopQueue( data[ index ] );
        }
      } else {
        for ( index in data ) {
          if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
            stopQueue( data[ index ] );
          }
        }
      }

      for ( index = timers.length; index--; ) {
        if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
          timers[ index ].anim.stop( gotoEnd );
          dequeue = false;
          timers.splice( index, 1 );
        }
      }

      // start the next in the queue if the last step wasn't forced
      // timers currently will call their complete callbacks, which will dequeue
      // but only if they were gotoEnd
      if ( dequeue || !gotoEnd ) {
        jQuery.dequeue( this, type );
      }
    });
  },
  finish: function( type ) {
    if ( type !== false ) {
      type = type || "fx";
    }
    return this.each(function() {
      var index,
        data = jQuery._data( this ),
        queue = data[ type + "queue" ],
        hooks = data[ type + "queueHooks" ],
        timers = jQuery.timers,
        length = queue ? queue.length : 0;

      // enable finishing flag on private data
      data.finish = true;

      // empty the queue first
      jQuery.queue( this, type, [] );

      if ( hooks && hooks.stop ) {
        hooks.stop.call( this, true );
      }

      // look for any active animations, and finish them
      for ( index = timers.length; index--; ) {
        if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
          timers[ index ].anim.stop( true );
          timers.splice( index, 1 );
        }
      }

      // look for any animations in the old queue and finish them
      for ( index = 0; index < length; index++ ) {
        if ( queue[ index ] && queue[ index ].finish ) {
          queue[ index ].finish.call( this );
        }
      }

      // turn off finishing flag
      delete data.finish;
    });
  }
});

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
  var cssFn = jQuery.fn[ name ];
  jQuery.fn[ name ] = function( speed, easing, callback ) {
    return speed == null || typeof speed === "boolean" ?
      cssFn.apply( this, arguments ) :
      this.animate( genFx( name, true ), speed, easing, callback );
  };
});

// Generate shortcuts for custom animations
jQuery.each({
  slideDown: genFx("show"),
  slideUp: genFx("hide"),
  slideToggle: genFx("toggle"),
  fadeIn: { opacity: "show" },
  fadeOut: { opacity: "hide" },
  fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
  jQuery.fn[ name ] = function( speed, easing, callback ) {
    return this.animate( props, speed, easing, callback );
  };
});

jQuery.timers = [];
jQuery.fx.tick = function() {
  var timer,
    timers = jQuery.timers,
    i = 0;

  fxNow = jQuery.now();

  for ( ; i < timers.length; i++ ) {
    timer = timers[ i ];
    // Checks the timer has not already been removed
    if ( !timer() && timers[ i ] === timer ) {
      timers.splice( i--, 1 );
    }
  }

  if ( !timers.length ) {
    jQuery.fx.stop();
  }
  fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
  jQuery.timers.push( timer );
  if ( timer() ) {
    jQuery.fx.start();
  } else {
    jQuery.timers.pop();
  }
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
  if ( !timerId ) {
    timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
  }
};

jQuery.fx.stop = function() {
  clearInterval( timerId );
  timerId = null;
};

jQuery.fx.speeds = {
  slow: 600,
  fast: 200,
  // Default speed
  _default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
  time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
  type = type || "fx";

  return this.queue( type, function( next, hooks ) {
    var timeout = setTimeout( next, time );
    hooks.stop = function() {
      clearTimeout( timeout );
    };
  });
};


(function() {
  // Minified: var a,b,c,d,e
  var input, div, select, a, opt;

  // Setup
  div = document.createElement( "div" );
  div.setAttribute( "className", "t" );
  div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
  a = div.getElementsByTagName("a")[ 0 ];

  // First batch of tests.
  select = document.createElement("select");
  opt = select.appendChild( document.createElement("option") );
  input = div.getElementsByTagName("input")[ 0 ];

  a.style.cssText = "top:1px";

  // Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
  support.getSetAttribute = div.className !== "t";

  // Get the style information from getAttribute
  // (IE uses .cssText instead)
  support.style = /top/.test( a.getAttribute("style") );

  // Make sure that URLs aren't manipulated
  // (IE normalizes it by default)
  support.hrefNormalized = a.getAttribute("href") === "/a";

  // Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
  support.checkOn = !!input.value;

  // Make sure that a selected-by-default option has a working selected property.
  // (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
  support.optSelected = opt.selected;

  // Tests for enctype support on a form (#6743)
  support.enctype = !!document.createElement("form").enctype;

  // Make sure that the options inside disabled selects aren't marked as disabled
  // (WebKit marks them as disabled)
  select.disabled = true;
  support.optDisabled = !opt.disabled;

  // Support: IE8 only
  // Check if we can trust getAttribute("value")
  input = document.createElement( "input" );
  input.setAttribute( "value", "" );
  support.input = input.getAttribute( "value" ) === "";

  // Check if an input maintains its value after becoming a radio
  input.value = "t";
  input.setAttribute( "type", "radio" );
  support.radioValue = input.value === "t";
})();


var rreturn = /\r/g;

jQuery.fn.extend({
  val: function( value ) {
    var hooks, ret, isFunction,
      elem = this[0];

    if ( !arguments.length ) {
      if ( elem ) {
        hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

        if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
          return ret;
        }

        ret = elem.value;

        return typeof ret === "string" ?
          // handle most common string cases
          ret.replace(rreturn, "") :
          // handle cases where value is null/undef or number
          ret == null ? "" : ret;
      }

      return;
    }

    isFunction = jQuery.isFunction( value );

    return this.each(function( i ) {
      var val;

      if ( this.nodeType !== 1 ) {
        return;
      }

      if ( isFunction ) {
        val = value.call( this, i, jQuery( this ).val() );
      } else {
        val = value;
      }

      // Treat null/undefined as ""; convert numbers to string
      if ( val == null ) {
        val = "";
      } else if ( typeof val === "number" ) {
        val += "";
      } else if ( jQuery.isArray( val ) ) {
        val = jQuery.map( val, function( value ) {
          return value == null ? "" : value + "";
        });
      }

      hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

      // If set returns undefined, fall back to normal setting
      if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
        this.value = val;
      }
    });
  }
});

jQuery.extend({
  valHooks: {
    option: {
      get: function( elem ) {
        var val = jQuery.find.attr( elem, "value" );
        return val != null ?
          val :
          // Support: IE10-11+
          // option.text throws exceptions (#14686, #14858)
          jQuery.trim( jQuery.text( elem ) );
      }
    },
    select: {
      get: function( elem ) {
        var value, option,
          options = elem.options,
          index = elem.selectedIndex,
          one = elem.type === "select-one" || index < 0,
          values = one ? null : [],
          max = one ? index + 1 : options.length,
          i = index < 0 ?
            max :
            one ? index : 0;

        // Loop through all the selected options
        for ( ; i < max; i++ ) {
          option = options[ i ];

          // oldIE doesn't update selected after form reset (#2551)
          if ( ( option.selected || i === index ) &&
              // Don't return options that are disabled or in a disabled optgroup
              ( support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
              ( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

            // Get the specific value for the option
            value = jQuery( option ).val();

            // We don't need an array for one selects
            if ( one ) {
              return value;
            }

            // Multi-Selects return an array
            values.push( value );
          }
        }

        return values;
      },

      set: function( elem, value ) {
        var optionSet, option,
          options = elem.options,
          values = jQuery.makeArray( value ),
          i = options.length;

        while ( i-- ) {
          option = options[ i ];

          if ( jQuery.inArray( jQuery.valHooks.option.get( option ), values ) >= 0 ) {

            // Support: IE6
            // When new option element is added to select box we need to
            // force reflow of newly added node in order to workaround delay
            // of initialization properties
            try {
              option.selected = optionSet = true;

            } catch ( _ ) {

              // Will be executed only in IE6
              option.scrollHeight;
            }

          } else {
            option.selected = false;
          }
        }

        // Force browsers to behave consistently when non-matching value is set
        if ( !optionSet ) {
          elem.selectedIndex = -1;
        }

        return options;
      }
    }
  }
});

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
  jQuery.valHooks[ this ] = {
    set: function( elem, value ) {
      if ( jQuery.isArray( value ) ) {
        return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
      }
    }
  };
  if ( !support.checkOn ) {
    jQuery.valHooks[ this ].get = function( elem ) {
      // Support: Webkit
      // "" is returned instead of "on" if a value isn't specified
      return elem.getAttribute("value") === null ? "on" : elem.value;
    };
  }
});




var nodeHook, boolHook,
  attrHandle = jQuery.expr.attrHandle,
  ruseDefault = /^(?:checked|selected)$/i,
  getSetAttribute = support.getSetAttribute,
  getSetInput = support.input;

jQuery.fn.extend({
  attr: function( name, value ) {
    return access( this, jQuery.attr, name, value, arguments.length > 1 );
  },

  removeAttr: function( name ) {
    return this.each(function() {
      jQuery.removeAttr( this, name );
    });
  }
});

jQuery.extend({
  attr: function( elem, name, value ) {
    var hooks, ret,
      nType = elem.nodeType;

    // don't get/set attributes on text, comment and attribute nodes
    if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
      return;
    }

    // Fallback to prop when attributes are not supported
    if ( typeof elem.getAttribute === strundefined ) {
      return jQuery.prop( elem, name, value );
    }

    // All attributes are lowercase
    // Grab necessary hook if one is defined
    if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
      name = name.toLowerCase();
      hooks = jQuery.attrHooks[ name ] ||
        ( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
    }

    if ( value !== undefined ) {

      if ( value === null ) {
        jQuery.removeAttr( elem, name );

      } else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
        return ret;

      } else {
        elem.setAttribute( name, value + "" );
        return value;
      }

    } else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
      return ret;

    } else {
      ret = jQuery.find.attr( elem, name );

      // Non-existent attributes return null, we normalize to undefined
      return ret == null ?
        undefined :
        ret;
    }
  },

  removeAttr: function( elem, value ) {
    var name, propName,
      i = 0,
      attrNames = value && value.match( rnotwhite );

    if ( attrNames && elem.nodeType === 1 ) {
      while ( (name = attrNames[i++]) ) {
        propName = jQuery.propFix[ name ] || name;

        // Boolean attributes get special treatment (#10870)
        if ( jQuery.expr.match.bool.test( name ) ) {
          // Set corresponding property to false
          if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
            elem[ propName ] = false;
          // Support: IE<9
          // Also clear defaultChecked/defaultSelected (if appropriate)
          } else {
            elem[ jQuery.camelCase( "default-" + name ) ] =
              elem[ propName ] = false;
          }

        // See #9699 for explanation of this approach (setting first, then removal)
        } else {
          jQuery.attr( elem, name, "" );
        }

        elem.removeAttribute( getSetAttribute ? name : propName );
      }
    }
  },

  attrHooks: {
    type: {
      set: function( elem, value ) {
        if ( !support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
          // Setting the type on a radio button after the value resets the value in IE6-9
          // Reset value to default in case type is set after value during creation
          var val = elem.value;
          elem.setAttribute( "type", value );
          if ( val ) {
            elem.value = val;
          }
          return value;
        }
      }
    }
  }
});

// Hook for boolean attributes
boolHook = {
  set: function( elem, value, name ) {
    if ( value === false ) {
      // Remove boolean attributes when set to false
      jQuery.removeAttr( elem, name );
    } else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
      // IE<8 needs the *property* name
      elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

    // Use defaultChecked and defaultSelected for oldIE
    } else {
      elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
    }

    return name;
  }
};

// Retrieve booleans specially
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {

  var getter = attrHandle[ name ] || jQuery.find.attr;

  attrHandle[ name ] = getSetInput && getSetAttribute || !ruseDefault.test( name ) ?
    function( elem, name, isXML ) {
      var ret, handle;
      if ( !isXML ) {
        // Avoid an infinite loop by temporarily removing this function from the getter
        handle = attrHandle[ name ];
        attrHandle[ name ] = ret;
        ret = getter( elem, name, isXML ) != null ?
          name.toLowerCase() :
          null;
        attrHandle[ name ] = handle;
      }
      return ret;
    } :
    function( elem, name, isXML ) {
      if ( !isXML ) {
        return elem[ jQuery.camelCase( "default-" + name ) ] ?
          name.toLowerCase() :
          null;
      }
    };
});

// fix oldIE attroperties
if ( !getSetInput || !getSetAttribute ) {
  jQuery.attrHooks.value = {
    set: function( elem, value, name ) {
      if ( jQuery.nodeName( elem, "input" ) ) {
        // Does not return so that setAttribute is also used
        elem.defaultValue = value;
      } else {
        // Use nodeHook if defined (#1954); otherwise setAttribute is fine
        return nodeHook && nodeHook.set( elem, value, name );
      }
    }
  };
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

  // Use this for any attribute in IE6/7
  // This fixes almost every IE6/7 issue
  nodeHook = {
    set: function( elem, value, name ) {
      // Set the existing or create a new attribute node
      var ret = elem.getAttributeNode( name );
      if ( !ret ) {
        elem.setAttributeNode(
          (ret = elem.ownerDocument.createAttribute( name ))
        );
      }

      ret.value = value += "";

      // Break association with cloned elements by also using setAttribute (#9646)
      if ( name === "value" || value === elem.getAttribute( name ) ) {
        return value;
      }
    }
  };

  // Some attributes are constructed with empty-string values when not defined
  attrHandle.id = attrHandle.name = attrHandle.coords =
    function( elem, name, isXML ) {
      var ret;
      if ( !isXML ) {
        return (ret = elem.getAttributeNode( name )) && ret.value !== "" ?
          ret.value :
          null;
      }
    };

  // Fixing value retrieval on a button requires this module
  jQuery.valHooks.button = {
    get: function( elem, name ) {
      var ret = elem.getAttributeNode( name );
      if ( ret && ret.specified ) {
        return ret.value;
      }
    },
    set: nodeHook.set
  };

  // Set contenteditable to false on removals(#10429)
  // Setting to empty string throws an error as an invalid value
  jQuery.attrHooks.contenteditable = {
    set: function( elem, value, name ) {
      nodeHook.set( elem, value === "" ? false : value, name );
    }
  };

  // Set width and height to auto instead of 0 on empty string( Bug #8150 )
  // This is for removals
  jQuery.each([ "width", "height" ], function( i, name ) {
    jQuery.attrHooks[ name ] = {
      set: function( elem, value ) {
        if ( value === "" ) {
          elem.setAttribute( name, "auto" );
          return value;
        }
      }
    };
  });
}

if ( !support.style ) {
  jQuery.attrHooks.style = {
    get: function( elem ) {
      // Return undefined in the case of empty string
      // Note: IE uppercases css property names, but if we were to .toLowerCase()
      // .cssText, that would destroy case senstitivity in URL's, like in "background"
      return elem.style.cssText || undefined;
    },
    set: function( elem, value ) {
      return ( elem.style.cssText = value + "" );
    }
  };
}




var rfocusable = /^(?:input|select|textarea|button|object)$/i,
  rclickable = /^(?:a|area)$/i;

jQuery.fn.extend({
  prop: function( name, value ) {
    return access( this, jQuery.prop, name, value, arguments.length > 1 );
  },

  removeProp: function( name ) {
    name = jQuery.propFix[ name ] || name;
    return this.each(function() {
      // try/catch handles cases where IE balks (such as removing a property on window)
      try {
        this[ name ] = undefined;
        delete this[ name ];
      } catch( e ) {}
    });
  }
});

jQuery.extend({
  propFix: {
    "for": "htmlFor",
    "class": "className"
  },

  prop: function( elem, name, value ) {
    var ret, hooks, notxml,
      nType = elem.nodeType;

    // don't get/set properties on text, comment and attribute nodes
    if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
      return;
    }

    notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

    if ( notxml ) {
      // Fix name and attach hooks
      name = jQuery.propFix[ name ] || name;
      hooks = jQuery.propHooks[ name ];
    }

    if ( value !== undefined ) {
      return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
        ret :
        ( elem[ name ] = value );

    } else {
      return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
        ret :
        elem[ name ];
    }
  },

  propHooks: {
    tabIndex: {
      get: function( elem ) {
        // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
        // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
        // Use proper attribute retrieval(#12072)
        var tabindex = jQuery.find.attr( elem, "tabindex" );

        return tabindex ?
          parseInt( tabindex, 10 ) :
          rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
            0 :
            -1;
      }
    }
  }
});

// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !support.hrefNormalized ) {
  // href/src property should get the full normalized URL (#10299/#12915)
  jQuery.each([ "href", "src" ], function( i, name ) {
    jQuery.propHooks[ name ] = {
      get: function( elem ) {
        return elem.getAttribute( name, 4 );
      }
    };
  });
}

// Support: Safari, IE9+
// mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !support.optSelected ) {
  jQuery.propHooks.selected = {
    get: function( elem ) {
      var parent = elem.parentNode;

      if ( parent ) {
        parent.selectedIndex;

        // Make sure that it also works with optgroups, see #5701
        if ( parent.parentNode ) {
          parent.parentNode.selectedIndex;
        }
      }
      return null;
    }
  };
}

jQuery.each([
  "tabIndex",
  "readOnly",
  "maxLength",
  "cellSpacing",
  "cellPadding",
  "rowSpan",
  "colSpan",
  "useMap",
  "frameBorder",
  "contentEditable"
], function() {
  jQuery.propFix[ this.toLowerCase() ] = this;
});

// IE6/7 call enctype encoding
if ( !support.enctype ) {
  jQuery.propFix.enctype = "encoding";
}




var rclass = /[\t\r\n\f]/g;

jQuery.fn.extend({
  addClass: function( value ) {
    var classes, elem, cur, clazz, j, finalValue,
      i = 0,
      len = this.length,
      proceed = typeof value === "string" && value;

    if ( jQuery.isFunction( value ) ) {
      return this.each(function( j ) {
        jQuery( this ).addClass( value.call( this, j, this.className ) );
      });
    }

    if ( proceed ) {
      // The disjunction here is for better compressibility (see removeClass)
      classes = ( value || "" ).match( rnotwhite ) || [];

      for ( ; i < len; i++ ) {
        elem = this[ i ];
        cur = elem.nodeType === 1 && ( elem.className ?
          ( " " + elem.className + " " ).replace( rclass, " " ) :
          " "
        );

        if ( cur ) {
          j = 0;
          while ( (clazz = classes[j++]) ) {
            if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
              cur += clazz + " ";
            }
          }

          // only assign if different to avoid unneeded rendering.
          finalValue = jQuery.trim( cur );
          if ( elem.className !== finalValue ) {
            elem.className = finalValue;
          }
        }
      }
    }

    return this;
  },

  removeClass: function( value ) {
    var classes, elem, cur, clazz, j, finalValue,
      i = 0,
      len = this.length,
      proceed = arguments.length === 0 || typeof value === "string" && value;

    if ( jQuery.isFunction( value ) ) {
      return this.each(function( j ) {
        jQuery( this ).removeClass( value.call( this, j, this.className ) );
      });
    }
    if ( proceed ) {
      classes = ( value || "" ).match( rnotwhite ) || [];

      for ( ; i < len; i++ ) {
        elem = this[ i ];
        // This expression is here for better compressibility (see addClass)
        cur = elem.nodeType === 1 && ( elem.className ?
          ( " " + elem.className + " " ).replace( rclass, " " ) :
          ""
        );

        if ( cur ) {
          j = 0;
          while ( (clazz = classes[j++]) ) {
            // Remove *all* instances
            while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
              cur = cur.replace( " " + clazz + " ", " " );
            }
          }

          // only assign if different to avoid unneeded rendering.
          finalValue = value ? jQuery.trim( cur ) : "";
          if ( elem.className !== finalValue ) {
            elem.className = finalValue;
          }
        }
      }
    }

    return this;
  },

  toggleClass: function( value, stateVal ) {
    var type = typeof value;

    if ( typeof stateVal === "boolean" && type === "string" ) {
      return stateVal ? this.addClass( value ) : this.removeClass( value );
    }

    if ( jQuery.isFunction( value ) ) {
      return this.each(function( i ) {
        jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
      });
    }

    return this.each(function() {
      if ( type === "string" ) {
        // toggle individual class names
        var className,
          i = 0,
          self = jQuery( this ),
          classNames = value.match( rnotwhite ) || [];

        while ( (className = classNames[ i++ ]) ) {
          // check each className given, space separated list
          if ( self.hasClass( className ) ) {
            self.removeClass( className );
          } else {
            self.addClass( className );
          }
        }

      // Toggle whole class name
      } else if ( type === strundefined || type === "boolean" ) {
        if ( this.className ) {
          // store className if set
          jQuery._data( this, "__className__", this.className );
        }

        // If the element has a class name or if we're passed "false",
        // then remove the whole classname (if there was one, the above saved it).
        // Otherwise bring back whatever was previously saved (if anything),
        // falling back to the empty string if nothing was stored.
        this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
      }
    });
  },

  hasClass: function( selector ) {
    var className = " " + selector + " ",
      i = 0,
      l = this.length;
    for ( ; i < l; i++ ) {
      if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
        return true;
      }
    }

    return false;
  }
});




// Return jQuery for attributes-only inclusion


jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
  "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
  "change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

  // Handle event binding
  jQuery.fn[ name ] = function( data, fn ) {
    return arguments.length > 0 ?
      this.on( name, null, data, fn ) :
      this.trigger( name );
  };
});

jQuery.fn.extend({
  hover: function( fnOver, fnOut ) {
    return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
  },

  bind: function( types, data, fn ) {
    return this.on( types, null, data, fn );
  },
  unbind: function( types, fn ) {
    return this.off( types, null, fn );
  },

  delegate: function( selector, types, data, fn ) {
    return this.on( types, selector, data, fn );
  },
  undelegate: function( selector, types, fn ) {
    // ( namespace ) or ( selector, types [, fn] )
    return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
  }
});


var nonce = jQuery.now();

var rquery = (/\?/);



var rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;

jQuery.parseJSON = function( data ) {
  // Attempt to parse using the native JSON parser first
  if ( window.JSON && window.JSON.parse ) {
    // Support: Android 2.3
    // Workaround failure to string-cast null input
    return window.JSON.parse( data + "" );
  }

  var requireNonComma,
    depth = null,
    str = jQuery.trim( data + "" );

  // Guard against invalid (and possibly dangerous) input by ensuring that nothing remains
  // after removing valid tokens
  return str && !jQuery.trim( str.replace( rvalidtokens, function( token, comma, open, close ) {

    // Force termination if we see a misplaced comma
    if ( requireNonComma && comma ) {
      depth = 0;
    }

    // Perform no more replacements after returning to outermost depth
    if ( depth === 0 ) {
      return token;
    }

    // Commas must not follow "[", "{", or ","
    requireNonComma = open || comma;

    // Determine new depth
    // array/object open ("[" or "{"): depth += true - false (increment)
    // array/object close ("]" or "}"): depth += false - true (decrement)
    // other cases ("," or primitive): depth += true - true (numeric cast)
    depth += !close - !open;

    // Remove this token
    return "";
  }) ) ?
    ( Function( "return " + str ) )() :
    jQuery.error( "Invalid JSON: " + data );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
  var xml, tmp;
  if ( !data || typeof data !== "string" ) {
    return null;
  }
  try {
    if ( window.DOMParser ) { // Standard
      tmp = new DOMParser();
      xml = tmp.parseFromString( data, "text/xml" );
    } else { // IE
      xml = new ActiveXObject( "Microsoft.XMLDOM" );
      xml.async = "false";
      xml.loadXML( data );
    }
  } catch( e ) {
    xml = undefined;
  }
  if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
    jQuery.error( "Invalid XML: " + data );
  }
  return xml;
};


var
  // Document location
  ajaxLocParts,
  ajaxLocation,

  rhash = /#.*$/,
  rts = /([?&])_=[^&]*/,
  rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
  // #7653, #8125, #8152: local protocol detection
  rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
  rnoContent = /^(?:GET|HEAD)$/,
  rprotocol = /^\/\//,
  rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

  /* Prefilters
   * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
   * 2) These are called:
   *    - BEFORE asking for a transport
   *    - AFTER param serialization (s.data is a string if s.processData is true)
   * 3) key is the dataType
   * 4) the catchall symbol "*" can be used
   * 5) execution will start with transport dataType and THEN continue down to "*" if needed
   */
  prefilters = {},

  /* Transports bindings
   * 1) key is the dataType
   * 2) the catchall symbol "*" can be used
   * 3) selection will start with transport dataType and THEN go to "*" if needed
   */
  transports = {},

  // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
  allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
  ajaxLocation = location.href;
} catch( e ) {
  // Use the href attribute of an A element
  // since IE will modify it given document.location
  ajaxLocation = document.createElement( "a" );
  ajaxLocation.href = "";
  ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

  // dataTypeExpression is optional and defaults to "*"
  return function( dataTypeExpression, func ) {

    if ( typeof dataTypeExpression !== "string" ) {
      func = dataTypeExpression;
      dataTypeExpression = "*";
    }

    var dataType,
      i = 0,
      dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

    if ( jQuery.isFunction( func ) ) {
      // For each dataType in the dataTypeExpression
      while ( (dataType = dataTypes[i++]) ) {
        // Prepend if requested
        if ( dataType.charAt( 0 ) === "+" ) {
          dataType = dataType.slice( 1 ) || "*";
          (structure[ dataType ] = structure[ dataType ] || []).unshift( func );

        // Otherwise append
        } else {
          (structure[ dataType ] = structure[ dataType ] || []).push( func );
        }
      }
    }
  };
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

  var inspected = {},
    seekingTransport = ( structure === transports );

  function inspect( dataType ) {
    var selected;
    inspected[ dataType ] = true;
    jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
      var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
      if ( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
        options.dataTypes.unshift( dataTypeOrTransport );
        inspect( dataTypeOrTransport );
        return false;
      } else if ( seekingTransport ) {
        return !( selected = dataTypeOrTransport );
      }
    });
    return selected;
  }

  return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
  var deep, key,
    flatOptions = jQuery.ajaxSettings.flatOptions || {};

  for ( key in src ) {
    if ( src[ key ] !== undefined ) {
      ( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
    }
  }
  if ( deep ) {
    jQuery.extend( true, target, deep );
  }

  return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
  var firstDataType, ct, finalDataType, type,
    contents = s.contents,
    dataTypes = s.dataTypes;

  // Remove auto dataType and get content-type in the process
  while ( dataTypes[ 0 ] === "*" ) {
    dataTypes.shift();
    if ( ct === undefined ) {
      ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
    }
  }

  // Check if we're dealing with a known content-type
  if ( ct ) {
    for ( type in contents ) {
      if ( contents[ type ] && contents[ type ].test( ct ) ) {
        dataTypes.unshift( type );
        break;
      }
    }
  }

  // Check to see if we have a response for the expected dataType
  if ( dataTypes[ 0 ] in responses ) {
    finalDataType = dataTypes[ 0 ];
  } else {
    // Try convertible dataTypes
    for ( type in responses ) {
      if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
        finalDataType = type;
        break;
      }
      if ( !firstDataType ) {
        firstDataType = type;
      }
    }
    // Or just use first one
    finalDataType = finalDataType || firstDataType;
  }

  // If we found a dataType
  // We add the dataType to the list if needed
  // and return the corresponding response
  if ( finalDataType ) {
    if ( finalDataType !== dataTypes[ 0 ] ) {
      dataTypes.unshift( finalDataType );
    }
    return responses[ finalDataType ];
  }
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
  var conv2, current, conv, tmp, prev,
    converters = {},
    // Work with a copy of dataTypes in case we need to modify it for conversion
    dataTypes = s.dataTypes.slice();

  // Create converters map with lowercased keys
  if ( dataTypes[ 1 ] ) {
    for ( conv in s.converters ) {
      converters[ conv.toLowerCase() ] = s.converters[ conv ];
    }
  }

  current = dataTypes.shift();

  // Convert to each sequential dataType
  while ( current ) {

    if ( s.responseFields[ current ] ) {
      jqXHR[ s.responseFields[ current ] ] = response;
    }

    // Apply the dataFilter if provided
    if ( !prev && isSuccess && s.dataFilter ) {
      response = s.dataFilter( response, s.dataType );
    }

    prev = current;
    current = dataTypes.shift();

    if ( current ) {

      // There's only work to do if current dataType is non-auto
      if ( current === "*" ) {

        current = prev;

      // Convert response if prev dataType is non-auto and differs from current
      } else if ( prev !== "*" && prev !== current ) {

        // Seek a direct converter
        conv = converters[ prev + " " + current ] || converters[ "* " + current ];

        // If none found, seek a pair
        if ( !conv ) {
          for ( conv2 in converters ) {

            // If conv2 outputs current
            tmp = conv2.split( " " );
            if ( tmp[ 1 ] === current ) {

              // If prev can be converted to accepted input
              conv = converters[ prev + " " + tmp[ 0 ] ] ||
                converters[ "* " + tmp[ 0 ] ];
              if ( conv ) {
                // Condense equivalence converters
                if ( conv === true ) {
                  conv = converters[ conv2 ];

                // Otherwise, insert the intermediate dataType
                } else if ( converters[ conv2 ] !== true ) {
                  current = tmp[ 0 ];
                  dataTypes.unshift( tmp[ 1 ] );
                }
                break;
              }
            }
          }
        }

        // Apply converter (if not an equivalence)
        if ( conv !== true ) {

          // Unless errors are allowed to bubble, catch and return them
          if ( conv && s[ "throws" ] ) {
            response = conv( response );
          } else {
            try {
              response = conv( response );
            } catch ( e ) {
              return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
            }
          }
        }
      }
    }
  }

  return { state: "success", data: response };
}

jQuery.extend({

  // Counter for holding the number of active queries
  active: 0,

  // Last-Modified header cache for next request
  lastModified: {},
  etag: {},

  ajaxSettings: {
    url: ajaxLocation,
    type: "GET",
    isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
    global: true,
    processData: true,
    async: true,
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    /*
    timeout: 0,
    data: null,
    dataType: null,
    username: null,
    password: null,
    cache: null,
    throws: false,
    traditional: false,
    headers: {},
    */

    accepts: {
      "*": allTypes,
      text: "text/plain",
      html: "text/html",
      xml: "application/xml, text/xml",
      json: "application/json, text/javascript"
    },

    contents: {
      xml: /xml/,
      html: /html/,
      json: /json/
    },

    responseFields: {
      xml: "responseXML",
      text: "responseText",
      json: "responseJSON"
    },

    // Data converters
    // Keys separate source (or catchall "*") and destination types with a single space
    converters: {

      // Convert anything to text
      "* text": String,

      // Text to html (true = no transformation)
      "text html": true,

      // Evaluate text as a json expression
      "text json": jQuery.parseJSON,

      // Parse text as xml
      "text xml": jQuery.parseXML
    },

    // For options that shouldn't be deep extended:
    // you can add your own custom options here if
    // and when you create one that shouldn't be
    // deep extended (see ajaxExtend)
    flatOptions: {
      url: true,
      context: true
    }
  },

  // Creates a full fledged settings object into target
  // with both ajaxSettings and settings fields.
  // If target is omitted, writes into ajaxSettings.
  ajaxSetup: function( target, settings ) {
    return settings ?

      // Building a settings object
      ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

      // Extending ajaxSettings
      ajaxExtend( jQuery.ajaxSettings, target );
  },

  ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
  ajaxTransport: addToPrefiltersOrTransports( transports ),

  // Main method
  ajax: function( url, options ) {

    // If url is an object, simulate pre-1.5 signature
    if ( typeof url === "object" ) {
      options = url;
      url = undefined;
    }

    // Force options to be an object
    options = options || {};

    var // Cross-domain detection vars
      parts,
      // Loop variable
      i,
      // URL without anti-cache param
      cacheURL,
      // Response headers as string
      responseHeadersString,
      // timeout handle
      timeoutTimer,

      // To know if global events are to be dispatched
      fireGlobals,

      transport,
      // Response headers
      responseHeaders,
      // Create the final options object
      s = jQuery.ajaxSetup( {}, options ),
      // Callbacks context
      callbackContext = s.context || s,
      // Context for global events is callbackContext if it is a DOM node or jQuery collection
      globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
        jQuery( callbackContext ) :
        jQuery.event,
      // Deferreds
      deferred = jQuery.Deferred(),
      completeDeferred = jQuery.Callbacks("once memory"),
      // Status-dependent callbacks
      statusCode = s.statusCode || {},
      // Headers (they are sent all at once)
      requestHeaders = {},
      requestHeadersNames = {},
      // The jqXHR state
      state = 0,
      // Default abort message
      strAbort = "canceled",
      // Fake xhr
      jqXHR = {
        readyState: 0,

        // Builds headers hashtable if needed
        getResponseHeader: function( key ) {
          var match;
          if ( state === 2 ) {
            if ( !responseHeaders ) {
              responseHeaders = {};
              while ( (match = rheaders.exec( responseHeadersString )) ) {
                responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
              }
            }
            match = responseHeaders[ key.toLowerCase() ];
          }
          return match == null ? null : match;
        },

        // Raw string
        getAllResponseHeaders: function() {
          return state === 2 ? responseHeadersString : null;
        },

        // Caches the header
        setRequestHeader: function( name, value ) {
          var lname = name.toLowerCase();
          if ( !state ) {
            name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
            requestHeaders[ name ] = value;
          }
          return this;
        },

        // Overrides response content-type header
        overrideMimeType: function( type ) {
          if ( !state ) {
            s.mimeType = type;
          }
          return this;
        },

        // Status-dependent callbacks
        statusCode: function( map ) {
          var code;
          if ( map ) {
            if ( state < 2 ) {
              for ( code in map ) {
                // Lazy-add the new callback in a way that preserves old ones
                statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
              }
            } else {
              // Execute the appropriate callbacks
              jqXHR.always( map[ jqXHR.status ] );
            }
          }
          return this;
        },

        // Cancel the request
        abort: function( statusText ) {
          var finalText = statusText || strAbort;
          if ( transport ) {
            transport.abort( finalText );
          }
          done( 0, finalText );
          return this;
        }
      };

    // Attach deferreds
    deferred.promise( jqXHR ).complete = completeDeferred.add;
    jqXHR.success = jqXHR.done;
    jqXHR.error = jqXHR.fail;

    // Remove hash character (#7531: and string promotion)
    // Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
    // Handle falsy url in the settings object (#10093: consistency with old signature)
    // We also use the url parameter if available
    s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

    // Alias method option to type as per ticket #12004
    s.type = options.method || options.type || s.method || s.type;

    // Extract dataTypes list
    s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

    // A cross-domain request is in order when we have a protocol:host:port mismatch
    if ( s.crossDomain == null ) {
      parts = rurl.exec( s.url.toLowerCase() );
      s.crossDomain = !!( parts &&
        ( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
          ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
            ( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
      );
    }

    // Convert data if not already a string
    if ( s.data && s.processData && typeof s.data !== "string" ) {
      s.data = jQuery.param( s.data, s.traditional );
    }

    // Apply prefilters
    inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

    // If request was aborted inside a prefilter, stop there
    if ( state === 2 ) {
      return jqXHR;
    }

    // We can fire global events as of now if asked to
    fireGlobals = s.global;

    // Watch for a new set of requests
    if ( fireGlobals && jQuery.active++ === 0 ) {
      jQuery.event.trigger("ajaxStart");
    }

    // Uppercase the type
    s.type = s.type.toUpperCase();

    // Determine if request has content
    s.hasContent = !rnoContent.test( s.type );

    // Save the URL in case we're toying with the If-Modified-Since
    // and/or If-None-Match header later on
    cacheURL = s.url;

    // More options handling for requests with no content
    if ( !s.hasContent ) {

      // If data is available, append data to url
      if ( s.data ) {
        cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
        // #9682: remove data so that it's not used in an eventual retry
        delete s.data;
      }

      // Add anti-cache in url if needed
      if ( s.cache === false ) {
        s.url = rts.test( cacheURL ) ?

          // If there is already a '_' parameter, set its value
          cacheURL.replace( rts, "$1_=" + nonce++ ) :

          // Otherwise add one to the end
          cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
      }
    }

    // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
    if ( s.ifModified ) {
      if ( jQuery.lastModified[ cacheURL ] ) {
        jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
      }
      if ( jQuery.etag[ cacheURL ] ) {
        jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
      }
    }

    // Set the correct header, if data is being sent
    if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
      jqXHR.setRequestHeader( "Content-Type", s.contentType );
    }

    // Set the Accepts header for the server, depending on the dataType
    jqXHR.setRequestHeader(
      "Accept",
      s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
        s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
        s.accepts[ "*" ]
    );

    // Check for headers option
    for ( i in s.headers ) {
      jqXHR.setRequestHeader( i, s.headers[ i ] );
    }

    // Allow custom headers/mimetypes and early abort
    if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
      // Abort if not done already and return
      return jqXHR.abort();
    }

    // aborting is no longer a cancellation
    strAbort = "abort";

    // Install callbacks on deferreds
    for ( i in { success: 1, error: 1, complete: 1 } ) {
      jqXHR[ i ]( s[ i ] );
    }

    // Get transport
    transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

    // If no transport, we auto-abort
    if ( !transport ) {
      done( -1, "No Transport" );
    } else {
      jqXHR.readyState = 1;

      // Send global event
      if ( fireGlobals ) {
        globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
      }
      // Timeout
      if ( s.async && s.timeout > 0 ) {
        timeoutTimer = setTimeout(function() {
          jqXHR.abort("timeout");
        }, s.timeout );
      }

      try {
        state = 1;
        transport.send( requestHeaders, done );
      } catch ( e ) {
        // Propagate exception as error if not done
        if ( state < 2 ) {
          done( -1, e );
        // Simply rethrow otherwise
        } else {
          throw e;
        }
      }
    }

    // Callback for when everything is done
    function done( status, nativeStatusText, responses, headers ) {
      var isSuccess, success, error, response, modified,
        statusText = nativeStatusText;

      // Called once
      if ( state === 2 ) {
        return;
      }

      // State is "done" now
      state = 2;

      // Clear timeout if it exists
      if ( timeoutTimer ) {
        clearTimeout( timeoutTimer );
      }

      // Dereference transport for early garbage collection
      // (no matter how long the jqXHR object will be used)
      transport = undefined;

      // Cache response headers
      responseHeadersString = headers || "";

      // Set readyState
      jqXHR.readyState = status > 0 ? 4 : 0;

      // Determine if successful
      isSuccess = status >= 200 && status < 300 || status === 304;

      // Get response data
      if ( responses ) {
        response = ajaxHandleResponses( s, jqXHR, responses );
      }

      // Convert no matter what (that way responseXXX fields are always set)
      response = ajaxConvert( s, response, jqXHR, isSuccess );

      // If successful, handle type chaining
      if ( isSuccess ) {

        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
        if ( s.ifModified ) {
          modified = jqXHR.getResponseHeader("Last-Modified");
          if ( modified ) {
            jQuery.lastModified[ cacheURL ] = modified;
          }
          modified = jqXHR.getResponseHeader("etag");
          if ( modified ) {
            jQuery.etag[ cacheURL ] = modified;
          }
        }

        // if no content
        if ( status === 204 || s.type === "HEAD" ) {
          statusText = "nocontent";

        // if not modified
        } else if ( status === 304 ) {
          statusText = "notmodified";

        // If we have data, let's convert it
        } else {
          statusText = response.state;
          success = response.data;
          error = response.error;
          isSuccess = !error;
        }
      } else {
        // We extract error from statusText
        // then normalize statusText and status for non-aborts
        error = statusText;
        if ( status || !statusText ) {
          statusText = "error";
          if ( status < 0 ) {
            status = 0;
          }
        }
      }

      // Set data for the fake xhr object
      jqXHR.status = status;
      jqXHR.statusText = ( nativeStatusText || statusText ) + "";

      // Success/Error
      if ( isSuccess ) {
        deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
      } else {
        deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
      }

      // Status-dependent callbacks
      jqXHR.statusCode( statusCode );
      statusCode = undefined;

      if ( fireGlobals ) {
        globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
          [ jqXHR, s, isSuccess ? success : error ] );
      }

      // Complete
      completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

      if ( fireGlobals ) {
        globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
        // Handle the global AJAX counter
        if ( !( --jQuery.active ) ) {
          jQuery.event.trigger("ajaxStop");
        }
      }
    }

    return jqXHR;
  },

  getJSON: function( url, data, callback ) {
    return jQuery.get( url, data, callback, "json" );
  },

  getScript: function( url, callback ) {
    return jQuery.get( url, undefined, callback, "script" );
  }
});

jQuery.each( [ "get", "post" ], function( i, method ) {
  jQuery[ method ] = function( url, data, callback, type ) {
    // shift arguments if data argument was omitted
    if ( jQuery.isFunction( data ) ) {
      type = type || callback;
      callback = data;
      data = undefined;
    }

    return jQuery.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: callback
    });
  };
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ) {
  jQuery.fn[ type ] = function( fn ) {
    return this.on( type, fn );
  };
});


jQuery._evalUrl = function( url ) {
  return jQuery.ajax({
    url: url,
    type: "GET",
    dataType: "script",
    async: false,
    global: false,
    "throws": true
  });
};


jQuery.fn.extend({
  wrapAll: function( html ) {
    if ( jQuery.isFunction( html ) ) {
      return this.each(function(i) {
        jQuery(this).wrapAll( html.call(this, i) );
      });
    }

    if ( this[0] ) {
      // The elements to wrap the target around
      var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

      if ( this[0].parentNode ) {
        wrap.insertBefore( this[0] );
      }

      wrap.map(function() {
        var elem = this;

        while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
          elem = elem.firstChild;
        }

        return elem;
      }).append( this );
    }

    return this;
  },

  wrapInner: function( html ) {
    if ( jQuery.isFunction( html ) ) {
      return this.each(function(i) {
        jQuery(this).wrapInner( html.call(this, i) );
      });
    }

    return this.each(function() {
      var self = jQuery( this ),
        contents = self.contents();

      if ( contents.length ) {
        contents.wrapAll( html );

      } else {
        self.append( html );
      }
    });
  },

  wrap: function( html ) {
    var isFunction = jQuery.isFunction( html );

    return this.each(function(i) {
      jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
    });
  },

  unwrap: function() {
    return this.parent().each(function() {
      if ( !jQuery.nodeName( this, "body" ) ) {
        jQuery( this ).replaceWith( this.childNodes );
      }
    }).end();
  }
});


jQuery.expr.filters.hidden = function( elem ) {
  // Support: Opera <= 12.12
  // Opera reports offsetWidths and offsetHeights less than zero on some elements
  return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
    (!support.reliableHiddenOffsets() &&
      ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
};

jQuery.expr.filters.visible = function( elem ) {
  return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
  rbracket = /\[\]$/,
  rCRLF = /\r?\n/g,
  rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
  rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
  var name;

  if ( jQuery.isArray( obj ) ) {
    // Serialize array item.
    jQuery.each( obj, function( i, v ) {
      if ( traditional || rbracket.test( prefix ) ) {
        // Treat each array item as a scalar.
        add( prefix, v );

      } else {
        // Item is non-scalar (array or object), encode its numeric index.
        buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
      }
    });

  } else if ( !traditional && jQuery.type( obj ) === "object" ) {
    // Serialize object item.
    for ( name in obj ) {
      buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
    }

  } else {
    // Serialize scalar item.
    add( prefix, obj );
  }
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
  var prefix,
    s = [],
    add = function( key, value ) {
      // If value is a function, invoke it and return its value
      value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
      s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
    };

  // Set traditional to true for jQuery <= 1.3.2 behavior.
  if ( traditional === undefined ) {
    traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
  }

  // If an array was passed in, assume that it is an array of form elements.
  if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
    // Serialize the form elements
    jQuery.each( a, function() {
      add( this.name, this.value );
    });

  } else {
    // If traditional, encode the "old" way (the way 1.3.2 or older
    // did it), otherwise encode params recursively.
    for ( prefix in a ) {
      buildParams( prefix, a[ prefix ], traditional, add );
    }
  }

  // Return the resulting serialization
  return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend({
  serialize: function() {
    return jQuery.param( this.serializeArray() );
  },
  serializeArray: function() {
    return this.map(function() {
      // Can add propHook for "elements" to filter or add form elements
      var elements = jQuery.prop( this, "elements" );
      return elements ? jQuery.makeArray( elements ) : this;
    })
    .filter(function() {
      var type = this.type;
      // Use .is(":disabled") so that fieldset[disabled] works
      return this.name && !jQuery( this ).is( ":disabled" ) &&
        rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
        ( this.checked || !rcheckableType.test( type ) );
    })
    .map(function( i, elem ) {
      var val = jQuery( this ).val();

      return val == null ?
        null :
        jQuery.isArray( val ) ?
          jQuery.map( val, function( val ) {
            return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
          }) :
          { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
    }).get();
  }
});


// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ?
  // Support: IE6+
  function() {

    // XHR cannot access local files, always use ActiveX for that case
    return !this.isLocal &&

      // Support: IE7-8
      // oldIE XHR does not support non-RFC2616 methods (#13240)
      // See http://msdn.microsoft.com/en-us/library/ie/ms536648(v=vs.85).aspx
      // and http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9
      // Although this check for six methods instead of eight
      // since IE also does not support "trace" and "connect"
      /^(get|post|head|put|delete|options)$/i.test( this.type ) &&

      createStandardXHR() || createActiveXHR();
  } :
  // For all other browsers, use the standard XMLHttpRequest object
  createStandardXHR;

var xhrId = 0,
  xhrCallbacks = {},
  xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE<10
// Open requests must be manually aborted on unload (#5280)
if ( window.ActiveXObject ) {
  jQuery( window ).on( "unload", function() {
    for ( var key in xhrCallbacks ) {
      xhrCallbacks[ key ]( undefined, true );
    }
  });
}

// Determine support properties
support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

  jQuery.ajaxTransport(function( options ) {
    // Cross domain only allowed if supported through XMLHttpRequest
    if ( !options.crossDomain || support.cors ) {

      var callback;

      return {
        send: function( headers, complete ) {
          var i,
            xhr = options.xhr(),
            id = ++xhrId;

          // Open the socket
          xhr.open( options.type, options.url, options.async, options.username, options.password );

          // Apply custom fields if provided
          if ( options.xhrFields ) {
            for ( i in options.xhrFields ) {
              xhr[ i ] = options.xhrFields[ i ];
            }
          }

          // Override mime type if needed
          if ( options.mimeType && xhr.overrideMimeType ) {
            xhr.overrideMimeType( options.mimeType );
          }

          // X-Requested-With header
          // For cross-domain requests, seeing as conditions for a preflight are
          // akin to a jigsaw puzzle, we simply never set it to be sure.
          // (it can always be set on a per-request basis or even using ajaxSetup)
          // For same-domain requests, won't change header if already provided.
          if ( !options.crossDomain && !headers["X-Requested-With"] ) {
            headers["X-Requested-With"] = "XMLHttpRequest";
          }

          // Set headers
          for ( i in headers ) {
            // Support: IE<9
            // IE's ActiveXObject throws a 'Type Mismatch' exception when setting
            // request header to a null-value.
            //
            // To keep consistent with other XHR implementations, cast the value
            // to string and ignore `undefined`.
            if ( headers[ i ] !== undefined ) {
              xhr.setRequestHeader( i, headers[ i ] + "" );
            }
          }

          // Do send the request
          // This may raise an exception which is actually
          // handled in jQuery.ajax (so no try/catch here)
          xhr.send( ( options.hasContent && options.data ) || null );

          // Listener
          callback = function( _, isAbort ) {
            var status, statusText, responses;

            // Was never called and is aborted or complete
            if ( callback && ( isAbort || xhr.readyState === 4 ) ) {
              // Clean up
              delete xhrCallbacks[ id ];
              callback = undefined;
              xhr.onreadystatechange = jQuery.noop;

              // Abort manually if needed
              if ( isAbort ) {
                if ( xhr.readyState !== 4 ) {
                  xhr.abort();
                }
              } else {
                responses = {};
                status = xhr.status;

                // Support: IE<10
                // Accessing binary-data responseText throws an exception
                // (#11426)
                if ( typeof xhr.responseText === "string" ) {
                  responses.text = xhr.responseText;
                }

                // Firefox throws an exception when accessing
                // statusText for faulty cross-domain requests
                try {
                  statusText = xhr.statusText;
                } catch( e ) {
                  // We normalize with Webkit giving an empty statusText
                  statusText = "";
                }

                // Filter status for non standard behaviors

                // If the request is local and we have data: assume a success
                // (success with no data won't get notified, that's the best we
                // can do given current implementations)
                if ( !status && options.isLocal && !options.crossDomain ) {
                  status = responses.text ? 200 : 404;
                // IE - #1450: sometimes returns 1223 when it should be 204
                } else if ( status === 1223 ) {
                  status = 204;
                }
              }
            }

            // Call complete if needed
            if ( responses ) {
              complete( status, statusText, responses, xhr.getAllResponseHeaders() );
            }
          };

          if ( !options.async ) {
            // if we're in sync mode we fire the callback
            callback();
          } else if ( xhr.readyState === 4 ) {
            // (IE6 & IE7) if it's in cache and has been
            // retrieved directly we need to fire the callback
            setTimeout( callback );
          } else {
            // Add to the list of active xhr callbacks
            xhr.onreadystatechange = xhrCallbacks[ id ] = callback;
          }
        },

        abort: function() {
          if ( callback ) {
            callback( undefined, true );
          }
        }
      };
    }
  });
}

// Functions to create xhrs
function createStandardXHR() {
  try {
    return new window.XMLHttpRequest();
  } catch( e ) {}
}

function createActiveXHR() {
  try {
    return new window.ActiveXObject( "Microsoft.XMLHTTP" );
  } catch( e ) {}
}




// Install script dataType
jQuery.ajaxSetup({
  accepts: {
    script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
  },
  contents: {
    script: /(?:java|ecma)script/
  },
  converters: {
    "text script": function( text ) {
      jQuery.globalEval( text );
      return text;
    }
  }
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
  if ( s.cache === undefined ) {
    s.cache = false;
  }
  if ( s.crossDomain ) {
    s.type = "GET";
    s.global = false;
  }
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

  // This transport only deals with cross domain requests
  if ( s.crossDomain ) {

    var script,
      head = document.head || jQuery("head")[0] || document.documentElement;

    return {

      send: function( _, callback ) {

        script = document.createElement("script");

        script.async = true;

        if ( s.scriptCharset ) {
          script.charset = s.scriptCharset;
        }

        script.src = s.url;

        // Attach handlers for all browsers
        script.onload = script.onreadystatechange = function( _, isAbort ) {

          if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

            // Handle memory leak in IE
            script.onload = script.onreadystatechange = null;

            // Remove the script
            if ( script.parentNode ) {
              script.parentNode.removeChild( script );
            }

            // Dereference the script
            script = null;

            // Callback if not abort
            if ( !isAbort ) {
              callback( 200, "success" );
            }
          }
        };

        // Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
        // Use native DOM manipulation to avoid our domManip AJAX trickery
        head.insertBefore( script, head.firstChild );
      },

      abort: function() {
        if ( script ) {
          script.onload( undefined, true );
        }
      }
    };
  }
});




var oldCallbacks = [],
  rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
  jsonp: "callback",
  jsonpCallback: function() {
    var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
    this[ callback ] = true;
    return callback;
  }
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

  var callbackName, overwritten, responseContainer,
    jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
      "url" :
      typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
    );

  // Handle iff the expected data type is "jsonp" or we have a parameter to set
  if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

    // Get callback name, remembering preexisting value associated with it
    callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
      s.jsonpCallback() :
      s.jsonpCallback;

    // Insert callback into url or form data
    if ( jsonProp ) {
      s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
    } else if ( s.jsonp !== false ) {
      s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
    }

    // Use data converter to retrieve json after script execution
    s.converters["script json"] = function() {
      if ( !responseContainer ) {
        jQuery.error( callbackName + " was not called" );
      }
      return responseContainer[ 0 ];
    };

    // force json dataType
    s.dataTypes[ 0 ] = "json";

    // Install callback
    overwritten = window[ callbackName ];
    window[ callbackName ] = function() {
      responseContainer = arguments;
    };

    // Clean-up function (fires after converters)
    jqXHR.always(function() {
      // Restore preexisting value
      window[ callbackName ] = overwritten;

      // Save back as free
      if ( s[ callbackName ] ) {
        // make sure that re-using the options doesn't screw things around
        s.jsonpCallback = originalSettings.jsonpCallback;

        // save the callback name for future use
        oldCallbacks.push( callbackName );
      }

      // Call if it was a function and we have a response
      if ( responseContainer && jQuery.isFunction( overwritten ) ) {
        overwritten( responseContainer[ 0 ] );
      }

      responseContainer = overwritten = undefined;
    });

    // Delegate to script
    return "script";
  }
});




// data: string of html
// context (optional): If specified, the fragment will be created in this context, defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
  if ( !data || typeof data !== "string" ) {
    return null;
  }
  if ( typeof context === "boolean" ) {
    keepScripts = context;
    context = false;
  }
  context = context || document;

  var parsed = rsingleTag.exec( data ),
    scripts = !keepScripts && [];

  // Single tag
  if ( parsed ) {
    return [ context.createElement( parsed[1] ) ];
  }

  parsed = jQuery.buildFragment( [ data ], context, scripts );

  if ( scripts && scripts.length ) {
    jQuery( scripts ).remove();
  }

  return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
  if ( typeof url !== "string" && _load ) {
    return _load.apply( this, arguments );
  }

  var selector, response, type,
    self = this,
    off = url.indexOf(" ");

  if ( off >= 0 ) {
    selector = jQuery.trim( url.slice( off, url.length ) );
    url = url.slice( 0, off );
  }

  // If it's a function
  if ( jQuery.isFunction( params ) ) {

    // We assume that it's the callback
    callback = params;
    params = undefined;

  // Otherwise, build a param string
  } else if ( params && typeof params === "object" ) {
    type = "POST";
  }

  // If we have elements to modify, make the request
  if ( self.length > 0 ) {
    jQuery.ajax({
      url: url,

      // if "type" variable is undefined, then "GET" method will be used
      type: type,
      dataType: "html",
      data: params
    }).done(function( responseText ) {

      // Save response for use in complete callback
      response = arguments;

      self.html( selector ?

        // If a selector was specified, locate the right elements in a dummy div
        // Exclude scripts to avoid IE 'Permission Denied' errors
        jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

        // Otherwise use the full result
        responseText );

    }).complete( callback && function( jqXHR, status ) {
      self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
    });
  }

  return this;
};




jQuery.expr.filters.animated = function( elem ) {
  return jQuery.grep(jQuery.timers, function( fn ) {
    return elem === fn.elem;
  }).length;
};





var docElem = window.document.documentElement;

/**
 * Gets a window from an element
 */
function getWindow( elem ) {
  return jQuery.isWindow( elem ) ?
    elem :
    elem.nodeType === 9 ?
      elem.defaultView || elem.parentWindow :
      false;
}

jQuery.offset = {
  setOffset: function( elem, options, i ) {
    var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
      position = jQuery.css( elem, "position" ),
      curElem = jQuery( elem ),
      props = {};

    // set position first, in-case top/left are set even on static elem
    if ( position === "static" ) {
      elem.style.position = "relative";
    }

    curOffset = curElem.offset();
    curCSSTop = jQuery.css( elem, "top" );
    curCSSLeft = jQuery.css( elem, "left" );
    calculatePosition = ( position === "absolute" || position === "fixed" ) &&
      jQuery.inArray("auto", [ curCSSTop, curCSSLeft ] ) > -1;

    // need to be able to calculate position if either top or left is auto and position is either absolute or fixed
    if ( calculatePosition ) {
      curPosition = curElem.position();
      curTop = curPosition.top;
      curLeft = curPosition.left;
    } else {
      curTop = parseFloat( curCSSTop ) || 0;
      curLeft = parseFloat( curCSSLeft ) || 0;
    }

    if ( jQuery.isFunction( options ) ) {
      options = options.call( elem, i, curOffset );
    }

    if ( options.top != null ) {
      props.top = ( options.top - curOffset.top ) + curTop;
    }
    if ( options.left != null ) {
      props.left = ( options.left - curOffset.left ) + curLeft;
    }

    if ( "using" in options ) {
      options.using.call( elem, props );
    } else {
      curElem.css( props );
    }
  }
};

jQuery.fn.extend({
  offset: function( options ) {
    if ( arguments.length ) {
      return options === undefined ?
        this :
        this.each(function( i ) {
          jQuery.offset.setOffset( this, options, i );
        });
    }

    var docElem, win,
      box = { top: 0, left: 0 },
      elem = this[ 0 ],
      doc = elem && elem.ownerDocument;

    if ( !doc ) {
      return;
    }

    docElem = doc.documentElement;

    // Make sure it's not a disconnected DOM node
    if ( !jQuery.contains( docElem, elem ) ) {
      return box;
    }

    // If we don't have gBCR, just use 0,0 rather than error
    // BlackBerry 5, iOS 3 (original iPhone)
    if ( typeof elem.getBoundingClientRect !== strundefined ) {
      box = elem.getBoundingClientRect();
    }
    win = getWindow( doc );
    return {
      top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
      left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
    };
  },

  position: function() {
    if ( !this[ 0 ] ) {
      return;
    }

    var offsetParent, offset,
      parentOffset = { top: 0, left: 0 },
      elem = this[ 0 ];

    // fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
    if ( jQuery.css( elem, "position" ) === "fixed" ) {
      // we assume that getBoundingClientRect is available when computed position is fixed
      offset = elem.getBoundingClientRect();
    } else {
      // Get *real* offsetParent
      offsetParent = this.offsetParent();

      // Get correct offsets
      offset = this.offset();
      if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
        parentOffset = offsetParent.offset();
      }

      // Add offsetParent borders
      parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
      parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
    }

    // Subtract parent offsets and element margins
    // note: when an element has margin: auto the offsetLeft and marginLeft
    // are the same in Safari causing offset.left to incorrectly be 0
    return {
      top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
      left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true)
    };
  },

  offsetParent: function() {
    return this.map(function() {
      var offsetParent = this.offsetParent || docElem;

      while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position" ) === "static" ) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docElem;
    });
  }
});

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
  var top = /Y/.test( prop );

  jQuery.fn[ method ] = function( val ) {
    return access( this, function( elem, method, val ) {
      var win = getWindow( elem );

      if ( val === undefined ) {
        return win ? (prop in win) ? win[ prop ] :
          win.document.documentElement[ method ] :
          elem[ method ];
      }

      if ( win ) {
        win.scrollTo(
          !top ? val : jQuery( win ).scrollLeft(),
          top ? val : jQuery( win ).scrollTop()
        );

      } else {
        elem[ method ] = val;
      }
    }, method, val, arguments.length, null );
  };
});

// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// getComputedStyle returns percent when specified for top/left/bottom/right
// rather than make the css module depend on the offset module, we just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
  jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
    function( elem, computed ) {
      if ( computed ) {
        computed = curCSS( elem, prop );
        // if curCSS returns percentage, fallback to offset
        return rnumnonpx.test( computed ) ?
          jQuery( elem ).position()[ prop ] + "px" :
          computed;
      }
    }
  );
});


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
  jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
    // margin is only for outerHeight, outerWidth
    jQuery.fn[ funcName ] = function( margin, value ) {
      var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
        extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

      return access( this, function( elem, type, value ) {
        var doc;

        if ( jQuery.isWindow( elem ) ) {
          // As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
          // isn't a whole lot we can do. See pull request at this URL for discussion:
          // https://github.com/jquery/jquery/pull/764
          return elem.document.documentElement[ "client" + name ];
        }

        // Get document width or height
        if ( elem.nodeType === 9 ) {
          doc = elem.documentElement;

          // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
          // unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
          return Math.max(
            elem.body[ "scroll" + name ], doc[ "scroll" + name ],
            elem.body[ "offset" + name ], doc[ "offset" + name ],
            doc[ "client" + name ]
          );
        }

        return value === undefined ?
          // Get width or height on the element, requesting but not forcing parseFloat
          jQuery.css( elem, type, extra ) :

          // Set width or height on the element
          jQuery.style( elem, type, value, extra );
      }, type, chainable ? margin : undefined, chainable, null );
    };
  });
});


// The number of elements contained in the matched element set
jQuery.fn.size = function() {
  return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
  define( "jquery", [], function() {
    return jQuery;
  });
}




var
  // Map over jQuery in case of overwrite
  _jQuery = window.jQuery,

  // Map over the $ in case of overwrite
  _$ = window.$;

jQuery.noConflict = function( deep ) {
  if ( window.$ === jQuery ) {
    window.$ = _$;
  }

  if ( deep && window.jQuery === jQuery ) {
    window.jQuery = _jQuery;
  }

  return jQuery;
};

// Expose jQuery and $ identifiers, even in
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === strundefined ) {
  window.jQuery = window.$ = jQuery;
}




return jQuery;

}));

}, {}],
6: [function(require, module, exports) {
/**
 * Adapted from Medium's kew, and used under the Apache 2.0 License
 * https://github.com/Medium/kew/blob/master/LICENSE.TXT
 */

/**
 * An object representing a "promise" for a future value
 *
 * @param {?function(T, ?)=} onSuccess a function to handle successful
 *     resolution of this promise
 * @param {?function(!Error, ?)=} onFail a function to handle failed
 *     resolution of this promise
 * @constructor
 * @template T
 */
Promise.Impl = function(onSuccess, onFail) {
  this.promise = this;
  this._isPromise = true;
  this._successFn = onSuccess;
  this._failFn = onFail;
  this._scope = this;
  this._boundArgs = null;
  this._hasContext = false;
  this._nextContext = undefined;
  this._currentContext = undefined;
};

/**
 * Keep track of the number of promises that are rejected along side
 * the number of rejected promises we call _failFn on so we can look
 * for leaked rejections.
 */
Promise.PromiseStats = function() {
  this.errorsEmitted = 0;
  this.errorsHandled = 0;
};

Promise.stats = new Promise.PromiseStats();

Promise.Impl.prototype._handleError = function () {
  if (!this._errorHandled) {
    Promise.stats.errorsHandled++;
    this._errorHandled = true;
  }
};

/**
 * Specify that the current promise should have a specified context
 * @param  {*} context context
 * @private
 */
Promise.Impl.prototype._useContext = function (context) {
  this._nextContext = this._currentContext = context;
  this._hasContext = true;
  return this;
};

Promise.Impl.prototype.clearContext = function () {
  this._hasContext = false;
  this._nextContext = undefined;
  return this;
};

/**
 * Set the context for all promise handlers to follow
 *
 * NOTE(dpup): This should be considered deprecated.  It does not do what most
 * people would expect.  The context will be passed as a second argument to all
 * subsequent callbacks.
 *
 * @param {*} context An arbitrary context
 */
Promise.Impl.prototype.setContext = function (context) {
  this._nextContext = context;
  this._hasContext = true;
  return this;
};

/**
 * Get the context for a promise
 * @return {*} the context set by setContext
 */
Promise.Impl.prototype.getContext = function () {
  return this._nextContext;
};

/**
 * Resolve this promise with a specified value
 *
 * @param {*=} data
 */
Promise.Impl.prototype.resolve = function (data) {
  if (this._error || this._hasData) throw new Error("Unable to resolve or reject the same promise twice");

  var i;
  if (data && Promise.isPromise(data)) {
    this._child = data;
    if (this._promises) {
      for (i = 0; i < this._promises.length; i += 1) {
        data._chainPromise(this._promises[i]);
      }
      delete this._promises;
    }

    if (this._onComplete) {
      for (i = 0; i < this._onComplete.length; i+= 1) {
        data.fin(this._onComplete[i]);
      }
      delete this._onComplete;
    }
  } else if (data && Promise.isPromiseLike(data)) {
    data.then(
      function(data) { this.resolve(data) }.bind(this),
      function(err) { this.reject(err) }.bind(this)
    );
  } else {
    this._hasData = true;
    this._data = data;

    if (this._onComplete) {
      for (i = 0; i < this._onComplete.length; i++) {
        this._onComplete[i]();
      }
    }

    if (this._promises) {
      for (i = 0; i < this._promises.length; i += 1) {
        this._promises[i]._withInput(data);
      }
      delete this._promises;
    }
  }
};

/**
 * Reject this promise with an error
 *
 * @param {!Error} e
 */
Promise.Impl.prototype.reject = function (e) {
  if (this._error || this._hasData) throw new Error("Unable to resolve or reject the same promise twice");

  var i;
  this._error = e;
  Promise.stats.errorsEmitted++;

  if (this._ended) {
    this._handleError();
    if (window.setImmediate) {
      window.setImmediate(function onPromiseThrow() {
        throw e;
      });
    } else {
      window.setTimeout(function onPromiseThrow() {
        throw e;
      });
    }
  }

  if (this._onComplete) {
    for (i = 0; i < this._onComplete.length; i++) {
      this._onComplete[i]();
    }
  }

  if (this._promises) {
    this._handleError();
    for (i = 0; i < this._promises.length; i += 1) {
      this._promises[i]._withError(e);
    }
    delete this._promises;
  }
};

/**
 * Provide a callback to be called whenever this promise successfully
 * resolves. Allows for an optional second callback to handle the failure
 * case.
 *
 * @param {?function(this:void, T, ?): RESULT|undefined} onSuccess
 * @param {?function(this:void, !Error, ?): RESULT=} onFail
 * @return {!Promise.<RESULT>} returns a new promise with the output of the onSuccess or
 *     onFail handler
 * @template RESULT
 */
Promise.Impl.prototype.then = function (onSuccess, onFail) {
  var promise = new Promise.Impl(onSuccess, onFail);
  if (this._nextContext) promise._useContext(this._nextContext);

  if (this._child) this._child._chainPromise(promise);
  else this._chainPromise(promise);

  return promise;
};

/**
 * Provide a callback to be called whenever this promise successfully
 * resolves. The callback will be executed in the context of the provided scope.
 *
 * @param {function(this:SCOPE, T, ?): RESULT} onSuccess
 * @param {SCOPE} scope Object whose context callback will be executed in.
 * @param {...*} var_args Additional arguments to be passed to the promise callback.
 * @return {!Promise.<RESULT>} returns a new promise with the output of the onSuccess
 * @template SCOPE, RESULT
 */
Promise.Impl.prototype.thenBound = function (onSuccess, scope, var_args) {
  var promise = new Promise(onSuccess);
  if (this._nextContext) promise._useContext(this._nextContext);

  promise._scope = scope;
  if (arguments.length > 2) {
    promise._boundArgs = Array.prototype.slice.call(arguments, 2);
  }

  // Chaining must happen after setting args and scope since it may fire callback.
  if (this._child) this._child._chainPromise(promise);
  else this._chainPromise(promise);

  return promise;
};

/**
 * Provide a callback to be called whenever this promise is rejected
 *
 * @param {function(this:void, !Error, ?)} onFail
 * @return {!Promise.<T>} returns a new promise with the output of the onFail handler
 */
Promise.Impl.prototype.fail = function (onFail) {
  return this.then(null, onFail);
};

/**
 * Provide a callback to be called whenever this promise is rejected.
 * The callback will be executed in the context of the provided scope.
 *
 * @param {function(this:SCOPE, Error, ?)} onFail
 * @param {SCOPE} scope Object whose context callback will be executed in.
 * @param {...?} var_args
 * @return {!Promise.<T>} returns a new promise with the output of the onSuccess
 * @template SCOPE
 */
Promise.Impl.prototype.failBound = function (onFail, scope, var_args) {
  var promise = new Promise(null, onFail);
  if (this._nextContext) promise._useContext(this._nextContext);

  promise._scope = scope;
  if (arguments.length > 2) {
    promise._boundArgs = Array.prototype.slice.call(arguments, 2);
  }

  // Chaining must happen after setting args and scope since it may fire callback.
  if (this._child) this._child._chainPromise(promise);
  else this._chainPromise(promise);

  return promise;
};

/**
 * Provide a callback to be called whenever this promise is either resolved
 * or rejected.
 *
 * @param {function()} onComplete
 * @return {!Promise.<T>} returns the current promise
 */
Promise.Impl.prototype.fin = function (onComplete) {
  if (this._hasData || this._error) {
    onComplete();
    return this;
  }

  if (this._child) {
    this._child.fin(onComplete);
  } else {
    if (!this._onComplete) this._onComplete = [onComplete];
    else this._onComplete.push(onComplete);
  }

  return this;
};

/**
 * Mark this promise as "ended". If the promise is rejected, this will throw an
 * error in whatever scope it happens to be in
 *
 * @return {!Promise.<T>} returns the current promise
 * @deprecated Prefer done(), because it's consistent with Q.
 */
Promise.Impl.prototype.end = function () {
  this._end();
  return this;
};


/**
 * Mark this promise as "ended".
 * @private
 */
Promise.Impl.prototype._end = function () {
  if (this._error) {
    this._handleError();
    throw this._error;
  }
  this._ended = true;
  return this;
};

/**
 * Close the promise. Any errors after this completes will be thrown to the global handler.
 *
 * @param {?function(this:void, T, ?)=} onSuccess a function to handle successful
 *     resolution of this promise
 * @param {?function(this:void, !Error, ?)=} onFailure a function to handle failed
 *     resolution of this promise
 * @return {void}
 */
Promise.Impl.prototype.done = function (onSuccess, onFailure) {
  var self = this;
  if (onSuccess || onFailure) {
    self = self.then(onSuccess, onFailure);
  }
  self._end();
};

/**
 * Return a new promise that behaves the same as the current promise except
 * that it will be rejected if the current promise does not get fulfilled
 * after a certain amount of time.
 *
 * @param {number} timeoutMs The timeout threshold in msec
 * @param {string=} timeoutMsg error message
 * @return {!Promise.<T>} a new promise with timeout
 */
 Promise.Impl.prototype.timeout = function (timeoutMs, timeoutMsg) {
  var deferred = new Promise.Impl();
  var isTimeout = false;

  var timeout = setTimeout(function() {
    deferred.reject(new Error(timeoutMsg || 'Promise timeout after ' + timeoutMs + ' ms.'));
    isTimeout = true;
  }, timeoutMs)

  this.then(function (data) {
    if (!isTimeout) {
      clearTimeout(timeout);
      deferred.resolve(data);
    }
  },
  function (err) {
    if (!isTimeout) {
      clearTimeout(timeout);
      deferred.reject(err);
    }
  })

  return deferred.promise;
};

/**
 * Attempt to resolve this promise with the specified input
 *
 * @param {*} data the input
 */
Promise.Impl.prototype._withInput = function (data) {
  if (this._successFn) {
    try {
      this.resolve(this._call(this._successFn, [data, this._currentContext]));
    } catch (e) {
      console.log(e);
      this.reject(e);
    }
  } else this.resolve(data);

  // context is no longer needed
  delete this._currentContext;
};

/**
 * Attempt to reject this promise with the specified error
 *
 * @param {!Error} e
 * @private
 */
Promise.Impl.prototype._withError = function (e) {
  if (this._failFn) {
    try {
      this.resolve(this._call(this._failFn, [e, this._currentContext]));
    } catch (thrown) {
      console.log(e);
      this.reject(thrown);
    }
  } else this.reject(e);

  // context is no longer needed
  delete this._currentContext;
};

/**
 * Calls a function in the correct scope, and includes bound arguments.
 * @param {Function} fn
 * @param {Array} args
 * @return {*}
 * @private
 */
Promise.Impl.prototype._call = function (fn, args) {
  if (this._boundArgs) {
    args = this._boundArgs.concat(args);
  }
  return fn.apply(this._scope, args);
};

/**
 * Chain a promise to the current promise
 *
 * @param {!Promise} promise the promise to chain
 * @private
 */
Promise.Impl.prototype._chainPromise = function (promise) {
  var i;
  if (this._hasContext) promise._useContext(this._nextContext);

  if (this._child) {
    this._child._chainPromise(promise);
  } else if (this._hasData) {
    promise._withInput(this._data);
  } else if (this._error) {
    // We can't rely on _withError() because it's called on the chained promises
    // and we need to use the source's _errorHandled state
    this._handleError();
    promise._withError(this._error);
  } else if (!this._promises) {
    this._promises = [promise];
  } else {
    this._promises.push(promise);
  }
};

/**
 * Package Level Functions
 */

/**
 * Utility function used for creating a node-style resolver
 * for deferreds
 *
 * @param {!Promise} deferred a promise that looks like a deferred
 * @param {Error=} err an optional error
 * @param {*=} data optional data
 */
Promise.resolver = function(deferred, err, data) {
  if (err) deferred.reject(err);
  else deferred.resolve(data);
};

/**
 * Creates a node-style resolver for a deferred by wrapping
 * resolver()
 *
 * @return {function(?Error, *)} node-style callback
 */
Promise.Impl.prototype.makeNodeResolver = function () {
  return Promise.resolver.bind(null, this);
};

/**
 * Return true iff the given object is a promise of this library.
 *
 * Because kew's API is slightly different than other promise libraries,
 * it's important that we have a test for its promise type. If you want
 * to test for a more general A+ promise, you should do a cap test for
 * the features you want.
 *
 * @param {*} obj The object to test
 * @return {boolean} Whether the object is a promise
 */
Promise.isPromise = function(obj) {
  return !!obj._isPromise;
};

/**
 * Return true iff the given object is a promise-like object, e.g. appears to
 * implement Promises/A+ specification
 *
 * @param {*} obj The object to test
 * @return {boolean} Whether the object is a promise-like object
 */
Promise.isPromiseLike = function(obj) {
  return typeof obj === 'object' && typeof obj.then === 'function';
};

/**
 * Static function which creates and resolves a promise immediately
 *
 * @param {T} data data to resolve the promise with
 * @return {!Promise.<T>}
 * @template T
 */
Promise.resolve = function(data) {
  var promise = new Promise.Impl();
  promise.resolve(data);
  return promise;
};

/**
 * Static function which creates and rejects a promise immediately
 *
 * @param {!Error} e error to reject the promise with
 * @return {!Promise}
 */
Promise.reject = function(e) {
  var promise = new Promise.Impl();
  promise.reject(e);
  return promise;
};

/**
 * Replace an element in an array with a new value. Used by .all() to
 * call from .then()
 *
 * @param {!Array} arr
 * @param {number} idx
 * @param {*} val
 * @return {*} the val that's being injected into the array
 */
Promise.replaceEl = function(arr, idx, val) {
  arr[idx] = val;
  return val;
};

/**
 * Replace an element in an array as it is resolved with its value.
 * Used by .allSettled().
 *
 * @param {!Array} arr
 * @param {number} idx
 * @param {*} value The value from a resolved promise.
 * @return {*} the data that's being passed in
 */
Promise.replaceElFulfilled = function(arr, idx, value) {
  arr[idx] = {
    state: 'fulfilled',
    value: value
  };
  return value;
};

/**
 * Replace an element in an array as it is rejected with the reason.
 * Used by .allSettled().
 *
 * @param {!Array} arr
 * @param {number} idx
 * @param {*} reason The reason why the original promise is rejected
 * @return {*} the data that's being passed in
 */
Promise.replaceElRejected = function(arr, idx, reason) {
  arr[idx] = {
    state: 'rejected',
    reason: reason
  };
  return reason;
};

/**
 * Takes in an array of promises or literals and returns a promise which returns
 * an array of values when all have resolved. If any fail, the promise fails.
 *
 * @param {!Array.<!Promise>} promises
 * @return {!Promise.<!Array>}
 */
Promise.all = function(promises) {
  if (arguments.length != 1 || !Array.isArray(promises)) {
    promises = Array.prototype.slice.call(arguments, 0);
  }
  if (!promises.length) return Promise.resolve([]);

  var outputs = [];
  var finished = false;
  var promise = new Promise.Impl();
  var counter = promises.length;

  for (var i = 0; i < promises.length; i += 1) {
    if (!promises[i] || !Promise.isPromiseLike(promises[i])) {
      outputs[i] = promises[i];
      counter -= 1;
    } else {
      promises[i].then(Promise.replaceEl.bind(null, outputs, i))
      .then(function decrementAllCounter() {
        counter--;
        if (!finished && counter === 0) {
          finished = true;
          promise.resolve(outputs);
        }
      }, function onAllError(e) {
        if (!finished) {
          finished = true;
          promise.reject(e);
        }
      });
    }
  }

  if (counter === 0 && !finished) {
    finished = true;
    promise.resolve(outputs);
  }

  return promise;
};

/**
 * Takes in an array of promises or values and returns a promise that is
 * fulfilled with an array of state objects when all have resolved or
 * rejected. If a promise is resolved, its corresponding state object is
 * {state: 'fulfilled', value: Object}; whereas if a promise is rejected, its
 * corresponding state object is {state: 'rejected', reason: Object}.
 *
 * @param {!Array} promises or values
 * @return {!Promise.<!Array>} Promise fulfilled with state objects for each input
 */
Promise.allSettled = function(promises) {
  if (!Array.isArray(promises)) {
    throw Error('The input to "allSettled()" should be an array of Promise or values');
  }
  if (!promises.length) return Promise.resolve([]);

  var outputs = [];
  var promise = new Promise.Impl();
  var counter = promises.length;

  for (var i = 0; i < promises.length; i += 1) {
    if (!promises[i] || !Promise.isPromiseLike(promises[i])) {
      Promise.replaceElFulfilled(outputs, i, promises[i]);
      if ((--counter) === 0) promise.resolve(outputs);
    } else {
      promises[i]
        .then(Promise.replaceElFulfilled.bind(null, outputs, i), Promise.replaceElRejected.bind(null, outputs, i))
        .then(function () {
          if ((--counter) === 0) promise.resolve(outputs);
        });
    }
  }

  return promise;
};

/**
 * Create a new Promise which looks like a deferred
 *
 * @return {!Promise}
 */
Promise.defer = function() {
  return new Promise.Impl();
};

/**
 * Return a promise which will wait a specified number of ms to resolve
 *
 * @param {*} delayMsOrVal A delay (in ms) if this takes one argument, or ther
 *     return value if it takes two.
 * @param {number=} opt_delayMs
 * @return {!Promise}
 */
Promise.delay = function(delayMsOrVal, opt_delayMs) {
  var returnVal = undefined;
  var delayMs = delayMsOrVal;
  if (typeof opt_delayMs != 'undefined') {
    delayMs = opt_delayMs;
    returnVal = delayMsOrVal;
  }

  if (typeof delayMs != 'number') {
    throw new Error('Bad delay value ' + delayMs);
  }

  var defer = new Promise.Impl()
  setTimeout(function onDelay() {
    defer.resolve(returnVal);
  }, delayMs);
  return defer;
};

/**
 * Returns a promise that has the same result as `this`, but fulfilled
 * after at least ms milliseconds
 * @param {number} ms
 */
Promise.Impl.prototype.delay = function (ms) {
  return this.then(function (val) {
    return Promise.delay(val, ms);
  })
};

/**
 * Return a promise which will evaluate the function fn in a future turn with
 * the provided args
 *
 * @param {function(...)} fn
 * @param {...*} var_args a variable number of arguments
 * @return {!Promise}
 */
Promise.fcall = function(fn, var_args) {
  var rootArgs = Array.prototype.slice.call(arguments, 1);
  var defer = new Promise.Impl();
  if (window.setImmediate) {
    window.setImmediate(function onNextTick() {
      try {
        defer.resolve(fn.apply(undefined, rootArgs));
      } catch (e) {
        console.log(e);
        defer.reject(e);
      }
    });
  } else {
    window.setTimeout(function onNextTick() {
      try {
        defer.resolve(fn.apply(undefined, rootArgs));
      } catch (e) {
        console.log(e);
        defer.reject(e);
      }
    });
  }
  return defer;
};

/**
 * Returns a promise that will be invoked with the result of a node style
 * callback. All args to fn should be given except for the final callback arg
 *
 * @param {function(...)} fn
 * @param {...*} var_args a variable number of arguments
 * @return {!Promise}
 */
Promise.nfcall = function(fn, var_args) {
  // Insert an undefined argument for scope and let bindPromise() do the work.
  var args = Array.prototype.slice.call(arguments, 0);
  args.splice(1, 0, undefined);
  return Promise.bindPromise.apply(undefined, args)();
};


/**
 * Binds a function to a scope with an optional number of curried arguments. Attaches
 * a node style callback as the last argument and returns a promise
 *
 * @param {function(...)} fn
 * @param {Object} scope
 * @param {...*} var_args a variable number of arguments
 * @return {function(...)}: !Promise}
 */
Promise.bindPromise = function(fn, scope, var_args) {
  var rootArgs = Array.prototype.slice.call(arguments, 2);
  return function onBoundPromise(var_args) {
    var defer = new Promise.Impl();
    try {
      fn.apply(scope, rootArgs.concat(Array.prototype.slice.call(arguments, 0), defer.makeNodeResolver()));
    } catch (e) {
      console.log(e);
      defer.reject(e);
    }
    return defer;
  }
};

module.exports = Promise;

}, {}],
7: [function(require, module, exports) {
var _ = require('components/underscore'); // An odd one

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

var Events = {

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
    var args = Array.prototype.slice.call(arguments);
    if (args.length > 1) {
      args = args.slice(1, args.length);
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

module.exports = Events;
}, {"components/underscore":4}],
8: [function(require, module, exports) {
var _ = require('components/underscore'); // An odd one.
var $ = require('component/jquery');

module.exports = {
  truthyOrFalsy: function(val) {
    if (typeof val == 'undefined') {
      return false;
    } else if (typeof val == 'boolean') {
      return val;
    } else if (typeof val == 'object') {
      return true;
    } else if (typeof val == 'string') {
      var v = val.trim().toLowerCase();
      if ((v == '') || (v == '0') || (v == 'false') || (v == 'no')) {
        return false;
      } else {
        return true;
      }
    } else if (typeof val == 'number') {
      return (val != 0);
    } else {
      return false;
    }
  },

  arrDelete: function(arr, from, to) {
    var rest = arr.slice((to || from) + 1 || arr.length);
    arr.length = from < 0 ? arr.length + from : from;
    return arr.push.apply(arr, rest);
  },

  deepClone: function(obj) {
    var func, isArr;
    if (!_.isObject(obj) || _.isFunction(obj)) {
      return obj;
    }
    if (_.isDate(obj)) {
      return new Date(obj.getTime());
    }
    if (_.isRegExp(obj)) {
      return new RegExp(obj.source, obj.toString().replace(/.*\//, ""));
    }
    isArr = _.isArray(obj || _.isArguments(obj));
    func = function(memo, value, key) {
      if (isArr) {
        memo.push(deepClone(value));
      } else {
        memo[key] = deepClone(value);
      }
      return memo;
    };
    return _.reduce(obj, func, isArr ? [] : {});
  },

  /*
   * Like Underscore's extend but recurses.
   */
  deepExtend: function(destination, source) {
    for (var property in source) {
      if (source[property] && source[property].constructor &&
       source[property].constructor === Object) {
        destination[property] = destination[property] || {};
        arguments.callee(destination[property], source[property]);
      } else {
        destination[property] = source[property];
      }
    }
    return destination;
  },

  buildOptions: function(defaults, overrides) {
    var ret = module.exports.deepExtend({}, defaults);
    module.exports.deepExtend(ret, overrides);
    return ret;
  },

  getQuiltOptions: function() {
    var opts = {};
    _.each($('script'), function(elem) {
      // See if it's Quilt
      var src = $(elem).attr('src');
      if (src != null) {
        if (src.toLowerCase().indexOf('cloudstitch') >= 0) {
          var appkey = $(elem).attr('appkey');
          if (appkey != null) {
            opts['appkey'] = appkey;
          }
        }
      }
    });
    return opts;
  },

  createJqueryNode: function(node) {
    // A Node contains multiple DOM Nodes
    var n = null;
    if (typeof node == 'object') {
      if (! _.isUndefined(node.jquery)) {
        n = node;
      } else if (node instanceof Array) {
        n = node[0];
      } else if (node instanceof Element) {
        n = $(node);
      } else {
        n = null;
      }
    } else if (typeof node == 'string') {
      n = $(node);
    } else {
      n = null;
    }

    return n;
  },

    /**
   * Args:
   *   $fromNode (optional) - Constrains search to this node.
   *
   * Returns:
   *   Array of Objects:
   *    {
   *      type:     link or inline
   *      content:  the CTS content, if inline
   *      url:      the URL, if a link
   *      args:     any other args
   *    }
   *
   */
  getTreesheetLinks: function($fromNode) {
    var ret = [];

    var find = function(sel) {
      return $(sel);
    };
    if (typeof $fromNode != 'undefined') {
      find = function(sel) {
        var s1 = $fromNode.find(sel);
        if ($fromNode.is(sel)) {
          s1 = s1.add($fromNode);
        }
        return s1;
      }
    }

    _.each(find('style[type="text/cts"]'), function(elem) {
      var block = {
        type: 'block',
        format: 'string',
        content: $(elem).html()
      };
      ret.push(block);
    }, this);

    _.each(find('style[type="json/cts"]'), function(elem) {
      var block = {
        type: 'block',
        format: 'json',
        content: $(elem).html()
      };
      ret.push(block);
    }, this);
    // TODO(eob): see if this causes it to get the smae element three times...
    // XXX !important

    _.each(find('link[rel="treesheet"],link[type="txt/cts"],link[type="json/cts"]'), function(elem) {
      var e = $(elem);
      var type = e.attr('type');
      var format = 'string';
      if (type == 'json/cts') {
        format = 'json';
      }
      var block = {
        type: 'link',
        url: $(elem).attr('href'),
        format: format
      };
      ret.push(block);
    }, this);

    _.each(find('link[type="cts/gsheet"]'), function(elem) {
      var e = $(elem);
      var kind = 'gsheet';
      var name = e.attr('name');
      var url = null;
      var opts = {
        'read': 'public',
        'write': 'public'
      };
      if (e.attr('href')) {
        url = e.attr('href');
      }
      if (e.attr('read')) {
        opts['read'] = e.attr('read');
      }
      if (e.attr('write')) {
        opts['write'] = e.attr('write');
      }
      if (e.attr('key')) {
        opts['key'] = e.attr('key');
      }
      if (name) {
        opts['name'] = name;
      }
      var json = {
        trees: [[kind, name, url, opts]]
      };
      var block = {
        type: 'block',
        format: 'json',
        content: json
      };
      ret.push(block);
    }, this);

    return ret;
  },

  addCss: function(url) {
    var link = document.createElement('link')
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', url);
    document.getElementsByTagName('head')[0].appendChild(link);
  },

  themeUrls: function(themeRef, subthemeRef) {
    // theme urls take the form TYPE/INSTANCE/PAGE
    // TODO(eob): create more flexible ecosystem

    var parts = themeRef.split("/");
    var kind = null;
    var name = null;
    var page = null;

    if (parts.length == 2) {
      kind = parts[0];
      name = parts[1];
    }

    if (parts.length == 3) {
      kind = parts[0];
      name = parts[1];
      page = parts[2];
    }

    if ((typeof subthemeRef != 'undefined') && (subthemeRef !== null)) {
      page = subthemeRef;
    }
    var base = CTS.Constants.mockupBase;
    if (page == null) {
      page = 'index';
    }

    return [
      (base + kind + "/" + page + ".cts"),
      (base + kind + "/" + name + "/" + page + ".cts")
    ];
  },

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

  shouldAutoload: function() {
    // Don't autoload if there is a ?autoload=false
    if (typeof document == 'undefined') {
      return false;
    }
    if (module.exports.getUrlParameter('autoload') == 'false') {
      return false;
    }
    if (document.body != null) {
      if (typeof document.body.dataset != 'undefined') {
        if (typeof document.body.dataset.ctsautoload != 'undefined') {
          if (document.body.dataset.ctsautoload == 'false') {
            return false;
          }
        }
      }
    }
    return true;
  },

  hideDocumentBody: function() {
    var css = 'body { display: none; }';
    var head = document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet){
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
  },

  showDocumentBody: function($e) {
    $('body').show();
  }
};
}, {"components/underscore":4,"component/jquery":5}],
9: [function(require, module, exports) {
var Log = require('./log');
var Promise = require('./promise');
var _ = require('components/underscore'); // An odd one.
var $ = require('component/jquery');

module.exports = {
  loadJavascript: function(url, onload) {
    var s = document.createElement('script');
    var proto = '';
    if ((typeof window != 'undefined') &&
        (typeof window.location != 'undefined') &&
        (window.location.protocol == 'file:')) {
      proto = 'http:';
    }
    s.setAttribute('src', proto + url);
    s.setAttribute('type', 'text/javascript');
    if (typeof onload == 'function') {
      s.onload = onload;
    }
    document.getElementsByTagName('head')[0].appendChild(s);
  },

  getUrlBase: function(url) {
    var temp = document.createElement('a');
    temp.href = url;

    var base = temp.protocol + "//" + temp.hostname;
    if (temp.port) {
      base += ":" + temp.port;
    }
    return base;
  },

  getUrlBaseAndPath: function(url) {
    var temp = document.createElement('a');
    temp.href = url;

    var base = temp.protocol + "//" + temp.hostname;
    if (temp.port) {
      base += ":" + temp.port;
    }
    var parts = temp.pathname.split("/");
    if (parts.length > 0) {
      parts.pop(); // The filename
    }
    var newPath = parts.join("/");
    if (newPath.length == 0) {
      newPath = "/";
    }
    base += newPath;
    return base;
  },

  rewriteRelativeLinks: function(jqNode, sourceUrl) {
    var base = module.exports.getUrlBase(sourceUrl);
    var basePath = module.exports.getUrlBaseAndPath(sourceUrl);
    var pat = /^https?:\/\//i;
    var fixElemAttr = function(elem, attr) {
      var a = elem.attr(attr);
      if ((typeof a != 'undefined') &&
          (a !== null) &&
          (a.length > 0)) {
        if (! pat.test(a)) {
          if (a[0] == "/") {
            a = base + a;
          } else {
            a = basePath + "/" + a;
          }
          elem.attr(attr, a);
        }
      }
    };
    var fixElem = function(elem) {
      if (elem.is('img')) {
        fixElemAttr(elem, 'src');
      } else if (elem.is('a')) {
        fixElemAttr(elem, 'href');
      } else {
        // Do nothing
      }
      _.each(elem.children(), function(c) {
        fixElem($(c));
      }, this);
    }
    fixElem(jqNode);
  },

  fixRelativeUrl: function(url, loadedFrom) {
    if ((url === null) || (typeof url == "undefined")) {
      return null;
    }
    if (typeof loadedFrom == 'undefined') {
      return url;
    } else {
      if ((url.indexOf("relative(") == 0) && (url[url.length - 1] == ")")) {
        var fragment = url.substring(9, url.length - 1);
        var prefix = loadedFrom.split("/");
        prefix.pop();
        if (prefix.length > 0) {
          prefix = prefix.join("/");
          url = prefix + "/" + fragment; 
        } else {
          url = fragment;
        }
        return url;
      } else {
        return url;
      }
    }
  },

  fetchString: function(params) {
    var deferred = Promise.defer();
    var xhr = $.ajax({
      url: params.url,
      dataType: 'text',
      beforeSend: function(xhr, settings) {
        _.each(params, function(value, key, list) {
          xhr[key] = value;
        }, this);
      }
    });
    xhr.done(function(data, textStatus, jqXhr) {
      deferred.resolve(data, textStatus, jqXhr);
    });
    xhr.fail(function(jqXhr, textStatus, errorThrown) {
      Log.Error("Couldn't fetch string at:", params.url);
      deferred.reject(jqXhr, textStatus, errorThrown);
    });
    return deferred.promise;
  },

  fetchTree: function(spec, callback, context) {
    if ((spec.url == null) && (spec.name == 'body')) {
      callback.call(context, null, $('body'));
    } else {
      Log.Fatal("FETCH TREE NOT IMPLEMENTED");
      callback.call(context, "Not Implemented");
    }
  }
};


}, {"./log":10,"./promise":6,"components/underscore":4,"component/jquery":5}],
10: [function(require, module, exports) {
/* 
 * To avoid processing costly things only not to log them, you can
 * say:
 * 
 *     if (CTS.LogLevel.Warn()) {
 *       var b = computeExpensiveThing;
 *       CTS.Log.Warn("b's value is", b);
 *     }
 *
 * This way we can keep some debugging code permanently in the codebasea
 * with minimal production overhead.
 *
 */

exports.LogLevel = {
  
  Level: 3,

  // 0: Fatal
  Fatal: function() {
    return exports.LogLevel.Level >= 0;
  },
   
  // 1: Error
  Error: function() {
    return exports.LogLevel.Level >= 1;
  },

  // 2: Warn
  Warn: function() {
    return exports.LogLevel.Level >= 2;
  },

  // 3: Info
  Info: function() {
    return exports.LogLevel.Level >= 3;
  },

  // 4: Debug 
  Debug: function() {
    return exports.LogLevel.Level >= 4;
  }
};

exports.Log = {
  _timers: {},

  Fatal: function(msg) {
    alert(msg);
    exports.Log._LogWithLevel("FATAL", exports.LogLevel.Fatal, 'error', arguments);
  },

  Error: function(message) {
    exports.Log._LogWithLevel("ERROR", exports.LogLevel.Error, 'error', arguments);
  },

  Warn: function(message) {
    exports.Log._LogWithLevel("WARN", exports.LogLevel.Warn, 'warn', arguments);
  },

  Debug: function(message) {
    exports.Log._LogWithLevel("DEBUG", exports.LogLevel.Debug, 'debug', arguments);
  },

  Info: function(message) {
    exports.Log._LogWithLevel("INFO", exports.LogLevel.Info, 'info', arguments);
  },

  Tick: function(timerName) {
    if (typeof exports.Log._timers[timerName] == 'object') {
      exports.Log.Error("Double tick on timer", timerName);
    }
    exports.Log._timers[timerName] = {
      start: Date.now(),
      name: timerName
    };
  },

  Tock: function(timerName) {
    var end = Date.now();
    if (typeof exports.Log._timers[timerName] == 'object') {
      exports.Log._timers[timerName]['finish'] = end;
      // TODO: Could log to remove server here.
      exports.Log.ReportTimer(exports.Log._timers[timerName]);
      exports.Log._timers[timerName] = null;
    } else {
      exports.Log.Error("Tock with no tick", timerName);
    }
  },

  ReportTimer: function(timer) {
    exports.Log.Info((timer.finish - timer.start), 'ms:', timer.name);
  },

  // To be considered private.
  _LogWithLevel: function(levelName, levelFn, consoleFn, args) {
    if (console && levelFn()) {
      var args = Array.prototype.slice.call(args);
      if (! console[consoleFn]) {
        consoleFn = 'log';
        args.unshift(levelName + ": ");
      }
      console[consoleFn].apply(console, args);
    }
  }
};

}, {}],
3: [function(require, module, exports) {
exports.Factory = require('./factory');
exports.Engine = require('./engine');
}, {"./factory":11,"./engine":12}],
11: [function(require, module, exports) {
var Model = require('cts/model');
var Util = require('cts/util');
var Relations = require('cts/relations');

var Adapters = {
  Html: require('cts/html-adapter'),
  GSheet: require('cts/gsheet-adapter')
};

module.exports = {
  Forrest: function(opts, factory) {
    // Returns Promise
    var forrest = new Model.Forrest(opts, factory);
    return forrest.initializeAsync();
  },

  Relation: Relations.Factory.CreateFromSpec,

  Tree: function(spec, forrest) {
    if ((spec.url == null) && (spec.name == 'body')) {
      return Adapters.Html.Factory.TreeWithJquery(Util.$('body'), forrest, spec);
    } if ((spec.kind == "GSheet" || spec.kind == 'gsheet')) {
      return Adapters.GSheet.Factory.GSpreadsheetTree(spec, forrest);
    } else if (typeof spec.url == "string") {
      var promise = Util.Promise.defer();
      Util.Net.fetchString(spec).then(
        function(content) {
          if ((spec.kind == 'HTML') || (spec.kind == 'html')) {
            var div = Util.$("<div></div>");
            var nodes = Util.$.parseHTML(content);
            var jqNodes = Util._.map(nodes, function(n) {
              return Util.$(n);
            });
            div.append(jqNodes);
            if (spec.fixLinks) {
              Util.Net.rewriteRelativeLinks(div, spec.url);
            }
            Adapters.Html.Factory.TreeWithJquery(div, forrest, spec).then(
              function(tree) {
                promise.resolve(tree);
              },
              function(reason) {
                promise.reject(reason);
              }
            );
          } else {
            promise.reject("Don't know how to make Tree of kind: " + spec.kind);
          }
        },
        function(reason) {
          promise.reject(reason);
        }
      );
      return promise;
    } else {
      return Adapters.Html.Factory.TreeWithJquery(spec.url, forrest, spec);
    }
  }
};
}, {"cts/model":13,"cts/util":2,"cts/relations":14,"cts/html-adapter":15,"cts/gsheet-adapter":16}],
13: [function(require, module, exports) {
exports.Forrest          = require('./forrest.js');
exports.Node             = require('./node.js');
exports.Selection        = require('./selection.js');
exports.Tree             = require('./tree.js');
exports.Relation         = require('./relation.js');
}, {"./forrest.js":17,"./node.js":18,"./selection.js":19,"./tree.js":20,"./relation.js":21}],
17: [function(require, module, exports) {
// Forrest
// ==========================================================================
// A Forrest contains:
//  * Named trees
//  * Relations between those trees
// ==========================================================================

var Parser = require('cts/parser');
var Util = require('cts/util');

var NonexistentNode = require('./nonexistent-node');
var Relation = require('./relation');

var defaultOptions = {
  listenForNodeInsertionOnBody: true
};

// Constructor
// -----------
var Forrest = function(opts, factory) {
  var self = this;
  this.forrestSpecs = [];
  this.factory = factory;

  this.treeSpecs = {};
  this.trees = {};

  this.relationSpecs = [];
  this.relations= [];

  this.insertionListeners = {};

  this.opts = Util.Helper.buildOptions(defaultOptions, opts);

  this.defaultTreeReady = Util.Promise.defer();

  if (opts && (typeof opts.engine != 'undefined')) {
    this.engine = opts.engine;
    // Default tree was realized.
    // Add callback for DOM change events.
    this.engine.status.booted.then(function() {
      if (self.opts.listenForNodeInsertionOnBody) {
        self.listenForNodeInsertionsOnTree('body', true);
      }
    });
  }

  this.initialize();
};


// Instance Methods
// ----------------
Util._.extend(Forrest.prototype, {

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
    var deferred = Util.Promise.defer();
    var self = this;
    var pageBody = null;
    if (typeof this.opts.defaultTree != 'undefined') {
      var pageBody = new Parser.TreeSpec('html', {name: 'body', url: this.opts.defaultTree});
    } else {
      var pageBody = new Parser.TreeSpec('html', {name: 'body'});
    }
    this.addTreeSpec(pageBody);
    this.realizeTree(pageBody).then(
     function(tree) {
       self.defaultTreeReady.resolve();
       if (self.engine) {
         self.engine.status.defaultTreeReady.resolve();
       }
       deferred.resolve(self);
     },
     function(reason) {
       deferred.reject(reason);
     }
    );
    return deferred.promise;
  },

  removeRelationSpec: function(spec) {
    this.relationSpecs = Util._.filter(this.relationSpecs,
      function(r) { return r != spec; });
  },

  reloadTreeSpec: function(name, render) {
    var deferred = Util.Promise.defer();
    var self = this;
    var spec = this.treeSpecs[name]

    // Unload listeners
    var listenValue = this.listenForNodeInsertionsOnTree(name);
    this.listenForNodeInsertionsOnTree(name, false);

    this.trees[name].root.unrealize();
    delete this.trees[name];

    this.realizeTree(spec).then(
     function(tree) {
      // Realize relations again
      Util.Log.Info("Re-Realized tree", name);
      for (var i = 0; i < self.relationSpecs.length; i++) {
        var spec = self.relationSpecs[i];
        if ((spec.selectionSpec1.treeName == name) ||
            (spec.selectionSpec2.treeName == name)) {
          console.log("Re-realizing relation spec", spec);
          self.realizeRelation(spec);
        }
      }

      if (render) {
        self.trees[name].root._processIncoming();
        // Resume listening maybe
        self.listenForNodeInsertionsOnTree(name, listenValue);
        deferred.reject(reason);
      } else {
        // Resume listening maybe
        self.listenForNodeInsertionsOnTree(name, listenValue);
        deferred.reject(reason);        
      }
     },
     function(reason) {
       Util.Log.Error(reason);
       deferred.reject(reason);
     }
    );
    return deferred.promise;
  },

  stopListening: function() {
    Util.Log.Info("Stop Listening");
    for (var treeName in this.insertionListeners) {
      this.listenForNodeInsertionsOnTree(treeName, false);
    }
  },

  startListening: function() {
    Util.Log.Info("Start Listening");
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
      Util.Log.Error("forrest spec undef");
    }
    this.forrestSpecs.push(forrestSpec);

    var initial = Util.Promise.defer();
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
      var promises = Util._.map(forrestSpec.treeSpecs, function(treeSpec) {
        self.addTreeSpec(treeSpec);
        return self.realizeTree(treeSpec);
      });
      Util.Promise.all(promises).then(function() {
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
    var promises = Util._.map(specs, function(spec) {
      return self.addSpec(spec);
    });
    return Util.Promise.all(promises);
  },

  parseAndAddSpec: function(rawData, kind, fromUrl) {
    var deferred = Util.Promise.defer();
    var self = this;
    Parser.parseForrestSpec(rawData, kind, fromUrl).then(
      function(specs) {
        if (fromUrl != 'undefined') {
          Util._.each(specs, function(spec) {
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
    var promises = Util._.map(links, function(block) {
      var deferred = Util.Promise.defer();
      if (block.type == 'link') {
        Util.Net.fetchString(block).then(
          function(content) {
            var url = block.url;
            self.parseAndAddSpec(content, block.format, url).then(
              function() {
                deferred.resolve();
             },
             function(reason) {
               Util.Log.Error("Could not parse and add spec", content, block);
               deferred.resolve();
             }
           );
         },
         function(reason) {
           Util.Log.Error("Could not fetch CTS link:", block);
           deferred.resolve();
         });
      } else if (block.type == 'block') {
        var url = window.location;
        self.parseAndAddSpec(block.content, block.format, url).then(
          function() {
            deferred.resolve();
          },
          function(reason) {
            Util.Log.Error("Could not parse and add spec", content, block);
            deferred.resolve();
          }
        );
      } else {
        Util.Log.Error("Could not load CTS: did not understand block type", block.block, block);
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
      Util.Log.Error("rel spc undef");
    }
    this.relationSpecs.push(relationSpec);
  },

  addRelationSpecs: function(someRelationSpecs) {
    for (var i = 0; i < someRelationSpecs.length; i++) {
      // Faster than .push()
       if (typeof this.relationSpecs == 'undefined') {
         Util.Log.Error("relation undefined");
       }

      this.relationSpecs.push(someRelationSpecs[i]);
    }
  },

  realizeTrees: function() {
    var promises = [];
    Util._.each(this.treeSpecs, function(treeSpec, name, list) {
      if (! Util._.has(this.trees, name)) {
        Util.Log.Info("Promising to realize tree", treeSpec);
        promises.push(this.realizeTree(treeSpec));
      }
    }, this);
    return Util.Promise.all(promises);
  },

  realizeDependencies: function() {
    Util._.each(this.forrestSpecs, function(fs) {
      Util._.each(fs.dependencySpecs, function(ds) {
        ds.load();
      });
    });

    // A no-op, just to fit in with boot and later potential deps.
    return Util.Promise.resolve();
  },

  realizeTree: function(treeSpec) {
    var deferred = Util.Promise.defer();
    var self = this;
    if ((treeSpec.url !== null) && (typeof treeSpec.url == "string") && (treeSpec.url.indexOf("alias(") == 0) && (treeSpec.url[treeSpec.url.length - 1] == ")")) {
      var alias = treeSpec.url.substring(6, treeSpec.url.length - 1);
      if (typeof self.trees[alias] != 'undefined') {
        self.trees[treeSpec.name] = self.trees[alias];
        if (treeSpec.receiveEvents) {
          // XXX: Potential bug here, depending on intent. The aliased tree is
          // the same tree! That means we might intend one to receive and the
          // other not to, but in reality they'll both be in lockstep.
          self.trees[treeSpec.name].toggleReceiveRelationEvents(true);
        }
        deferred.resolve(self.trees[alias]);
      } else {
        deferred.reject("Trying to alias undefined tree");
      }
    } else if (typeof treeSpec.url == "string") {
      treeSpec.url = Util.Net.fixRelativeUrl(treeSpec.url, treeSpec.loadedFrom);
      self.factory.Tree(treeSpec, this).then(
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
      self.factory.Tree(treeSpec, this).then(
        function(tree) {
          self.trees[treeSpec.name] = tree;
          deferred.resolve(tree);
        },
        function(reason) {
          deferred.reject(reason);
        }
      );
    }
    return deferred;
  },

  /*
   * ButOnto exists for the received ARE case: we want to clone the last
   * of an iterable and then set up the proper relations before we add the new
   * iterable to the tree. proble is some relations may be wired based on tree
   * position. But that's OK: since this only happens during an iteration, we can
   * use the existant node to scan for relations that are appropriate, but then
   * add them to the new node. Then filter (see node.js :: handleEventFromRelation).
   * then add.
   */
  realizeRelations: function(subtree, butOnto) {
    for (var i = 0; i < this.relationSpecs.length; i++) {
      this.realizeRelation(this.relationSpecs[i], subtree, butOnto);
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

  realizeRelation: function(spec, subtree, butOnto) {
    if (typeof subtree == 'undefined') {
      subtree = false;
    }
    var s1 = spec.selectionSpec1;
    var s2 = spec.selectionSpec2;

    if (typeof s1 == 'undefined') {
      Util.Log.Error("S1 is undefined", spec);
      return;
    }
    if (typeof s2 == 'undefined') {
      Util.Log.Error("S2 is undefined", spec);
      return;
    }

    // Note: at this point we assume that all trees are loaded.
    if (! this.containsTree(s1.treeName)) {
      Util.Log.Error("Can not realize RelationSpec becasue one or more trees are not available", s1.treeName);
      return;
    }
    if (! this.containsTree(s2.treeName)) {
      Util.Log.Error("Can not realize RelationSpec becasue one or more trees are not available", s2.treeName);
      return;
    }

    // Here we're guaranteed that the trees are available.

    // Now we find all the nodes that this spec matches on each side and
    // take the cross product of all combinations.

    var tree1 = this.trees[s1.treeName];
    var tree2 = this.trees[s2.treeName];

    if (subtree && (subtree.tree != tree1) && (subtree.tree != tree2)) {
      // not relevant to us.
      return;
    }

    var nodes1 = tree1.nodesForSelectionSpec(s1);
    var nodes2 = tree2.nodesForSelectionSpec(s2);

    if (nodes1.length == 0) {
      nodes1 = [NonexistentNode];
      Util.Log.Info("empty selection -> NonExistantNode!", s1);
    }
    if (nodes2.length == 0) {
      nodes2 = [NonexistentNode];
      Util.Log.Info("empty selection -> NonExistantNode!", s2);
    }

    for (var i = 0; i < nodes1.length; i++) {
      for (var j = 0; j < nodes2.length; j++) {
        // Realize a relation between i and j. Creating the relation adds
        // a pointer back to the nodes.
        if ((!subtree) ||
            ((nodes1[i].isDescendantOf(subtree) || nodes1[i] == subtree)) ||
            ((nodes2[j].isDescendantOf(subtree) || nodes2[j] == subtree))) {
          var node1 = nodes1[i];
          var node2 = nodes2[j];

          if (subtree && butOnto) {
            // we have to positionally remap on to the butOnto node!
            // because either node1 or node2 might be anywhere inside `subtree`
            // but we know thet butOnto is a clone of subtree, so we can use
            // positional math to do the trick!
            var keyPath1 = null;
            var keyPath2 = null;
            var buildKP = function(node, parent) {
              kp = [];
              var n = node;
              while (n != parent) {
                kp.unshift(n.parentNode.children.indexOf(n));
                n = n.parentNode;
                if (n == null) {
                  Util.Log.Error("Uh oh. Reached null parent.");
                }
              }
              return kp;
            }
            var adjustNode = function(orig, onto, kp) {
              if (kp == null) {
                return orig;
              }
              var ret = onto;
              for (var i = 0; i < kp.length; i++) {
                ret = ret.children[kp[i]];
              }
              return ret;
            };
            if (nodes1[i].isDescendantOf(subtree) || nodes1[i] == subtree) {
              keyPath1 = buildKP(nodes1[i], subtree);
            }
            if (nodes2[j].isDescendantOf(subtree) || nodes2[j] == subtree) {
              keyPath2 = buildKP(nodes2[j], subtree);
            }
            node1 = adjustNode(node1, butOnto, keyPath1);
            node2 = adjustNode(node2, butOnto, keyPath2);
          }
          var relation = this.factory.Relation(node1, node2, spec);
          // This is necessary but I can't remember why. But it's necessary here.
          node1.realizedInlineRelationSpecs = true;
          node2.realizedInlineRelationSpecs = true;
          // Add the relation to the forrest
          if (typeof this.relations == 'undefined') {
           Util.Log.Error("relations undefined");
          }
          this.relations.push(relation);
        } else {
        }
      }
    }
  },

  /*
   * Fetching Objects
   *
   * -------------------------------------------------------- */

  containsTree: function(alias) {
    return Util._.has(this.trees, alias);
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
      Util.Log.Error("listenForNodeInsertion (" + new_val + "):" +
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
    Util.Log.Info("Forrest caught tree value change");
    var node = evt.sourceNode;
    var tree = evt.sourceTree;

    if (node._subclass_shouldRunCtsOnInsertion()) {
      var links = node._subclass_getTreesheetLinks();
      var promises = self.parseAndAddSpecsFromLinks(ctsLinks);
      Util.Promise.all(promises).then(
        function() {
          // Creae the CTS tree for this region.
          Util.Log.Info("Running onChildInserted", prnt);

          var node = prnt._onChildInserted($node);
        }, function(errors) {
          Util.Log.Error("Couldn't add CTS blocks from inserted dom node", errors);
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
          Util.Log.Info("Insertion", evt.node);
          // Get the parent
          var $prnt = evt.node.parent();
          var prnt = tree.getCtsNode($prnt);
          if (prnt == null) {
            // Util.Log.Error("Node inserted into yet unmapped region of tree", prnt);
          } else {
            // First see if any CTS blocks live in this region
            var ctsLinks = Util.Helper.getTreesheetLinks(evt.node);
            var promises = self.parseAndAddSpecsFromLinks(ctsLinks);
            Util.Promise.all(promises).then(
              function() {
                // Create the CTS tree for this region.
                Util.Log.Info("Running onChildInserted", prnt);
                var node = prnt._onChildInserted(evt.node);
              }, function(errors) {
                Util.Log.Error("Couldn't add CTS blocks from inserted dom node", errors);
              }
            );
          }
        }
      }
      evt.ctsHandled = true;
    }
  }
});

module.exports = Forrest;

}, {"cts/parser":22,"cts/util":2,"./nonexistent-node":23,"./relation":21}],
22: [function(require, module, exports) {
var Util = require('cts/util');
var JsonParser = require('./json-parser');
var CtsParser = require('./cts-parser');
var DependencySpec = require('./spec/dependency-spec');
var ForrestSpec = require('./spec/forrest-spec');
var SelectionSpec = require('./spec/selection-spec');
var TreeSpec = require('./spec/tree-spec');
var RelationSpec = require('./spec/relation-spec');

/* Helper: separates inline spec into FORMAT and BODY.
 *
 * Args:
 *  - str: The string encoding of a CTS spec.
 *
 *  str may be either <format>:<cts spec> or <cts spec>
 *  <format> may be either 'json' or 'str'
 *
 * Returns:
 *  Tuple of [format, specBody]
 */
var _typeAndBodyForInline = function(str) {
  var res = /^([a-zA-Z]+):(.*)$/.exec(str);
  if (res === null) {
    return ['string', str];
  } else {
    return [res[1], res[2]];
  }
};

/* Parses a forrest (externally linked) CTS sheet.
 *
 * Args:
 *  - spec: the spec to parse
 *  - format: the format which encodes the spec
 *  - fromUrl: the url which loaded the spec
 *
 * Returns:
 *  Promise for a ForrestSpec object
 */
var parseForrestSpec = function(spec, format, fromUrl) {
  if (format == 'json') {
    return JsonParser.parseForrestSpec(spec, fromUrl);
  } else if (format == 'string') {
    return CtsParser.parseForrestSpec(spec, fromUrl);
  } else {
    return Util.Promise.reject("I don't understand the CTS Format:" + format);
  }
};

/* Helper function which wraps parseForrestSpec.
 *
 * Args:
 *   - spec: the spec to parse
 *   - kind: the format which encodes the spec
 *   - fromUrl: the url which loaded the spec
 */
var parse = function(spec, format, fromUrl) {
  if (typeof format == 'undefined') {
    format = 'string';
  }
  return parseForrestSpec(spec, format, fromUrl);
};

/* Parses an inline (in a DOM Note attribute) CTS sheet.
 *
 * Args:
 *   - spec: the spec to parse
 *   - node: the CTS node on which the spec was inlined
 *   - intoForrest: the forrest into which to add this inline spec
 *   - realizeTrees: (bool) should any unrealized trees referenced within
 *                   be automatically realized before promise is resolved?
 *
 * Returns:
 *   Promise for a ForrestSpec object.
 */
var parseInlineSpecs = function(spec, node, intoForrest, realizeTrees) {
  var tup = _typeAndBodyForInline(spec);
  var kind = tup[0];
  var body = tup[1];

  if (kind == 'json') {
    return JsonParser.parseInlineSpecs(body, node, intoForrest, realizeTrees);
  } else if (kind == 'string') {
    return CtsParser.parseInlineSpecs(body, node, intoForrest, realizeTrees);
  } else {
    return Util.Promise.reject("I don't understand the CTS Format:" + kind);
  }
};

// var tryPop =  function(str, r) {
//   var match = r.exec(str);
//   console.log(match);
//   return;
// },

var _rTree = /^\s*([A-Za-z0-9_\-])+\s*\|(.*)$/;
var _rWorksheet = /^\s*([a-zA-Z0-9_-]+)\s*\!(.*)$/;
var _rRows = /^\s*[Rr][Oo][Ww][Ss]\s*$/;
var _rCols = /^\s*[Cc][Oo][Ll][Ss]\s*$/;
var _rRow = /^\s*[Rr][Oo][Ww]\(([a-zA-Z0-9_\- \.:;,]+)\)\s*$/;
var _rCol = /^\s*[Cc][Oo][Ll]\(([a-zA-Z0-9_\- \.:;,]+)\)\s*$/;
var _rCell = /^\s*([A-Za-z]+)([0-9]+)\s*$/;

/*
 */
var parseSheetSelector = function(selectorString) {
  var s = selectorString.trim();
  var ret = {
    tree: null,
    worksheet: null,
    projection: null,
    row: null,
    col: null
  };
  var match;

  if (match = _rTree.exec(s)) {
    ret.tree = match[1];
    s = match[2];
  }

  // WORKSHEET PREFIX
  if (match = _rWorksheet.exec(s)) {
    // There's a worksheet string
    ret.worksheet = match[1];
    s = match[2];
  }

  if (match = _rRows.exec(s)) {
    ret.projection = 'Rows';
  } else if (match = _rCols.exec(s)) {
    ret.projection = 'Cols';
  } else if (match = _rRow.exec(s)) {
    ret.projection = "Rows";
    ret.row = match[1];
  } else if (match = _rCol.exec(s)) {
    ret.projection = "Cols";
    ret.col = match[1];
  } else if (match = _rCell.exec(s)) {
    ret.projection = "Cells";
    ret.col = match[1]; // A
    ret.row = match[2]; // 1
  }
  return ret;
};

module.exports = {
  parseForrestSpec: parseForrestSpec,
  parse: parse,
  parseInlineSpecs: parseInlineSpecs,
  parseSheetSelector: parseSheetSelector,
  TreeSpec: TreeSpec,
  SelectionSpec: SelectionSpec,
  RelationSpec: RelationSpec,
  ForrestSpec: ForrestSpec,
  DependencySpec: DependencySpec
};
}, {"cts/util":2,"./json-parser":24,"./cts-parser":25,"./spec/dependency-spec":26,"./spec/forrest-spec":27,"./spec/selection-spec":28,"./spec/tree-spec":29,"./spec/relation-spec":30}],
24: [function(require, module, exports) {
var Util = require('cts/util');
var RelationSpec = require('./spec/relation-spec');
var DependencySpec = require('./spec/dependency-spec');
var SelectionSpec = require('./spec/selection-spec');
var TreeSpec = require('./spec/tree-spec');
var ForrestSpec = require('./spec/forrest-spec');

var JsonParser = {

  parseInlineSpecs: function(json, node, intoForrest) {
    var promise = Util.Promise.defer();

    if (typeof json == 'string') {
      json = JSON.parse(json);
    }

    // Now we build a proper spec document around it.
    var relations = intoForrest.incorporateInlineJson(json, node);

    return promise;
  },

  parseForrestSpec: function(json) {
    var rets = [];

    if (typeof json == 'string') {
      json = JSON.parse(json);
    }
    var ret = new ForrestSpec();

    if (! Util._.isUndefined(json.trees)) {
      Util._.each(json.trees, function(treeSpecJson) {
        var ts = JsonParser.parseTreeSpec(treeSpecJson);
        ret.treeSpecs.push(ts);
      });
    };

    if (! Util._.isUndefined(json.relations)) {
      Util._.each(json.relations, function(relationSpecJson) {
        var s1 = JsonParser.parseSelectorSpec(relationSpecJson[0]);
        var s2 = JsonParser.parseSelectorSpec(relationSpecJson[2]);
        var r  = JsonParser.parseRelationSpec(relationSpecJson[1], s1, s2);
        ret.relationSpecs.push(r);
      });
    }

    rets.push(ret);
    return Util.Promise.resolve(rets);
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
      intoForrestSpec = new ForrestSpec();
    }

    intoForrestSpec.incorporate(json);
  },

  parseRelationSpec: function(json, selectorSpec1, selectorSpec2) {
    var ruleName = null;
    var ruleProps = {};
    if (Util._.isArray(json)) {
      if (json.length == 2) {
        Util._.extend(ruleProps, json[1]);
      }
      if (json.length > 0) {
        ruleName = json[0];
      }
    } else if (Util._.isObject(json)) {
      if (!Util._.isUndefined(json.name)) {
        ruleName = json.name;
      }
      if (!Util._.isUndefined(json.props)) {
        ruleProps = json.props;
      }
    } else if (typeof json == 'string') {
      ruleName = json;
    }
    var r = new RelationSpec(selectorSpec1, selectorSpec2, ruleName, ruleProps);
    return r;
  },

  parseTreeSpec: function(json) {
    var ret = new TreeSpec();
    ret.kind = json[0];
    ret.name = json[1];
    ret.url = json[2];
    if (Util._.isObject(json[json.length - 1])) {
      ret.opts = json[json.length - 1];
    }
    return ret;
  },

  parseSelectorSpec: function(json, inlineNode) {
    var treeName = null;
    var selectorString = null;
    var args = {};

    if ((json === null) && (inlineNode)) {
      treeName = inlineNode.tree.name;
    } else if (Util._.isArray(json)) {
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
    } else if (Util._.isObject(json)) {
      if (!Util._.isUndefined(json.treeName)) {
        treeName = json.treeName;
      }
      if (!Util._.isUndefined(json.selectorString)) {
        selectorString = json.selectorString;
      }
      if (!Util._.isUndefined(json.props)) {
        args = json.props;
      }
    } if (typeof json == 'string') {
      selectorString = json;
    }

    if (treeName == null) {
      treeName = 'body';
    }

    var s = new SelectionSpec(treeName, selectorString, args);
    if ((json === null) && (inlineNode)) {
      s.inline = true;
      s.inlineObject = inlineNode;
    }
    return s;
  }

};

module.exports = JsonParser;

}, {"cts/util":2,"./spec/relation-spec":30,"./spec/dependency-spec":26,"./spec/selection-spec":28,"./spec/tree-spec":29,"./spec/forrest-spec":27}],
30: [function(require, module, exports) {
var Util = require('cts/util');

var RelationSpec = function(selector1, selector2, name, props) {
  this.selectionSpec1 = selector1;
  this.selectionSpec2 = selector2;
  this.name = name;
  this.opts = props || {};
  this.forCreationOnly = false;
};

Util._.extend(RelationSpec.prototype, {
  head: function() {
    return this.selectionSpec1;
  },

  tail: function() {
    return this.selectionSpec2;
  },

  clone: function() {
    var spec = RelationSpec(this.selectionSpec1, this.selectionSpec2, name, props);
    spec.forCreationOnly = this.forCreationOnly;
    return spec;
  }
});

module.exports = RelationSpec;
}, {"cts/util":2}],
26: [function(require, module, exports) {
var Util = require('cts/util');

var DependencySpec = function(kind, url) {
  this.kind = kind;
  this.url = url;
  this.loaded = false;
};

DependencySpec.prototype.load = function() {
  this.url = Util.Net.fixRelativeUrl(this.url, this.loadedFrom);
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
    } else if (this.kind == 'cts') {
      // Ignore
    } else {
      Util.Log.Error("DependencySpec: Unsure how to load: ", this.kind, this.url);
    }
  } else {
    Util.Log.Warn("DependencySpec: Not loading already loaded", this.kind, this.url);
  }
};

DependencySpec.prototype.unload = function() {
  if (this.loaded) {
    this.url = Util.Net.fixRelativeUrl(this.url, this.loadedFrom);
    if (this.kind == 'css') {
      var links = document.getElementsByTagName('link');
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (typeof link.attributes != "undefined") {
          if (typeof link.attributes["href"] != "undefined") {
            if (link.attributes["href"].value == this.url) {
              link.parentNode.removeChild(link);
              this.loaded = false;
            }
          }
        }
      }

    } else if (this.kind == 'js') {
      // Can't unload a JS link.
    }
  } else {
    Util.Log.Warn("Tried to unload DependencySpec that wasn't loaded", this);
  }
};

module.exports = DependencySpec;

}, {"cts/util":2}],
28: [function(require, module, exports) {
var Util = require('cts/util');

var SelectionSpec = function(treeName, selectorString, props) {
  this.treeName = treeName;
  this.selectorString = selectorString;
  this.props = props || {};
  this.inline = false;
  this.inlineObject = null;
};

Util._.extend(SelectionSpec.prototype, {
  toString: function() {
    return "<Selector {tree:" + this.treeName +
           ", type:" + this.treeType +
           ", selector:" + this.selector +
           ", variant:" + this.variant + "}>";
  },

  matches: function(node) {
    if (Util._.isUndefined(node._kind)) {
      Util.Log.Error("Node has no kind", [node]); 
      return false;
    } else if (node._kind != this._kind) {
      Util.Log.Error("Node has wrong kind", [node]);
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

    var trimmed = Util.$.trim(selectorString);
    if (trimmed[0] == "@") {
      var pair = trimmed.split('|');
      if (pair.length == 1) {
        throw new Error("Cound not parse: " + self.stringSpec);
      } else {
        treeName = Util.$.trim(pair.shift().substring(1));
        // TODO(eob): set tree type
        selector = Util.$.trim(pair);
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

    if (selector !== null) {
      selector.treeName = parts[0];
      selector.treeType = parts[1];
      selector.originalString = selectorString;
    }

    return selector;
  }
});

module.exports = SelectionSpec;

}, {"cts/util":2}],
29: [function(require, module, exports) {
var Util = require('cts/util');

var TreeSpec = function(kind, opts) {
  this.kind = kind;
  // name, url, loadedFrom, fixLinks
  this.fixLinks = true;
  this.loadedFrom = null;
  this.name = null;
  this.url = null;
  this.opts = {};
  Util._.extend(this, opts);
};

module.exports = TreeSpec;

}, {"cts/util":2}],
27: [function(require, module, exports) {
var Util = require('cts/util');

var ForrestSpec = function() {
  this.treeSpecs = [];
  this.relationSpecs = [];
  this.dependencySpecs = [];
};

Util._.extend(ForrestSpec.prototype, {
  // incorporateJson: function(json) {
  //   if (typeof json.relations != 'undefined') {
  //     for (var i = 0; i < json.relations.length; i++) {
  //       if (json.relations[i].length == 3) {
  //         var s1 = CTS.Parser.Json.parseSelectorSpec(json.relations[i][0]);
  //         var s2 = CTS.Parser.Json.parseSelectorSpec(json.relations[i][2]);
  //         var rule = CTS.Parser.Json.parseRelationSpec(json.relations[i][1], s1, s2);
  //         this.relationSpecs.push(rule);
  //       }
  //     }
  //   }

  //   if (typeof json.trees != 'undefined') {
  //     for (var i = 0; i < json.trees.length; i++) {
  //       if (json.trees[i].length == 3) {
  //         this.treeSpecs.push(new CTS.TreeSpec(
  //           json.trees[i][0],
  //           json.trees[i][1],
  //           json.trees[i][2]));
  //       }
  //     }
  //   }
  // },

});

module.exports = ForrestSpec;
}, {"cts/util":2}],
25: [function(require, module, exports) {
var Util = require('cts/util');
var RelationSpec = require('./spec/relation-spec');
var DependencySpec = require('./spec/dependency-spec');
var SelectionSpec = require('./spec/selection-spec');
var TreeSpec = require('./spec/tree-spec');
var ForrestSpec = require('./spec/forrest-spec');

var CtsParserImpl = {

  parse: function(str) {

    // First, remove all comments
    str = CtsParserImpl.RemoveComments(str);

    var i = 0;
    var c;
    var relations = [];
    var ats = [];
    while (i < str.length) {
      c = str[i];
      if ((c == ' ') || (c == '\n') || (c == '\t') || (c == '\r')) {
        i++;
      } else if (c == "@") {
        tup = CtsParserImpl.AT(str, i+1);
        i = tup[0];
        ats.push(tup[1]);
      } else {
        tup = CtsParserImpl.RELATION(str, i);
        i = tup[0];
        relations.push(tup[1]);
      }
    }
    var r = {headers: ats, relations: relations};
    return r;
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
    return inQuestion;
  },

  /* Can take the form:
   *   @string string2 string3 ... stringN { optional: args } ;
   */
  AT: function(str, i) {
    var start = i;
    var curly = -1;
    while ((i < str.length) && (str[i] != ';')) {
      if (str[i] == "{") {
        curly = i;
      }
      i++;
    }
    var s;
    if (curly) {
      s = str.substring(start, curly);
    } else {
      s = str.substring(start, i);
    }
    var opts = {};
    if (curly >= 0) {
      var optResults = CtsParserImpl.KV(str, curly);
      opts = optResults[1];
    }

    var s = str.substring(start, i);
    var parts = s.split(" ");
    for (var k = 0; i < parts.length; k++) {
      parts[k].trim();
    }
    return [i+1, [parts, opts]];
  },

  RELATION: function(str, i) {
    var tup = CtsParserImpl.SELECTOR(str, i, false);
    i = tup[0];
    var s1 = tup[1];

    tup = CtsParserImpl.RELATOR(str, i);
    i = tup[0];
    var r = tup[1][0];
    var kv = tup[1][1];

    var tup = CtsParserImpl.SELECTOR(str, i, true);
    i = tup[0];
    var s2 = tup[1];

    return [i, new RelationSpec(s1, s2, r, kv)];
  },

  SELECTOR: function(str, i, second) {
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
        var tup = CtsParserImpl.KV(str, i);
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
    // Parse a JSON Dict
    var start = i;
    var openQuote = null;    
    while ((i < str.length) && (
      ((openQuote == null) && (str[i] != '}')) || (openQuote != null))) { 
      if (openQuote == null) {
        if ((str[i] == '"') || (str[i] == "'")) {
          openQuote = str[i];
        }
      } else {
        if (str[i] == openQuote) {
          if (str[i-1] != "\\") {
            openQuote = null;
          }
        }
      }
      i += 1;
    }
    var s = str.substring(start, i+1);
    var ret = JSON.parse(s);
    return [i+1, ret];
  },

  KEY: function(str, i) {
    var start = i;
    while ((i < str.length) && (str[i] != ':')) {
      i++;
    }
    return [i+1, str.substring(start, i).trim()];
  },

  VALUE: function(str, i) {
    var start = i;

    var quoted = false;
    var seenNonQuotedString = false;
    var quoteChar = null;
    var end = -1;

    while ((i < str.length) && ((!quoted) && (str[i] != ",") && (str[i] != "}"))) {
      if (!quoted) {
        if ((!seenNonQuotedString) && ((str[i] == '\'') || (str[i] == '"'))) {
          quoted = true;
          seenNonQuotedString = true;
          start = i+1;
          quoteChar = str[i];
        } else if (str[i] != ' ') {
          seenNonQuotedString = true;
        }
      } else {
        if ((str[i] == quoteChar) && (str[i-1] != '\\')) {
          end = i;
          quoted = false;
        }
      }
      i++;
    }
    if (end == -1) {
      end = i;
    }
    var val = str.substring(start, end).trim();
    if (str[i] == ",") {
      return [i+1, val];
    } else {
      return [i, val]; // Parent needs to see } for terminal condition.
    }
  },

  RELATOR: function(str, i) {
    var kv = {};
    var start = i;
    var cont = true;
    while ((i < str.length) && (str[i] != ' ') && (str[i] != '\n') && (str[i] != '\t') && (str[i] != '\r')) {
      i++;
    }
    var relator = str.substring(start, i).trim();
    while ((i < str.length) && ((str[i] == ' ') || (str[i] == '\n') || (str[i] == '\t') || (str[i] == '\r'))) {
      i++;
    }
    if (str[i] == "{") {
      var tup = CtsParserImpl.KV(str, i);
      i = tup[0];
      kv = tup[1];
    }
    return [i, [relator, kv]];
  }
};

var CtsParser = {

  parseInlineSpecs: function(str, node, intoForrest) {
    var promise = Util.Promise.defer();
    // First parse out the spec. The user should be using "this" to refer
    // to the current node.

    CtsParser.parseForrestSpec(str).then(
      function(specs) {
        // We have to zip through here to find any instances of 'this' and replace
        // it with the tree that we're working with.
        var promises = Util._.map(specs, function(spec) {
          var nullSelector = false;
          if (typeof spec.relationSpecs != "undefined") {
            for (var i = 0; i < spec.relationSpecs.length; i++) {
              var rs = spec.relationSpecs[i];
              var s1 = rs.selectionSpec1;
              var s2 = rs.selectionSpec2;
              if ((s1.selectorString != null) && (s2.selectorString != null)) {
                if (s1.selectorString.trim() == "this") {
                  s1.inline = true;
                  s1.inlineObject = node;
                }
                if (s2.selectorString.trim() == "this") {
                  s2.inline = true;
                  s2.inlineObject = node;
                }
              } else {
                nullSelector = true;
              }
            }
          }
          if (nullSelector) {
            var error = "parseInlineSpecs: Null selector  ";
            Util.Log.Error(error, spec);
            Util.Promise.reject(error);
          } else {
            return intoForrest.addSpec(spec);
          }
        });

        Util.Promise.all(promises).then(
          // Specs here is ref to result from parseForrestSpec
          function() {
            promise.resolve(specs);
          },
          function(reason) {
            promise.reject(reason);
          }
        );
      },
      function(reason) {
        promise.reject(reason);
      }
    );

    return promise;
  },

  parseForrestSpec: function(str, fromLocation) {
    var promise = Util.Promise.defer();
    var json = null;
    var remoteLoads = [];
    var self = this;

    try {
      json = CtsParserImpl.parse(str.trim());
    } catch (e) {
      Util.Log.Error("Parser error: couldn't parse string", str, e);
      return null;
    }
    json.trees = [];
    json.css = [];
    json.js = [];
    var i;
    var forrestSpecs = [];
    var f = new ForrestSpec();
    if (typeof json.headers != 'undefined') {
      for (i = 0; i < json.headers.length; i++) {
        var headerBlob = json.headers[i];
        var h = headerBlob[0];
        var headerOpts = headerBlob[1];
        var kind = h.shift().trim();
        if (kind == 'html') {
          headerOpts['name'] = h[0];
          headerOpts['url'] = h[1];
          f.treeSpecs.push(new TreeSpec('html', headerOpts));
        } else if (kind == 'gsheet') {
          headerOpts['name'] = h[0];
          headerOpts['url'] = h[1];
          if (h.length > 3) {
            headerOpts['worksheet'] = h[2];
            f.treeSpecs.push(new TreeSpec('gsheet', headerOpts));
          }
          else if (h.length > 2) {
            headerOpts['worksheet'] = h[2];
            f.treeSpecs.push(new TreeSpec('gsheet', headerOpts));
          } else {
            f.treeSpecs.push(new TreeSpec('gsheet', headerOpts));
          }
        } else if (kind == 'css') {
          f.dependencySpecs.push(new DependencySpec('css', h[0]));
        } else if (kind == 'cts') {
          f.dependencySpecs.push(new DependencySpec('cts', h[0]));
          var url = h[0];
          if (typeof fromLocation != 'undefined') {
            url = Util.Net.fixRelativeUrl(url, fromLocation);
          }
          remoteLoads.push(
            Util.Net.fetchString({url: url}).then(
              function(str) {
                return self.parseForrestSpec(str, url);
              }
            )
          );
        } else if (kind == 'js') {
          f.dependencySpecs.push(new DependencySpec('js', h[0]));
        } else {
          Util.Log.Error("Don't know CTS header type:", kind);
        }
      }
    }
    f.relationSpecs = json.relations;
    forrestSpecs.push(f);

    Util.Promise.all(remoteLoads).then(
      function(moreSpecs) {
        // Results here contains MORE cts strings
        //var parsePromises = Util._.map(results, function(result) {
        //  return self.parseForrestSpec(result);
        //});
//        Q.all(parsePromises).then(
//          function(moreSpecs) {
            for (var i = 0; i < moreSpecs.length; i++) {
              for (var j = 0; j < moreSpecs[i].length; j++) {
                forrestSpecs.push(moreSpecs[i][j]);
              }
            }
            promise.resolve(forrestSpecs);
//          },
//          function(reason) {
//            deferred.reject(reason);
//          }
//        );
      },
      function(reason) {
        promise.reject(reason);
      }
    );
    return promise;
  }
};

module.exports = CtsParser;

}, {"cts/util":2,"./spec/relation-spec":30,"./spec/dependency-spec":26,"./spec/selection-spec":28,"./spec/tree-spec":29,"./spec/forrest-spec":27}],
23: [function(require, module, exports) {
var AbstractNode = require('./abstract-node');

var nen = new AbstractNode();

module.exports = nen;
}, {"./abstract-node":31}],
31: [function(require, module, exports) {
var Node = require('./node');
var Util = require('cts/util');

var AbstractNode = function() {
  this.initializeNodeBase();
  this.value = null;
};

Util._.extend(AbstractNode.prototype, Util.Events, Node.Base, {
   _subclass_beginClone: function() {
     var d = Util.Promise.defer();
     var n = new AbstractNode();
     n.setValue(this.getValue());
     var kidPromises = CTS._.map(this.children, function(kid) {
       return kid.clone();
     });
     Util.Promise.all(kidPromises).then(
       function(kids) {
         for (var i = 0; i < kids.length; i++) {
           kids[i].parentNode = n;
           n.insertChild(kids[i]);
         }
         deferred.resolve(n);
       },
       function(reason) {
         d.reject(reason);
       }
     )
     return d.promise;
   },

   getValue: function() {
     return "";
   }
});

module.exports = AbstractNode;



}, {"./node":18,"cts/util":2}],
18: [function(require, module, exports) {
// Node
// --------------------------------------------------------------------------
//
// A Node represents a fragment of a tree which is annotated with CTS.
//
// Nodes are responsible for understanding how to behave when acted on
// by certain relations (in both directions). The differences between
// different types of trees (JSON, HTML, etc) are concealed at this level.

var Util = require('cts/util');
var Parser = require('cts/parser');

var Node = {};

Node.Base = {

  initializeNodeBase: function(tree, opts) {
    this.opts = opts;
    this.tree = tree;
    this.kind = null;
    this.children = [];
    this.parentNode = null;
    this.relations = [];
    this.value = null;
    this.shouldThrowEvents = false;
    this.shouldReceiveEvents = false;
    this.inlineRelationSpecs = [];
    this.parsedInlineRelationSpecs = false;
    this.realizedInlineRelationSpecs = false;
    this._lastValueChangedValue = null;
  },

  getChildren: function() {
    return this.children;
  },

  containsRelation: function(relation) {
    if (! this.relations) {
      return false;
    }
    if (Util._.contains(this.relations, relation)) {
      return true;
    }
    for (var i = 0; i < this.relations.length; i++) {
      if (this.relations[i].equals(relation)) {
        return true;
      }
    }
    return false;
  },

  registerRelation: function(relation) {
    if (typeof this.relations == 'undefined') {
      this.relations = [];
    }
    if (! this.containsRelation(relation)) {
      this.relations.push(relation);
      this.on('ValueChanged', relation.handleEventFromNode, relation);
      this.on('ChildInserted', relation.handleEventFromNode, relation);
    }
  },

  unregisterRelation: function(relation) {
    this.off('ValueChanged', relation.handleEventFromNode, relation);
    this.off('ChildInserted', relation.handleEventFromNode, relation);
    this.relations = Util._.filter(this.relations,
      function(r) { return r != relation; });
  },

  getRelations: function() {
    if (! this.realizedInlineRelationSpecs) {
      for (var i = 0; i < this.inlineRelationSpecs.length; i++) {
        var spec = this.inlineRelationSpecs[i];
        this.tree.forrest.realizeRelation(spec);
      }
      this.realizedInlineRelationSpecs = true;
    }
    return this.relations;
  },

  markRelationsAsForCreation: function(val, recurse, insideOtherSubtree) {
    var rs = this.getRelations();
    if (typeof insideOtherSubtree == 'undefined') {
      insideOtherSubtree = false;
    }
    for (var i = 0; i < rs.length; i++) {

      if (insideOtherSubtree) {
        if ((rs[i].node1 == this) && (rs[i].node2.isDescendantOf(insideOtherSubtree))) {
          rs[i].forCreationOnly(val);          
        } else if ((rs[i].node2 == this) && (rs[i].node1.isDescendantOf(insideOtherSubtree))) {
          rs[i].forCreationOnly(val);
        }
      } else {
        rs[i].forCreationOnly(val);
      }
    }
    if (recurse) {
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].markRelationsAsForCreation(val, recurse, insideOtherSubtree);
      }
    }
  },

  parseInlineRelationSpecs: function() {
    var deferred = Util.Promise.defer();
    var self = this;

    // Already added
    if (this.parsedInlineRelationSpecs === true) {
      Util.Log.Warn("Not registering inline relations: have already done so.");
      deferred.resolve();
      return deferred.promise;
    }

    self.parsedInlineRelationSpecs = true;
    var specStr = this._subclass_getInlineRelationSpecString();

    // No inline spec
    if (! specStr) {
      deferred.resolve();
      return deferred.promise;
    }

    if (typeof this.tree == 'undefined') {
      deferred.reject("Undefined tree");
      return deferred.promise;
    }

    if (typeof this.tree.forrest == 'undefined') {
      deferred.reject("Undefined forrest");
      return deferred.promise;
    }

    var self = this;

    Parser.parseInlineSpecs(specStr, self, self.tree.forrest, true).then(
      function(forrestSpecs) {
        Util._.each(forrestSpecs, function(forrestSpec) {
          if (typeof forrestSpec.relationSpecs != 'undefined') {
            self.inlineRelationSpecs = forrestSpec.relationSpecs;
          }
        });
        deferred.resolve();
      },
      function(reason) {
        deferred.reject(reason);
      }
    );

    return deferred.promise;
  },

  parseInlineRelationSpecsRecursive: function() {
    var d = Util.Promise.defer();
    var self = this;
    this.parseInlineRelationSpecs().then(
      function() {
        Util.Promise.all(Util._.map(self.children, function(kid) {
           return kid.parseInlineRelationSpecsRecursive();
        })).then(function() {
          d.resolve();
        }, function(reason) {
          d.reject(reason);
        });
      },
      function(reason) {
        d.reject(reason);
      }
    );
    return d.promise;

  },

  getSubtreeRelations: function() {
    return Util._.union(this.getRelations(), Util._.flatten(
      Util._.map(this.getChildren(), function(kid) {
        return kid.getSubtreeRelations();
      }))
    );
    /*
       var deferred = Q.defer();

    this.getRelations().then(function(relations) {
      var kidPromises = Util._.map(this.getChildren(), function(kid) {
        return kid.getSubtreeRelations();
      });
      if (kidPromises.length == 0) {
        deferred.resolve(relations);
      } else {
        Q.allSettled(kidPromises).then(function(results) {
          var rejected = false
          var kidRelations = [];
          results.forEach(function(result) {
            if (result.state == "fulfilled") {
              kidRelations.push(result.value);
            } else {
              rejected = true;
              Util.Log.Error(result.reason);
              deferred.reject(result.reason);
            }
          });
          if (!rejected) {
            var allR = Util._.union(relations, Util._.flatten(kidRelations));
            deferred.resolve(allR);
          }
        });
      }
    }, function(reason) {
      deferred.reject(reason);
    });

    return deferred.promise;
    */
  },

  insertChild: function(node, afterIndex, throwEvent) {
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

    // Now we need to realize relations for this node.

    //TODO(eob) Have this be an event
    this._subclass_insertChild(node, afterIndex);

    if (throwEvent) {
      this.trigger("ChildInserted", {
        eventName: "ChildInserted",
        ctsNode: node,
        sourceNode: this,
        sourceTree: this.tree,
        afterIndex: afterIndex
      });
    }
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
    // Now clean up anything left
    this._subclass_ensure_childless();

    for (var j = 0; j < nodes.length; j++) {
      this.insertChild(nodes[j]);
    }
  },

  // TODO(eob): potentially override later
  equals: function(other) {
    return this == other;
  },

  hide: function() {

  },

  unhide: function() {

  },

  unrealize: function() {
    while (this.relations.length > 0) {
      console.log("Destroying", this.relations[0]);
      this.relations[0].destroy();
    }

    for (var i = 0; i < this.inlineRelationSpecs.length; i++) {
      this.tree.forrest.removeRelationSpec(this.inlineRelationSpecs[i]);
    }

    this.toggleThrowDataEvents(false);
    this._subclass_unrealize();
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].unrealize();
    }
  },

  _subclass_unrealize: function() {

  },

  destroy: function(destroyValueToo) {
    var gotIt = false;
    if (typeof destroyValueToo == 'undefined') {
      destroyValueToo = true;
    }
    if (this.parentNode) {
      for (var i = 0; i < this.parentNode.children.length; i++) {
        if (this.parentNode.children[i] == this) {
          Util.Helper.arrDelete(this.parentNode.children, i, i);
          gotIt = true;
          break;
        }
      }
    }

    for (var i = 0; i < this.relations.length; i++) {
      this.relations[i].destroy();
    }
    // No need to log if we don't have it. That means it's root.
    // TODO(eob) log error if not tree root
    if (destroyValueToo) {
      this._subclass_destroy();
    }
  },

  undestroy: function() {
  },

  realizeChildren: function() {
    var deferred = Util.Promise.defer();

    if (this.children.length != 0) {
      Util.Log.Fatal("Trying to realize children when already have some.", this);
      deferred.reject("Trying to realize when children > 0");
    }

    var self = this;
    var sc = this._subclass_realizeChildren();

    sc.then(
      function() {
        var promises = Util._.map(self.children, function(child) {
          return child.realizeChildren();
        });
        Util.Promise.all(promises).then(
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

  clone: function(runBeforeAnyPersistenceFn) {
    var deferred = Util.Promise.defer();
    var self = this;
    this._subclass_beginClone(runBeforeAnyPersistenceFn).then(
      function(clone) {
        if (typeof clone == 'undefined') {
          Util.Log.Fatal("Subclass did not clone itself when asked.");
          deferred.reject("Subclass did not clone itself when asked");
        } else {
          if (clone.relations.length > 0) {
            Util.Log.Error("Clone shouldn't have relations yet, but does", clone);
          }

          clone.parentNode = this.parentNode;

          // Note that we DON'T wire up any parent-child relationships
          // because that would result in more than just cloning the node
          // but also modifying other structures, such as the tree which
          // contained the source.
          self.recursivelyCloneRelations(clone);

          // For the love of god, make the asynchronicity
          if (runBeforeAnyPersistenceFn) {            
            if (clone._subclass_endClone) {
              runBeforeAnyPersistenceFn(clone).then(
                function() {
                  clone._subclass_endClone().then(
                    function() { deferred.resolve(clone) },
                    function(reason) { deferred.reject(reason); }
                  );
                },
                function(reason) { deferred.reject(reason); }
              );
            } else {
              runBeforeAnyPersistenceFn.then(
                function() { deferred.resolve(clone) },
                function(reason) { deferred.reject(reason); }
              );
            }
          } else {
            if (clone._subclass_endClone) {
              clone._subclass_endClone().then(
                function() { deferred.resolve(clone) },
                function(reason) { deferred.reject(reason); }
              );
            } else {
              deferred.resolve(clone);
            }
          }
        }
      },
      function(reason) {
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  },

  recursivelyCloneRelations: function(to) {
    if (typeof to == 'undefined') {
      debugger;
    }
    var r = this.getRelations();

    if (to.relations && (to.relations.length > 0)) {
      Util.Log.Error("Clone relations to non-empty relation container. Blowing away");
      while (to.relations.length > 0) {
        to.relations[0].destroy();
      }
    }

    for (var i = 0; i < r.length; i++) {
      var n1 = r[i].node1;
      var n2 = r[i].node2;
      if (n1 == this) {
        n1 = to;
      } else if (n2 == this) {
        n2 = to;
      } else {
        Util.Log.Fatal("Clone failed");
      }
      var relationClone = r[i].clone(n1, n2);
    };

    for (var j = 0; j < this.getChildren().length; j++) {
      var myKid = this.children[j];
      var otherKid = to.children[j];
      if (typeof otherKid == 'undefined') {
        Util.Log.Error("Cloned children out of sync with origin children.");
      }
      myKid.recursivelyCloneRelations(otherKid);
    }
  },

  pruneRelations: function(otherParent, otherContainer) {
    var self = this;
    this.relations = Util._.filter(this.getRelations(), function(r) {
      var other = r.opposite(self);
      // If the rule ISN'T subtree of this iterable
      // But it IS inside the other container
      // Remove it
      var insideOtherContainer = false;
      if (typeof otherContainer == 'undefined') {
        // They didn't specify, so anything fits.
        insideOtherContainer = true;
      } else if (other.equals(otherContainer) || other.isDescendantOf(otherContainer)) {
        insideOtherContainer = true;
      }
      var insideOtherParent = (other.equals(otherParent) || other.isDescendantOf(otherParent));

      if ((! insideOtherParent) && (insideOtherContainer)) {
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

  trigger: function(eventName, eventData) {
    this._subclass_trigger(eventName, eventData);
  },

  getProvenance: function() {
    if (this.provenance == null) {
      if (this.parentNode == null) {
        // We're the root of a tree. This is an error: the root should always know where it
        // came from.
        Util.Log.Error("Root of tree has no provenance information");
        return null;
      } else {
        return this.parentNode.getProvenance();
      }
    } else {
      return this.provenance;
    }
  },

  setProvenance: function(tree, node) {
    this.provenance = {
      tree: tree
    }
    if (! Util._.isUndefined(node)) {
      this.provenance.node = node;
    }
  },

  _processIncoming: function(insideOtherSubtree) {
    // Do incoming nodes except graft
    var d = Util.Promise.defer();
    var self = this;
    var r = this.getRelations();

    self._processIncomingRelations(r, 'if-exist', insideOtherSubtree);
    self._processIncomingRelations(r, 'if-nexist', insideOtherSubtree);
    self._processIncomingRelations(r, 'is', insideOtherSubtree, false, true).then(function() {
      return self._processIncomingRelations(r, 'are', insideOtherSubtree, true, true)
    }).then(function() {
      return Util.Promise.all(Util._.map(self.getChildren(), function(child) {
        return child._processIncoming(insideOtherSubtree);
      }));
    }).then(function() {
      return self._processIncomingRelations(r, 'graft', insideOtherSubtree, true, true);
    }).then(function() {
      d.resolve();
    }, function(reason) {
      Util.Log.error(reason);
      d.reject(reason);
    });
    return d.promise;
  },

  _processIncomingRelations: function(relations, name, insideOtherSubtree, once, defer) {
    if (defer) {
      promises = [];
    }
    if (typeof insideOtherSubtree != 'undefined') {
      insideOtherSubtree = !!insideOtherSubtree;
    } else {
      insideOtherSubtree = false;
    }
    for (var i = 0; i < relations.length; i++) {
      if (relations[i].name == name) {
        if (relations[i].node1.equals(this)) {
          if ((! insideOtherSubtree) || 
              ((insideOtherSubtree) && (relations[i].node2.isDescendantOf(insideOtherSubtree)))) {
            if (defer) {
              var res = relations[i].execute(this);
              if (res) {
                promises.push(res);
              }
            } else {
              relations[i].execute(this);
            }
            if (once) {
              break;
            }            
          }
        }
      }
    }
    if (defer) {
      return Util.Promise.all(promises);
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

  getIfExistValue: function() {
    // The node's existence is enough by default.
    return this.value;
  },

  setValue: function(v, opts) {
    this.value = v;
  },

  hasRule: function(name) {
    for (var i = 0; i < this.relations.length; i++) {
      if (this.relations[i].name == name) {
        return true;
      }
    }
    return false;
  },

  /* Parent needs to have an ARE and we also need to be within
   * the scope.
   */
  isEnumerated: function() {
    if (this.parentNode != null) {
      var p = this.parentNode;
      for (var i = 0; i < p.relations.length; i++) {
        if (p.relations[i].name == 'are') {
          var r = p.relations[i];
          var opts = r.optsFor(p);
          var kids = p.getChildren();
          var iterables = kids.slice(opts.prefix, kids.length - opts.suffix);
          if (iterables.indexOf(this) > -1) {
            return true;
          }
        }
      }
    }
    return false;
  },

  descendantOf: function(other) {
    return false;
  },

  /***************************************************************************
   * EVENTS
   *
   * Two modes:
   *   - shouldThrowEvents
   *   - shouldReceiveEvents (and modify)
   *
   * Events are dicts. The `name` field contains the type.
   *
   * ValueChanged:
   *   newValue -- contains the new value
   *
   **************************************************************************/

  toggleThrowDataEvents: function(bool) {
    if (bool == this.shouldThrowEvents) {
      return;
    } else if (bool) {
      this.shouldThrowEvents = true;
      this._subclass_throwChangeEvents(true);
    } else {
      this.shouldThrowEvents = false;
      this._subclass_throwChangeEvents(false);
    }
  },

  _maybeThrowDataEvent: function(evt) {
    if (this.shouldThrowEvents) {
      if (evt.ctsNode) {
        evt.newValue = evt.ctsNode.getValue();
        if (evt.eventName == 'ValueChanged') {
          // Maybe squash if we're in an echo chamber.
          if (this._lastValueChangedValue == evt.newValue) {
            // An echo! Stop it here.
            Util.Log.Info("Suppressing event echo", this, evt);
            this._lastValueChangedValue = null;
            return;
          } else {
            this._lastValueChangedValue = evt.newValue;
            evt.sourceNode = this;
            evt.sourceTree = this.tree;
            this.trigger(evt.eventName, evt);
            if (this.tree && this.tree.trigger) {
              this.tree.trigger(evt.eventName, evt); // Throw it for the tree, too.
            }
          }
        }
      }
    }
  },

  toggleReceiveRelationEvents: function(bool, recursive) {
    if (bool == this.shouldReceiveEvents) {
      return;
    } else if (bool) {
      this.shouldReceiveEvents = true;
    } else {
      this.shouldReceiveEvents = true;
    }

    if (recursive) {
      for (var i = 0; i < this.getChildren().length; i++) {
        this.children[i].toggleReceiveRelationEvents(bool, recursive);
      }
    }
  },

  handleEventFromRelation: function(evt, fromRelation, fromNode) {
    var self = this;
    if (this.shouldReceiveEvents) {
      if (evt.eventName == "ValueChanged") {
        if (fromRelation.name == "is") {
          this.setValue(evt.newValue);
        }
      } else if (evt.eventName == "ChildInserted") {
        var otherContainer = evt.sourceNode;
        var otherItem = evt.ctsNode;
        // If the from relation is ARE...
        if (fromRelation.name == "are") {
          // XXX: Make diff instead of redo! For efficiency!
          // Clone one.
          var afterIndex = evt.afterIndex;
          var myIterables = fromRelation._getIterables(this);
          // TODO YAY!
          myIterables[afterIndex].clone().then(
            function(clone) {
              // This will force realization of inline specs.
              clone.parseInlineRelationSpecsRecursive().then(
                function() {
                  self.tree.forrest.realizeRelations(myIterables[afterIndex], clone);
                  clone.pruneRelations(otherItem, otherContainer);
                  clone._processIncoming().then(
                    function() {
                      window.hooga = clone; // xxx
                      self.insertChild(clone, afterIndex, false);
                    },
                    function(reason) {
                      Util.Log.Error(reason);
                    }
                  ).done();
                }
              )
            },
            function(reason) {
              Util.Log.Error(reason);
            }
          );
        }
      }
    }
  },

  /***************************************************************************
   * STUBS FOR SUBCLASS
   **************************************************************************/

  _subclass_onDataEvent: function() {},
  _subclass_offDataEvent: function() {},
  _subclass_realizeChildren: function() {},
  _subclass_insertChild: function(child, afterIndex) {},
  _subclass_destroy: function() {},
  _subclass_beginClone: function() {},
  _subclass_getInlineRelationSpecString: function() { return null; },
//  _subclass_trigger: function(eventName, eventData) { },
  _subclass_ensure_childless: function() { },
};

module.exports = Node;

}, {"cts/util":2,"cts/parser":22}],
21: [function(require, module, exports) {
/**
 * A Relation is a connection between two tree nodes.
 * Relations are the actual arcs between nodes.
 * Rules are the language which specify relations.
 */

var NonexistentNode = require('./nonexistent-node');
var Util = require('cts/util');

var Relation = {};

Relation.Base = {

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

  truthyOrFalsy: function(node) {
    if ((node == NonexistentNode) || (node == null) || Util._.isUndefined(node)) {
      return false;
    }
    var val = node.getIfExistValue();
    return Util.Helper.truthyOrFalsy(val);
  },

  forCreationOnly: function(val) {
    if (typeof val == 'undefined') {
      return this.spec.forCreationOnly;
    } else if (val) {
      this.spec.forCreationOnly = true;
      return true;
    } else {
      this.spec.forCreationOnly = false;
      return false;
    }
  },

  handleEventFromNode: function(evt) {
    if (this.spec.forCreationOnly) {
      // Otherwise modifications to the input elements of the
      // form will set the entire collection that this is creation-mapped
      // to!
      return;
    }
    // Shoule we throw it?
    var shouldPass = false;
    if (evt.eventName == 'ChildInserted' && this.name == 'are') {
      shouldPass = true;
    } else if ((evt.eventName == 'ValueChanged') && (this.name == 'is')) {
      shouldPass = true;
    }
    if (shouldPass) {
      // Pass it on over.
      evt.viaRelation = this;
      if (evt.sourceNode == this.node1) {
        this.node2.handleEventFromRelation(evt, this, this.node1);
      } else {
        this.node1.handleEventFromRelation(evt, this, this.node2);
      }
    }
    if ((evt.eventName == 'ValueChanged') &&
        ((this.name == 'if-exist') || (this.name == 'if-nexist'))) {
      // Recompute!
      this.execute(this.node1);
    }
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
    this.node1 = null;
    this.node2 = null;
    this.name = null;
    this.spec = null;
    this.destroyed = true;
  },

  optsFor: function(node) {
    var toRet = {};
    Util._.extend(toRet, this.defaultOpts);
    if (this.node1 === node) {
      if (this.spec && this.spec.selectionSpec1) {
        Util._.extend(toRet, this.spec.selectionSpec1.props);
      }
    } else if (this.node2 == node) {
      if (this.spec && this.spec.selectionSpec1) {
        Util._.extend(toRet, this.spec.selectionSpec2.props);
      }
    }
    return toRet;
  },

  clone: function(from, to) {
    if (typeof from == 'undefined') {
      from = this.node1;
    }
    if (typeof to == 'undefined') {
      to = this.node2;
    }
    return new Relation.Base(from, to, this.spec.clone());
  },

  equals: function(other) {
    return (
      (this.node1 == other.node1) &&
      (this.node2 == other.node2) &&
      (this.name == other.name)
    );
  },

  signature: function() {
    return "<" + this.name + " " + Util._.map(this.opts, function(v, k) { return k + ":" + v}).join(";") + ">";
  },

  _getIterables: function(node) {
    var opts = this.optsFor(node);
    var kids = node.getChildren();
    var prefix = 0;
    var suffix = 0;
    if (opts.prefix) {
      prefix = opts.prefix;
    }
    if (opts.suffix) {
      suffix = opts.suffix;
    }
    var iterables = kids.slice(prefix, kids.length - suffix);
    if (opts.item) {
      if (Util._.isUndefined(parseInt(opts.item))) {
        if (opts.item.toLowerCase() == 'random') {
          var item = iterables[Math.floor(Math.random()*iterables.length)];
          iterables = [item];
        }
      } else {
        // We're one-indexed
        var index = parseInt(opts.item)
        iterables = iterables.slice(index, 1);
      }
    }
    if (opts.limit) {
      iterables = iterables.slice(0, limit);
    }
    return iterables;
  }
};

module.exports = Relation;

}, {"./nonexistent-node":23,"cts/util":2}],
19: [function(require, module, exports) {
/**
 * A Relation is a connection between two tree nodes.
 * Relations are the actual arcs between nodes.
 * Rules are the language which specify relations.
 */

var Util = require('cts/util');

var Selection = function(nodes, opts) {
  this.nodes = nodes;
  this.opts = {};
  if (typeof opts != 'undefined') {
    this.opts = Util._.extend(this.opts, opts);
  }
};

Util._.extend(Selection.prototype, {
  contains: function(node) {
    return Util._.contains(this.nodes, node);
  },

  clone: function() {
    // not a deep clone of the selection. we don't want duplicate nodes
    // running around.
    return new Selection(Util._.union([], this.nodes), this.opts);
  },

  matchesArray: function(arr, exactly, orArrayAncestor) {
    if (typeof backoffToAncestor == 'undefined') {
      backoffToAncestor = false;
    }

    for (var i = 0; i < this.nodes.length; i++) {
      if (! Util._.contains(arr, this.nodes[i])) {
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

module.exports = Selection;

}, {"cts/util":2}],
20: [function(require, module, exports) {

var Tree = {
  Base: {
    render: function(opts) {
      this.root.render(opts);
    },

    nodesForSelectionSpec: function(spec) {
      if (spec.inline) {
        return [spec.inlineObject];
      } else {
        var results = this.root.find(spec.selectorString);
        return results;
      }
    },

    toggleReceiveRelationEvents: function(toggle) {
      this.root.toggleReceiveRelationEvents(toggle, true);
    }
  }
};

module.exports = Tree;
}, {}],
14: [function(require, module, exports) {
var Util = require('cts/util');
var Is = require('./is.js');
var Are = require('./are.js');
var Graft = require('./graft.js');
var IfExist = require('./ifexist.js');
var IfNexist = require('./ifnexist.js');

var Factory = {
  CreateFromSpec: function(node1, node2, spec) {
    if (spec.name == 'is') {
      return new Is(node1, node2, spec);
    } else if (spec.name == 'are') {
      return new Are(node1, node2, spec);
    } else if (spec.name == 'graft') {
      return new Graft(node1, node2, spec);
    } else if (spec.name == 'if-exist') {
      return new IfExist(node1, node2, spec);
    } else if (spec.name == 'if-nexist') {
      return new IfNexist(node1, node2, spec);
    } else {
      Util.Log.Fatal("Unsure what kind of relation this is:", spec.name);
      return null;
    }
  }
};

module.exports = {
  Is:       Is,
  Are:      Are,
  Graft:    Graft,
  IfExist:  IfExist,
  IfNexist: IfNexist,
  Factory:  Factory
};
}, {"cts/util":2,"./is.js":32,"./are.js":33,"./graft.js":34,"./ifexist.js":35,"./ifnexist.js":36}],
32: [function(require, module, exports) {
/*
 * IS
 * ==
 *
 * Intended as a Mix-In to Relation.
 */

var Util = require('cts/util');
var Model = require('cts/model');

var Is = function(node1, node2, spec) {
  if (typeof spec == 'undefined') {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
  this.name = 'is';
  this.initializeBase();
};

Util._.extend(Is.prototype, Model.Relation.Base, {

  execute: function(toward) {
    // CTS.Fn.map(this.node1.relations, function(r) {console.log(r.node2.ctsId, r.spec.forCreationOnly, r.node2.value.val(), r.node2.value[0])})
    if (this.spec.forCreationOnly) {
      console.log("CREATION ONLY!");
      return;
    }

    var from = this.opposite(toward);
    var content = from.getValue(this.optsFor(from));
    var res = toward.setValue(content, this.optsFor(toward));
    toward.setProvenance(from.tree, from);
    return res;
  },

  clone: function(n1, n2) {
    if (Util._.isUndefined(n1)) {
      n1 = this.node1;
    }
    if (Util._.isUndefined(n2)) {
      n2 = this.node2;
    }
    return new Is(n1, n2, this.spec);
  }

});

module.exports = Is;

}, {"cts/util":2,"cts/model":13}],
33: [function(require, module, exports) {
/*
 * ARE
 * ===
 *
 * Intended as a Mix-In to Relation.
 */

var Model = require('cts/model');
var Util = require('cts/util');

var Are = function(node1, node2, spec) {
  if (typeof spec == 'undefined') {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
  this.initializeBase();
  this.name = 'are';
};

Util._.extend(Are.prototype, Model.Relation.Base, {
  getDefaultOpts: function() {
    return {
      prefix: 0,
      suffix: 0,
      step: 0
    };
  },

  execute: function(toward) {
    var forCreationOnly = this.spec.forCreationOnly;
    if (forCreationOnly) {
      return Util.Promise.resolve();
    }

    return this._Are_AlignCardinalities(toward);
//    toward.trigger('received-are', {
//      target: toward,
//      source: this.opposite(toward),
//      relation: this
//    });
  },

  clone: function(n1, n2) {
    if (Util._.isUndefined(n1)) {
      n1 = this.node1;
    }
    if (Util._.isUndefined(n2)) {
      n2 = this.node2;
    }
    return new Are(n1, n2, this.spec);
  },

  _Are_AlignCardinalities: function(toward) {
    var myOpts = this.optsFor(toward);
    var other = this.opposite(toward);
    var otherIterables = this._getIterables(other);
    var myIterables = this._getIterables(toward);
    var d = Util.Promise.defer();
    if (myIterables.length > 0) {
      while (myIterables.length > 1) {
        var bye = myIterables.pop();
        bye.destroy();
      }

      if (Util.LogLevel.Debug()) {
        Util.Log.Debug("After prune to 1");
      }

      // Now build it back up.
      if (otherIterables.length == 0) {
        myIterables[0].destroy();
        d.resolve();
      } else if (otherIterables.length == 1) {
        d.resolve();
      } else {
        var lastIndex = myOpts.prefix;
        // WARNING: Note that i starts at 1
        var promises = [];
        for (var i = 1; i < otherIterables.length; i++) {
          // Clone the iterable.
          promises.push(myIterables[0].clone());
        }
        Util.Promise.all(promises).then(
          function(clones) {
            myIterables[0].pruneRelations(otherIterables[0], other);
            for (var i = 0; i < clones.length; i++) {
              var clone = clones[i];
              toward.insertChild(clone, lastIndex, false);
              // the ith clone here is the i+1th element! (because 0th is the clone origin)
              clone.pruneRelations(otherIterables[i+1], other);
              lastIndex++;
            }
            if (Util.LogLevel.Debug()) {
              Util.Log.Debug("After Align");
            }
            d.resolve();
          },
          function(reason) {
            d.reject(reason);
          }
        );
      }
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

module.exports = Are;

}, {"cts/model":13,"cts/util":2}],
34: [function(require, module, exports) {
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

var Util = require('cts/util');
var Model = require('cts/model');

var Graft = function(node1, node2, spec) {
  if (Util._.isUndefined(spec)) {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
  this.name = 'graft';
  this.initializeBase();
};

Util._.extend(Graft.prototype, Model.Relation.Base, {
  execute: function(toward) {
    if (this.spec.forCreationOnly) {
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
    var d = Util.Promise.defer();
    var createOn = null;
    var self = this;
    if (typeof towardOpts.createOn != 'undefined') {
      createOn = toward.find(towardOpts.createOn);
    } else {
      createOn = toward.find('button');
    }
    Util.Log.Info("Creating on", createOn);
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
    // Step 1: Assume iterable on FROM side.
    var iterables = this._getIterables(from);
    var self = this;

    if ((typeof CTS != 'undefined') && (typeof CTS.engine != 'undefined') && (typeof CTS.engine.ui != 'undefined')) {
      CTS.engine.ui.showSendingModal();
    }

        // // Create a new one.
    return iterables[iterables.length - 1].clone(
      function(clone) {
        var form = self.opposite(from);
        // clone.pruneRelations(form);
        // We can't prune relations here because what if there are multiple forms
        // hooked up to the same list!
        Util.Log.Info("Processing incoming on newly created item");
        // Now RUN relations
        var p = Util.Promise.defer();
        // Now turn OFF creation only.
        clone.markRelationsAsForCreation(false, true, form);
        console.log("Marking relations as for creation", form.ctsId);

        clone._processIncoming().then(
          function() {
            // Turn back ON creation only.
            clone.markRelationsAsForCreation(true, true, form);
            // Now insert! The insertion handler on an enumerated node should cause
            // any corresponding data structures to also be altered.
            from.insertChild(clone, from.children.length - 1, true);
            if ((typeof CTS != 'undefined') && (typeof CTS.engine != 'undefined') && (typeof CTS.engine.ui != 'undefined')) {
              CTS.engine.ui.hideSendingModal();
            }

            // Finally, let's reset the form elements.
            Util._.each(form.value.find('input'), function(elem) {
              var $elem = CTS.$(elem);
              if ($elem.is('[type="checkbox"]')) {
                if ($elem.attr('default')) {
                  if ($elem.attr('default').toLowerCase() == 'false') {
                    $elem.prop('checked', false);
                  } else {
                    $elem.prop('checked', !! $elem.attr('default'));
                  }
                } else {
                  $elem.prop('checked', false);
                }           
              } else {
                if ($elem.attr('default')) {
                  $elem.val($elem.attr('default'));
                } else {
                  $elem.val('');
                }                
              }
            });

            p.resolve();
          },
          function(reason) {
            console.log(reason);
            p.reject(reason);
          }
        );
        return p.promise;
      }
    );
    // // Create a new one.
    // iterables[iterables.length - 1].clone().then(
    //   function(clone) {
    //     console.log("Got cloned iterable");
    //     // Now set relations on to those coming to ME.
    //     var form = self.opposite(from);
    //     clone.pruneRelations(form);
    //             console.log("Pruned relations");

    //     // Now turn OFF creation only.
    //     clone.markRelationsAsForCreation(false, true);
    //                     console.log("Marked relations as for creation");

    //     Util.Log.Info("Processing incoming on newly created item");

    //     // Now RUN relations
    //     clone._processIncoming().then(
    //       function() {
    //         Util.Log.Tock("CTS:Graft:CreateIterable");
    //         // Turn back ON creation only.
    //         clone.markRelationsAsForCreation(true, true);
    //         // Now insert! The insertion handler on an enumerated node should cause
    //         // any corresponding data structures to also be altered.
    //         from.insertChild(clone, from.children.length - 1, true);
    //       },
    //       function(reason) {
    //         d.reject(reason);
    //       }
    //     );
    //   },
    //   function(reason) {
    //     d.reject(reason);
    //   }
    // ).done();

    // return d.promise;
  },

  _regularGraft: function(toward, opp) {
    var d = Util.Promise.defer();

    //Util.Log.Info("Graft from", opp.tree.name, "to", toward.tree.name);
    //Util.Log.Info("Opp", opp.value.html());
    // Util.Log.Info("To", toward.value.html());

    if (opp != null) {

      if (Util.LogLevel.Debug()) {
        Util.Log.Debug("GRAFT THE FOLLOWING");
        CTS.Debugging.DumpTree(opp);
        Util.Log.Debug("GRAFT ONTO THE FOLLOWING");
        CTS.Debugging.DumpTree(toward);
      }

      var replacements = [];
      var promises = [];

      for (var i = 0; i < opp.children.length; i++) {
        var kidPromise = Util.Promise.defer();
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
      Util.Promise.all(promises).then(
        function (children) {
          for (var i = 0; i < children.length; i++) {
            replacements.push(children[i]);
          }
          if (Util.LogLevel.Debug()) {
            Util._.map(replacements, function(r) {
              Util.Log.Debug("replacement", r.value.html());
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
    if (Util._.isUndefined(n1)) {
      n1 = this.node1;
    }
    if (Util._.isUndefined(n2)) {
      n2 = this.node2;
    }
    return new Graft(n1, n2, this.spec);
  }

});

module.exports = Graft;

}, {"cts/util":2,"cts/model":13}],
35: [function(require, module, exports) {
/*
 * IF-EXIST
 * ========
 *
 * Intended as a Mix-In to Relation.
 */

var Util = require('cts/util');
var Model = require('cts/model');

var IfExist = function(node1, node2, spec) {
  if (typeof spec == 'undefined') {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
  this.name = 'if-exist';
  this.initializeBase();
};

Util._.extend(IfExist.prototype, Model.Relation.Base, {

  execute: function(toward) {
    if (this.spec.forCreationOnly) {
      return;
    }

    var other = this.opposite(toward);
    if (this.truthyOrFalsy(other)) {
      toward.unhide();
    } else {
      toward.hide();
    }
  },

  clone: function(n1, n2) {
    if (Util._.isUndefined(n1)) {
      n1 = this.node1;
    }
    if (Util.isUndefined(n2)) {
      n2 = this.node2;
    }
    return new IfExist(n1, n2, this.spec);
  }
});

module.exports = IfExist;

}, {"cts/util":2,"cts/model":13}],
36: [function(require, module, exports) {
/*
 * IF-EXIST
 * ========
 *
 * Intended as a Mix-In to Relation.
 */

var Util = require('cts/util');
var Model = require('cts/model');

var IfNexist = function(node1, node2, spec) {
  if (typeof spec == 'undefined') {
    spec = {};
  }
  this.node1 = node1;
  this.node2 = node2;
  this.spec = spec;
  this.name = 'if-nexist';
  this.initializeBase();
};

Util._.extend(IfNexist.prototype, Model.Relation.Base, {

  execute: function(toward) {
    if (this.spec.forCreationOnly) {
      return;
    }
    var other = this.opposite(toward);
    if (this.truthyOrFalsy(other)) {
      toward.hide();
    } else {
      toward.unhide();
    }
  },

  clone: function(n1, n2) {
    if (Util._.isUndefined(n1)) {
      n1 = this.node1;
    }
    if (Util._.isUndefined(n2)) {
      n2 = this.node2;
    }
    return new IfNexist(n1, n2, this.spec);
  }

});

module.exports = IfNexist;

}, {"cts/util":2,"cts/model":13}],
15: [function(require, module, exports) {
exports.HtmlNode         = require('./dom-node.js').HtmlNode;
exports.HtmlInputNode    = require('./dom-node-input.js');
exports.HtmlTree         = require('./dom-tree.js');
exports.Factory          = require('./dom-factory.js');
}, {"./dom-node.js":37,"./dom-node-input.js":38,"./dom-tree.js":39,"./dom-factory.js":40}],
37: [function(require, module, exports) {
var HtmlNodeBase = require('./dom-node-base');
var HtmlInputNode = require('./dom-node-input');
var Util = require('cts/util');
var Model = require('cts/model');

function CreateHtmlNode(node, tree, opts) {
  var deferred = Util.Promise.defer();
  var klass = HtmlNode;

  if (! Util._.isUndefined(node.jquery)) {
    if (node.is('input') || node.is('select')) {
      klass = HtmlInputNode;
    }
  } else if (node instanceof Element) {
    if ((node.nodeName == 'INPUT') || (node.nodeName == 'SELECT')) {
      klass = HtmlInputNode;
    }
  }

  var node = new klass(node, tree, opts);
  node.parseInlineRelationSpecs().then(
    function() {
      if (node == null) {
        Util.Log.Error("Created NULL child");
      }
      deferred.resolve(node);
    },
    function(reason) {
      deferred.reject(reason);
    }
  );
  return deferred.promise;
};

// ### Constructor
function HtmlNode(node, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.kind = "HTML";
  this.value = Util.Helper.createJqueryNode(node);
  this.value.data('ctsnode', this);
  this.ctsId = Util._.uniqueId().toString();

  this.value.data('ctsid', this.ctsId);
  this.value.data('ctsnode', this);

  this.shouldReceiveEvents = true;
  this.shouldThrowEvents = true;

  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
Util._.extend(HtmlNode.prototype, Model.Node.Base, Util.Events, HtmlNodeBase, {

   /*
    * Precondition: this.children.length == 0
    *
    * Realizes all children.
    */
   _subclass_realizeChildren: function() {
     // promise
     var deferred = Util.Promise.defer();

     this.children = [];

     // Map each child

     var self = this;
     var promises = Util._.map(this.value.children(), function(child) {
       var promise = CreateHtmlNode(child, self.tree, self.opts);
       return promise;
     });

     Util.Promise.all(promises).then(
       function(results) {
         self.children = results;
         for (var i = 0; i < self.children.length; i++) {
           var node = self.children[i];
           if ((typeof node == "undefined") || (node == null)) {
             Util.Log.Error("Child is undefined or null!");
           }
           node.parentNode = self;
         }
         deferred.resolve();
       },
       function(reason) {
         deferred.reject(reason);
       }
     );

     return deferred.promise;
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
       Util.Log.Error("[HTML Node] Afer index shouldn't be ", afterIndex);
     }
   },

   /*
    *
    * Args:
    *   child: A jQuery node
    *
    * TODO(eob(): Implement some kind of locking here?
    */
   _onChildInserted: function(child) {
     var self = this;
     CreateHtmlNode(child, this.tree, this.opts).then(
       function(ctsChild) {
         ctsChild.parentNode = self;
         var idx = child.index();
         var l = self.children.length;
         self.children[self.children.length] = null;
         // TODO: need locking on kids
         for (var i = self.children.length - 1; i >= idx; i--) {
           if (i == idx) {
             self.children[i] = ctsChild;
           } else {
             self.children[i] = self.children[i - 1];
           }
         }
         // XXX TODO: This is a hack case that happens when CTS indexing and DOM indexing get out of sync
         // because of cts-ignore nodes. Need to figure out how to fix.
         if ((self.children[self.children.length - 1] == null) && (idx >= self.children.length)) {
           self.children[self.children.length - 1] = ctsChild;
         }

         ctsChild.realizeChildren().then(
           function() {
             //  Now run any rules.
             Util.Log.Info("Running CTS Rules on new node");
             ctsChild._processIncoming().done();
           },
           function(reason) {
             Util.Log.Error("Could not realize children of new CTS node", ctsChild);
           }
         ).done();
       },
       function(reason) {
         Util.Log.Error("Could not convert new node to CTS node", child, reason);
       }
     ).done();
   },

   _subclass_beginClone: function($node) {
     return this._subclass_beginClone_base($node, HtmlNode);
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    if (Util._.isUndefined(opts) || Util._.isUndefined(opts.attribute)) {
      return this.value.html();
    } else {
      return this.value.attr(opts.attribute);
    }
  },

  setValue: function(value, opts) {
    var v = value;
    if (opts && opts.prefix) {
      v = opts.prefix + v;
    }
    if (opts && opts.suffix) {
      v = v + opts.suffix;
    }
    if (Util._.isUndefined(opts) || Util._.isUndefined(opts.attribute)) {
      this.value.html("" + v);
    } else {
      if (opts.attribute != null) {
        this.value.attr(opts.attribute, v);
      }
    }
  },

  _subclass_unrealize: function() {
    this.value.data('ctsnode', null);
  },

  /************************************************************************
   **
   ** Events
   **
   ************************************************************************/

  /* Toggles whether this node will throw events when its data change. If so,
   * the event will be thrown by calling Node (superclass)'s
   * _throwEvent(name, data)
   */
  _subclass_throwChangeEvents: function(toggle, subtree) {
    if (typeof this._valueChangedListenerProxy == 'undefined') {
      this._valueChangedListenerProxy = Util.$.proxy(this._subclass_valueChangedListener, this);
    }

    var existing = (this._subclass_proxy_handleDomChange != null);
    // GET
    if (typeof toggle == 'undefined') {
      return existing;
    }
    // SET NO-OP
    if (toggle == existing) {
      return toggle;
    }

    var self = this;
    if (toggle) {
      // SET ON
      // This funny way of implementing is to save the "this" pointer.
      this._subclass_proxy_handleDomChange = function(e) {
        self._subclass_handleDomChangeEvent(e);
      }
      this._changeObserver = new MutationObserver(this._subclass_proxy_handleDomChange);
      var opts = {

      };
      this._changeObserver.observe(this.value[0], {
        attribute: true,
        characterData: true,
        childList: true,
        subtree: true
      });
    } else {
      // SET OFF
      this._changeObserver.disconnect();
      this._changeObserver = null;
      this._subclass_proxy_handleDomChange = null;
    }
  },

  click: function(fn) {
    this.value.on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      fn();
    });
  },

  _subclass_handleDomChangeEvent: function(mrs) {
    Util.Log.Info("Change Occured", this, mrs);
    for (var j = 0; j < mrs.length; j++) {
      var mr = mrs[j];

      // Destroy the CTS accounting for any nodes that were removed.
      for (var i = 0; i < mr.removedNodes.length; i++) {
        var $removedNode = Util.$(mr.removedNodes[i]);
        var $$rn = $removedNode.data('ctsNode');
        if ($$rn) {
            $$rn.destroy(false);
        }
      }

      for (var i = 0; i < mr.addedNodes.length; i++) {
        var $addedNode = Util.$(mr.addedNodes[i]);
        this._maybeThrowDataEvent({
          eventName: "ValueChanged",
          node: $addedNode,
          ctsNode: $addedNode.data('ctsnode')
        });
      }

      if (mr.type == "characterData") {
        var textNode = mr.target;
        var $changedNode = Util.$(textNode.parentElement);
        this._maybeThrowDataEvent({
          eventName: "ValueChanged",
          node: $changedNode,
          ctsNode: $changedNode.data('ctsnode')
        });
      }
    }

  }

});

module.exports = {
  HtmlNode: HtmlNode,
  CreateHtmlNode: CreateHtmlNode
};
}, {"./dom-node-base":41,"./dom-node-input":38,"cts/util":2,"cts/model":13}],
41: [function(require, module, exports) {
var Util = require('cts/util');
var Parser = require('cts/parser');

var HtmlNodeBase = {
  debugName: function() {
    return Util._.map(this.siblings, function(node) {
      return node[0].nodeName; }
    ).join(', ');
  },

  stash: function() {
    this.value.attr('data-ctsid', this.ctsId);
    this.tree.nodeStash[this.ctsId] = this;
  },

  _subclass_shouldRunCtsOnInsertion: function() {
    if (! this.value) return false;
    if (this.value.hasClass('cts-ignore')) return false;
  },

  _subclass_getTreesheetLinks: function() {
    return Util.Helper.getTreesheetLinks(this.value);
  },

  // Horrendously inefficient.
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    if (this.value.is(selector)) {
      if (typeof ret == 'undefined') {
        Util.Log.Error("push");
      }
      ret.push(this);
    }
    for (var i = 0; i < this.children.length; i++) {
      if (this.children[i] == null) {
        Util.Log.Error("Error: Child " + i + " of me is null (find:" + selector + ")", this);
      } else {
        if (typeof this.children[i] == 'undefined') {
          Util.Log.Error("Undefined child");
        }
        this.children[i].find(selector, ret);
      }
    }
    return ret;
  },

  _subclass_beginClone_base: function($node, klass) {
    var d = Util.Promise.defer();
    var $value = null;
    if (typeof $node == "undefined") {
      $value = this.value.clone();
    } else {
      $value = $node;
    }

    // Remove any inline CTS annotations, since we're going to
    // manually copy in relations.
    $value.attr('data-cts', null);
    $value.find("*").attr('data-cts', null);

    // NOTE: beginClone is allowed to directly create a Node
    // without going through the factory because we already can be
    // sure that all this node's trees have been realized
    var clone = new klass($value, this.tree, this.opts);
    var cloneKids = clone.value.children();

    if (this.children.length != cloneKids.length) {
      Util.Log.Error("Trying to clone CTS node that is out of sync with dom");
    }
    // We use THIS to set i
    var kidPromises = [];
    for (var i = 0; i < cloneKids.length; i++) {
      var $child = Util.$(cloneKids[i]);
      kidPromises.push(this.children[i]._subclass_beginClone($child));
    }

    if (kidPromises.length == 0) {
      d.resolve(clone);
    } else {
      Util.Promise.all(kidPromises).then(
        function(kids) {
          for (var i = 0; i < kids.length; i++) {
            kids[i].parentNode = clone;
            clone.children.push(kids[i]);
          }
          d.resolve(clone);
        },
        function(reason) {
          d.reject(reason);
        }
      );
    }
    return d.promise;
  },


  /*
   *  Removes this DOM node from the DOM tree it is in.
   */
  _subclass_destroy: function() {
    this.value.remove();
  },

  _fixSpreadSheetRef: function(ref) {
    var match;
    if (match = this._rSheetRef.exec(ref)) {
      return ref;
    } else {
      return "sheet | " + ref;
    }
  },

  _rewriteQuiltVariant: function(attr, s) {
    var spec = Parser.parseSheetSelector(s);
    if (! spec.tree) {
      s = 'sheet | ' + s;
    }

    if (attr == 'connect') {
      // ARE
      if (((spec.projection == 'Rows') && (! spec.row)) ||
          ((spec.projection == 'Cols') && (! spec.col))) {
        if (this.value.is("form")) {
            return "this :graft " + s + ' {"createNew": "true"};';
          } else {
            return "this :are " + s + ";";
          }
      } else if (this.value.closest('form').length > 0) {
        return s + " :is this;";
      } else {
        return "this :is " + s + ';';
      }
    } else if (attr == 'show-if') {
      return "this :if-exist " + s + ';';
    } else if (attr == 'hide-if') {
      return "this :if-nexist " + s + ';';
    }
  },

  _subclass_getInlineRelationSpecString: function() {
    if (this.value !== null) {
      var inline;
      if (inline = this.value.attr('data-cts')) {
        return inline;
      } else if (inline = this.value.attr('connect')) {
        return this._rewriteQuiltVariant('connect', inline);
      } else if (inline = this.value.attr('show-if')) {
        return this._rewriteQuiltVariant('show-if', inline);
      } else if (inline = this.value.attr('hide-if')) {
        return this._rewriteQuiltVariant('hide-if', inline);
      }
    }
    return null;
  },

  hide: function() {
    this.value.hide();
  },

  unhide: function() {
    this.value.show();
  },

  _subclass_ensure_childless: function() {
    if (this.value !== null) {
      this.value.html("");
    }
  }
};

module.exports = HtmlNodeBase;

}, {"cts/util":2,"cts/parser":22}],
38: [function(require, module, exports) {
var HtmlNodeBase = require('./dom-node-base');
var Util = require('cts/util');
var Model = require('cts/model');

// ### Constructor
var HtmlInputNode = function(node, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.kind = "HTMLInput";
  this.value = Util.Helper.createJqueryNode(node);
  this.value.data('ctsnode', this);
  this.ctsId = Util._.uniqueId().toString();
  this.value.data('ctsid', this.ctsId);
  this.value.data('ctsnode', this);

  this.subKind = "text";
  if (this.value.is('[type="checkbox"]')) {
    this.subKind = "checkbox";
  } else if (this.value.is('select')) {
    this.subKind = "select";
  }

  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });

  this.toggleThrowDataEvents(true);
  this.shouldReceiveEvents = true;
};

// ### Instance Methods
Util._.extend(HtmlInputNode.prototype, Model.Node.Base, Util.Events, HtmlNodeBase, {

   /*
    * Precondition: this.children.length == 0
    *
    * Realizes all children.
    */
   _subclass_realizeChildren: function() {
     // An INPUT node shouldn't have children.
     this.children = [];
     return Util.Promise.resolve(this.children);
   },

   _subclass_insertChild: function(child, afterIndex) {
     Util.Log.Error("[HTML Input] Can't insert child!", this, child);
   },

   _onChildInserted: function(child) {
     Util.Log.Error("[HTML Input] Node shouldn't have children", this, child);
   },

  _subclass_beginClone: function($node) {
    var d = Util.Promise.defer();
    this._subclass_beginClone_base($node, HtmlInputNode).then(
      function(clone) {
        if (clone.value.is('[type="checkbox"]')) {
          clone.setValue(false);
        }
        d.resolve(clone);
      },
      function(reason) {
        d.reject(reason);
      }
    );
    return d.promise;
  },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    if (Util._.isUndefined(opts) || Util._.isUndefined(opts.attribute)) {
      if (this.subKind == "checkbox") {
        return this.value.prop("checked");
      } else if (this.subKind == "select") {
        return this.value.val();
      } else {
        return this.value.val();
      }
    } else {
      return this.value.attr(opts.attribute);
    }
  },

  setValue: function(value, opts) {
    if (Util._.isUndefined(opts) || Util._.isUndefined(opts.attribute)) {
      if (this.subKind == "checkbox") {
        var checked = Util.Helper.truthyOrFalsy(value);
        this.value.prop('checked', checked);
      } else if (this.subKind == "select") {
        this.value.val(value);
      } else {
        this.value.val(value);
      }
    } else {
      if (opts.attribute != null) {
        this.value.attr(opts.attribute, value);
      }
    }
  },

  /************************************************************************
   **
   ** Events
   **
   ************************************************************************/

  /* Toggles whether this node will throw events when its data change. If so,
   * the event will be thrown by calling Node (superclass)'s
   * _throwEvent(name, data)
   */
  _subclass_throwChangeEvents: function(toggle, subtree) {
    var existing = (this._subclass_proxy_handleDomChange != null);
    // GET
    if (typeof toggle == 'undefined') {
      return existing;
    }
    // SET NO-OP
    if (toggle == existing) {
      return toggle;
    }

    var self = this;
    if (toggle) {
      // SET ON
      // This funny way of implementing is to save the "this" pointer.
      this._subclass_proxy_handleDomChange = function(e) {
        self._subclass_handleDomChangeEvent(e);
      }
      this.value.on('change', this._subclass_proxy_handleDomChange);
    } else {
      // SET OFF
      this._subclass_proxy_handleDomChange = null;
      this.value.off('change', this._subclass_proxy_handleDomChange);
    }
  },

  _subclass_handleDomChangeEvent: function(e) {
    this._maybeThrowDataEvent({
      eventName: "ValueChanged",
      node: this.value,
      ctsNode: this
    });
  }

});

module.exports = HtmlInputNode;

}, {"./dom-node-base":41,"cts/util":2,"cts/model":13}],
39: [function(require, module, exports) {
var Util = require('cts/util');
var Model = require('cts/model');

var HtmlTree = function(forrest, spec) {
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
  this.root = null;
  this.nodeStash = [];
  this.insertionListener = null;
};

// Instance Methods
// ----------------
Util._.extend(HtmlTree.prototype, Model.Tree.Base, Util.Events, {
  setRoot: function($$node) {
    this.root = $$node;
    this.root.setProvenance(this);
  },

  getCtsNode: function($node) {
    var ctsnode = $node.data('ctsnode');
    if ((ctsnode == null) || (typeof ctsnode == 'undefined') || (ctsnode == '')) {
      // Last resort: look for an attr
      var attr = $node.attr('data-ctsid');
      if ((attr == null) || (typeof attr == 'undefined') || (attr == '')) {
        return null;
      }
      return this.nodeStash[attr];
    } else {
      return ctsnode;
    }
  }
});

module.exports = HtmlTree;

}, {"cts/util":2,"cts/model":13}],
40: [function(require, module, exports) {
var HtmlTree = require('./dom-tree');
var HtmlNode = require('./dom-node');
var HtmlInputNode = require('./dom-node-input');

var Util = require('cts/util');

module.exports = {
  TreeWithJquery: function(node, forrest, spec) {
    var promise = Util.Promise.defer();
    var tree = new HtmlTree(forrest, spec);
    HtmlNode.CreateHtmlNode(node, tree).then(
      function(ctsNode) {
        ctsNode.realizeChildren().then(
          function() {
            tree.setRoot(ctsNode);
            if (spec.receiveEvents) {
              tree.toggleReceiveRelationEvents(true);
            }
            promise.resolve(tree);
          },
          function(reason) {
            promise.reject(reason);
          }
        );
      },
      function(reason) {
        promise.reject(reason);
      }
    );
    return promise;
  }
}




}, {"./dom-tree":39,"./dom-node":37,"./dom-node-input":38,"cts/util":2}],
16: [function(require, module, exports) {
exports.Factory    = require('./gsheet-factory.js');

}, {"./gsheet-factory.js":42}],
42: [function(require, module, exports) {
var Util = require('cts/util');
var GTree = require('./gsheet-tree');
var GSheetNode = require('./gspreadsheet-node');
var GSheetUtil = require('./gsheet-util');

var Factory = {
  GSpreadsheetTree: function(treespec, forrest) {
    var promise = Util.Promise.defer();
    // For the GSheet.
    // https://docs.google.com/spreadsheet/ccc?key=0Arj8lnBW4_tZdC1rVlAzQXFhWmFaLU1DY2RsMzVtUkE&usp=drive_web#gid=0
    if (treespec.url.indexOf('http') == 0) {
      var pat = "key=([^&]+)(&|$)";
      var match = treespec.url.match(pat);
      if (match && (match.length > 1)) {
        treespec.sskey = match[1];
      }
    } else {
      treespec.sskey = treespec.url;
    }

    Util.Log.Info("Trying to resolve GSheet Tree:", treespec.sskey);

    var buildOutTree = function() {
      var tree = new GTree(forrest, treespec);
      var ss = new GSheetNode(treespec, tree);
      var ws = false;
      if (typeof treespec.worksheet != 'undefined') {
        ws = true;
      }
      console.log("Trying to build out gsheet tree");
      ss.realizeChildren().then(
        function() {
          if (ws) {
            Util.Log.Info("Looking for worksheed named ", ws);
            var found = false;
            for (var i = 0; i < ss.children.length; i++) {
              var child = ss.children[i];
              if ((! found) && (child.name == treespec.worksheet)) {
                tree.root = child;
                found = true;
                if (treespec.receiveEvents) {
                  tree.toggleReceiveRelationEvents(true);
                }
                promise.resolve(tree);
              }
            }
            if (! found) {
              promise.reject("Couldn't find worksheet named: " + treespec.worksheet);
            }
          } else {
            tree.root = ss;
            promise.resolve(tree);
          }
        },
        function(reason) {
          console.log("couldn't realize");
          promise.reject(reason);
        }
      );
    };

    var maybeAutobind = function() {
      var d2 = Util.Promise.defer();
      if ((treespec.sskey == 'auto') && (treespec.name)) {
        GSheetUtil.autobindSheet(treespec.name).then(
          function(key) {
            console.log("Autobind: got", key);
            treespec.sskey = key;
            d2.resolve();
          },
          function(err) {
            d2.reject(err);
          }
        );
      } else {
        d2.resolve();
      }
      return d2;
    };

    if (GSheetUtil.specRequiresLogin(treespec)) {
      GSheetUtil.maybeLogin().then(
        function() {
          maybeAutobind().then(
            function() {
              buildOutTree();
            },
            function(err) {
              promise.reject(err);
            }
          );
        },
        function(reason) {
          Util.Log.Error("Couldn't Login to Google Spreadsheets", reason);
          promise.reject(reason);
        }
      );
    } else {
      console.log("GSheet don't log in");
      buildOutTree();
    }

    return promise;
  }
};

module.exports = Factory;


}, {"cts/util":2,"./gsheet-tree":43,"./gspreadsheet-node":44,"./gsheet-util":45}],
43: [function(require, module, exports) {
var Util = require('cts/util');
var Model = require('cts/model');

// Constructor
// -----------
var GSpreadsheetTree = function(forrest, spec) {
  this.forrest = forrest;
  this.spec = spec;
  this.root = null;
  this.insertionListener = null;
};

// Instance Methods
// ----------------
Util._.extend(GSpreadsheetTree.prototype, Model.Tree.Base, {
  setRoot: function(node) {
    this.root = node;
    this.root.setProvenance(this);
  },

  nodesForSelectionSpec: function(spec) {
    if (spec.inline) {
      return [spec.inlineObject];
    } else {
      // This passes in the SPEC rather than the selector.
      var results = this.root.find(spec);
      return results;
    }
  },

  listenForNodeInsertions: function(new_val) {
  },

  open: function() {
    var base = 'https://docs.google.com/spreadsheets/d/';
    var url = base + this.spec.sskey;
    window.open(url);
  }
});

module.exports = GSpreadsheetTree;

}, {"cts/util":2,"cts/model":13}],
44: [function(require, module, exports) {
var Util = require('cts/util');
var Model = require('cts/model');
var GSheetUtil = require('./gsheet-util');
var GWorksheetNode = require('./gworksheet-node');

var GSpreadsheetNode = function(spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.kind = "GSpreadsheet";
  this.value = null;
  this.ctsId = Util._.uniqueId().toString();
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
Util._.extend(GSpreadsheetNode.prototype, Model.Node.Base, Util.Events, {

  debugName: function() {
    return "GSpreadsheet";
  },

  find: function(spec, ret) {
    spec = GSheetUtil.fixSpec(spec);
    if (typeof ret == 'undefined') {
      ret = [];
    }
    var kids = this.getChildren();
    for (var i = 0; i < kids.length; i++) {
      var kid = kids[i];
      if ((! spec.sheetSpec.worksheet) || (kid.name == spec.sheetSpec.worksheet)) {
        kid.find(spec, ret);
      }
    }
    return ret;
  },

  isDescendantOf: function(other) {
    false;
  },

  _subclass_realizeChildren: function() {
     var deferred = Util.Promise.defer();
     this.children = [];
     var self = this;
     GSheetUtil.getWorksheets(this.spec.sskey).then(
       function(gdata) {
         self.gdata = gdata;
         for (var i = 0; i < gdata.length; i++) {
           var item = gdata[i];
           var child = new GWorksheetNode(item, self.tree, self.opts);
           child.parentNode = self;
           self.children.push(child);
         }
         deferred.resolve();
       },
       function(reason) {
         deferred.reject(reason);
       }
     );
     return deferred.promise;
   },

   /*
    * Inserts this DOM node after the child at the specified index.
    * It must be a new row node.
    */
   _subclass_insertChild: function(child, afterIndex) {
     // TODO: Figure out what to do.
   },

   /*
    */
   _onChildInserted: function(child) {
     // TODO: Figure out what to do.
   },

   /*
    *  Removes this Workbook from the GSheet
    */
   _subclass_destroy: function() {
   },

   _subclass_getInlineRelationSpecString: function() {
   },

   _subclass_beginClone: function(node) {
     return null;
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    return null;
  },

  setValue: function(value, opts) {
    // noop.
  },

  _subclass_ensure_childless: function() {
    // noop.
  },

  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

  _subclass_onDataEvent: function(eventName, handler) {
  },

  _subclass_offDataEvent: function(eventName, handler) {
  },

  _subclass_valueChangedListener: function(evt) {
  }

});

module.exports = GSpreadsheetNode;

}, {"cts/util":2,"cts/model":13,"./gsheet-util":45,"./gworksheet-node":46}],
45: [function(require, module, exports) {
var Util = require('cts/util');
var Parser = require('cts/parser');

var GSheetUtil = {

  fixSpec: function(spec) {
    if (typeof spec == 'string') {
      specString = spec;
      spec = new Parser.SelectionSpec('', specString);
    }

    // Now parse
    if (typeof spec.sheetSpec == 'undefined') {
      spec.sheetSpec = Parser.parseSheetSelector(spec.selectorString);
      // worksheet, projection, row, col
    }

    return spec;
  },

  /*
   * Args:
   *   feed: list (objects) | cells (table)
   *   key: spreadsheet key
   *   worksheet: worksheet name or identifier
   *   security: public | private
   *   mode: full | basic
   *   json: false | true
   *   accessToken: false | true
   *
   *  "od6" is the worksheet id for the default.
   */
  _gSheetUrl: function(feed, key, worksheet, security, mode, cell, jsonCallback, accessToken) {
    var url = "https://spreadsheets.google.com/feeds/";
    if (feed != null) {
      url = (url + feed + "/");
    }
    if (key != null) {
      if (key == 'autobind') {
        url = (url + key + "/");
      } else {
        url = (url + key + "/");        
      }
    }
    if (worksheet != null) {
      url += (worksheet + "/")
    }
    url += security + "/" + mode;
    if (cell != null) {
      url += ('/' + cell)
    }
    if (jsonCallback) {
      url += "?alt=json-in-script&callback=CALLBACK";
    }
    return url;
  },

  specRequiresLogin: function(spec) {
    if ((spec.opts.read && (spec.opts.read != 'public')) ||
        (spec.opts.write && (spec.opts.write != 'public'))) {
      Util.Log.Info('GSheet Spec requires login', spec);
      return true;
    } else {
      if (spec.sskey == 'auto') {
        Util.Log.Info('GSheet Spec requires login because of autobind', spec);
        return true;
      } else {
        Util.Log.Info('GSheet Spec does not require login', spec);
        return false;        
      }
    }
  },

  cellAddressRegex: /^([A-Z]+)([0-9]+)$/,

  getCellAddressParts: function(s) {
    var matched = s.trim().match(GSheetUtil.cellAddressRegex);
    if ((! matched) || (matched.length < 3)) {
      return null;
    }
    return [matched[1], matched[2]];
  },

  maybeLogin: function() {
    if (this._currentToken == null) {
      return CTS.engine.server.login();
    } else {
      return CTS.engine.server._loginDeferred.promise;
    }
  },

  createSpreadsheet: function(title) {
    var url = "https://www.googleapis.com/drive/v2/files";
    var promise = Util.Promise.defer;
    var boundary = '-------314159265358979323846';
    var delimiter = "\r\n--" + boundary + "\r\n";
    var close_delim = "\r\n--" + boundary + "--";
    var contentType = 'application/vnd.google-apps.spreadsheet';
    var metadata = {
      'title': title,
      'mimeType': contentType
    };
    var csvBody = '';
    var base64Data = btoa(csvBody);
    var multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + contentType + '\r\n' +
      'Content-Transfer-Encoding: base64\r\n' +
      '\r\n' +
      base64Data +
      close_delim;

    var request = gapi.client.request({
      'path': '/upload/drive/v2/files',
      'method': 'POST',
      'params': {'uploadType': 'multipart'},
      'headers': {
        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
      },
      'body': multipartRequestBody});
    request.execute(function(resp) {
      if (typeof resp.error != 'undefined') {
        Util.Log.Error('create error', resp.error);
        promise.reject(resp.error);
      } else {
        promise.resolve(resp);
      }
    });
    return promise;
  },

  makeProxyUrl: function(url) {
    return 'api/gdoc/' + url;
  },

  autobindSheet: function(label) {
    var promise = Util.Promise.defer();
    var request = CTS.engine.server.request('api/app/autobind', {
      dataType: 'json',
      type: 'POST',
      data: {
        label: label
      }
    });
    request.done(function(json) {
      if (json.error) {
        promise.reject(deferred.error);
      } else {
        promise.resolve(json.key);
      }
    });
    request.fail(function(jqxhr, textstatus) {
      promise.reject(textstatus);
    });
    return promise;
  },

  getSpreadsheets: function() {
    var promise = Util.Promise.defer();
    var url = GSheetUtil._gSheetUrl(
        'spreadsheets', null, null, GSheetUtil.getSecurityLevel(), 'full', null, true, true);
    var request = CTS.engine.server.request('api/app/gsheet', {
      dataType: "json",
      type: 'POST',
      data: {
        verb: 'GET',
        url: url
      }
    });

    request.done(function(json) {
      var ret = [];
      for (var i = 0; i < json.feed.entry.length; i++) {
        var sheet = json.feed.entry[i];
        var title = GSheetUtil._parseGItem(sheet.title);
        var id = GSheetUtil._parseGItem(sheet.id);
        var spec = {
          title: title,
          id: id
        };
        var parts = spec.id.split('/');
        spec['key'] = parts[parts.length - 1];
        ret.push(spec);
      }
      promise.resolve(ret);
    });
    request.fail(function(jqxhr, textStatus) {
      promise.reject(textStatus);
    });

    return promise;
  },

  getWorksheets: function(key) {
    var promise = Util.Promise.defer();
    var url = GSheetUtil._gSheetUrl('worksheets', key, null, GSheetUtil.getSecurityLevel(), 'full', null, true, true);
    var request = CTS.engine.server.request('api/app/gsheet', {
      dataType: "json",
      type: 'POST',
      data: {
        verb: 'GET',
        url: url
      }
    });

    request.done(function(json) {
      var ret = [];
      if (json.feed && json.feed.entry) {
        for (var i = 0; i < json.feed.entry.length; i++) {
          var worksheet = json.feed.entry[i];
          var spec = {
            kind: 'worksheet',
            title: GSheetUtil._parseGItem(worksheet.title),
            id: GSheetUtil._parseGItem(worksheet.id),
            colCount: parseInt(GSheetUtil._parseGItem(worksheet['gs$colCount'])),
            rowCount: parseInt(GSheetUtil._parseGItem(worksheet['gs$rowCount'])),
            updated: GSheetUtil._parseGItem(worksheet.updated)
          };
          var parts = spec.id.split('/');
          spec['wskey'] = parts[parts.length - 1];
          spec['sskey'] = key;
          ret.push(spec);
        }
      }
      promise.resolve(ret);
    });

    request.fail(function(jqxhr, textStatus) {
      promise.reject([jqxhr, textStatus]);
    });

    return promise;
  },

  _parseGItem: function(item) {
    return item['$t'];
  },

  _getItemData: function(entry) {
    var data = {};
    for (var key in entry) {
      if ((key.length > 4) && (key.substring(0,4) == 'gsx$')) {
        var k = key.substring(4);
        data[k] = GSheetUtil._parseGItem(entry[key]);
      }
    }
    return data;
  },

  _getItemSpec: function(entry, sskey, wskey) {
    var itemSpec = {
      title: GSheetUtil._parseGItem(entry.title),
      id: GSheetUtil._parseGItem(entry.id),
      data: GSheetUtil._getItemData(entry),
      editLink: entry.link[1].href,
      json: entry
    };
    if (sskey) {
      itemSpec.sskey = sskey;
    }
    if (wskey) {
      itemSpec.wskey = wskey;
    }

    // Fix the edit link to remove the trailing version, which appears to be
    // causing problems.
    if (itemSpec.editLink.indexOf(itemSpec.id) != -1) {
      itemSpec.editLink = itemSpec.id;
    }
    return itemSpec;
  },

  getListFeed: function(spreadsheetKey, worksheetKey) {
    var promise = Util.Promise.defer();
    var url = GSheetUtil._gSheetUrl('list', spreadsheetKey, worksheetKey, GSheetUtil.getSecurityLevel(), 'full', null, true, true);
    var request = CTS.engine.server.request('api/app/gsheet', {
      dataType: "json",
      type: 'POST',
      data: {
        verb: 'GET',
        url: url
      }
    });

    request.done(function(json) {
      if (typeof json == 'string') {
        json = JSON.parse(json);
      }
      var spec = {};
      spec.title = GSheetUtil._parseGItem(json.feed.title);
      spec.updated = GSheetUtil._parseGItem(json.feed.updated);
      spec.id = GSheetUtil._parseGItem(json.feed.id);
      spec.items = [];
      if (typeof json.feed.entry != 'undefined') {
        for (var i = 0; i < json.feed.entry.length; i++) {
          var itemSpec = GSheetUtil._getItemSpec(json.feed.entry[i]);
          spec.items.push(itemSpec);
        }
      }
      promise.resolve(spec);
    });

    request.fail(function(jqxhr, textStatus) {
      Util.Log.Error(jqxhr, textStatus);
      promise.reject(textStatus);
    });

    return promise;
  },

  getCellFeed: function(spreadsheetKey, worksheetKey) {
    var promise = Util.Promise.defer();
    var url = GSheetUtil._gSheetUrl('cells', spreadsheetKey, worksheetKey, GSheetUtil.getSecurityLevel(), 'full', null, true, true);
    var request = CTS.engine.server.request('api/app/gsheet', {
      dataType: "json",
      type: 'POST',
      data: {
        verb: 'GET',
        url: url
      }
    });

    request.done(function(json) {
      if (typeof json == 'string') {
        json = JSON.parse(json);
      }
      var spec = {};
      spec.title = GSheetUtil._parseGItem(json.feed.title);
      spec.updated = GSheetUtil._parseGItem(json.feed.updated);
      spec.id = GSheetUtil._parseGItem(json.feed.id);
      spec.rows = {};

      if (json.feed.entry) {
        for (var i = 0; i < json.feed.entry.length; i++) {
          var cell = GSheetUtil._parseGItem(json.feed.entry[i].title);
          var content = GSheetUtil._parseGItem(json.feed.entry[i].content);
          var letterIdx = 0;
          // This might be a formula!
          var inputValue = json.feed.entry[i]['gs$cell'].inputValue;
          while (isNaN(parseInt(cell[letterIdx]))) {
            letterIdx++;
          }
          var row = cell.slice(0, letterIdx);
          var col = parseInt(cell.slice(letterIdx));
          var colNum = parseInt(json.feed.entry[i]['gs$cell']['col'])

          if (typeof spec.rows[row] == "undefined") {
            spec.rows[row] = {};
          }
          spec.rows[row][col] = {
            content: content,
            colNum: colNum,
            inputValue: inputValue,
            isComputed: (inputValue != content)
          };
        }
      }
      promise.resolve(spec);
    });

    request.fail(function(jqxhr, textStatus) {
      Util.Log.Error(jqxhr, textStatus);
      promise.reject(textStatus);
    });

    return promise;
  },

  getCell: function(spreadsheetKey, worksheetKey, row, col) {
    var promise = Util.Promise.defer();
    var url = GSheetUtil._gSheetUrl('cells', spreadsheetKey, worksheetKey, GSheetUtil.getSecurityLevel(), 'full', null, true, true);
    url = url + '&min-row=' + row + '&max-row=' + row + '&min-col=' + col + '&max-col=' + col;
    var request = CTS.engine.server.request('api/app/gsheet', {
      dataType: "json",
      type: 'POST',
      data: {
        verb: 'GET',
        url: url
      }
    });

    request.done(function(json) {
      if (typeof json == 'string') {
        json = JSON.parse(json);
      }
      if ((typeof json.feed.entry != 'undefined') && (json.feed.entry.length == 1)) {
        promise.resolve(GSheetUtil._parseGItem(json.feed.entry[0].content));
      } else {
        promise.reject("Cell entry didn't return");
      }
    });
    request.fail(function(jqxhr, textStatus) {
      Util.Log.Error(jqxhr, textStatus);
      promise.reject(textStatus);
    });

    return promise;
  },

  modifyCell: function(ssKey, wsKey, rowNum, colNum, value) {
    var promise = Util.Promise.defer();

    var cell = 'R' + rowNum + 'C' + colNum;
    var url = GSheetUtil._gSheetUrl('cells', ssKey, wsKey, GSheetUtil.getSecurityLevel(), 'full', cell, false, true);
    url = url + '?alt=json';
    var cellurl = "https://spreadsheets.google.com/feeds/cells/" +
      ssKey + "/" + wsKey + "/" + GSheetUtil.getSecurityLevel() + "/full/" + cell;

    var xmlBody = "<?xml version='1.0' ?>";
    xmlBody += '<entry xmlns="http://www.w3.org/2005/Atom"';
    xmlBody += ' xmlns:gs="http://schemas.google.com/spreadsheets/2006">\n';
    xmlBody += '\t<id>' + cellurl + '</id>\n';
    xmlBody += '\t<link rel="edit" type="application/atom+xml" ';
    xmlBody += 'href="' + cellurl + '" />\n';
    xmlBody += '\t<gs:cell row="' + rowNum + '" col="' + colNum + '" ';
    xmlBody += 'inputValue="' + value + '"/>\n</entry>';

    var request = CTS.engine.server.request('api/app/gsheet', {
      type: 'POST',
      dataType: "json",
      // headers: {
      //   'GData-Version': '3.0',
      //   'If-Match': '*'
      // },
      data: {
        verb: 'PUT',
        contentType: 'application/atom+xml',
        ifMatch: '*',
        url: url,
        body: xmlBody
      }
    });

    request.done(function(json) {
      if (typeof json == 'string') {
        json = JSON.parse(json);
      }
      promise.resolve();
    });
    request.fail(function(jqxhr, textStatus) {
      Util.Log.Error(jqxhr, textStatus);
      promise.reject(textStatus);
    });

    return promise;
  },

  modifyListItem: function(ssKey, wsKey, itemNode) {
    console.log("Modify List Item");
    var promise = Util.Promise.defer();
    var url = itemNode.spec.editLink + '?alt=json';

    var xmlBody = "<?xml version='1.0' ?>";
    xmlBody += '<entry xmlns="http://www.w3.org/2005/Atom"';
    xmlBody += ' xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">\n';
    xmlBody += '\t<link rel="edit" type="application/atom+xml" ';
    xmlBody += 'href="' + itemNode.spec.editLink + '" />\n';
    xmlBody += '\t<id>' + itemNode.getItemId() + '</id>\n';
    for (var i = 0; i < itemNode.children.length; i++) {
      var child = itemNode.children[i];
      xmlBody += '\t<gsx:' + child.key + '>' + child.value + '</gsx:' + child.key + '>\n'
    }
    xmlBody += '</entry>';

    var request = CTS.engine.server.request('api/app/gsheet', {
      type: 'POST',
      // headers: {
      //   'GData-Version': '3.0',
      //   'If-Match': '*'
      // },
      data: {
        verb: 'PUT',
        url: url,
        contentType: 'application/atom+xml',
        ifMatch: '*',
        body: xmlBody
      }
    });

    request.done(function(json) {
      if (typeof json == 'string') {
        json = JSON.parse(json);
      }
      promise.resolve();
    });
    request.fail(function(jqxhr, textStatus) {
      Util.Log.Error(jqxhr, textStatus);
      promise.reject(textStatus);
    });

    return promise;
  },

  getSecurityLevel: function() {
    return 'private';
  },

  cloneListItem: function(ssKey, wsKey, itemNode) {
    var promise = Util.Promise.defer();

    var url = "https://spreadsheets.google.com/feeds/list/" + ssKey +
          "/" + wsKey + "/" + GSheetUtil.getSecurityLevel() + "/full?alt=json";

    var xmlBody = "<?xml version='1.0' ?>";
    xmlBody += '<entry xmlns="http://www.w3.org/2005/Atom"';
    xmlBody += ' xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">\n';
    for (var i = 0; i < itemNode.children.length; i++) {
      var child = itemNode.children[i];
      var value = child.value;
      var key = child.key;

      // XXX TEMPORARY FIX FOR BOOLEAN DEFAULTING!
      if ((value == true) || (value == "TRUE") || (value == "True") || (value == "true")) {
        key = false;
      }

      xmlBody += '\t<gsx:' + child.key + '>' + child.value + '</gsx:' + child.key + '>\n'
    }
    xmlBody += '</entry>';

    var request = CTS.engine.server.request('api/app/gsheet', {
      type: 'POST',
      headers: {
        'GData-Version': '3.0'
      },
      data: {
        verb: 'POST',
        contentType: 'application/atom+xml',
        url: url,
        body: xmlBody
      }
    }); 

    request.done(function(json) {
      console.log("Clone push success");
      if (typeof json == 'string') {
        json = JSON.parse(json);
      }
      var itemSpec = GSheetUtil._getItemSpec(json.entry, ssKey, wsKey);
      promise.resolve(itemSpec);
    });
    request.fail(function(jqxhr, textStatus) {
      console.log("Clone push fail");
      Util.Log.Error(jqxhr, textStatus);
      promise.reject(textStatus);
    });

    return promise;
  }
};

module.exports = GSheetUtil;
}, {"cts/util":2,"cts/parser":22}],
46: [function(require, module, exports) {
var Util = require('cts/util');
var Model = require('cts/model');
var GSheetUtil = require('./gsheet-util');
var GListFeedNode = require('./glistfeed-node');
var GCellFeedNode = require('./gcellfeed-node');

var GWorksheetNode = function(spec, tree, opts) {
  Util.Log.Debug("GWorksheet Constructor");
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.kind = "GWorksheet";
  this.name = spec.title;
  this.value = null;
  this.ctsId = Util._.uniqueId().toString();
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
Util._.extend(GWorksheetNode.prototype, Model.Node.Base, Util.Events, {

  debugName: function() {
    return "GWorkSheet";
  },

  find: function(spec, ret) {
    spec = GSheetUtil.fixSpec(spec);
    if (typeof ret == 'undefined') {
      ret = [];
    }
    if ((spec.sheetSpec.projection == "Rows") || (spec.sheetSpec.projection == "Cols")) {
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].kind == "GListFeed") {
          this.children[i].find(spec, ret);
        }
      }
    } else if (spec.sheetSpec.projection == "Cells") {
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].kind == "GCellFeed") {
          this.children[i].find(spec, ret);
        }
      }
    } else {
      Util.Log.Warn("Worksheet not sure how to process this spec", this, spec);
    }
    return ret;
  },

  isDescendantOf: function(other) {
    if ((this.parentNode != null) && (other == this.parentNode)) {
      return true;
    }
    return false;
  },

  _subclass_realizeChildren: function() {
    Util.Log.Debug("Worksheet realize kids", this.spec);
    var lf = new GListFeedNode(this.spec, this.tree, this.opts);
    lf.parentNode = this;
    var cf = new GCellFeedNode(this.spec, this.tree, this.opts);
    cf.parentNode = this;
    this.children = [lf, cf];
    return Util.Promise.resolve();
  },

   /*
    * Inserts this DOM node after the child at the specified index.
    * It must be a new row node.
    */
   _subclass_insertChild: function(child, afterIndex) {
     // TODO: Figure out what to do.
   },

   /*
    */
   _onChildInserted: function(child) {
     // TODO: Figure out what to do.
   },

   /*
    *  Removes this Workbook from the GSheet
    */
   _subclass_destroy: function() {
   },

   _subclass_getInlineRelationSpecString: function() {
   },

   _subclass_beginClone: function(node) {
     return null;
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    return null;
  },

  setValue: function(value, opts) {
    // noop.
  },

  _subclass_ensure_childless: function() {
    // noop.
  },

  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

  _subclass_onDataEvent: function(eventName, handler) {
  },

  _subclass_offDataEvent: function(eventName, handler) {
  },

  _subclass_valueChangedListener: function(evt) {
  }

});

module.exports = GWorksheetNode;

}, {"cts/util":2,"cts/model":13,"./gsheet-util":45,"./glistfeed-node":47,"./gcellfeed-node":48}],
47: [function(require, module, exports) {
var Util = require('cts/util');
var Model = require('cts/model');
var GSheetUtil = require('./gsheet-util');
var GListFeedItemNode = require('./glistfeeditem-node');

/** A Google Spreadsheets "List Feed" Property Node.
 *
 * The LIST FEED represents the view of a Work Sheet that google considers to
 * be a list items, each with key-value pairs. This node represents one of
 * those ITEMS.
 */
var GListFeedNode = function(spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.ctsId = Util._.uniqueId().toString();
  this.kind = 'GListFeed';
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
Util._.extend(GListFeedNode.prototype, Model.Node.Base, Util.Events, {

  debugName: function() {
    return this.kind;
  },

  // Find alreays returns empty on a leaf.
  find: function(spec, ret) {
    spec = GSheetUtil.fixSpec(spec);
    if (typeof ret == 'undefined') {
      ret = [];
    }
    if (spec.sheetSpec.col == null) {
      // They want the container!
      ret.push(this);
    } else {
      // They want a column for all rows
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].find(spec, ret);
      }
    }
    return ret;
  },

  getWorksheetKey: function() {
    return this.spec.wskey;
  },

  getSpreadsheetKey: function() {
    return this.spec.sskey;
  },

  isDescendantOf: function(other) {
    // This node is only below a worksheet or gsheet.
    var ret = false;
    if (this.parentNode != null) {
      if (other == this.parentNode) {
        ret =true;
      } else {
        ret = this.parentNode.isDescendantOf(other);
      }
    }
    return ret;
  },

  _subclass_realizeChildren: function() {
     var deferred = Util.Promise.defer();
     this.children = [];
     var self = this;
     GSheetUtil.getListFeed(this.spec.sskey, this.spec.wskey).then(
       function(gdata) {
         Util.Log.Debug("Got list feed worksheet", gdata);
         self.gdata = gdata;
         for (var i = 0; i < gdata.items.length; i++) {
           var item = gdata.items[i];
           var child = new GListFeedItemNode(item.title, item, self.tree, self.opts);
           child.parentNode = self;
           self.children.push(child);
         }
         Util.Log.Debug("Resolving Worksheet Kids");
         deferred.resolve();
       },
       function(reason) {
         Util.Log.Warn("ListFeed Load Rejected", reason);
         deferred.reject(reason);
       }
     );
     return deferred.promise;
   },

   _subclass_insertChild: function(child, afterIndex) {
     // Sure, no problem.
     // TODO: If the child has no spec, that means that we haven't inserted it yet.
     // Right now, this is because Graft will insert it with clone_after, but 
     // there might be other cases where we aren't in the middle of clone operation.
   },

   /*
    */
   _onChildInserted: function(child) {
     Util.Log.Error("onChildInserted called (impossibly) on GListFeed Node");
   },

   /*
    *  Removes this Workbook from the GSheet
    */
   _subclass_destroy: function() {
     // TODO: Delete item from sheet
   },

   _subclass_getInlineRelationSpecString: function() {a
     return null;
   },

   _subclass_beginClone: function(node) {
     var value = this.value;
     // TODO: Need to generate a NEW id for insertion. And beginClone here
     // will neeed to be deferred!
     var spec = this.spec;
     var clone = new GListFeedNode(value, spec, this.tree, this.opts);
     // there are no children, so no need to do anything there.
     return Util.Promise.resolve(clone);
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    // Returns the value as JSON.
    return Util._.map(this.children, function(child) {
      return child.getValue();
    });
  },

  setValue: function(value, opts) {
    Util.Log.Error("You can't set the value of a ListFeed node");
  },

  _subclass_ensure_childless: function() {
  },

  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

  _subclass_onDataEvent: function(eventName, handler) {
  },

  _subclass_offDataEvent: function(eventName, handler) {
  },

  _subclass_valueChangedListener: function(evt) {
  }

});

module.exports = GListFeedNode;

}, {"cts/util":2,"cts/model":13,"./gsheet-util":45,"./glistfeeditem-node":49}],
49: [function(require, module, exports) {
var Util = require('cts/util');
var Model = require('cts/model');
var GSheetUtil = require('./gsheet-util');
var GListFeedPropertyNode = require('./glistfeedproperty-node');

/** A Google Spreadsheets "List Feed" Property Node.
 *
 * The LIST FEED represents the view of a Work Sheet that google considers to
 * be a list items, each with key-value pairs. This node represents one of
 * those ITEMS.
 *
 */

var GListFeedItemNode = function(value, spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.value = value;
  this.specDuringClone = null;
  this.spec = spec;
  this.ctsId = Util._.uniqueId().toString();
  this.kind = 'GListFeedItem';
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
Util._.extend(GListFeedItemNode.prototype, Model.Node.Base, Util.Events, {

  debugName: function() {
    return "GListFeedItem";
  },

  // Find alreays returns empty on a leaf.
  find: function(spec, ret) {
    spec = GSheetUtil.fixSpec(spec);
    if (typeof ret == 'undefined') {
      ret = [];
    }

    if (spec.sheetSpec.col) {
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].key == spec.sheetSpec.col) {
          ret.push(this.children[i]);
        }
      }
    }

    return ret;
  },

  isDescendantOf: function(other) {
    // This node is only below a worksheet or gsheet.
    var ret = false;
    if (this.parentNode != null) {
      if (other == this.parentNode) {
        ret =true;
      } else {
        ret = this.parentNode.isDescendantOf(other);
      }
    }
    return ret;
  },

  getItemId: function() {
    return this.spec.id;
  },

  getWorksheetKey: function() {
    if ((this.spec) && (this.spec.wskey)) {
      return this.spec.wskey;
    } else if ((this.specDuringClone) && (this.specDuringClone.wskey)) {
      return this.specDuringClone.wskey;
    } else {
     return this.parentNode.getWorksheetKey();
   }
  },

  getSpreadsheetKey: function() {
    if (this.spec && this.spec.sskey) {
      return this.spec.sskey;
    } else if (this.specDuringClone && this.specDuringClone.sskey) {
      return this.specDuringClone.sskey;
    } else {
      return this.parentNode.getSpreadsheetKey();
    }
  },

  _subclass_realizeChildren: function() {
     this.children = [];
     for (var key in this.spec.data) {
       var value = this.spec.data[key];
       var child = new GListFeedPropertyNode(key, value, this.tree, this.opts);
       child.parentNode = this;
       this.children.push(child);
     }
     return Util.Promise.resolve();
   },

   _subclass_insertChild: function(child, afterIndex) {
     Util.Log.Error("insertChild called (impossibly) on GListFeedItem");
   },

   /*
    */
   _onChildInserted: function(child) {
     Util.Log.Error("onChildInserted called (impossibly) on GListFeedItem Node");
   },

   /*
    *  Removes this Workbook from the GSheet
    */
   _subclass_destroy: function() {
     // TODO: Delete item from sheet
   },

   _subclass_getInlineRelationSpecString: function() {
     return null;
   },

   _subclass_beginClone: function() {
     var d = Util.Promise.defer();
     var value = this.value;
     var clone = new GListFeedItemNode(this.value, this.spec, this.tree, this.opts);
     clone.realizeChildren().then(
       function() {
         console.log("Realized children");
         // Important: we use the spec to build out the clone, but then we have to 
         // remove it. Otherwise modifications to this node will save to the wrong row.
         // In the spreadsheet. The _endClone method will give this node its own spec.
         clone.specDuringClone = clone.spec;
         clone.spec = null;
         d.resolve(clone);
       },
       function(reason) {
         d.reject(reason);
       }
     );
     return d.promise;
   },

   _subclass_endClone: function() {
     var d = Util.Promise.defer();
     var value = this.value;
     var self = this;
     console.log("Cloning list feed item");
     GSheetUtil.cloneListItem(
       self.getSpreadsheetKey(), self.getWorksheetKey(), self).then(
         function(spec) {
           console.log("Got spec for new list feed item", spec);
           self.spec = spec;
           self.specDuringClone = null;
           d.resolve(self);
         },
         function(reason) {
           Util.Log.Error('could not clone', reason);
           d.reject(reason);
         }
    );
    return d.promise;
  },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    var ret = {};
    Util._.each(this.children, function(child) {
      ret[child.key] = child.value;
    });
    return ret;
  },

  setValue: function(value, opts) {
    Util.Log.Error("You can't set the value of a ListFeedItem node");
  },

  _saveUpdates: function() {
    if (this.spec) {
      var sskey = this.getSpreadsheetKey();
      var wskey = this.getWorksheetKey();
      return GSheetUtil.modifyListItem(
        this.getSpreadsheetKey(),
        this.getWorksheetKey(),
        this);      
    } else {
      Util.Log.Info("No spec so fake saving");
      return Util.Promise.resolve();
    }
  },

  _subclass_ensure_childless: function() {
  },

  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

  _subclass_onDataEvent: function(eventName, handler) {
  },

  _subclass_offDataEvent: function(eventName, handler) {
  },

  _subclass_valueChangedListener: function(evt) {
  }

});

module.exports = GListFeedItemNode;

}, {"cts/util":2,"cts/model":13,"./gsheet-util":45,"./glistfeedproperty-node":50}],
50: [function(require, module, exports) {
var Util = require('cts/util');
var Model = require('cts/model');
var GSheetUtil = require('./gsheet-util');

/** A Google Spreadsheets "List Feed" Property Node.
 *
 * The LIST FEED represents the view of a Work Sheet that google considers to
 * be a list items, each with key-value pairs. This node represents the
 * PROPERTY of one of those items.
 *
 * As such, it is addressed (and initialized, in constructor) with the KEY and
 * VALUE that it represents, and has no notion of typical spreadsheet
 * addressing.
 *
 */

var GListFeedPropertyNode = function(key, value, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.key = key;
  this.value = value;
  this.ctsId = Util._.uniqueId().toString();
  this.kind = 'GListFeedProperty';
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
  this.shouldReceiveEvents = true;
};

// ### Instance Methods
Util._.extend(GListFeedPropertyNode.prototype, Model.Node.Base, Util.Events, {

  debugName: function() {
    return "GListFeedProperty";
  },

  // Find alreays returns empty on a leaf.
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    return ret;
  },

  isDescendantOf: function(other) {
    // This node is only below a worksheet or gsheet.
    var ret = false;
    if (this.parentNode != null) {
      if (other == this.parentNode) {
        ret =true;
      } else {
        ret = this.parentNode.isDescendantOf(other);
      }
    }
    return ret;
  },

  _subclass_realizeChildren: function() {
     // No op. This node is a child.
     this.children = [];
     return Util.Promise.resolve();
   },

   _subclass_insertChild: function(child, afterIndex) {
     Util.Log.Error("insertChild called (impossibly) on GListFeedProperty Node");
   },

   getWorksheetKey: function() {
     return this.parentNode.parentNode.getWorksheetKey();
   },

   getSpreadsheetKey: function() {
     return this.parentNode.parentNode.getSpreadsheetKey();
   },

   /*
    */
   _onChildInserted: function(child) {
     Util.Log.Error("onChildInserted called (impossibly) on GListFeedProperty Node");
   },

   /*
    *  Removes this Workbook from the GSheet
    */
   _subclass_destroy: function() {
     // TODO: Delete cell from sheet
   },

   _subclass_getInlineRelationSpecString: function() {a
     return null;
   },

   _subclass_beginClone: function(node) {
     var value = this.value;
     var key = this.key;
     var clone = new GListFeedPropertyNode(key, value, this.tree, this.opts);
     // there are no children, so no need to do anything there.
     return Util.Promise.resolve(clone);
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    return this.value;
  },

  setValue: function(value, opts) {
    Util.Log.Info("ItemProp setting to", value, "and asking item node to save.");
    this.value = value;
    return this.parentNode._saveUpdates();
  },

  getIfExistValue: function() {
    return ((this.value != null) && (this.value != ""));
  },

  _subclass_ensure_childless: function() {
    this.value = null;
  },

  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

  _subclass_onDataEvent: function(eventName, handler) {
  },

  _subclass_offDataEvent: function(eventName, handler) {
  },

  _subclass_valueChangedListener: function(evt) {
  }

});

module.exports = GListFeedPropertyNode;

}, {"cts/util":2,"cts/model":13,"./gsheet-util":45}],
48: [function(require, module, exports) {
var Util = require('cts/util');
var Model = require('cts/model');
var GSheetUtil = require('./gsheet-util');
var GColumnNode = require('./gcolumn-node');

/** A Google Spreadsheets "List Feed" Property Node.
 *
 * The LIST FEED represents the view of a Work Sheet that google considers to
 * be a list items, each with key-value pairs. This node represents one of
 * those ITEMS.
 */
var GCellFeedNode = function(spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.ctsId = Util._.uniqueId().toString();
  this.kind = 'GCellFeed';
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
Util._.extend(GCellFeedNode.prototype, Model.Node.Base, Util.Events, {

  debugName: function() {
    return this.kind;
  },

  getWorksheetKey: function() {
    return this.spec.wskey;
  },

  getSpreadsheetKey: function() {
    return this.spec.sskey;
  },

  // Find alreays returns empty on a leaf.
  find: function(spec, ret) {
    spec = GSheetUtil.fixSpec(spec);
    if (typeof ret == 'undefined') {
      ret = [];
    }
    var kids = this.getChildren();
    if (spec.sheetSpec.row && spec.sheetSpec.col) {
      for (var i = 0; i < kids.length; i++) {
        if (kids[i].value == spec.sheetSpec.col) {
          kids[i].find(spec, ret);
        }
      }
    }
    return ret;
  },

  isDescendantOf: function(other) {
    // This node is only below a worksheet or gsheet.
    if (this.parentNode != null) {
      if (other == this.parentNode) {
        return true;
      } else {
        return this.parentNode.isDescendantOf(other);
      }
    }
    return false;
  },

  updateComputedNodes: function() {
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].updateComputedNodes();
    }
  },

  _subclass_realizeChildren: function() {
     var deferred = Util.Promise.defer();
     this.children = [];
     var self = this;
     GSheetUtil.getCellFeed(this.spec.sskey, this.spec.wskey).then(
       function(gdata) {
         Util.Log.Debug("Got cell feed worksheet", gdata);
         self.gdata = gdata;

         for (var rowName in gdata.rows) {
           var columns = gdata.rows[rowName];
           var child = new GColumnNode(rowName, columns, self.tree, self.opts);
           child.parentNode = self;
           self.children.push(child);
         }
         Util.Log.Debug("Resolving Worksheet Kids");
         deferred.resolve();
       },
       function(reason) {
         Util.Log.Warn("CellFeed Load Rejected", reason);
         deferred.reject(reason);
       }
     );
     return deferred.promise;
   },

   _subclass_insertChild: function(child, afterIndex) {
     Util.Log.Error("insertChild called (impossibly) on GListFeedItem");
   },

   /*
    */
   _onChildInserted: function(child) {
     Util.Log.Error("onChildInserted called (impossibly) on GListFeedItem Node");
   },

   /*
    *  Removes this Workbook from the GSheet
    */
   _subclass_destroy: function() {
     // TODO: Delete item from sheet
   },

   _subclass_getInlineRelationSpecString: function() {a
     return null;
   },

   _subclass_beginClone: function(node) {
     var value = this.value;
     // TODO: Need to generate a NEW id for insertion. And beginClone here
     // will neeed to be deferred!
     var spec = this.spec;
     var clone = new GCellFeedNode(spec, this.tree, this.opts);
     // there are no children, so no need to do anything there.
     return Util.Promise.resolve(clone);
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    return null; // no value.
  },

  setValue: function(value, opts) {
    // noop.
  },

  _subclass_ensure_childless: function() {
  },

  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

  _subclass_onDataEvent: function(eventName, handler) {
  },

  _subclass_offDataEvent: function(eventName, handler) {
  },

  _subclass_valueChangedListener: function(evt) {
  }

});

module.exports = GCellFeedNode;

}, {"cts/util":2,"cts/model":13,"./gsheet-util":45,"./gcolumn-node":51}],
51: [function(require, module, exports) {
var Util = require('cts/util');
var Model = require('cts/model');
var GSheetUtil = require('./gsheet-util');
var GColumnCellNode = require('./gcolumncell-node');

/** A Google Spreadsheets "Cell Row" Node.
 *
 */

var GColumnNode = function(value, columns, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.value = value;
  this.columnNum = null;
  this.columns = columns;
  this.ctsId = Util._.uniqueId().toString();
  this.kind = 'GColumn';
};

// ### Instance Methods
Util._.extend(GColumnNode.prototype, Model.Node.Base, Util.Events, {

  debugName: function() {
    return "GColumn";
  },

  getColNum: function() {
    return this.columnNum;
  },

  getWorksheetKey: function() {
    return this.parentNode.getWorksheetKey();
  },

  // Find alreays returns empty on a leaf.
  find: function(spec, ret) {
    spec = GSheetUtil.fixSpec(spec);
    if (typeof ret == 'undefined') {
      ret = [];
    }
    var kids = this.getChildren();
    if (spec.sheetSpec.row) {
      var row = parseInt(spec.sheetSpec.row);
      if (! isNaN(row)) {
        for (var i = 0; i < kids.length; i++) {
          if (kids[i].row == row) {
            ret.push(kids[i]);
          }
        }
      }
    }
    return ret;
  },

  isDescendantOf: function(other) {
    // This node is only below a worksheet or gsheet.
    if (this.parentNode != null) {
      if (other == this.parentNode) {
        return true;
      } else {
        return this.parentNode.isDescendantOf(other);
      }
    }
    return false;
  },

  updateComputedNodes: function() {
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].updateIfComputed();
    }
  },

  _subclass_realizeChildren: function() {
    Util.Log.Debug("GColumn Realize Children");
     this.children = [];
     for (var rowName in this.columns) {
       var spec = this.columns[rowName];
       var child = new GColumnCellNode(rowName, spec, this.tree, this.opts);
       child.parentNode = this;
       this.children.push(child);
     }
     return Util.Promise.resolve();
   },

   _subclass_insertChild: function(child, afterIndex) {
     Util.Log.Error("insertChild called (impossibly) on GListFeedItem");
   },

   /*
    */
   _onChildInserted: function(child) {
     Util.Log.Error("onChildInserted called (impossibly) on GListFeedItem Node");
   },

   /*
    *  Removes this Workbook from the GSheet
    */
   _subclass_destroy: function() {
     // TODO: Delete item from sheet
   },

   _subclass_getInlineRelationSpecString: function() {a
     return null;
   },

   _subclass_beginClone: function(node) {
     return null;
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    return null; // no value.
  },

  setValue: function(value, opts) {
    // noop.
  },

  _subclass_ensure_childless: function() {
  },

  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

  _subclass_onDataEvent: function(eventName, handler) {
  },

  _subclass_offDataEvent: function(eventName, handler) {
  },

  _subclass_valueChangedListener: function(evt) {
  }

});

module.exports = GColumnNode;
}, {"cts/util":2,"cts/model":13,"./gsheet-util":45,"./gcolumncell-node":52}],
52: [function(require, module, exports) {
var Util = require('cts/util');
var Model = require('cts/model');
var GSheetUtil = require('./gsheet-util');

/** A Google Spreadsheets "Cell Row" Node.
 *
 */

var GColumnCellNode = function(row, spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.row = row;
  this.spec = spec;
  this.value = spec.content;
  this.colNum = spec.colNum;
  this.ctsId = Util._.uniqueId().toString();
  this.kind = 'GColumnCell';
  this.shouldReceiveEvents = true;
  this.shouldThrowEvents = true;
};

// ### Instance Methods
Util._.extend(GColumnCellNode.prototype, Model.Node.Base, Util.Events, {

  debugName: function() {
    return "GColumnCell";
  },

  // Find alreays returns empty on a leaf.
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    return ret;
  },

  isDescendantOf: function(other) {
    // This node is only below a worksheet or gsheet.
    if (this.parentNode != null) {
      if (other == this.parentNode) {
        return true;
      } else {
        return this.parentNode.isDescendantOf(other);
      }
    }
    return false;
  },

  getRowNum: function() {
    return this.row;
  },

  getColNum: function() {
    return this.colNum;
  },

  getWorksheetKey: function() {
    return this.parentNode.parentNode.getWorksheetKey();
  },

  getSpreadsheetKey: function() {
    return this.parentNode.parentNode.getSpreadsheetKey();
  },

  isFormulaCell: function() {
    return this.spec.isComputed;
  },

  updateIfComputed: function() {
    var self = this;
    if (this.isFormulaCell()) {
      return GSheetUtil.getCell(
        this.getSpreadsheetKey(),
        this.getWorksheetKey(),
        this.getRowNum(),
        this.getColNum()).then(
          function(newVal) {
            var oldVal = self.value;
            self.value = newVal;
            if (oldVal != newVal) {
              self._maybeThrowDataEvent({
                eventName: "ValueChanged",
                ctsNode: self
              });
            }
          }, function(reason) {
            Util.Log.Error(reason);
          }
        ).done();
    }
  },

  _subclass_realizeChildren: function() {
     // No kids!
     this.children = [];
     return Util.Promise.resolve();
   },

   _subclass_insertChild: function(child, afterIndex) {
     Util.Log.Error("insertChild called (impossibly) on GListFeedItem");
   },

   /*
    */
   _onChildInserted: function(child) {
     Util.Log.Error("onChildInserted called (impossibly) on GListFeedItem Node");
   },

   /*
    *  Removes this Workbook from the GSheet
    */
   _subclass_destroy: function() {
     // TODO: Delete item from sheet
   },

   _subclass_getInlineRelationSpecString: function() {a
     return null;
   },

   _subclass_beginClone: function(node) {
     return null;
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    return this.value; // no value.
  },

  setValue: function(value, opts) {
    this.value = value;
    var self = this;
    Util.Log.Info("Column Cell setting to ", value, this);
    var promise = GSheetUtil.modifyCell(
      this.getSpreadsheetKey(),
      this.getWorksheetKey(),
      this.getRowNum(),
      this.getColNum(),
      value).then(
        function() {
          self.parentNode.parentNode.updateComputedNodes();
        },
        function(reason) {
          Util.Log.Error("Cell update failed", reason);
        }
      ).done();
  },

  _subclass_ensure_childless: function() {
  },

  /************************************************************************
   **
   ** Utility Helpers
   **
   ************************************************************************/

  _subclass_onDataEvent: function(eventName, handler) {
  },

  _subclass_offDataEvent: function(eventName, handler) {
  },

  _subclass_valueChangedListener: function(evt) {
    console.log("VALUE CHANGED!", evt);
  }

});

module.exports = GColumnCellNode;

}, {"cts/util":2,"cts/model":13,"./gsheet-util":45}],
12: [function(require, module, exports) {
var Util = require('cts/util');
var Factory = require('./factory');

/*
 * Available options:
 *
 * - autoLoadSpecs (default: true) - Should we autload specs from
 *   script and link elements
 * - forrestSpecs - optional array of forrest specs to load
 *
 */

var Engine = function(opts, args) {
  var defaults;
  this.opts = opts || {};
  this.bootStage = "PreBoot";

  if (typeof this.opts.autoLoadSpecs == 'undefined') {
    this.opts.autoLoadSpecs = true;
  }

  // The main tree.
  this.forrest = null;
  this.initialize.apply(this, args);

  this.status = {
    defaultTreeReady: Util.Promise.defer(),
    allRealized: Util.Promise.defer(),
    booted: Util.Promise.defer(),
    rendered: Util.Promise.defer()
  };
};

// Instance Methods
// ----------------
Util._.extend(Engine.prototype, Util.Events, {

  initialize: function() {
  },

  /**
   * Rendering picks a primary tree. For each node in the tree, we:
   *  1: Process any *incoming* relations for its subtree.
   *  2: Process any *outgoing* tempalte operations
   *  3:
   */
  render: function(opts) {
    var self = this;
    var pt = this.forrest.getPrimaryTree();

    Util.Log.Debug("CTS::Engine::render called on Primary Tree");
    Util.Log.Tick("CTS:Engine Render");
    var options = Util._.extend({}, opts);
    pt.root._processIncoming().then(
      function() {
        Util.Log.Debug("CTS::Engine::render finished on Primary Tree");
        Util.Log.Tock("CTS:Engine Render");
        self.status.rendered.resolve();
      },
      function(reason) {
        Util.Log.Error(reason);
        self.status.rendered.reject(reason);
      }
    ).done();
  },

  boot: function() {
    Util.Log.Info("Engine: Starting Boot");
    Util.Log.Tick("CTS:Boot");
    this.bootStage = "Booting";
    var self = this;
    if (typeof self.booting != 'undefined') {
      Util.Log.Error("Already booted / booting");
    } else {
      self.booting = true;
    }
    self.bootStage = "Loading Forrest";
    Util.Log.Tick("CTS:LoadForrest");
    self.loadForrest().then(function() {
      Util.Log.Debug("Engine: Loaded Forrest");
      self.bootStage = "Loading CTS";
      Util.Log.Tock("CTS:LoadForrest");
      Util.Log.Tick("CTS:LoadCTS");
      return self.loadCts();
    }).then(function() {
      Util.Log.Debug("Engine: Loaded CTS");
      Util.Log.Tock("CTS:LoadCTS");
      Util.Log.Tick("CTS:RealizeDependencies");
      self.bootStage = "Realizing Dependencies";
      return self.forrest.realizeDependencies();
    }).then(function() {
      Util.Log.Debug("Engine: Realized Dependencies");
      Util.Log.Tock("CTS:RealizeDependencies");
      Util.Log.Tick("CTS:RealizeTrees");
      self.bootStage = "Realize Trees";
      return self.forrest.realizeTrees();
    }).then(function() {
      Util.Log.Debug("Engine: Realized Trees");
      self.bootStage = "Realize Relations";
      Util.Log.Tock("CTS:RealizeTrees");
      Util.Log.Tick("CTS:RealizeRelations");
      return Util.Promise.fcall(function() {
        self.forrest.realizeRelations()
      });
    }).then(function() {
      self.status.allRealized.resolve();
      Util.Log.Tock("CTS:RealizeRelations");
      Util.Log.Info("Engine: CTS Realized Relations. Starting Render.");
      self.bootStage = "Render";
      self.render.call(self);
      self.bootStage = "Finalizing Boot";
      Util.Log.Tock("CTS:Boot");
      self.status.booted.resolve();
      return Util.Promise.fcall(function() { return true; });
    }).fail(function(error) {
      Util.Log.Error("Boot stage failed.", error);
      self.status.booted.reject(error);
    }).done();
    return self.status.booted;
  },

  renderlessBoot: function() {
    Util.Log.Info("Engine: Starting Boot");
    Util.Log.Tick("CTS:Boot");
    this.bootStage = "Booting";
    var self = this;
    if (typeof self.booting != 'undefined') {
      Util.Log.Error("Already booted / booting");
    } else {
      self.booting = true;
    }
    self.bootStage = "Loading Forrest";
    Util.Log.Tick("CTS:LoadForrest");
    self.loadForrest().then(function() {
      self.bootStage = "Loading CTS";
      Util.Log.Tock("CTS:LoadForrest");
      Util.Log.Tick("CTS:LoadCTS");
      return self.loadCts();
    }).then(function() {
      self.status.defaultTreeReady.resolve();
      Util.Log.Debug("Engine: Loaded CTS");
      Util.Log.Tock("CTS:LoadCTS");
      Util.Log.Tick("CTS:RealizeDependencies");
      self.bootStage = "Realizing Dependencies";
      return self.forrest.realizeDependencies();
    }).then(function() {
      Util.Log.Debug("Engine: Realized Dependencies");
      Util.Log.Tock("CTS:RealizeDependencies");
      Util.Log.Tick("CTS:RealizeTrees");
      self.bootStage = "Realize Trees";
      return self.forrest.realizeTrees();
    }).then(function() {
      Util.Log.Debug("Engine: Realized Trees");
      self.bootStage = "Realize Relations";
      Util.Log.Tock("CTS:RealizeTrees");
      Util.Log.Tick("CTS:RealizeRelations");
      return Util.Promise.fcall(function() {
        self.forrest.realizeRelations()
      });
    }).then(function() {
      Util.Log.Tock("CTS:RealizeRelations");
      Util.Log.Tock("CTS:Boot");
      self.status.booted.resolve();
      return Util.Promise.fcall(function() { return true; });
    }).fail(function(error) {
      Util.Log.Error("Boot stage failed.", error);
      self.status.booted.reject(error);
    }).done();
    return self.status.booted;
  },

  loadForrest: function() {
    var promise = Util.Promise.defer();
    var self = this;
    if (typeof this.opts.forrest == 'undefined') {
      this.opts.forrest = {};
    }
    this.opts.forrest.engine = this;
    Factory.Forrest(this.opts.forrest, Factory).then(
      function(forrest) {
        self.forrest = forrest;
        Util.Log.Info("Engine: Resolved forrest.");
        promise.resolve();
      }
    );
    return promise;
  },

  get: function(selector) {
    var parts = selector.split('|');
    var tree = 'body';
    if (parts.length > 0) {
      tree = parts[0].trim();
      selector = parts.slice(1).join('|');
    }
    if (typeof this.forrest.trees[tree] == 'undefined') {
      if (typeof this.forrest.treeSpecs[tree] == 'undefined') {
        Util.Log.Error("Unknown tree: ", tree);
        return null;
      } else {
        Util.Log.Error("Tree was not realized from selection spec: ", tree);
        return null;
      }
    }
    console.log("Trying to get", selector, "from", tree);
    var nodes = this.forrest.trees[tree].root.find(selector);
    console.log("Got", nodes.length, "nodes");
    var values = Util._.map(nodes, function(n) { return n.getValue(); });
    return values;
  },

  loadCts: function() {
    var promises = [];
    var self = this;

    // Possibly add specs from the OPTS hash passed to Engine.
    if ((typeof self.opts.forrestSpecs != 'undefined') && (self.opts.forrestSpecs.length > 0)) {
      promises.push(self.forrest.addSpecs(self.opts.forrestSpecs));
    }

    if ((typeof self.opts.autoLoadSpecs != 'undefined') && (self.opts.autoLoadSpecs === true)) {
      var links = Util.Helper.getTreesheetLinks();
      var ps = self.forrest.parseAndAddSpecsFromLinks(links);
      for (var i = 0; i < ps.length; i++) {
        promises.push(ps[i]);
      }
    }
    return Util.Promise.all(promises);
  },

  // Stops all event listeners
  shutdown: function() {
    this.forrest.stopListening();
  }

});

module.exports = Engine;


}, {"cts/util":2,"./factory":11}]}, {}, {"1":""})
