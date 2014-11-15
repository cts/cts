/*  Cascading Tree Sheets
 *  ==========================================================================
 * 
 *  Assumption:
 * 
 *    This is the one file that must ALWAYS be loaded before any other CTS file
 *    has loaded. In other words, other files can count on
 *    `CTS.registerNamespace` being around.
 *
 *    This file is also designed to be able to load multiple times. So CTS-UI
 *    can load it if it loads before CTS.
 * 
 *  Set up CTS root object
 *  --------------------------------------------------------------------------
 */

var root = this;

// Define Root CTS Namespace if CTS doesn't exist.
if (typeof CTS == 'undefined') {
  if (typeof exports !== 'undefined') {
    CTS = exports;
  } else {
    CTS = root.CTS = {};
  }
} else if (typeof CTS != 'object') {
  console.error("Something appears to already occupy the CTS namespace");
}
CTS.VERSION = '0.6.0';

// Set up bare minimum functionality that we want available for
// all other files.
// --------------------------------------------------------------------------

if (typeof CTS.registerNamespace == 'undefined') {
  CTS.registerNamespace = function(s) {
    var parts = s.split('.');
    var ptr = root;
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      if (typeof ptr != 'object') {
        throw "Can not register namespace segment " + part + " in nonobject.";
      }
      if (typeof ptr[part] == 'undefined') {
        ptr[part] = {};
      }
      ptr = ptr[part];
    }
  };
}

CTS.registerNamespace('CTS.status');

if (typeof CTS.Fn == 'undefined') {
  CTS.registerNamespace('CTS.Fn');
  CTS.Fn.breaker = {};

  CTS.Fn.each = function(obj, iterator, context) {
    if (obj == null) return;
    if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === CTS.Fn.breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === CTS.Fn.breaker) return;
        }
      }
    }
  };
  
  CTS.Fn.extend = function(obj) {
    CTS.Fn.each(Array.prototype.slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };
}

CTS.registerNamespace('CTS.Constants');

CTS.Constants.mockupBase = "http://www.treesheets.org/mockups/";
CTS.Constants.jQuery = '//ajax.googleapis.com/ajax/libs/jquery/2.0.2/jquery.min.js';
CTS.Constants.longstackSupport = false;

CTS.registerNamespace('CTS.Util');

CTS.Fn.extend(CTS.Util, {
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

  createJqueryNode: function(node) {
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
      n = $(node);
    } else {
      n = null;
    }

    return n;
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
    var base = CTS.Util.getUrlBase(sourceUrl);
    var basePath = CTS.Util.getUrlBaseAndPath(sourceUrl);
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
      Fn.each(elem.children(), function(c) {
        fixElem(CTS.$(c));
      }, this);
    }
    fixElem(jqNode);
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
      return CTS.$(sel);
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

    CTS.Fn.each(find('script[data-treesheet]'), function(elem) {
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
    CTS.Fn.each(find('script[data-theme]'), function(elem) {
      var str = CTS.$(elem).attr('data-theme');
      var sub = CTS.$(elem).attr('data-subtheme');
      if (str != null) {
        var urls = CTS.Util.themeUrls(str, sub);
        CTS.Log.Info("Loading theme", urls);
        for (var k = 0; k < urls.length; k++) {
          var block = {
            type: 'link',
            format: 'string',
            url: urls[k]
          };
          ret.push(block);
        }
      }
    }, this);

    CTS.Fn.each(find('style[type="text/cts"]'), function(elem) {
      var block = {
        type: 'block',
        format: 'string',
        content: CTS.$(elem).html()
      };
      ret.push(block);
    }, this);

    CTS.Fn.each(find('style[type="json/cts"]'), function(elem) {
      var block = {
        type: 'block',
        format: 'json',
        content: CTS.$(elem).html()
      };
      ret.push(block);
    }, this);
    // TODO(eob): see if this causes it to get the smae element three times...
    // XXX !important

    CTS.Fn.each(find('link[rel="treesheet"],link[type="txt/cts"],link[type="json/cts"]'), function(elem) {
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
        prefix = prefix.join("/");
        url = prefix + "/" + fragment;
        return url;
      } else {
        return url;
      }
    }
  },

  fetchString: function(params) {
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

});

CTS.registerNamespace('CTS.Util');

// We're going to load *some* things in the util namespace here.

CTS.Util.getUrlParameter = function(param, url) {
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
};

CTS.Util.shouldAutoload = function() {
  // Don't autoload if there is a ?autoload=false
  if (typeof document == 'undefined') {
    return false;
  }
  if (CTS.Util.getUrlParameter('autoload') == 'false') {
    return false;
  }
  if (typeof document.body.dataset != 'undefined') {
    if (typeof document.body.dataset.ctsautoload != 'undefined') {
      if (document.body.dataset.ctsautoload == 'false') {
        return false;
      }
    }
  }
  return true;
};

CTS.Util.hideDocumentBody = function() {
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
};

CTS.Util.showDocumentBody = function($e) {
  CTS.$('body').show();
};

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
CTS.LogLevel = {
  
  Level: 3,

  // 0: Fatal
  Fatal: function() {
    return CTS.LogLevel.Level >= 0;
  },
   
  // 1: Error
  Error: function() {
    return CTS.LogLevel.Level >= 1;
  },

  // 2: Warn
  Warn: function() {
    return CTS.LogLevel.Level >= 2;
  },

  // 3: Info
  Info: function() {
    return CTS.LogLevel.Level >= 3;
  },

  // 4: Debug 
  Debug: function() {
    return CTS.LogLevel.Level >= 4;
  }
};

CTS.Log = {

  Fatal: function(msg) {
    alert(msg);
    CTS.Log._LogWithLevel("FATAL", CTS.LogLevel.Fatal, 'error', arguments);
  },

  Error: function(message) {
    CTS.Log._LogWithLevel("ERROR", CTS.LogLevel.Error, 'error', arguments);
  },

  Warn: function(message) {
    CTS.Log._LogWithLevel("WARN", CTS.LogLevel.Warn, 'warn', arguments);
  },

  Debug: function(message) {
    CTS.Log._LogWithLevel("DEBUG", CTS.LogLevel.Debug, 'debug', arguments);
  },

  Info: function(message) {
    CTS.Log._LogWithLevel("INFO", CTS.LogLevel.Info, 'info', arguments);
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
      var opp = node.relations[i].opposite(node);
      if (opp != null) {
        opp = opp.getValue();
      } else {
        opp = "null";
      }
      console.log(indentSp + "- " + node.relations[i].name + " " + opp);
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
    primary._processIncoming().done();
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

(function (definition) {

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // RequireJS
    if (typeof define === "function") {
        define(definition);
    // CommonJS
    } else if (typeof exports === "object") {
        definition(require, exports);
    // <script>
    } else {
        window.Cause = definition(void 0, {});
    }

})(function (serverSideRequire, exports) {
"use strict";

function removeCommonSegments(baseSegments, segments) {
  if (segments[0] !== baseSegments[0]) {
    return segments; // nothing in common
  }
  for(var i = 1; i < segments.length; i++) {
    if (segments[i] !== baseSegments[i]) {
      return segments.slice(i);
    }
  }
  // everything in common
  return [segments[segments.length - 1]];
}



function description(callsite) {
  var text = "";
  if (callsite.getThis()) {
    text += callsite.getTypeName() + '.';
  }
  text += callsite.getFunctionName();
  return text;
}

function FileFilter() {
  this.inQ = false;
}

FileFilter.showSystem = false;
FileFilter.reQ = /q\/q\.js$/;
FileFilter.reNative = /^native\s/;

FileFilter.prototype.isSystem  = function(file) {
  if (FileFilter.showSystem) {
    return false;
  }
  if (FileFilter.reQ.test(file)) {
    this.inQ = true;
    return true;
  } else if (this.inQ && FileFilter.reNative.test(file)) {
    return true;
  } else {
    this.inQ = false;
  }
}


function filterAndCount(error, arrayOfCallSite) {
  error.fileNameColumns = 0;
  error.largestLineNumber = 0;
  var baseSegments = window.location.toString().split('/');

  var filteredStack = [];
  var fileFilter = new FileFilter();
  for (var i = 0; i < arrayOfCallSite.length; i++) {
    var callsite = arrayOfCallSite[i];
    var file = callsite.getFileName();
    if (!fileFilter.isSystem(file)) {
      file = removeCommonSegments(baseSegments, file.split('/')).join('/');

      if (file.length > error.fileNameColumns) {
        error.fileNameColumns = file.length;
      }
      var line = callsite.getLineNumber();
      if (line > error.largestLineNumber) {
        error.largestLineNumber = line;
      }
      filteredStack.push({file: file, line: line, description: description(callsite)});
    }
  }
  error.lineNumberColumns = (error.largestLineNumber+'').length;
  return filteredStack;
}

function formatStack(error, stackArray) {
  var lineNumberColumns = error.lineNumberColumns || 0;
  var fileNameColumns = error.fileNameColumns || 0;

  var textArray = stackArray.map(function toString(callsite, index) {
    // https://gist.github.com/312a55532fac0296f2ab P. Mueller
    //WeinreTargetCommands.coffee  21 - WeinreTargetCommands.registerTarget()
    var text = "";
    var file = callsite.file;
    var line = callsite.line;
    if (!file) {
      console.log("file undefined: ", callsite);
    }
    var blanks = fileNameColumns - file.length;
    if (blanks < 0) {
      console.log("toString blanks negative for "+file);
    }
    while (blanks-- > 0) {
      text += " ";
    };
    text += file;
    blanks = lineNumberColumns - (line+'').length + 1;
    while (blanks-- > 0) {
      text += " ";
    };
    text += line + ' - ';

    text += callsite.description;
    return text;
  });
  return textArray.join('\n');
}

var reMueller = /(\s*[^\s]*)\s(\s*[0-9]*)\s-\s/;  // abcd 1234 -
// I would much rather work on the stack before its turned to a string!
function reformatStack(error, stack) {
  var fileNameShift = 0;
  var lineNumberShift = 0;
  var frameStrings = stack.split('\n');
  var m = reMueller.exec(frameStrings[0]);
  if (m) {
    var fileNameFormatted = m[1];
    if (fileNameFormatted.length > error.fileNameColumns) {
      // the other stack will need to step up
      error.fileNameColumns = fileNameFormatted.length;
    } else {
      // We need to move this one over
      fileNameShift = error.fileNameColumns - fileNameFormatted.length;
    }
    var lineNumberFormatted = m[2];
    if (lineNumberFormatted.length > error.lineNumberColumns) {
      error.lineNumberColumns = lineNumberFormatted.length;
    } else {
      lineNumberShift = error.lineNumberColumns - lineNumberFormatted.length;
    }

    if (lineNumberShift || fileNameShift) {
      var fileNamePadding = "";
      while (fileNameShift--) {
        fileNamePadding += ' ';
      }
      var lineNumberPadding = "";
      while (lineNumberShift--) {
        lineNumberPadding += ' ';
      }

      var oldFileNameColumns = fileNameFormatted.length;
      var frames = frameStrings.map(function splitter(frameString) {
        var fileName = frameString.substr(0, oldFileNameColumns);
        var rest = frameString.substr(oldFileNameColumns);
        return fileNamePadding + fileName + lineNumberPadding + rest;
      });
      return frames.join('\n');
    } else {
      return stack;
    }
  } else {
    console.error("reformatStack fails ", frameStrings);
  }
}

Error.stackTraceLimit = 20;  // cause ten of them are Q
Error.causeStackDepth = 0;

// Triggered by Cause.stack access
Error.prepareStackTrace = function(error, structuredStackTrace) {

  var filteredStack = filterAndCount(error, structuredStackTrace);

  var reformattedCauseStack = "";
  if (error instanceof Cause || (error.prev && error.prev.cause)) {
    if (error.prev && error.prev.cause) {
      var cause = error.prev.cause;
      Error.causeStackDepth++;
      var causeStack = cause.stack;  // recurse
      Error.causeStackDepth--;
      reformattedCauseStack = reformatStack(error, causeStack);
    } //  else hit bottom
  }
  // don't move this up, the reformat may change the error.fileNameColumns values
  var formattedStack = formatStack(error, filteredStack);
  if (formattedStack) {
    if (reformattedCauseStack) {
      formattedStack = formattedStack + '\n' + reformattedCauseStack;
    }
  } else { //  all got filtered
    formattedStack = reformattedCauseStack;
  }
  return formattedStack;
}

// An Error constructor used as a Cause constructor
function Cause(head) {
  Error.captureStackTrace(this, Cause);  // sets this.stack, lazy
  this.prev = head;
  this.message = 'cause';
  this.fileName = 'q.js'
  this.lineNumber = 1;
}

Cause.externalCause = null;
Cause.setExternalCause  = function(message) {
  Cause.externalCause = message;
}
exports = Cause;

return Cause;

});

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

// vim:ts=4:sts=4:sw=4:
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

(function (definition) {
    // Turn off strict mode for this function so we can assign to global.Q
    /* jshint strict: false */

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else {
        Q = definition();
        if (typeof CTS != 'undefined') {
          CTS.Q = Q;
        }
    }

})(function () {
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
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
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
// deeply frozen anyway, and if you donâ€™t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Millerâ€™s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
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
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
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
Q.resolve = Q;

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
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

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

        become(Q(value));
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
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become fulfilled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be fulfilled
 */
Q.race = race;
function race(answerPs) {
    return promise(function(resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function(answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

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

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

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

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If itâ€™s a fulfilled promise, the fulfillment value is nearer.
 * If itâ€™s a deferred promise and the deferred has been resolved, the
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

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
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
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
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
        return Q(object).inspect();
    });
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
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

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

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
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
                // SpiderMonkey Generators
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
        var callback = continuer.bind(continuer, "next");
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
 * add(Q(a), Q(B));
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
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

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
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

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
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--countDown === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (countDown === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

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
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

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
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
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
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {String} custom error message (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, message) {
    return Q(object).timeout(ms, message);
};

Promise.prototype.timeout = function (ms, message) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        deferred.reject(new Error(message || "Timed out after " + ms + " ms"));
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

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
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

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

CTS.registerNamespace('CTS.Events');

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


var gapi=window.gapi=window.gapi||{};gapi._bs=new Date().getTime();(function(){var f=encodeURIComponent,g=window,k=decodeURIComponent,m="push",n="test",s="shift",t="replace",x="length",A="split",B="join";var C=g,D=document,aa=C.location,ba=function(){},ca=/\[native code\]/,F=function(a,b,c){return a[b]=a[b]||c},da=function(a){for(var b=0;b<this[x];b++)if(this[b]===a)return b;return-1},ea=function(a){a=a.sort();for(var b=[],c=void 0,d=0;d<a[x];d++){var e=a[d];e!=c&&b[m](e);c=e}return b},G=function(){var a;if((a=Object.create)&&ca[n](a))a=a(null);else{a={};for(var b in a)a[b]=void 0}return a},H=F(C,"gapi",{});var I;I=F(C,"___jsl",G());F(I,"I",0);F(I,"hel",10);var J=function(){var a=aa.href,b;if(I.dpo)b=I.h;else{b=I.h;var c=RegExp("([#].*&|[#])jsh=([^&#]*)","g"),d=RegExp("([?#].*&|[?#])jsh=([^&#]*)","g");if(a=a&&(c.exec(a)||d.exec(a)))try{b=k(a[2])}catch(e){}}return b},fa=function(a){var b=F(I,"PQ",[]);I.PQ=[];var c=b[x];if(0===c)a();else for(var d=0,e=function(){++d===c&&a()},h=0;h<c;h++)b[h](e)},K=function(a){return F(F(I,"H",G()),a,G())};var L=F(I,"perf",G()),M=F(L,"g",G()),ga=F(L,"i",G());F(L,"r",[]);G();G();var N=function(a,b,c){var d=L.r;"function"===typeof d?d(a,b,c):d[m]([a,b,c])},P=function(a,b,c){b&&0<b[x]&&(b=O(b),c&&0<c[x]&&(b+="___"+O(c)),28<b[x]&&(b=b.substr(0,28)+(b[x]-28)),c=b,b=F(ga,"_p",G()),F(b,c,G())[a]=(new Date).getTime(),N(a,"_p",c))},O=function(a){return a[B]("__")[t](/\./g,"_")[t](/\-/g,"_")[t](/\,/g,"_")};var R=G(),S=[],T=function(a){throw Error("Bad hint"+(a?": "+a:""));};S[m](["jsl",function(a){for(var b in a)if(Object.prototype.hasOwnProperty.call(a,b)){var c=a[b];"object"==typeof c?I[b]=F(I,b,[]).concat(c):F(I,b,c)}if(b=a.u)a=F(I,"us",[]),a[m](b),(b=/^https:(.*)$/.exec(b))&&a[m]("http:"+b[1])}]);var ha=/^(\/[a-zA-Z0-9_\-]+)+$/,ia=/^[a-zA-Z0-9\-_\.,!]+$/,ja=/^gapi\.loaded_[0-9]+$/,ka=/^[a-zA-Z0-9,._-]+$/,oa=function(a,b,c,d){var e=a[A](";"),h=R[e[s]()],l=null;h&&(l=h(e,b,c,d));if(b=l)b=l,c=b.match(la),d=b.match(ma),b=!!d&&1===d[x]&&na[n](b)&&!!c&&1===c[x];b||T(a);return l},qa=function(a,b,c,d){a=pa(a);ja[n](c)||T("invalid_callback");b=U(b);d=d&&d[x]?U(d):null;var e=function(a){return f(a)[t](/%2C/g,",")};return[f(a.d)[t](/%2C/g,",")[t](/%2F/g,"/"),"/k=",e(a.version),"/m=",e(b),d?"/exm="+e(d):
"","/rt=j/sv=1/d=1/ed=1",a.a?"/am="+e(a.a):"",a.b?"/rs="+e(a.b):"","/cb=",e(c)][B]("")},pa=function(a){"/"!==a.charAt(0)&&T("relative path");for(var b=a.substring(1)[A]("/"),c=[];b[x];){a=b[s]();if(!a[x]||0==a.indexOf("."))T("empty/relative directory");else if(0<a.indexOf("=")){b.unshift(a);break}c[m](a)}a={};for(var d=0,e=b[x];d<e;++d){var h=b[d][A]("="),l=k(h[0]),p=k(h[1]);2==h[x]&&l&&p&&(a[l]=a[l]||p)}b="/"+c[B]("/");ha[n](b)||T("invalid_prefix");c=V(a,"k",!0);d=V(a,"am");a=V(a,"rs");return{d:b,
version:c,a:d,b:a}},U=function(a){for(var b=[],c=0,d=a[x];c<d;++c){var e=a[c][t](/\./g,"_")[t](/-/g,"_");ka[n](e)&&b[m](e)}return b[B](",")},V=function(a,b,c){a=a[b];!a&&c&&T("missing: "+b);if(a){if(ia[n](a))return a;T("invalid: "+b)}return null},na=/^https?:\/\/[a-z0-9_.-]+\.google\.com(:\d+)?\/[a-zA-Z0-9_.,!=\-\/]+$/,ma=/\/cb=/g,la=/\/\//g,ra=function(){var a=J();if(!a)throw Error("Bad hint");return a};R.m=function(a,b,c,d){(a=a[0])||T("missing_hint");return"https://apis.google.com"+qa(a,b,c,d)};var W=decodeURI("%73cript"),X=function(a,b){for(var c=[],d=0;d<a[x];++d){var e=a[d];e&&0>da.call(b,e)&&c[m](e)}return c},sa=function(a){"loading"!=D.readyState?Y(a):D.write("<"+W+' src="'+encodeURI(a)+'"></'+W+">")},Y=function(a){var b=D.createElement(W);b.setAttribute("src",a);b.async="true";(a=D.getElementsByTagName(W)[0])?a.parentNode.insertBefore(b,a):(D.head||D.body||D.documentElement).appendChild(b)},ta=function(a,b){var c=b&&b._c;if(c)for(var d=0;d<S[x];d++){var e=S[d][0],h=S[d][1];h&&Object.prototype.hasOwnProperty.call(c,
e)&&h(c[e],a,b)}},ua=function(a,b){Z(function(){var c;c=b===J()?F(H,"_",G()):G();c=F(K(b),"_",c);a(c)})},va=function(a,b){var c=b||{};"function"==typeof b&&(c={},c.callback=b);ta(a,c);var d=a?a[A](":"):[],e=c.h||ra(),h=F(I,"ah",G());if(h["::"]&&d[x]){for(var l=[],p=null;p=d[s]();){var u=p[A]("."),u=h[p]||h[u[1]&&"ns:"+u[0]||""]||e,r=l[x]&&l[l[x]-1]||null,y=r;r&&r.hint==u||(y={hint:u,c:[]},l[m](y));y.c[m](p)}var z=l[x];if(1<z){var E=c.callback;E&&(c.callback=function(){0==--z&&E()})}for(;d=l[s]();)$(d.c,
c,d.hint)}else $(d||[],c,e)},$=function(a,b,c){a=ea(a)||[];var d=b.callback,e=b.config,h=b.timeout,l=b.ontimeout,p=null,u=!1;if(h&&!l||!h&&l)throw"Timeout requires both the timeout parameter and ontimeout parameter to be set";var r=F(K(c),"r",[]).sort(),y=F(K(c),"L",[]).sort(),z=[].concat(r),E=function(a,b){if(u)return 0;C.clearTimeout(p);y[m].apply(y,q);var d=((H||{}).config||{}).update;d?d(e):e&&F(I,"cu",[])[m](e);if(b){P("me0",a,z);try{ua(b,c)}finally{P("me1",a,z)}}return 1};0<h&&(p=C.setTimeout(function(){u=
!0;l()},h));var q=X(a,y);if(q[x]){var q=X(a,r),v=F(I,"CP",[]),w=v[x];v[w]=function(a){if(!a)return 0;P("ml1",q,z);var b=function(b){v[w]=null;E(q,a)&&fa(function(){d&&d();b()})},c=function(){var a=v[w+1];a&&a()};0<w&&v[w-1]?v[w]=function(){b(c)}:b(c)};if(q[x]){var Q="loaded_"+I.I++;H[Q]=function(a){v[w](a);H[Q]=null};a=oa(c,q,"gapi."+Q,r);r[m].apply(r,q);P("ml0",q,z);b.sync||C.___gapisync?sa(a):Y(a)}else v[w](ba)}else E(q)&&d&&d()};var Z=function(a){if(I.hee&&0<I.hel)try{return a()}catch(b){I.hel--,va("debug_error",function(){try{g.___jsl.hefn(b)}catch(a){throw b;}})}else return a()};H.load=function(a,b){return Z(function(){return va(a,b)})};M.bs0=g.gapi._bs||(new Date).getTime();N("bs0");M.bs1=(new Date).getTime();N("bs1");delete g.gapi._bs;})();
gapi.load("client",{callback:window["handleClientLoad"],_c:{"jsl":{"ci":{"llang":"en","client":{"cors":false},"plus_layer":{"isEnabled":false},"enableMultilogin":false,"disableRealtimeCallback":false,"isLoggedIn":true,"iframes":{"additnow":{"methods":["launchurl"],"url":"https://apis.google.com/additnow/additnow.html?usegapi\u003d1\u0026bsv\u003do"},"person":{"url":":socialhost:/:session_prefix:_/widget/render/person?usegapi\u003d1\u0026bsv\u003do"},"plus_followers":{"params":{"url":""},"url":":socialhost:/_/im/_/widget/render/plus/followers?usegapi\u003d1\u0026bsv\u003do"},"signin":{"methods":["onauth"],"params":{"url":""},"url":":socialhost:/:session_prefix:_/widget/render/signin?usegapi\u003d1\u0026bsv\u003do"},"commentcount":{"url":":socialhost:/:session_prefix:_/widget/render/commentcount?usegapi\u003d1\u0026bsv\u003do"},"page":{"url":":socialhost:/:session_prefix:_/widget/render/page?usegapi\u003d1\u0026bsv\u003do"},"hangout":{"url":"https://talkgadget.google.com/:session_prefix:talkgadget/_/widget?bsv\u003do"},"plus_circle":{"params":{"url":""},"url":":socialhost:/:session_prefix:_/widget/plus/circle?usegapi\u003d1\u0026bsv\u003do"},"card":{"url":":socialhost:/:session_prefix:_/hovercard/card?bsv\u003do"},"evwidget":{"params":{"url":""},"url":":socialhost:/:session_prefix:_/events/widget?usegapi\u003d1\u0026bsv\u003do"},"zoomableimage":{"url":"https://ssl.gstatic.com/microscope/embed/?bsv\u003do"},"follow":{"url":":socialhost:/:session_prefix:_/widget/render/follow?usegapi\u003d1\u0026bsv\u003do"},"shortlists":{"url":"?bsv\u003do"},"plus":{"url":":socialhost:/:session_prefix:_/widget/render/badge?usegapi\u003d1\u0026bsv\u003do"},"configurator":{"url":":socialhost:/:session_prefix:_/plusbuttonconfigurator?usegapi\u003d1\u0026bsv\u003do"},":socialhost:":"https://apis.google.com","post":{"params":{"url":""},"url":":socialhost:/:session_prefix::im_prefix:_/widget/render/post?usegapi\u003d1\u0026bsv\u003do"},"community":{"url":":socialhost:/:session_prefix:_/widget/render/community?usegapi\u003d1\u0026bsv\u003do"},"rbr_s":{"params":{"url":""},"url":":socialhost:/:session_prefix:_/widget/render/recobarsimplescroller?bsv\u003do"},"autocomplete":{"params":{"url":""},"url":":socialhost:/:session_prefix:_/widget/render/autocomplete?bsv\u003do"},"plus_share":{"params":{"url":""},"url":":socialhost:/:session_prefix:_/+1/sharebutton?plusShare\u003dtrue\u0026usegapi\u003d1\u0026bsv\u003do"},":source:":"3p","savetowallet":{"url":"https://clients5.google.com/s2w/o/savetowallet?bsv\u003do"},"rbr_i":{"params":{"url":""},"url":":socialhost:/:session_prefix:_/widget/render/recobarinvitation?bsv\u003do"},"appcirclepicker":{"url":":socialhost:/:session_prefix:_/widget/render/appcirclepicker?bsv\u003do"},":im_socialhost:":"https://plus.googleapis.com","savetodrive":{"methods":["save"],"url":"https://drive.google.com/savetodrivebutton?usegapi\u003d1\u0026bsv\u003do"},":signuphost:":"https://plus.google.com","plusone":{"params":{"count":"","size":"","url":""},"url":":socialhost:/:session_prefix:_/+1/fastbutton?usegapi\u003d1\u0026bsv\u003do"},"comments":{"methods":["scroll","openwindow"],"params":{"location":["search","hash"]},"url":":socialhost:/:session_prefix:_/widget/render/comments?usegapi\u003d1\u0026bsv\u003do"},"ytsubscribe":{"url":"https://www.youtube.com/subscribe_embed?usegapi\u003d1\u0026bsv\u003do"}},"isPlusUser":true,"debug":{"host":"https://apis.google.com","reportExceptionRate":0.05,"rethrowException":false},"eesw":{"enabled":false},"enableContextualSignin":false,"deviceType":"desktop","inline":{"css":1},"lexps":[102,98,99,79,109,45,17,117,115,81,95,125,124,122,61,30],"include_granted_scopes":true,"oauth-flow":{"improveToastUi":true,"authAware":true,"usegapi":false,"disableOpt":true,"authUrl":"https://accounts.google.com/o/oauth2/auth","proxyUrl":"https://accounts.google.com/o/oauth2/postmessageRelay","toastCfg":"1000:3000:1000"},"report":{"host":"https://apis.google.com","rate":0.001,"apis":["iframes\\..*","gadgets\\..*","gapi\\.appcirclepicker\\..*","gapi\\.auth\\..*","gapi\\.client\\..*","gapi\\.signin\\..*"]},"csi":{"rate":0.01},"googleapis.config":{"auth":{"useFirstPartyAuthV2":false}}},"h":"m;/_/scs/apps-static/_/js/k\u003doz.gapi.en.DEioiMzDtV0.O/m\u003d__features__/am\u003dIQ/rt\u003dj/d\u003d1/t\u003dzcms/rs\u003dAItRSTMjejumKjINpJ3W022vcvOWdYiIwA","u":"https://apis.google.com/js/client.js?onload\u003dhandleClientLoad","hee":true,"fp":"bd00ebdee6ccf927079bc3b376a8dc770ddc74a4","dpo":false},"fp":"bd00ebdee6ccf927079bc3b376a8dc770ddc74a4","annotation":["interactivepost","recobar","autocomplete","profile"],"bimodal":["signin"]}});

CTS.registerNamespace('CTS.Util.GSheet');

CTS.Fn.extend(CTS.Util.GSheet, {
  // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauthauthorize
  _ctsApiClientId: '459454183971-3rhp3qnfrdane1hnoa23eom28qoo146f.apps.googleusercontent.com',
  _ctsApiKey: 'AIzaSyBpNbbqKrk21n6rI8Nw2R6JSz6faN7OiWc',
  _ctsApiClientScopes: 'https://www.googleapis.com/auth/plus.me http://spreadsheets.google.com/feeds/ https://www.googleapis.com/auth/drive',
  _loginStateModified: null,
  _currentToken: null,
  _loginDefer: Q.defer(),
  _gapiLoaded: Q.defer(),

  _loadGApi: function() {
    gapi.load("auth:client,drive-share", function() {
      CTS.Util.GSheet._gapiLoaded.resolve();
    });
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
      url = (url + key + "/");
    }
    if (worksheet != null) {
      url += (worksheet + "/")
    }
    url += security + "/" + mode;
    if (cell != null) {
      url += ('/' + cell)
    }
    if (jsonCallback) {
      url += "?alt=json-in-script&callback=?";
    }
    if (accessToken) {
      if (jsonCallback) {
        url += "&";
      } else {
        url += "?";
      }
      if (CTS.Util.GSheet._currentToken != null) {
        url += "access_token=" + CTS.Util.GSheet._currentToken.access_token;
      } else {
        console.error("Asked for auth but current token null");
      }
    }
    return url;
  },

  isLoggedIn: function() {
    return (CTS.Util.GSheet._currentToken != null);
  },

  logout: function() {
    CTS.Util.GSheet._currentToken = null;
    if (typeof this._loginStateModified == 'function') {
      this._loginStateModified();
    }
  },

  _registerCtsCredentials: function() {
    gapi.client.setApiKey(CTS.Util.GSheet._ctsApiKey);
  },

  _authenticationResult: function(authResult) {
   if (authResult && !authResult.error) {
     CTS.Util.GSheet._currentToken = gapi.auth.getToken();
     CTS.Util.GSheet._loginDefer.resolve();
   } else {
     CTS.Util.GSheet._currentToken = null;
     CTS.Util.GSheet._loginDefer.reject();
   }
   if (typeof CTS.Util.GSheet._loginStateModified == 'function') {
     CTS.Util.GSheet._loginStateModified();
   }
  },

  maybeLogin: function() {
    if (this._currentToken == null) {
      return CTS.Util.GSheet.login();
    } else {
      return CTS.Util.GSheet._loginDefer.promise;
    }
  },

  login: function() {
    CTS.Util.GSheet._gapiLoaded.promise.then(
      function() {
        gapi.auth.authorize(
          {
            client_id: CTS.Util.GSheet._ctsApiClientId,
            scope: CTS.Util.GSheet._ctsApiClientScopes
          },
          CTS.Util.GSheet._authenticationResult
        );
      }
    );
    CTS.Log.Info("Done");
    return CTS.Util.GSheet._loginDefer.promise;
  },

  isLoggedIn: function() {
    return (CTS.Util.GSheet._currentToken != null);
  },

  createSpreadsheet: function(title) {
    var url = "https://www.googleapis.com/drive/v2/files";
    var deferred = Q.defer();
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
        CTS.Log.Error('create error', resp.error);
        deferred.reject(resp.error);
      } else {
        deferred.resolve(resp);
      }
    });
    return deferred.promise;
  },

  getSpreadsheets: function() {
    var deferred = Q.defer();
    var url = CTS.Util.GSheet._gSheetUrl(
        'spreadsheets', null, null, 'private', 'full', null, true, true);
    var request = CTS.$.getJSON(url);

    request.done(function(json) {
      var ret = [];
      for (var i = 0; i < json.feed.entry.length; i++) {
        var sheet = json.feed.entry[i];
        var title = CTS.Util.GSheet._parseGItem(sheet.title);
        var id = CTS.Util.GSheet._parseGItem(sheet.id);
        var spec = {
          title: title,
          id: id
        };
        var parts = spec.id.split('/');
        spec['key'] = parts[parts.length - 1];
        ret.push(spec);
      }
      deferred.resolve(ret);
    });
    request.fail(function(jqxhr, textStatus) {
      deferred.reject(textStatus);
    });

    return deferred.promise;
  },

  getWorksheets: function(key) {
    var deferred = Q.defer();
    var url = CTS.Util.GSheet._gSheetUrl('worksheets', key, null, 'private', 'full', null, true, true);
    var request = CTS.$.getJSON(url);
    request.done(function(json) {
      var ret = [];
      for (var i = 0; i < json.feed.entry.length; i++) {
        var worksheet = json.feed.entry[i];
        var spec = {
          kind: 'worksheet',
          title: CTS.Util.GSheet._parseGItem(worksheet.title),
          id: CTS.Util.GSheet._parseGItem(worksheet.id),
          colCount: parseInt(CTS.Util.GSheet._parseGItem(worksheet['gs$colCount'])),
          rowCount: parseInt(CTS.Util.GSheet._parseGItem(worksheet['gs$rowCount'])),
          updated: CTS.Util.GSheet._parseGItem(worksheet.updated)
        };
        var parts = spec.id.split('/');
        spec['wskey'] = parts[parts.length - 1];
        spec['sskey'] = key;
        ret.push(spec);
      }
      deferred.resolve(ret);
    });

    request.fail(function(jqxhr, textStatus) {
      deferred.reject([jqxhr, textStatus]);
    });

    return deferred.promise;
  },

  _parseGItem: function(item) {
    return item['$t'];
  },

  _getItemData: function(entry) {
    var data = {};
    for (var key in entry) {
      if ((key.length > 4) && (key.substring(0,4) == 'gsx$')) {
        var k = key.substring(4);
        data[k] = CTS.Util.GSheet._parseGItem(entry[key]);
      }
    }
    return data;
  },

  _getItemSpec: function(entry, sskey, wskey) {
    var itemSpec = {
      title: CTS.Util.GSheet._parseGItem(entry.title),
      id: CTS.Util.GSheet._parseGItem(entry.id),
      data: CTS.Util.GSheet._getItemData(entry),
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
    var deferred = Q.defer();
    var url = CTS.Util.GSheet._gSheetUrl('list', spreadsheetKey, worksheetKey, 'private', 'full', null, true, true);

    var request = CTS.$.getJSON(url);

    request.done(function(json) {
      var spec = {};
      spec.title = CTS.Util.GSheet._parseGItem(json.feed.title);
      spec.updated = CTS.Util.GSheet._parseGItem(json.feed.updated);
      spec.id = CTS.Util.GSheet._parseGItem(json.feed.id);
      spec.items = [];
      if (typeof json.feed.entry != 'undefined') {
        for (var i = 0; i < json.feed.entry.length; i++) {
          var itemSpec = CTS.Util.GSheet._getItemSpec(json.feed.entry[i]);
          spec.items.push(itemSpec);
        }
      }
      deferred.resolve(spec);
    });

    request.fail(function(jqxhr, textStatus) {
      CTS.Log.Error(jqxhr, textStatus);
      deferred.reject(textStatus);
    });

    return deferred.promise;
  },

  getCellFeed: function(spreadsheetKey, worksheetKey) {
    var deferred = Q.defer();
    var url = CTS.Util.GSheet._gSheetUrl('cells', spreadsheetKey, worksheetKey, 'private', 'full', null, true, true);

    var request = CTS.$.getJSON(url);

    request.done(function(json) {
      var spec = {};
      spec.title = CTS.Util.GSheet._parseGItem(json.feed.title);
      spec.updated = CTS.Util.GSheet._parseGItem(json.feed.updated);
      spec.id = CTS.Util.GSheet._parseGItem(json.feed.id);
      spec.rows = {};

      if (json.feed.entry) {
        for (var i = 0; i < json.feed.entry.length; i++) {
          var cell = CTS.Util.GSheet._parseGItem(json.feed.entry[i].title);
          var content = CTS.Util.GSheet._parseGItem(json.feed.entry[i].content);
          var letterIdx = 0;
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
            colNum: colNum
          };
        }
      }
      deferred.resolve(spec);
    });

    request.fail(function(jqxhr, textStatus) {
      CTS.Log.Error(jqxhr, textStatus);
      deferred.reject(textStatus);
    });

    return deferred.promise;
  },

  modifyCell: function(ssKey, wsKey, rowNum, colNum, value) {
    // The Google Docs API incorrectly responds to OPTIONS preflights, so
    // we are completely blocked from sending non-GET requests to it from
    // within the browser. For now we'll proxy via the CTS server. Ugh.
    var deferred = Q.defer();
    var request = CTS.$.ajax({
      url: '/api/gsheet/updatecell',
      type: 'POST',
      data: {
        rowNum: rowNum,
        colNum: colNum,
        ssKey: ssKey,
        wsKey: wsKey,
        value: value,
        token: this._currentToken.access_token
      }
    });
    request.done(function(json) {
      deferred.resolve(res);
    });
    request.fail(function(jqxhr, textStatus) {
      CTS.Log.Error(jqxhr, textStatus);
      deferred.reject(textStatus);
    });
    return deferred.promise;
  },

  modifyListItem: function(ssKey, wsKey, itemNode) {
    // The Google Docs API incorrectly responds to OPTIONS preflights, so
    // we are completely blocked from sending non-GET requests to it from
    // within the browser. For now we'll proxy via the CTS server. Ugh.
    var deferred = Q.defer();
    var properties = {};
    for (var i = 0; i < itemNode.children.length; i++) {
      var child = itemNode.children[i];
      properties[child.key] = child.value;
    }
    var data = {
      item: itemNode.getItemId(),
      properties: properties,
      ssKey: ssKey,
      wsKey: wsKey,
      token: this._currentToken.access_token,
      editLink: itemNode.spec.editLink
    };
    var request = CTS.$.ajax({
      url: '/api/gsheet/updatelistitem',
      type: 'POST',
      data: data
    });
    request.done(function(json) {
      CTS.Log.Info("Update Success!");
      deferred.resolve();
    });
    request.fail(function(jqxhr, textStatus) {
      CTS.Log.Info("Update Fail!");
      deferred.reject(textStatus);
    });
    return deferred.promise;
  },

  cloneListItem: function(ssKey, wsKey, itemNode) {
    // The Google Docs API incorrectly responds to OPTIONS preflights, so
    // we are completely blocked from sending non-GET requests to it from
    // within the browser. For now we'll proxy via the CTS server. Ugh.
    var deferred = Q.defer();

    var properties = {};
    for (var i = 0; i < itemNode.children.length; i++) {
      var child = itemNode.children[i];
      properties[child.key] = child.value;
      // XXX TEMPORARY FIX FOR BOOLEAN DEFAULTING!
      if ((child.value == true) || (child.value == "TRUE") || (child.value == "True") || (child.value == "true")) {
        properties[child.key] = false;
      }
    }
    var data = {
      properties: properties,
      ssKey: ssKey,
      wsKey: wsKey,
      token: this._currentToken.access_token
    };
    var request = CTS.$.ajax({
      url: '/api/gsheet/appendlistitem',
      type: 'POST',
      data: data,
      dataType: 'json'
    });
    request.done(function(json) {
      var itemSpec = CTS.Util.GSheet._getItemSpec(json.entry, ssKey, wsKey);
      deferred.resolve(itemSpec);
    });
    request.fail(function(jqxhr, textStatus) {
      CTS.Log.Error("Request Failed");
      deferred.reject(textStatus);
    });
    return deferred.promise;
  }
});

// Node
// --------------------------------------------------------------------------
//
// A Node represents a fragment of a tree which is annotated with CTS.
//
// Nodes are responsible for understanding how to behave when acted on
// by certain relations (in both directions). The differences between
// different types of trees (JSON, HTML, etc) are concealed at this level.
CTS.Node = {};

CTS.Node.Factory = {
  Html: function(node, tree, opts) {
    var deferred = Q.defer();
    var klass = CTS.Node.Html;

    if (! CTS.Fn.isUndefined(node.jquery)) {
      if (node.is('input')) {
        klass = CTS.Node.HtmlInput;
      }
    } else if (node instanceof Element) {
      if (node.nodeName == 'INPUT') {
        klass = CTS.Node.HtmlInput;
      }
    }

    var node = new klass(node, tree, opts);
    node.parseInlineRelationSpecs().then(
      function() {
        if (node == null) {
          CTS.Log.Error("Created NULL child");
        }
        deferred.resolve(node);
      },
      function(reason) {
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  }
};

CTS.Node.Base = {

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

  registerRelation: function(relation) {
    if (typeof this.relations == 'undefined') {
      this.relations = [];
    }
    if (! CTS.Fn.contains(this.relations, relation)) {
      this.relations.push(relation);
      this.on('ValueChanged', relation.handleEventFromNode, relation);
      this.on('ChildInserted', relation.handleEventFromNode, relation);
    }
  },

  unregisterRelation: function(relation) {
    this.off('ValueChanged', relation.handleEventFromNode, relation);
    this.off('ChildInserted', relation.handleEventFromNode, relation);
    this.relations = CTS.Fn.filter(this.relations,
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

  markRelationsAsForCreation: function(val, recurse) {
    var rs = this.getRelations();
    for (var i = 0; i < rs.length; i++) {
      rs[i].forCreationOnly(val);
    }
    if (recurse) {
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].markRelationsAsForCreation(val, recurse);
      }
    }
  },

  parseInlineRelationSpecs: function() {
    var deferred = Q.defer();
    var self = this;

    // Already added
    if (this.parsedInlineRelationSpecs === true) {
      CTS.Log.Warn("Not registering inline relations: have already done so.");
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

    CTS.Parser.parseInlineSpecs(specStr, self, self.tree.forrest, true).then(
      function(forrestSpecs) {
        Fn.each(forrestSpecs, function(forrestSpec) {
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
    var d = Q.defer();
    var self = this;
    this.parseInlineRelationSpecs().then(
      function() {
        Q.all(CTS.Fn.map(self.children, function(kid) {
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
    return CTS.Fn.union(this.getRelations(), CTS.Fn.flatten(
      CTS.Fn.map(this.getChildren(), function(kid) {
        return kid.getSubtreeRelations();
      }))
    );
    /*
       var deferred = Q.defer();

    this.getRelations().then(function(relations) {
      var kidPromises = CTS.Fn.map(this.getChildren(), function(kid) {
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
              CTS.Log.Error(result.reason);
              deferred.reject(result.reason);
            }
          });
          if (!rejected) {
            var allR = CTS.Fn.union(relations, CTS.Fn.flatten(kidRelations));
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

  destroy: function(destroyValueToo) {
    var gotIt = false;
    if (typeof destroyValueToo == 'undefined') {
      destroyValueToo = true;
    }
    if (this.parentNode) {
      for (var i = 0; i < this.parentNode.children.length; i++) {
        if (this.parentNode.children[i] == this) {
          CTS.Fn.arrDelete(this.parentNode.children, i, i);
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
    var deferred = Q.defer();

    if (this.children.length != 0) {
      CTS.Log.Fatal("Trying to realize children when already have some.", this);
      deferred.reject("Trying to realize when children > 0");
    }

    var self = this;
    var sc = this._subclass_realizeChildren();

    sc.then(
      function() {
        var promises = CTS.Fn.map(self.children, function(child) {
          return child.realizeChildren();
        });
        Q.all(promises).then(
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

  clone: function() {
    var deferred = Q.defer();
    var self = this;
    var p = this._subclass_beginClone();
    p.then(
      function(clone) {
        if (typeof clone == 'undefined') {
          CTS.Log.Fatal("Subclass did not clone itself when asked.");
          deferred.reject("Subclass did not clone itself when asked");
        } else {
          if (clone.relations.length > 0) {
            CTS.Log.Error("Clone shouldn't have relations yet, but does", clone);
          }
          // Note that we DON'T wire up any parent-child relationships
          // because that would result in more than just cloning the node
          // but also modifying other structures, such as the tree which
          // contained the source.
          self.recursivelyCloneRelations(clone);
          deferred.resolve(clone);
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
    CTS.Debugging.DumpStack();
    var r = this.getRelations();

    if (to.relations && (to.relations.length > 0)) {
      CTS.Log.Error("Clone relations to non-empty relation container. Blowing away");
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
        CTS.Log.Fatal("Clone failed");
      }
      var relationClone = r[i].clone(n1, n2);
    };

    for (var j = 0; j < this.getChildren().length; j++) {
      var myKid = this.children[j];
      var otherKid = to.children[j];
      if (typeof otherKid == 'undefined') {
        CTS.Log.Error("Cloned children out of sync with origin children.");
      }
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
        CTS.Log.Error("Root of tree has no provenance information");
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
    if (! Fn.isUndefined(node)) {
      this.provenance.node = node;
    }
  },

  _processIncoming: function() {
    // Do incoming nodes except graft
    var d = Q.defer();
    var self = this;
    var r = this.getRelations();
    self._processIncomingRelations(r, 'if-exist');
    self._processIncomingRelations(r, 'if-nexist');
    self._processIncomingRelations(r, 'is', false, true).then(function() {
      return self._processIncomingRelations(r, 'are', true, true)
    }).then(function() {
      return Q.all(CTS.Fn.map(self.getChildren(), function(child) {
        return child._processIncoming();
      }));
    }).then(function() {
      return self._processIncomingRelations(r, 'graft', true, true);
    }).then(function() {
      d.resolve();
    }, function(reason) {
      d.reject(reason);
    })
    return d.promise;
  },

  _processIncomingRelations: function(relations, name, once, defer) {
    if (defer) {
      promises = [];
    }
    for (var i = 0; i < relations.length; i++) {
      if (relations[i].name == name) {
        if (relations[i].node1.equals(this)) {
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
    if (defer) {
      return Q.all(promises);
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
    return true;
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
    if (typeof this._valueChangedListenerProxy == 'undefined') {
      this._valueChangedListenerProxy = CTS.$.proxy(this._subclass_valueChangedListener, this);
    }

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
      CTS.Log.Info("Maybe Throw Event from this=", this);
      CTS.Log.Info("evt is", evt);
      if (evt.ctsNode) {
        evt.newValue = evt.ctsNode.getValue();
        if (evt.eventName == 'ValueChanged') {
          // Maybe squash if we're in an echo chamber.
          if (this._lastValueChangedValue == evt.newValue) {
            // An echo! Stop it here.
            CTS.Log.Info("Suppressing event echo", this, evt);
            this._lastValueChangedValue = null;
            return;
          } else {
            this._lastValueChangedValue = evt.newValue;
            evt.sourceNode = this;
            evt.sourceTree = this.tree;
            this.trigger(evt.eventName, evt);
            this.tree.trigger(evt.eventName, evt); // Throw it for the tree, too.
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
    CTS.Log.Error("Event from relation", evt, fromRelation, this);
    var self = this;
    if (this.shouldReceiveEvents) {
      CTS.Log.Info("Should receive events!");
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
          CTS.Log.Info("Executing are relation toward me", this.value.html());
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
                      CTS.Log.Error(reason);
                    }
                  ).done();
                }
              )
            },
            function(reason) {
              CTS.Log.Error(reason);
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

CTS.Node.Abstract = function() {
  this.initializeNodeBase();
  this.value = null;
};

CTS.Fn.extend(CTS.Node.Abstract.prototype,
    CTS.Events,
    CTS.Node.Base, {

   _subclass_beginClone: function() {
     var d = Q.defer();
     var n = new CTS.Node.Abstract();
     n.setValue(this.getValue());
     var kidPromises = CTS.Fn.map(this.children, function(kid) {
       return kid.clone();
     });
     Q.all(kidPromises).then(
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
   }

});

CTS.NonExistantNode = new CTS.Node.Abstract();

CTS.Node.DomBase = {
  debugName: function() {
    return CTS.Fn.map(this.siblings, function(node) {
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
    return CTS.Util.getTreesheetLinks(this.value);
  },

  // Horrendously inefficient.
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    if (this.value.is(selector)) {
      if (typeof ret == 'undefined') {
        CTS.Log.Error("push");
      }
      ret.push(this);
    }
    for (var i = 0; i < this.children.length; i++) {
      if (this.children[i] == null) {
        CTS.Log.Error("Error: Child " + i + " of me is null (find:" + selector + ")", this);
      } else {
        if (typeof this.children[i] == 'undefined') {
          CTS.Log.Error("Undefined child");
        }
        this.children[i].find(selector, ret);
      }
    }
    return ret;
  },

  _subclass_beginClone_base: function($node, klass) {
    var d = Q.defer();
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
      CTS.Log.Error("Trying to clone CTS node that is out of sync with dom");
    }
    // We use THIS to set i
    var kidPromises = [];
    for (var i = 0; i < cloneKids.length; i++) {
      var $child = CTS.$(cloneKids[i]);
      kidPromises.push(this.children[i]._subclass_beginClone($child));
    }

    if (kidPromises.length == 0) {
      d.resolve(clone);
    } else {
      Q.all(kidPromises).then(
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
    ref = ref.replace(/\s+/g, "");
    if (ref.match(/[A-Za-z]+[0-9]+/)) {
      return ref;
    } else {
      ref = ref.toLowerCase();
      if (ref[0] == '.') {
        return ref;
      } else {
        return "." + ref;
      }
    }
  },

  _subclass_getInlineRelationSpecString: function() {
    if (this.value !== null) {
      var inline = this.value.attr('data-cts');
      if (inline) {
        return inline;
      } else {
        // Temporary spreadsheet case.
        inline = this.value.attr('stitch');
        if (inline) {
          if (inline.indexOf('rows') > -1) {
            if (this.value.is("form")) {
              return "this :graft sheet | items {createNew: true};";
            } else {
              console.log("this :are sheet | items;");
              return "this :are sheet | items;";
            }
          } else if (this.value.closest('form').length > 0) {
            return "sheet | " + this._fixSpreadSheetRef(inline) + " :is this;";
          } else {
            return "this :is sheet | " + this._fixSpreadSheetRef(inline) + ';';
          }
        } else {
          inline = this.value.attr('show-if');
          if (inline) {
            return "this :if-exist sheet | " + this._fixSpreadSheetRef(inline) + ';';
          } else {
            inline = this.value.attr('hide-if');
            if (inline) {
              return "this :if-nexist sheet | " + this._fixSpreadSheetRef(inline) + ';';
            }
          }
        }
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

// ### Constructor
CTS.Node.Html = function(node, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.kind = "HTML";
  this.value = CTS.Util.createJqueryNode(node);
  this.value.data('ctsnode', this);
  this.ctsId = Fn.uniqueId().toString();

  this.value.data('ctsid', this.ctsId);
  this.value.data('ctsnode', this);

  this.shouldReceiveEvents = true;
  this.shouldThrowEvents = true;

  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.Html.prototype, CTS.Node.Base, CTS.Events, CTS.Node.DomBase, {

   /*
    * Precondition: this.children.length == 0
    *
    * Realizes all children.
    */
   _subclass_realizeChildren: function() {
     // promise
     var deferred = Q.defer();

     this.children = [];

     // Map each child

     var self = this;
     var promises = CTS.Fn.map(this.value.children(), function(child) {
       var promise = CTS.Node.Factory.Html(child, self.tree, self.opts);
       return promise;
     });


     Q.all(promises).then(
       function(results) {
         self.children = results;
         for (var i = 0; i < self.children.length; i++) {
           var node = self.children[i];
           if ((typeof node == "undefined") || (node == null)) {
             CTS.Log.Error("Child is undefined or null!");
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
       CTS.Log.Error("[HTML Node] Afer index shouldn't be ", afterIndex);
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
     CTS.Node.Factory.Html(child, this.tree, this.opts).then(
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
             CTS.Log.Info("Running CTS Rules on new node");
             ctsChild._processIncoming().done();
           },
           function(reason) {
             CTS.Log.Error("Could not realize children of new CTS node", ctsChild);
           }
         ).done();
       },
       function(reason) {
         CTS.Log.Error("Could not convert new node to CTS node", child, reason);
       }
     ).done();
   },

   _subclass_beginClone: function($node) {
     return this._subclass_beginClone_base($node, CTS.Node.Html);
   },

  /************************************************************************
   **
   ** Required by Relation classes
   **
   ************************************************************************/

  getValue: function(opts) {
    if (Fn.isUndefined(opts) || Fn.isUndefined(opts.attribute)) {
      return this.value.html();
    } else {
      return this.value.attr(opts.attribute);
    }
  },

  setValue: function(value, opts) {
    if (Fn.isUndefined(opts) || Fn.isUndefined(opts.attribute)) {
      this.value.html("" + value);
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
    CTS.Log.Info("Change Occured", this, mrs);
    for (var j = 0; j < mrs.length; j++) {
      var mr = mrs[j];

      // Destroy the CTS accounting for any nodes that were removed.
      for (var i = 0; i < mr.removedNodes.length; i++) {
        var $removedNode = CTS.$(mr.removedNodes[i]);
        var $$rn = $removedNode.data('ctsNode');
        if ($$rn) {
            $$rn.destroy(false);
        }
      }

      for (var i = 0; i < mr.addedNodes.length; i++) {
        var $addedNode = CTS.$(mr.addedNodes[i]);
        this._maybeThrowDataEvent({
          eventName: "ValueChanged",
          node: $addedNode,
          ctsNode: $addedNode.data('ctsnode')
        });
      }

      if (mr.type == "characterData") {
        var textNode = mr.target;
        var $changedNode = CTS.$(textNode.parentElement);
        this._maybeThrowDataEvent({
          eventName: "ValueChanged",
          node: $changedNode,
          ctsNode: $changedNode.data('ctsnode')
        });
      }
    }

  }

});

// ### Constructor
CTS.Node.HtmlInput = function(node, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.kind = "HTMLInput";
  this.value = CTS.Util.createJqueryNode(node);
  this.value.data('ctsnode', this);
  this.ctsId = Fn.uniqueId().toString();
  this.value.data('ctsid', this.ctsId);
  this.value.data('ctsnode', this);

  this.subKind = "text";
  if (this.value.is('[type="checkbox"]')) {
    this.subKind = "checkbox";
  }

  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });

  this.toggleThrowDataEvents(true);
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.HtmlInput.prototype, CTS.Node.Base, CTS.Events, CTS.Node.DomBase, {

   /*
    * Precondition: this.children.length == 0
    *
    * Realizes all children.
    */
   _subclass_realizeChildren: function() {
     // An INPUT node shouldn't have children.
     var deferred = Q.defer();
     this.children = [];
     deferred.resolve(this.children);
     return deferred.promise;
   },

   _subclass_insertChild: function(child, afterIndex) {
     CTS.Log.Error("[HTML Input] Can't insert child!", this, child);
   },

   _onChildInserted: function(child) {
     CTS.Log.Error("[HTML Input] Node shouldn't have children", this, child);
   },

  _subclass_beginClone: function($node) {
    var d = Q.defer();
    this._subclass_beginClone_base($node, CTS.Node.HtmlInput).then(
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
    if (Fn.isUndefined(opts) || Fn.isUndefined(opts.attribute)) {
      if (this.subKind == "checkbox") {
        return this.value.prop("checked");
      } else {
        return this.value.val();
      }
    } else {
      return this.value.attr(opts.attribute);
    }
  },

  setValue: function(value, opts) {
    if (Fn.isUndefined(opts) || Fn.isUndefined(opts.attribute)) {
      if (this.subKind == "checkbox") {
        var checked = false;
        if (value) {
          checked = true;
        }
        if ((value == "false") || (value == "FALSE") || (value == "False") || (value == "0") || (value == 0)) {
          checked = false;
        }
        this.value.prop('checked', checked);
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

CTS.Node.GListFeedProperty = function(key, value, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.key = key;
  this.value = value;
  this.ctsId = Fn.uniqueId().toString();
  this.kind = 'GListFeedProperty';
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
  this.shouldReceiveEvents = true;
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GListFeedProperty.prototype, CTS.Node.Base, CTS.Events, {

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
     var deferred = Q.defer();
     this.children = [];
     deferred.resolve();
     return deferred.promise;
   },

   _subclass_insertChild: function(child, afterIndex) {
     CTS.Log.Error("insertChild called (impossibly) on GListFeedProperty Node");
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
     CTS.Log.Error("onChildInserted called (impossibly) on GListFeedProperty Node");
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
     var d = Q.defer();
     var value = this.value;
     var key = this.key;
     var clone = new CTS.Node.GWorkSheet(key, value, this.tree, this.opts);
     // there are no children, so no need to do anything there.
     d.resolve(clone);
     return d.promise;
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
    this.value = value;
    CTS.Log.Info("ItemProp setting to", value, "and asking item node to save.");
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

/** A Google Spreadsheets "List Feed" Property Node.
 *
 * The LIST FEED represents the view of a Work Sheet that google considers to
 * be a list items, each with key-value pairs. This node represents one of
 * those ITEMS.
 *
 */

CTS.Node.GListFeedItem = function(value, spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.value = value;
  this.spec = spec;
  this.ctsId = Fn.uniqueId().toString();
  this.kind = 'GListFeedItem';
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GListFeedItem.prototype, CTS.Node.Base, CTS.Events, {

  debugName: function() {
    return "GListFeedItem";
  },

  // Find alreays returns empty on a leaf.
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    // If any of the properties match.
    var found = 0;
    selector = selector.trim();
    if (selector[0] == ".") {
      selector = selector.slice(1);
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        if (selector == child.key) {
          found++;
          ret.push(child);
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
    if (typeof this.spec.wskey != 'undefined') {
      return this.spec.wskey;
    } else {
     return this.parentNode.getWorksheetKey();
   }
  },

  getSpreadsheetKey: function() {
    if (typeof this.spec.sskey != 'undefined') {
      return this.spec.sskey;
    } else {
      return this.parentNode.getSpreadsheetKey();
    }
  },

  _subclass_realizeChildren: function() {
     var deferred = Q.defer();
     this.children = [];
     for (var key in this.spec.data) {
       var value = this.spec.data[key];
       var child = new CTS.Node.GListFeedProperty(key, value, this.tree, this.opts);
       child.parentNode = this;
       this.children.push(child);
     }
     deferred.resolve();
     return deferred.promise;
   },

   _subclass_insertChild: function(child, afterIndex) {
     CTS.Log.Error("insertChild called (impossibly) on GListFeedItem");
   },

   /*
    */
   _onChildInserted: function(child) {
     CTS.Log.Error("onChildInserted called (impossibly) on GListFeedItem Node");
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
     var d = Q.defer();
     var value = this.value;
     CTS.Util.GSheet.cloneListItem(
       this.getSpreadsheetKey(), this.getWorksheetKey(), this).then(
         function(spec) {
           console.log("Got spec for new list feed item", spec);
           var clone = new CTS.Node.GListFeedItem(value, spec, this.tree, this.opts);
           console.log("Created new list feed item.");
           clone.realizeChildren().then(
             function() {
               console.log("Realized children");
               d.resolve(clone);
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

  _saveUpdates: function() {
    var sskey = this.getSpreadsheetKey();
    var wskey = this.getWorksheetKey();
    return CTS.Util.GSheet.modifyListItem(
      this.getSpreadsheetKey(),
      this.getWorksheetKey(),
      this);
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

/** A Google Spreadsheets "List Feed" Property Node.
 *
 * The LIST FEED represents the view of a Work Sheet that google considers to
 * be a list items, each with key-value pairs. This node represents one of
 * those ITEMS.
 */
CTS.Node.GListFeed = function(spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.ctsId = Fn.uniqueId().toString();
  this.kind = 'GListFeed';
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GListFeed.prototype, CTS.Node.Base, CTS.Events, {

  debugName: function() {
    return this.kind;
  },

  // Find alreays returns empty on a leaf.
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    // If any of the properties match.
    selector = selector.trim();
    if (selector[0] == ".") {
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        child.find(selector, ret);
      }
    }
    CTS.Log.Debug("GListFeed Finished Find");
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
     var deferred = Q.defer();
     this.children = [];
     var self = this;
     CTS.Util.GSheet.getListFeed(this.spec.sskey, this.spec.wskey).then(
       function(gdata) {
         CTS.Log.Debug("Got list feed worksheet", gdata);
         self.gdata = gdata;
         for (var i = 0; i < gdata.items.length; i++) {
           var item = gdata.items[i];
           var child = new CTS.Node.GListFeedItem(item.title, item, self.tree, self.opts);
           child.parentNode = self;
           self.children.push(child);
         }
         CTS.Log.Debug("Resolving Worksheet Kids");
         deferred.resolve();
       },
       function(reason) {
         CTS.Log.Warn("ListFeed Load Rejected", reason);
         deferred.reject(reason);
       }
     );
     return deferred.promise;
   },

   _subclass_insertChild: function(child, afterIndex) {
     // Sure, no problem.
     // TODO: What if the child has no spec? Then we have to actually insert it!
     // Right now, it's the GRAFT::CREATE that handles this!
     if (typeof child.spec.id == 'undefined') {
       CTS.Log.Fatal("Please fix: add to sheet.");
     }
   },

   /*
    */
   _onChildInserted: function(child) {
     CTS.Log.Error("onChildInserted called (impossibly) on GListFeed Node");
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
     var d = Q.defer();
     var value = this.value;
     // TODO: Need to generate a NEW id for insertion. And beginClone here
     // will neeed to be deferred!
     var spec = this.spec;
     var clone = new CTS.Node.GListFeedItem(value, spec, this.tree, this.opts);
     // there are no children, so no need to do anything there.
     d.resolve(clone);
     return d.promise;
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

/** A Google Spreadsheets "Cell Row" Node.
 *
 */

CTS.Node.GColumn = function(value, columns, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.value = value;
  this.columnNum = null;
  this.columns = columns;
  this.ctsId = Fn.uniqueId().toString();
  this.kind = 'GColumn';
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GColumn.prototype, CTS.Node.Base, CTS.Events, {

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
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }
    CTS.Log.Debug("Column asked to find selector", selector);
    // Incoming: a number
    selector = parseInt(selector);
    if (! isNaN(selector)) {
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].row == selector) {
          ret.push(this.children[i]);
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

  _subclass_realizeChildren: function() {
    CTS.Log.Debug("GColumn Realize Children");
     var deferred = Q.defer();
     this.children = [];
     for (var rowName in this.columns) {
       var cellValue = this.columns[rowName];
       CTS.Log.Debug("Realize Cell Value", this.value, rowName, cellValue);
       var child = new CTS.Node.GColumnCell(rowName, cellValue, this.tree, this.opts);
       child.parentNode = this;
       this.children.push(child);
     }
     deferred.resolve();
     return deferred.promise;
   },

   _subclass_insertChild: function(child, afterIndex) {
     CTS.Log.Error("insertChild called (impossibly) on GListFeedItem");
   },

   /*
    */
   _onChildInserted: function(child) {
     CTS.Log.Error("onChildInserted called (impossibly) on GListFeedItem Node");
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

/** A Google Spreadsheets "Cell Row" Node.
 *
 */

CTS.Node.GColumnCell = function(row, value, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.value = value.content;
  this.row = row;
  this.colNum = value.colNum;
  this.ctsId = Fn.uniqueId().toString();
  this.kind = 'GColumnCell';
  this.shouldReceiveEvents = true;
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GColumnCell.prototype, CTS.Node.Base, CTS.Events, {

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

  _subclass_realizeChildren: function() {
     // No kids!
     var deferred = Q.defer();
     this.children = [];
     deferred.resolve();
     return deferred.promise;
   },

   _subclass_insertChild: function(child, afterIndex) {
     CTS.Log.Error("insertChild called (impossibly) on GListFeedItem");
   },

   /*
    */
   _onChildInserted: function(child) {
     CTS.Log.Error("onChildInserted called (impossibly) on GListFeedItem Node");
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

  getIfExistValue: function() {
    return ((this.value != null) && (this.value != ""));
  },

  setValue: function(value, opts) {
    this.value = value;
    CTS.Log.Info("Column Cell setting to ", value, this);
    var promise = CTS.Util.GSheet.modifyCell(
      this.getSpreadsheetKey(),
      this.getWorksheetKey(),
      this.getRowNum(),
      this.getColNum(),
      value);
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

/** A Google Spreadsheets "List Feed" Property Node.
 *
 * The LIST FEED represents the view of a Work Sheet that google considers to
 * be a list items, each with key-value pairs. This node represents one of
 * those ITEMS.
 */
CTS.Node.GCellFeed = function(spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.ctsId = Fn.uniqueId().toString();
  this.kind = 'GCellFeed';
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GCellFeed.prototype, CTS.Node.Base, CTS.Events, {

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
  find: function(selector, ret) {
    if (typeof ret == 'undefined') {
      ret = [];
    }

    selector = selector.trim();
    CTS.Log.Debug("console ", selector);
    var letterIdx = 0;
    while (isNaN(parseInt(selector[letterIdx]))) {
      letterIdx++;
    }
    CTS.Log.Debug("Letter Index", letterIdx);
    var col = selector.slice(0, letterIdx);
    var row = parseInt(selector.slice(letterIdx));

    CTS.Log.Debug("Row", row, "Col", col);

    for (var i = 0; i < this.children.length; i++) {
      CTS.Log.Debug("Kid type", this.children[i].kind)
      if (this.children[i].kind == "GColumn") {
        CTS.Log.Debug("has value", this.children[i].value)
        if (this.children[i].value == col) {
          CTS.Log.Debug("Asking kid to find", row);
          this.children[i].find(row, ret);
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

  _subclass_realizeChildren: function() {
     var deferred = Q.defer();
     this.children = [];
     var self = this;
     CTS.Util.GSheet.getCellFeed(this.spec.sskey, this.spec.wskey).then(
       function(gdata) {
         CTS.Log.Debug("Got cell feed worksheet", gdata);
         self.gdata = gdata;

         for (var rowName in gdata.rows) {
           var columns = gdata.rows[rowName];
           var child = new CTS.Node.GColumn(rowName, columns, self.tree, self.opts);
           child.parentNode = self;
           self.children.push(child);
         }
         CTS.Log.Debug("Resolving Worksheet Kids");
         deferred.resolve();
       },
       function(reason) {
         CTS.Log.Warn("CellFeed Load Rejected", reason);
         deferred.reject(reason);
       }
     );
     return deferred.promise;
   },

   _subclass_insertChild: function(child, afterIndex) {
     CTS.Log.Error("insertChild called (impossibly) on GListFeedItem");
   },

   /*
    */
   _onChildInserted: function(child) {
     CTS.Log.Error("onChildInserted called (impossibly) on GListFeedItem Node");
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
     var d = Q.defer();
     var value = this.value;
     // TODO: Need to generate a NEW id for insertion. And beginClone here
     // will neeed to be deferred!
     var spec = this.spec;
     var clone = new CTS.Node.GListFeedItem(value, spec, this.tree, this.opts);
     // there are no children, so no need to do anything there.
     d.resolve(clone);
     return d.promise;
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

CTS.Node.GWorksheet = function(spec, tree, opts) {
  CTS.Log.Debug("GWorksheet Constructor");
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.kind = "GWorksheet";
  this.name = spec.title;
  this.value = null;
  this.ctsId = Fn.uniqueId().toString();
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GWorksheet.prototype, CTS.Node.Base, CTS.Events, {

  debugName: function() {
    return "GWorkSheet";
  },

  find: function(spec, ret) {
    CTS.Log.Debug("WS find", selector);
    if (typeof ret == 'undefined') {
      ret = [];
    }

    var selector;
    if (typeof spec == "string") {
      selector = spec;
    } else {
      selector = spec.selectorString;
    }

    if ((typeof selector == 'undefined') || (selector == null)) {
      return ret;
    }

    if (selector.trim() == "items") {
      CTS.Log.Debug("Worksheet interpreting find request as ITEM enumeration");
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].kind == "GListFeed") {
          ret.push(this.children[i]);
        }
      }
    } else if (selector.trim()[0] == ".") {
      CTS.Log.Debug("Worksheet interpreting find request as ITEM PROPERTY search");
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].kind == "GListFeed") {
          this.children[i].find(selector, ret);
        }
      }
    } else {
      CTS.Log.Debug("Worksheet interpreting find request as CELL query");
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].kind == "GCellFeed") {
          this.children[i].find(selector, ret);
        }
      }
    }
    CTS.Log.Debug("Finished WS Find", ret);
    return ret;
  },

  isDescendantOf: function(other) {
    if ((this.parentNode != null) && (other == this.parentNode)) {
      return true;
    }
    return false;
  },

  _subclass_realizeChildren: function() {
    CTS.Log.Debug("Worksheet realize kids", this.spec);
    var lf = new CTS.Node.GListFeed(this.spec, this.tree, this.opts);
    lf.parentNode = this;
    var cf = new CTS.Node.GCellFeed(this.spec, this.tree, this.opts);
    cf.parentNode = this;
    this.children = [lf, cf];
    var deferred = Q.defer();
    deferred.resolve();
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

CTS.Node.GSpreadsheet = function(spec, tree, opts) {
  opts = opts || {};
  this.initializeNodeBase(tree, opts);
  this.spec = spec;
  this.kind = "GSpreadsheet";
  this.value = null;
  this.ctsId = Fn.uniqueId().toString();
  this.on('received-is', function() {
    this.value.trigger('cts-received-is');
  });
};

// ### Instance Methods
CTS.Fn.extend(CTS.Node.GSpreadsheet.prototype, CTS.Node.Base, CTS.Events, {

  debugName: function() {
    return "GSpreadsheet";
  },

  find: function(spec, ret) {
    CTS.Log.Debug("SS find", spec);
    // Selector is spec.selectorString
    var selector;
    if (typeof spec == "string") {
      selector = spec;
    } else {
      selector = spec.selectorString;
    }

    if (typeof ret == 'undefined') {
      ret = [];
    }

    // Figure out which worksheets to pull from.
    var parts = selector.split("!");
    var union = this.children;
    var subselector = selector;
    if (parts.length > 1) {
      CTS.Log.Debug("Addressing a particular worksheet!");
      subselector = parts.slice(1).join("!");
      var worksheet = parts[0].trim();
      union = CTS.Fn.filter(this.children, function(kid) {
        return kid.name == worksheet;
      });
    }
    for (var i = 0; i < union.length; i++) {
      var kid = union[i];
      CTS.Log.Debug("Worksheet, please find ", subselector);
      var results = kid.find(subselector, ret);
    }
    CTS.Log.Debug("Finished SS Find", ret);

    return ret;
  },

  isDescendantOf: function(other) {
    false;
  },

  _subclass_realizeChildren: function() {
     var deferred = Q.defer();
     this.children = [];
     var self = this;
     CTS.Util.GSheet.getWorksheets(this.spec.sskey).then(
       function(gdata) {
         self.gdata = gdata;
         for (var i = 0; i < gdata.length; i++) {
           var item = gdata[i];
           var child = new CTS.Node.GWorksheet(item, self.tree, self.opts);
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
    this._forCreationOnly = false;
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

  forCreationOnly: function(val) {
    if (typeof val == 'undefined') {
      return this._forCreationOnly;
    } else if (val) {
      this._forCreationOnly = true;
      return true;
    } else {
      this._forCreationOnly = false;
      return false;
    }
  },

  handleEventFromNode: function(evt) {
    CTS.Log.Info("Got Event", this, evt);
    if (this._forCreationOnly) {
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

  optsFor: function(node) {
    var toRet = {};
    Fn.extend(toRet, this.defaultOpts);
    if (this.node1 === node) {
      if (this.spec && this.spec.selectionSpec1) {
        Fn.extend(toRet, this.spec.selectionSpec1.props);
      }
    } else if (this.node2 == node) {
      if (this.spec && this.spec.selectionSpec1) {
        Fn.extend(toRet, this.spec.selectionSpec2.props);
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
    return new CTS.Relation.Relation(from, to, this.spec);
  },

  signature: function() {
    return "<" + this.name + " " + CTS.Fn.map(this.opts, function(v, k) { return k + ":" + v}).join(";") + ">";
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
    console.log("iterables for ", node, iterables);
    return iterables;
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
  /*
   */
  execute: function(toward) {
    if (this._forCreationOnly) {
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
  isEmpty: function(node) {
    return (
      (node == CTS.NonExistantNode) ||
      (node == null) ||
      (! node.getIfExistValue())
    );
  },

  execute: function(toward) {
    if (this._forCreationOnly) {
      return;
    }

    var other = this.opposite(toward);
    var existed = false;
    if (this.isEmpty(other)) {
      alert("hiding" + toward.value.html());
      toward.hide();
      existed = false;
    } else {
      toward.unhide();
      existed = true;
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
  isEmpty: function(node) {
    return (
      (node == CTS.NonExistantNode) ||
      (node == null) ||
      (CTS.Fn.isUndefined(node)) ||
      (! node.getIfExistValue())
    );
  },

  execute: function(toward) {
    if (this._forCreationOnly) {
      return;
    }
    var other = this.opposite(toward);
    var existed = false;
    if (this.isEmpty(other)) {
      existed = false;
      toward.unhide();
    } else {
      existed = true;
      toward.hide();
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
    var self = this;
    // Create a new one.
    iterables[iterables.length - 1].clone().then(
      function(clone) {
        // Now set relations on to those coming to ME.
        var form = self.opposite(from);
        clone.pruneRelations(form);
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
    ).done();

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

// DOM Tree
// ==========================================================================
//
// ==========================================================================

var Tree = CTS.Tree = {};

CTS.Tree.Base = {
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
};

var TreeSpec = CTS.Tree.Spec = function(kind, opts) {
  this.kind = kind;
  // name, url, loadedFrom, fixLinks
  this.fixLinks = true;
  this.loadedFrom = null;
  this.name = null;
  this.url = null;
  CTS.Fn.extend(this, opts);
};

// Constructor
// -----------
CTS.Tree.Html = function(forrest, spec) {
  this.forrest = forrest;
  this.spec = spec;
  this.name = spec.name;
  this.root = null;
  this.nodeStash = [];
  this.insertionListener = null;
};

// Instance Methods
// ----------------
CTS.Fn.extend(CTS.Tree.Html.prototype, CTS.Tree.Base, CTS.Events, {
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

// Constructor
// -----------
CTS.Tree.GSpreadsheet = function(forrest, spec) {
  this.forrest = forrest;
  this.spec = spec;
  this.root = null;
  this.insertionListener = null;
};

// Instance Methods
// ----------------
CTS.Fn.extend(CTS.Tree.GSpreadsheet.prototype, CTS.Tree.Base, {
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
    console.log("add spec", forrestSpec);
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

    var tree1 = this.trees[s1.treeName];
    var tree2 = this.trees[s2.treeName];

    if (subtree && (subtree.tree != tree1) && (subtree.tree != tree2)) {
      // not relevant to us.
      return;
    }

    var nodes1 = tree1.nodesForSelectionSpec(s1);
    var nodes2 = tree2.nodesForSelectionSpec(s2);

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
                  CTS.Log.Error("Uh oh. Reached null parent.");
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
          var relation = new CTS.Relation.CreateFromSpec(node1, node2, spec);
          // This is necessary but I can't remember why. But it's necessary here.
          node1.realizedInlineRelationSpecs = true;
          node2.realizedInlineRelationSpecs = true;
          // Add the relation to the forrest
          if (typeof this.relations == 'undefined') {
           CTS.Log.Error("relations undefined");
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
  this.url = CTS.Util.fixRelativeUrl(this.url, this.loadedFrom);
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
      CTS.Log.Error("DependencySpec: Unsure how to load: ", this.kind, this.url);
    }
  } else {
    CTS.Log.Warn("DependencySpec: Not loading already loaded", this.kind, this.url);
  }
};

DependencySpec.prototype.unload = function() {
  if (this.loaded) {
    this.url = CTS.Util.fixRelativeUrl(this.url, this.loadedFrom);
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
    CTS.Log.Warn("Tried to unload DependencySpec that wasn't loaded", this);
  }
};

CTS.Factory = {
  Forrest: function(opts) {
    var deferred = Q.defer();
    var forrest = new CTS.Forrest(opts);
    forrest.initializeAsync().then(
      function() {
        deferred.resolve(forrest);
      },
      function(reason) {
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  },

  Tree: function(spec, forrest) {
    console.log('New tree', spec);
    if ((spec.url == null) && (spec.name = 'body')) {
      return CTS.Factory.TreeWithJquery(CTS.$('body'), forrest, spec);
    } if ((spec.kind == "GSheet" || spec.kind == 'gsheet')) {
      return CTS.Factory.GSpreadsheetTree(spec, forrest);
    } else if (typeof spec.url == "string") {
      var deferred = Q.defer();
      CTS.Util.fetchString(spec).then(
        function(content) {
          if ((spec.kind == 'HTML') || (spec.kind == 'html')) {
            var div = CTS.$("<div></div>");
            var nodes = CTS.$.parseHTML(content);
            var jqNodes = Fn.map(nodes, function(n) {
              return CTS.$(n);
            });
            div.append(jqNodes);
            if (spec.fixLinks) {
              CTS.Util.rewriteRelativeLinks(div, spec.url);
            }
            CTS.Factory.TreeWithJquery(div, forrest, spec).then(
              function(tree) {
                deferred.resolve(tree);
              },
              function(reason) {
                deferred.reject(reason);
              }
            );
          } else {
            deferred.reject("Don't know how to make Tree of kind: " + spec.kind);
          }
        },
        function(reason) {
          deferred.reject(reason);
        }
      );
      return deferred.promise;
    } else {
      return CTS.Factory.TreeWithJquery(spec.url, forrest, spec);
    }
  },

  TreeWithJquery: function(node, forrest, spec) {
    var deferred = Q.defer();
    var tree = new CTS.Tree.Html(forrest, spec);
    CTS.Node.Factory.Html(node, tree).then(
      function(ctsNode) {
        ctsNode.realizeChildren().then(
          function() {
            tree.setRoot(ctsNode);
            if (spec.receiveEvents) {
              CTS.Log.Info("New tree should receive events", spec);
              tree.toggleReceiveRelationEvents(true);
            }
            deferred.resolve(tree);
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

  GSpreadsheetTree: function(treespec, forrest) {
    var deferred = Q.defer();
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
    CTS.Log.Info("Trying to resolve GSheet Tree:", treespec.sskey);

    var tree = new CTS.Tree.GSpreadsheet(forrest, treespec);
    var ss = new CTS.Node.GSpreadsheet(treespec, tree);
    var ws = false;
    if (typeof treespec.worksheet != 'undefined') {
      ws = true;
    }

    CTS.Util.GSheet.maybeLogin().then(
      function() {
        CTS.Log.Info("GSheets Logged In");
        ss.realizeChildren().then(
          function() {
            if (ws) {
              CTS.Log.Info("Looking for worksheed named ", ws);
              var found = false;
              for (var i = 0; i < ss.children.length; i++) {
                var child = ss.children[i];
                if ((! found) && (child.name == treespec.worksheet)) {
                  tree.root = child;
                  found = true;
                  if (treespec.receiveEvents) {
                    tree.toggleReceiveRelationEvents(true);
                  }
                  deferred.resolve(tree);
                }
              }
              if (! found) {
                deferred.reject("Couldn't find worksheet named: " + treespec.worksheet);
              }
            } else {
              tree.root = ss;
              deferred.resolve(tree);
            }
          },
          function(reason) {
            console.log("couldn't realize");
            deferred.reject(reason);
          }
        );
      },
      function(reason) {
        CTS.Log.Error("Couldn't Login to Google Spreadsheets", reason);
        deferred.reject(reason);
      }
    );
    return deferred.promise;
  }
}

CTS.Parser = {
  /* Helper function which wraps parseForrestSpec. 
   *
   * Args:
   *   - spec: the spec to parse
   *   - kind: the format which encodes the spec
   *   - fromUrl: the url which loaded the spec
   */
  parse: function(spec, format, fromUrl) {
    if (typeof kind == 'undefined') {
      kind = 'string';
    }
    return CTS.Parser.parseForrestSpec(spec, format, fromUrl);
  },

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
  parseForrestSpec: function(spec, format, fromUrl) {
    if (format == 'json') {
      return CTS.Parser.Json.parseForrestSpec(spec, fromUrl);
    } else if (format == 'string') {
      return CTS.Parser.Cts.parseForrestSpec(spec, fromUrl);
    } else {
      var deferred = Q.defer();
      deferred.reject("I don't understand the CTS Format:" + format);
      return deferred.promise;
    }
  },


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
  parseInlineSpecs: function(spec, node, intoForrest, realizeTrees) {
    var tup = CTS.Parser._typeAndBodyForInline(spec);
    var kind = tup[0];
    var body = tup[1];
    
    if (kind == 'json') {
      return CTS.Parser.Json.parseInlineSpecs(body, node, intoForrest, realizeTrees);
    } else if (kind == 'string') {
      return CTS.Parser.Cts.parseInlineSpecs(body, node, intoForrest, realizeTrees);
    } else {
      var deferred = Q.defer();
      deferred.reject("I don't understand the CTS Format:" + kind);
      return deferred.promise;
    }
  },

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

  parseInlineSpecs: function(json, node, intoForrest) {
    var deferred = Q.defer();

    if (typeof json == 'string') {
      json = JSON.parse(json);
    }

    // Now we build a proper spec document around it.
    var relations = intoForrest.incorporateInlineJson(json, node);

    return deferred.promise;
  },

  parseForrestSpec: function(json) {
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
      s.inline = true;
      s.inlineObject = inlineNode;
    }
    return s;
  }

};

CTS.Parser.Cts = {

  parseInlineSpecs: function(str, node, intoForrest) {
    var deferred = Q.defer();
    // First parse out the spec. The user should be using "this" to refer
    // to the current node.

    CTS.Parser.Cts.parseForrestSpec(str).then(
      function(specs) {
        // We have to zip through here to find any instances of 'this' and replace
        // it with the tree that we're working with.
        var promises = Fn.map(specs, function(spec) {
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
            var deferred = new Q.defer();
            var error = "Null selector. Can not parseForrestSpec";
            CTS.Log.Error(error);
            defer.reject(error);
            return deferred.promise;

          } else {
            return intoForrest.addSpec(spec);
          }
        });

        Q.all(promises).then(
          // Specs here is ref to result from parseForrestSpec
          function() {
            deferred.resolve(specs);
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

  parseForrestSpec: function(str, fromLocation) {
    var deferred = Q.defer();
    var json = null;
    var remoteLoads = [];
    var self = this;

    try {
      json = CTS.Parser.CtsImpl.parse(str.trim());
    } catch (e) {
      CTS.Log.Error("Parser error: couldn't parse string", str, e);
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
          if (h.length > 2) {
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
            url = CTS.Util.fixRelativeUrl(url, fromLocation);
          }
          remoteLoads.push(
            CTS.Util.fetchString({url: url}).then(
              function(str) {
                return self.parseForrestSpec(str, url);
              }
            )
          );
        } else if (kind == 'js') {
          f.dependencySpecs.push(new DependencySpec('js', h[0]));
        } else {
          CTS.Log.Error("Don't know CTS header type:", kind);
        }
      }
    }
    f.relationSpecs = json.relations;
    forrestSpecs.push(f);

    Q.all(remoteLoads).then(
      function(moreSpecs) {
        // Results here contains MORE cts strings
        //var parsePromises = Fn.map(results, function(result) {
        //  return self.parseForrestSpec(result);
        //});
//        Q.all(parsePromises).then(
//          function(moreSpecs) {
            for (var i = 0; i < moreSpecs.length; i++) {
              for (var j = 0; j < moreSpecs[i].length; j++) {
                forrestSpecs.push(moreSpecs[i][j]);
              }
            }
            deferred.resolve(forrestSpecs);
//          },
//          function(reason) {
//            deferred.reject(reason);
//          }
//        );
      },
      function(reason) {
        deferred.reject(reason);
      }
    );
    return deferred.promise;
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
      if ((c == ' ') || (c == '\n') || (c == '\t') || (c == '\r')) {
        i++;
      } else if (c == "@") {
        tup = CTS.Parser.CtsImpl.AT(str, i+1);
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
    if (curly) {
      var optResults = CTS.Parser.CtsImpl.KV(str, curly+1);
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
    var tup = CTS.Parser.CtsImpl.SELECTOR(str, i, false);
    i = tup[0];
    var s1 = tup[1];

    tup = CTS.Parser.CtsImpl.RELATOR(str, i);
    i = tup[0];
    var r = tup[1][0];
    var kv = tup[1][1];

    var tup = CTS.Parser.CtsImpl.SELECTOR(str, i, true);
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
    var ret = {};
    while ((i < str.length) && (str[i] != '}')) {
      var t1 = CTS.Parser.CtsImpl.KEY(str, i);
      i = t1[0];
      var t2 = CTS.Parser.CtsImpl.VALUE(str, i);
      i = t2[0];
      ret[t1[1]] = t2[1];
    }
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
      var tup = CTS.Parser.CtsImpl.KV(str, i+1);
      i = tup[0];
      kv = tup[1];
    }
    return [i, [relator, kv]];
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
						escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //")
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

/*
 * Available options:
 *
 * - autoLoadSpecs (default: true) - Should we autload specs from
 *   script and link elements
 * - forrestSpecs - optional array of forrest specs to load
 *
 */

var Engine = CTS.Engine = function(opts, args) {
  var defaults;
  this.opts = opts || {};
  this.bootStage = "PreBoot";

  if (typeof this.opts.autoLoadSpecs == 'undefined') {
    this.opts.autoLoadSpecs = true;
  }

  this._booted = Q.defer();
  this.booted = this._booted.promise;

  // The main tree.
  this.forrest = null;
  this.initialize.apply(this, args);
};

// Instance Methods
// ----------------
CTS.Fn.extend(Engine.prototype, Events, {

  initialize: function() {
  },

  /**
   * Rendering picks a primary tree. For each node in the tree, we:
   *  1: Process any *incoming* relations for its subtree.
   *  2: Process any *outgoing* tempalte operations
   *  3:
   */
  render: function(opts) {
    var pt = this.forrest.getPrimaryTree();
    CTS.Log.Info("CTS::Engine::render called on Primary Tree");
    var options = CTS.Fn.extend({}, opts);
    pt.root._processIncoming().then(
      function() {
        CTS.Log.Info("CTS::Engine::render finished on Primary Tree");
      },
      function(reason) {
        CTS.Log.Error(reason);
      }
    ).done();
  },

  boot: function() {
    CTS.Log.Info("Engine: Starting Boot");
    this.bootStage = "Booting";
    var self = this;
    if (typeof self.booting != 'undefined') {
      CTS.Error("Already booted / booting");
    } else {
      self.booting = true;
    }
    self.bootStage = "Loading Forrest";
    self.loadForrest().then(function() {
      CTS.Log.Info("Engine: Loaded Forrest");
      self.bootStage = "Loading CTS";
      return self.loadCts();
    }).then(function() {
      CTS.Log.Info("Engine: Loaded CTS");
      self.bootStage = "Realizing Dependencies";
      return self.forrest.realizeDependencies();
    }).then(function() {
      CTS.Log.Info("Engine: Realized Dependencies");
      self.bootStage = "Realize Trees";
      return self.forrest.realizeTrees();
    }).then(function() {
      CTS.Log.Info("Engine: Realized Trees");
      self.bootStage = "Realize Relations";
      return Q.fcall(function() {
        self.forrest.realizeRelations()
      });
    }).then(function() {
      CTS.Log.Info("Engine: CTS Realized Relations. Starting Render.");
      self.bootStage = "Render";
      self.render.call(self);
      self.bootStage = "Finalizing Boot";
      self._booted.resolve();
      return Q.fcall(function() { return true; });
    }).fail(function(error) {
      CTS.Log.Error("Boot stage failed.", error);
      self._booted.reject(error);
    }).done();
    return self.booted;
  },

  loadForrest: function() {
    var self = this;
    if (typeof this.opts.forrest == 'undefined') {
      this.opts.forrest = {};
    }
    this.opts.forrest.engine = this;
    return CTS.Factory.Forrest(this.opts.forrest).then(
      function(forrest) {
        self.forrest = forrest;
        CTS.Log.Info("Engine: Resolved forrest.");
      }
    );
  },

  loadCts: function() {
    var promises = [];
    var self = this;

    // Possibly add specs from the OPTS hash passed to Engine.
    if ((typeof self.opts.forrestSpecs != 'undefined') && (self.opts.forrestSpecs.length > 0)) {
      promises.push(self.forrest.addSpecs(self.opts.forrestSpecs));
    }

    if ((typeof self.opts.autoLoadSpecs != 'undefined') && (self.opts.autoLoadSpecs === true)) {
      var links = CTS.Util.getTreesheetLinks();
      var ps = self.forrest.parseAndAddSpecsFromLinks(links);
      for (var i = 0; i < ps.length; i++) {
        promises.push(ps[i]);
      }
    }
    return Q.all(promises);
  },

  // Stops all event listeners
  shutdown: function() {
    this.forrest.stopListening();
  }

});

// Cascading Tree Sheets - Epilogue
// ==========================================================================
//
// Assumption:
//   This file is loaded AFTER all CTS Engine files have loaded.
//
CTS.registerNamespace('CTS.Epilogue');

// Set some status bits.
CTS.status._libraryLoaded = Q.defer();
CTS.status.libraryLoaded = CTS.loaded = CTS.status.loaded = CTS.status._libraryLoaded.promise;

CTS.status._defaultTreeReady = Q.defer();
CTS.ready = CTS.status.defaultTreeReady = CTS.status._defaultTreeReady.promise;

CTS.Epilogue.ensureJquery = function() {
  var deferred = Q.defer();
  if (typeof root.jQuery != 'undefined') {
    deferred.resolve(root.jQuery);
  } else if ((typeof exports !== 'undefined') && (typeof require == 'function')) {
    deferred.resolve(require('jquery'));
  } else {
    CTS.Util.loadJavascript(CTS.Constants.jQuery, function() {
      deferred.resolve(jQuery.noConflict());
    });
  }
  return deferred.promise;
}

CTS.Epilogue.maybeAutoload = function() {
  CTS.Log.Info("CTS Epilogue: Autoload check...");
  if (CTS.Util.shouldAutoload()) {
    CTS.$(function() {
      if (CTS.Constants.longstackSupport) {
        CTS.Q.longStackSupport = true;
      }
      CTS.engine = new CTS.Engine();
      CTS.engine.boot().then(
        function() {
          CTS.Util.showDocumentBody();
        }
      ).done();
    });
  }
};

CTS.Util.GSheet._loadGApi();

CTS.Epilogue.ensureJquery().then(
  function(jQuery) {
    CTS.$ = jQuery;
    CTS.Epilogue.maybeAutoload();
    CTS.status._libraryLoaded.resolve();
  },
  function(reason) {
  }
).done();

CTS.registerNamespace('CTS.Xtras.Color');

CTS.Xtras.Color = {
  RainbowColors: [
    "#FB0000",
    "#2AFF00",
    "#0000FF",
    "#FFFF00",
    "#FB0070",
    "#FC6C00",
    "#24FFFF",
    "#6800FF",
    "#76FF00",
    "#0063FF",
    "#F900FF",
    "#29FF58"
  ],

  ColorTree: function(tree) {
    var treeToColor = {};
    CTS.Xtras.Color.ColorTreeNode(tree.root, treeToColor, CTS.Xtras.Color.RainbowColors, 0);
  },

  ColorTreeNode: function(node, treeToColor, colorSet) {
    var p = node.getProvenance();
    if (p != null) {
      if (! Fn.isUndefined(p.tree)) {
        if (p.tree.name != null) {
          var color = "";
          if (Fn.isUndefined(treeToColor[p.tree.name])) {
            var nextColor = Fn.keys(treeToColor).length;
            if (nextColor >= colorSet.length) {
              CTS.Log.Error("Ran out of colors");
              color = '#'+Math.floor(Math.random()*16777215).toString(16);
            } else {
              treeToColor[p.tree.name] = colorSet[nextColor];
              color = treeToColor[p.tree.name];
              nextColor++;
            }
          } else {
            color = treeToColor[p.tree.name];
          }
          CTS.Xtras.Color.ColorNode(node, treeToColor[p.tree.name]);
        } else {
          CTS.Log.Error("ColorTreeNode: Tree name is null");
        }
      } else {
        CTS.Log.Error("ColorTreeNode: Tree is undefined");
      }
    } else {
        CTS.Log.Error("ColorTreeNode: Node has no provenance");
    }
  
    // Now color all the children.
    Fn.each(node.getChildren(), function(kid) {
      treeToColor = CTS.Xtras.Color.ColorTreeNode(kid, treeToColor, colorSet);
    });
  
    return treeToColor;
  },

  ColorNode: function(node, color) {
    if (node.kind == "HTML") {
      if (node.value == null) {
        CTS.Log.Error("Can't color node with null value");
      } else {
        var toWrap = node.value;
        if (toWrap.is("img")) {
          toWrap = CTS.$("<div></div>");
          node.value.wrap(toWrap);
        }
        toWrap.css('background-color', color);
        toWrap.css('color', color);
        toWrap.css('background-image', null);
        node.value.css('border', 'none');
        node.value.css('border-color', color);
        node.value.css('background-image', "");
        
      }
    } else {
      CTS.Log.Error("Not sure how to color node of type", node.kind);
    }
  }
};
