/*
 * Helper functions. Many of these are taken from Underscore.js
 */
var Fn = CTS.Fn;

CTS.Fn.extend(CTS.Fn, {

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
  map: function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (Array.prototype.map && obj.map === Array.prototype.map) return obj.map(iterator, context);
    CTS.Fn.each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
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
    var ret = CTS.Fn.deepExtend({}, defaults);
    CTS.Fn.deepExtend(ret, overrides);
    return ret;
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

});

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

