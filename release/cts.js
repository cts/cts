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


var RuleConstants = CTS.RuleConstants = {
  opts1Prefix: "<-",
  opts2Prefix: "->"
};

var Rule = CTS.Rule = function(selector1, selector2, name, opts) {
  this.selector1 = selector1;
  this.selector2 = selector2;
  this.name = name;
  this.opts = {};
  this.opts1 = {};
  this.opts2 = {};
  this.initialize(opts);
};

_.extend(Rule.prototype, {
  initialize: function(opts) {
    _.each(_.pairs(opts), function(pair) {
      var key;
      if (pair[0].indexOf(RelationConstants.opts1Prefix) === 0) {
        key = pair[0].substring(RuleConstants.opts1Prefix.length).trim();
        this.opts1[key] = pair[1];
      } else if (pair[0].indexOf(RelationConstants.opts2Prefix) === 0) {
        key = pair[0].substring(RuleConstants.opts2Prefix.length).trim();
        this.opts2[key] = pair[1];
      } else {
        this.opts[pair[0]] = pair[1];
      }
    });
  },

  addOption: function(key, value) {
    this.opts[key] = value;
  },

  head: function() {
    return this.selector1;
  },

  tail: function() {
    return this.selector2;
  }
});

var Selector = CTS.Selector = {
  toString: function() {
    return "<Selector {tree:" + this.treeName +
           ", type:" + this.treeType +
           ", selector:" + this.selector +
           ", variant:" + this.variant + "}>";
  },

  matches: function(node) {
    if (_.isUndefined(node._kind)) {
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
        selector = CTS.$.trim(_.join(pair, ""));
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

};


var DomSelector = CTS.DomSelector = function(selector) {
  this.treeName = null;
  this.treeType = null;
  this.originalString = null;
  this._selection = null;
  this.selector = selector;
  this.inline = false;
  this.inlineNode = null;
  this._kind = "dom";
};

_.extend(DomSelector.prototype, Selector, {


  toSelection: function(forrest) {
    console.log("DomSelector::toSelection", this.originalString);
    if (this.inline === true) {
      if (this.inlineNode === null) {
        return new CTS.Selection();
      } else {
        return new CTS.Selection([this.inlineNode]);
      }
    } else {
      if (this._selection === null) {
        // First time; compute.
        this._selection = forrest.selectionForSelector(this);
      }
      return this._selection;
    }
  }
});

var JsonSelector = CTS.JsonSelector = function(selector) {
  this.treeName = null;
  this.treeType = null;
  this.originalString = null;
  this._selection = null;
  this.selector = selector;
  this.inline = false;
  this.inlineNode = null;
  this._kind = "json";
};

_.extend(DomSelector.prototype, Selector, {
  toSelection: function(forrest) {
    console.log("DomSelector::toSelection", this.originalString);
    if (this.inline === true) {
      if (this.inlineNode === null) {
        return new CTS.Selection();
      } else {
        return new CTS.Selection([this.inlineNode]);
      }
    } else {
      if (this._selection === null) {
        // First time; compute.
        this._selection = forrest.selectionForSelector(this);
      }
      return this._selection;
    }
  }
});

// RuleParser
// ==========================================================================

/**
 *  To do:
 *
 *  SHEET := CONTEXT RULES | RULES ;
 *  CONTEXT := PROPERTY-BLOCK ;
 *  RULES := RULE RULES | RULE
 *  RULE := DECORATED-SELECTOR DECORATED-RELATION DECORATED-SELECTOR ;
 *  DECORATED-RELATION := RELATION | RELATION PROPERTY-BLOCK ;
 *  RELATION := is, are, recast, if-exist, if-exist ;
 *  PROPERTY-BLOCK := { KEY-VALUE-STATEMENTS }
 *  KEY-VALUE-STATEMENTS := KEY-VALUE | KEY-VALUE KEY-VALUE-STATEMENTS ;
 *  KEY-VALUE := string : string ; | string : "quoted-string" ;
 *  DECORATED-SELECTOR := SELECTOR | SELECTOR PROPERTY-BLOCK ;
 *  SELECTOR := string ;
 */

//CTS.LanguageSpec = {};
//
//CTS.LanguageSpec.Transitions = {
//  'SHEET': [['RULES']],
//  'RULES': [['RULE', 'RULES'], ['RULE']],
//  'RULE': [['DECORATED-SELECTOR', 'DECORATED-RELATION', 'DECORATED-SELECTOR']],
//  'DECORATED-RELATION': [['RELATION'], ['RELATION', 'PROPERTY-BLOCK']]
//};
//
//var Parser = CTS.Parser = {
//  isNonTerminal: function(string) {
//    return (typeof CTS.LanguageSpec.Transitions != 'undefined');
//  },
//
//  parse: function(string, state, accumulator, index, stack, pointer) {
//    if (CTS.Parser.isNonTerminal(state)) {
//    } else {
//      // We're building up a 
//    }
//  }
//}

var RuleParser = CTS.RuleParser = {
  incorporate: function(ruleMap, selector, block, inlineNode) {
    console.log("RuleParser::incorporate start");
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

        console.log("RuleParser::incorporate selector", selector, "key", key, "value", value);

        // Now add or accomodate the rule
        var selector1 = Selector.Create(selector);
        if (typeof inlineNode != 'undefined') {
          selector1.inline = true;
          selector1.inlineNode = inlineNode;
        }

        if (target.length > 0) {
          selector1.variant = target;
        }
        var selector1String = selector1.toString();

        console.log("RuleParser::incorporate selector1", selector1, selector1String);

        if (! _.contains(ruleMap, selector1String)) {
          // Ensure we know about this selector
          console.log("RuleParser::incorporate Creating slot for selector 1", selector1);
          ruleMap[selector1String] = {};
        }
        if (! _.contains(ruleMap[selector1String], name)) {
          console.log("RuleParser::incorporate Creating new rule for selector 1 :: name", selector1, name);
          ruleMap[selector1String][name] = new Rule(selector1, null, name, {});
        }

        if (variant.length === 0) {
          // We're setting selector 2
          var selector2 = Selector.Create(value);
          console.log("RuleParser::incorporate selector2", selector2, value);
          ruleMap[selector1String][name].selector2 = selector2;
        } else {
          // We're setting an option
          ruleMap[selector1String][name].addOption(variant, value);
        }

        console.log("RuleParser::incorporate Final after adding rule", ruleMap[selector1String][name]);
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
          console.log("RuleParser::Parse", r[i]);
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
    console.log("RuleParser::parse", ret);
    return ret;
  },

  parseInline: function(node, inlineCtsString) {
    var relations = {};
    this.incorporate(relations, "_inline_", inlineCtsString, node);
    var ret = [];
    _.each(_.values(relations), function(valueHash) {
      ret = _.union(ret, _.values(valueHash));
    });

    console.log("RuleParser::parseInline returning", ret);
    return ret;
  }

};

/* parser generated by jison 0.4.4 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"CTSText":3,"AnyString":4,"Rules":5,"Rule":6,"DecoratedSelectorA":7,"DecoratedRelation":8,"DecoratedSelectorB":9,";":10,"DecoratedSelector":11,"Relation":12,"PropertyBlock":13,"IS":14,"ARE":15,"GRAFT":16,"IFEXIST":17,"IFNEXIST":18,"{":19,"KeyValueStatements":20,"}":21,"KeyValue":22,"KEY":23,"Selector":24,"UNQUOTEDSTRING":25,"QUOTEDSTRING":26,"$accept":0,"$end":1},
terminals_: {2:"error",10:";",14:"IS",15:"ARE",16:"GRAFT",17:"IFEXIST",18:"IFNEXIST",19:"{",21:"}",23:"KEY",25:"UNQUOTEDSTRING",26:"QUOTEDSTRING"},
productions_: [0,[3,1],[5,2],[5,1],[6,4],[7,1],[9,1],[8,1],[8,2],[12,1],[12,1],[12,1],[12,1],[12,1],[13,3],[20,2],[20,1],[22,3],[11,1],[11,2],[24,1],[4,1],[4,1],[4,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
}
},
table: [{3:1,4:2,23:[1,3],25:[1,4],26:[1,5]},{1:[3]},{1:[2,1]},{1:[2,21]},{1:[2,22]},{1:[2,23]}],
defaultActions: {2:[2,1],3:[2,21],4:[2,22],5:[2,23]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
undefined/* generated by jison-lex 0.2.0 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            if (this.options.backtrack_lexer) {
                delete backup;
            }
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        if (this.options.backtrack_lexer) {
            delete backup;
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:return 25;
break;
case 1:yy_.yytext = yy_.yytext.substr(0, yy_.yytext.indexOf(':')); return 23;
break;
case 2:yy_.yytext = yy_.yytext.substr(1,yy_.yyleng-2); return 26;
break;
case 3:return 19
break;
case 4:return 21
break;
case 5:return 14
break;
case 6:return 15
break;
case 7:return 16
break;
case 8:return 17
break;
case 9:return 18
break;
case 10:return 10
break;
}
},
rules: [/^(?:(?:(\\)["bfnrt/(\\)]|(\\)(u[a-fA-F0-9]{4})|([^;(\s+is\s+)(\s+are\s+)(\s+graft\s+)(\s+if\-exist\s+)(\s+if\-nexist\s+)\{\}]))+)/,/^(?:([A-Za-z]+[A-Za-z0-9_-]*)(\s*:\s*))/,/^(?:"(?:(\\)["bfnrt/(\\)]|(\\)(u[a-fA-F0-9]{4})|([^"(\\)]))*")/,/^(?:\s*\{\s*)/,/^(?:\s*\}\s*)/,/^(?:(\s+is\s+))/,/^(?:(\s+are\s+))/,/^(?:(\s+graft\s+))/,/^(?:(\s+if\-exist\s+))/,/^(?:(\s+if\-nexist\s+))/,/^(?:(\s*;\s*))/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();
var Parser = CTS.Parser = parser;

// Node
// --------------------------------------------------------------------------
// 
// A Node represents a fragment of a tree which is annotated with CTS.
//
// Nodes are responsible for understanding how to behave when acted on
// by certain relations (in both directions). The differences between
// different types of trees (JSON, HTML, etc) are concealed at this level.

CTS.Node = {

  '_kind': 'undefined',

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
    this.on('FsmEntered:ProcessedIncoming', this._onProcessedIncoming, this);
    this.on('FsmEdge:FailedConditional', this._onFailedConditional, this);
    this.on('FsmEntered:Finished', this._onFinished, this);
  },

  render: function(opts) {
    console.log(this, "render");

    if (! _.isUndefined(opts)) {
      if (_.has(opts, 'callback')) {
        var scope = this;
        if (_.has(opts, 'callbackScope')) {
          scope = opts.callbackScope;
        }
        this.once('FsmEntered:Finished', opts.callback, scope);
      }
    }

    this.fsmTransition("BeginRender");
  },

  getChildren: function() {
    if (_.isUndefined(this.children) || _.isNull(this.children)) {
      this._createChildren();
    }
    return this.children;
  },

  registerRelation: function(relation) {
    if (! _.contains(this.relations, relation)) {
      this.relations.push(relation);
    }
  },

  getRelations: function() {
    if (! this.searchedForRelations) {
      if ((typeof this.tree != 'undefined') && (typeof this.tree.forrest != 'undefined')) {
        this.tree.forrest.registerRelationsForNode(this);
      }
      this.searchedForRelations = true;
    }
    return this.relations;
  },

  getSubtreeRelations: function() {
    return _.union(this.getRelations(), _.flatten(
      _.map(this.getChildren(), function(kid) {
        return kid.getSubtreeRelations();
      }))
    );
  },

  treeSize: function() {
    return 1 + this.getChildren().length;
  },

  subtreeRelations: function() {
    var relations = this.tree.forrest.relationsForNode(this);
    var myChildren = this.getChildren();
    for (var i = 0; i < myChildren.length; i++) {
      relations = _.union(relations, myChildren[i].subtreeRelations());
    }
    return relations;
  },

  getInlineRules: function() {
    return null;
  },

  _onBeginRender: function() {
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
        console.log("Performed is");
        // We did a value map, so move to Processed state.
        // TODO(eob): what if we want to interpret the value as cts-laden html?
        this.fsmTransition("ProcessedIncoming");
      } else if (this._performAre()) {
        this.fsmTransition("ProcessIncomingChildren");
      } else {
        this.fsmTransition("ProcessIncomingChildren");
      }
    }
  },

  _onProcessIncomingChildren: function() {
    console.log(this, "onProcessChildren");

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
    console.log("Trans to finish");
    this.fsmTransition("Finished");
  },

  _onFailedConditional: function() {
    this.failedConditional();
    this.fsmTransition("Finished");
  },

  _onFinished: function() {
  },

  _performConditional: function() {
    var relations = _.filter(this.relations, function(rule) {
      return (
        ((rule.name == "ifexist") || (rule.name == "ifnexist")) &&
         (rule.head().contains(this)));
    }, this);

    if (relations.length === 0) {
      // No conditionality restrictions
      return true;
    } else {
      return _.all(relations, function(rule) {
        var otherNodes = rule.tail().nodes;
        var exist = ((! _.isUndefined(otherNodes)) && (otherNodes.length > 0));
        return ((exist  && (rule.name == "ifexist")) ||
                ((!exist) && (rule.name == "ifnexist")));
      }, this);
    }
  },

  _performIs: function() {
    //console.log("Perform IS on", this, this.node.html(), this.relations);
    // If there is an incoming value node, handle it.
    // Just take the last one.
    var rule = null;
    _.each(this.relations, function(r) {
      console.log(r);
      if (r.name == "is") {
        console.log("is is!");
        if (r.head().contains(this)) {
          console.log("contains this!");
          console.log("Perform is");
          rule = r;
        }
      }
    }, this);

    if (rule) {
      console.log("Found IS rule");
      this.isIncoming(rule.tail());
      return true;
    } else {
      return false;
    }
  },

  _performAre: function() {
    var relation = null;
    _.each(this.relations, function(r) {
      if (r.name == "are") {
        console.log("FOUND AN ARE");
        if (r.head().contains(this)) {
          relation = r;
        }
      }
    }, this);

    if (relation) {
      // This aligns the cardinalities of the downstream trees.

      // Initialize some vars from this
      var thisSet = _.filter(this.getChildren(), function(child) { 
        return child.isEnumerable;
      });
      var thisCardinality = thisSet.length;
      if (thisCardinality.length == 0) {
        // Bail out: there's nothing to do.
        return;
      }

      // Initialize some vars from other
      var otherSelection = relation.tail();
      var otherSet = _.flatten(
        _.map(otherSelection.nodes, function(node) {
          return node.areOutgoing(relation, opts);
        })
      );
      var otherCardinality = otherSet.length;
      var otherKids = _.union(
          _.map(otherSelection.nodes, function(o) {
            o.getChildren()
      }));

      // 1. ALIGN CARDINALITY
      var diff = Math.abs(thisCardinality - otherCardinality);
      var i;
      if (thisCardinality > otherCardinality) {
        for (i = 0; i < diff; i++) {
          var excess = thisSet.pop();
          excess.destroy();
          console.log(thisSet);
        }
      } else if (thisCardinality < otherCardinality) {
        var toClone = thisSet[thisSet.length - 1];
        for (i = 0; i < diff; i++) {
          console.log("going to clone");
          thisSet[thisSet.length] = toClone.clone();
        }
      }

      // 2. SPLIT UP RELATIONS BETWEEN ALIGNED CHILDREN

      // First, collect all relations whose selections involve all and exactly the children
      // of both sides.
      var relations = [];
      var kids = this.getChildren();
      if (kids.length > 0) {
        var candidateRelations = kids[0].getSubtreeRelations();
        relations = _.filter(candidateRelations, function(r) {
          return (r.tail().matchesArray(otherKids, true, true) && 
            r.head().matchesArray(kids, true));
        });
      }

      // Relations is not the set of all relations that match
      // the CTS children of the two ARE nodes.

      // For each i, spawn a new relation, 

      return true;
    } else {
      return false;
    }
  }

};

// ### Constructor
var DomNode = CTS.DomNode = function(node, tree, opts, args) {
  var defaults;
  this._kind = 'dom'
  this.children = null;
  this.parentNode = null;
  this.relations = [];
  this.searchedForRelations = false;
  this.isSiblingGroup = false;
  this.isEnumerable = false;

  // A Node contains multiple DOM Nodes
  if (typeof node == 'object') {
    if (! _.isUndefined(node.jquery)) {
      CTS.Debugging.DumpStack();
      //console.log("SIBLINGS A", node);
      this.siblings = [node];
    } else if (node instanceof Array) {
      //console.log("SIBLINGS B", node);
      this.siblings = node;
    } else if (node instanceof Element) {
      //console.log("SIBLINGS C", node);
      this.siblings = [$(node)];
    } else {
      //console.log("SIBLINGS D", node);
      this.siblings = [];
    }
  } else if (typeof node == 'string') {
    //console.log("SIBLINGS E", node);
    this.siblings = _.map($(node), function(n) { return $(n); });
  } else {
    //console.log("SIBLINGS F", node);
    this.siblings = [];
  }

  if (this.siblings.length > 1) {
    this.isSiblingGroup = true;
  }
  this.opts = opts || {};

  this.tree = tree;
  if (typeof this.opts.relations != 'undefined') {
    this.relations = this.opts.relations;
  }
  this.initialize.apply(this, args);
};

// ### Instance Methods
_.extend(CTS.DomNode.prototype, CTS.Events, CTS.StateMachine, CTS.Node, {

  initialize: function(args) {
    this.initializeStateMachine();
  },

  destroy: function(opts) {
    // 1. Remove from parent in the shadow DOM
    // TODO: handle case of trying to unregister root.
    this.parentNode.unregisterChild(this);

    // 2. Remove nodes form DOM tree
    _.each(this.siblings, function(s) {
      s.remove();
    });
  },

  debugName: function() {
    return _.map(this.siblings, function(node) {
      return node[0].nodeName; }
    ).join(', ');
  },

  clone: function(opts) {
    console.log("SIBSIB", this.siblings);
    var n = _.map(this.siblings, function(s) {return s.clone();});
    // TODO(eob): any use in saving args to apply when cloned?
    var c = new DomNode(n, this.tree, [], this.opts);
    var relations = _.map(this.relations, function(relation) {
      var r = relation.clone();
      if (r.selection1.contains(this)) {
        r.selection1.nodes = _.without(r.selection1.nodes, this);
        r.selection1.nodes.push(c);
        _.each(r.selection2.nodes, function(node) {
          node.registerRelation(r);
        });
      } else if (r.selection2.contains(this)) {
        r.selection2.nodes = _.without(r.selection2.nodes, this);
        r.selection2.nodes.push(c);
        _.each(r.selection1.nodes, function(node) {
          node.registerRelation(r);
        });
      }
      return r;
    }, this);
    c.relations = relations;
    if ((typeof this.parentNode != 'undefined') && (this.parentNode !== null)) {
      this.parentNode.registerChild(c, {after: this, andInsert: true});
    }
    return c;
  },

  unregisterChild: function(child, opts) {
    this.children = _.without(this.children, child);
  },

  registerChild: function(child, opts) {
    console.log("registerChild", this, child);
    if (this.children === null) {
      // Danger: potential endless circular recursion
      // if this function and createChildren don't coordinate
      // properly.
      this._createChildren();
    }
    var didit = false;

    //TODO(eob): Handle case where there are no children.

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
          if ((typeof opts != 'undefined') && (typeof opts.andInsert != 'undefined') && (opts.andInsert === true)) {
            this.children[i].siblings[this.children[i].siblings.length - 1].after(child.siblings);
          }
          didit = true;
        }
      }
      // do it after an element
    } 
    
    if (! didit) {
      // do it at end as failback, or if no relative position specified
      console.log("FFFF", this.children);
      var lastChild = this.children[this.children.length - 1];
      console.log("Last Child", lastChild, this);
      this.children[this.children.length] = child;
      if ((typeof opts != 'undefined') && (typeof opts.andInsert != 'undefined') && (opts.andInsert === true)) {
        lastChild.siblings[lastChild.siblings.length - 1].after(child.siblings);
      }
      child.parentNode = this;
    }
  },

  getInlineRules: function() {
    if (this.isSiblingGroup === true) {
      return null;
    } else {
      var inline = this.siblings[0].attr('data-cts');
      console.log("SIBS", this.siblings[0], this.siblings[0].html(), this.siblings);
      if ((inline !== null) && (typeof inline != 'undefined')) {
        return inline;
      } else {
        return null;
      }
    }
  },

  _findChildIn: function(fringe) {
    // Start exploring the subtree, adding the first.
    while (fringe.length > 0) {
      var first = CTS.$(fringe.shift());
      var child = new DomNode(first, this.tree);
      var relevantRelations = child.getRelations();
      if (relevantRelations.length > 0) {
        console.log("RELATIONS OH MY", first, child, relevantRelations);
        child.relations = relevantRelations;
        this.registerChild(child);
      } else {
        fringe = _.union(fringe, first.children().toArray());
      }
    }
  },

  _createChildren: function() {
    console.log("DomNode::createChildren", this);
    this.children = []; 

    if (this.isSiblingGroup === true) {
      // If this is a sibling group, the children are the siblings.
      _.each(this.siblingGroup, function(node) {
        this.registerChild(node);
      }, this);
    } else {
      if (this.siblings.length > 1) {
        // If this isn't s sibling group, there should only be one node
        // represented by this node.
        CTS.Debugging.Fatal("Siblings > 1", this);
      } else {
        // We start off with all child DOM nodes 
        var domKids = this.siblings[0].children().toArray();

        // Now we figure out if there is an ARE relation, which
        // requires us to add all enumerables below us as a child.
        var areRelations = _.filter(this.getRelations(), function(relation) {
          return (relation.name == "are");
        }, this);

        if (areRelations.length > 1) {
          CTS.Debugging.Log.Fatal(
              "We don't know what to do with >1 ARE for a node yet.",
              this);
        } else if (areRelations.length > 0) {
          /*
           * Part 1:
           *  Add kids in the prefix
           */
          var fringe = [];
          var i = 0;
          var opts = areRelations[0].optsFor(this);
          for (i = 0; i < opts.prefix; i++) {
            fringe.push(domKids[i]);
          }
          this._findChildIn(fringe);

          /*
           * Part 2:
           *  Add the enumerables
           */
          var lastOne = 0;
          var terminal = (domKids.length - opts.suffix);
          for (i = opts.prefix; i < terminal; i += opts.step) {
            var newNodes = [];
            for (var j = 0; j < opts.step; j++) {
              newNodes.push(CTS.$(domKids[i+j]));
              lastOne = i+j;
            }
            console.log("New", newNodes);
            var newNode = new CTS.DomNode(newNodes, this.tree);
            newNode.isEnumerable = true;
            this.registerChild(newNode);
          }

          /*
           * Part 3:
           *  Add nodes in the suffix
           */
          lastOne += 1;
          fringe = [];
          for (i = lastOne; i < domKids.length; i++) {
            fringe.push(domKids[i]);
          }
          this._findChildIn(fringe);
        } else {
          /* The easy case: just look for CTS-related nodes in the subtree */
          this._findChildIn(this.siblings[0].children().toArray());
        }
      }
    }
    console.log("Create Children Returned: ", this.children);
  },

  failedConditional: function() {
    _.each(this.siblings, function(n) { n.hide(); });
  },

  /**
   * Replaces the value of this node with the value of the
   * other node provided.
   */
  isIncoming: function(otherNodeSelection, opts) {
    console.log("IS Incoming with otherNodes", otherNodeSelection);
    if (otherNodeSelection.nodes.length === 0) {
      _.each(this.siblings, function(s) { s.html(""); });
    } else {
      var html = _.map(otherNodeSelection.nodes, function(node) {
        return node.isOutgoing(opts);
      }).join("");
      _.each(this.siblings, function(s) { s.html(html); });
    }
  },

  /**
   * Provides the vilue of this node.
   */
  isOutgoing: function(opts) {
    return _.map(this.siblings, function(node) {
      return node.html();
    }).join("");
  },

  areIncoming: function(otherSelection, relation, opts) {
    // Note: all this prefix, sufix stuff should be handled
    // by the getChildren call.
    //var buckets = [];
    //var kid = this.node.children();
    //options = _.extend({
    //  prefix: 0,
    //  suffix: 0,
    //  step: 1
    //}, opts);

    //for (var i = 0; i < kid.length; i++) {
    //  if ((i >= options.prefix) && 
    //      (i < kid.length - options.suffix)) {
    //    // Create a new bucket at the start of a step
    //    if (((i - options.prefix) % options.prefix) == 0) {
    //      buckets[buckets.length] = [];
    //    }
    //    buckets[buckets.length - 1].append(kid[i]);
    //  }
    //}
    // Find the itemscoped children of this node.
    // var these = _.filter(this.node.children(), function(n) {
    //  return true;
    // }, this);
  },

  /**
   * Provides the itemscope'd nodes.
   */
  areOutgoing: function(relation, opts) {
    console.log("areOutgoing");
    var ret = _.filter(this.getChildren(), function(child) {
      return child.isEnumerable;
    });
    console.log("areOutgoing", ret);
    return ret;
  }

});

// ### Constructor
var JsonNode = CTS.JsonNode = function(obj, tree, opts, args) {
  var defaults;
  this._kind = 'json';
  this.dataType = null; // {set, object, property, string, boolean, number}
  this.value = null;
  this.tree = tree;
  this.opts = opts || {};
  this.initialize.apply(this, obj, args);
};
 
// ### Instance Methods
_.extend(CTS.JsonNode.prototype, CTS.Events, CTS.StateMachine, CTS.Node, {

  initialize: function(obj, args) {
    this.initializeStateMachine();
    this.children = [];

    // Recursively create all children
    if (_.isNull(obj)) {
      this.dataType = 'null';
      this.value = null;
    } else if (_.isUndefined(obj)) {
      this.dataType = 'null';
      this.value = null;
    } else if (_.isArray(obj)) {
      this.dataType = 'set';
      _.each(obj, function(item) {
        this.children.push(new JsonNode(item, this.tree, opts, args));
      }, this);
    } else if (_.isObject(obj)) {
      this.dataType = 'object';
      _.each(obj, function(val, key) {
        var kid = new JsonNode(null, this.tree, opts, args);
        kid.dataType = 'property';
        kid.value = key;
        kid.children = [new JsonNode(val, this.tree, opts, args)];
        this.children.push(kid);
      }, this);
    } else {
      this.dataType = typeof obj;
      this.value = obj;
    }
  },

  destroy: function(opts) {
    // TODO: handle case of trying to unregister root.
  },

  debugName: function() {
  },

  clone: function(opts) {
  },

  getInlineRules: function() {
    // A JSON Node can't have inline rules.
    return null;
  },

  toJSON: function() {
    if (this.dataType == 'set') {
      return _.map(this.children, function(kid) {
        return kid.toJSON();
      });
    } else if (this.dataType == 'object') {
      var ret = {};
      _.each(this.children, function(kid) {
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

  failedConditional: function() {
  },

  isIncoming: function(otherNodeSelection, opts) {
    if (otherNodeSelection.nodes.length === 0) {
      this.dataType = 'undefined';
      this.value = null;
      this.children = [];
    } else if (otherNodeSelection.nodes.length === 1) {
      this.value = otherNodeSelection.nodes[0].isOutgoing(opts);
      this.dataType = typeof this.value;
    } else {
      this.value = _.map(otherNodeSelection.nodes, function(n) {
        n.isOutgoing(opts)
      }, this).join("");
      this.dataType = typeof this.value;
    }
  },

  isOutgoing: function(opts) {
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

  areIncoming: function(otherSelection, relation, opts) {
  },

  areOutgoing: function(relation, opts) {
  }
});


/**
 * A Relation is a connection between two tree nodes.
 * Relations are the actual arcs between nodes.
 * Rules are the language which specify relations.
 *
 *
 */

var RelationOpts = CTS.RelationOpts = {
  prefix: 0,
  suffix: 0,
  step: 1
};

var Relation = CTS.Relation= function(selection1, selection2, name, opts, opts1, opts2) {
  this.selection1 = selection1;
  this.selection2 = selection2;
  this.name = name;
  this.opts = _.extend({}, opts);
  this.opts1 = _.extend(RelationOpts, opts1);
  this.opts2 = _.extend(RelationOpts, opts2);
};

_.extend(Relation.prototype, {

  addOption: function(key, value) {
    this.opts[key] = value;
  },

  head: function() {
    return this.selection1;
  },

  tail: function() {
    return this.selection2;
  },

  optsFor: function(node) {
    if (this.selection1.contains(node)) {
      return this.opts1;
    } else if (this.selection2.contains(node)) {
      return this.opts2;
    }
    return {};
  },

  clone: function() {
    return new CTS.Relation(
        this.selection1.clone(),
        this.selection2.clone(),
        this.name,
        this.opts,
        this.opts1,
        this.opts2);
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
    this.opts = _.extend(this.opts, opts);
  }
};

_.extend(Selection.prototype, {
  contains: function(node) {
    return _.contains(this.nodes, node);
  },

  clone: function() {
    // not a deep clone of the selection. we don't want duplicate nodes
    // running around.
    return new CTS.Selection(_.union([], this.nodes), this.opts);
  },

  matchesArray: function(arr, exactly, orArrayAncestor) {
    if (typeof backoffToAncestor == 'undefined') {
      backoffToAncestor = false;
    }

    for (var i = 0; i < this.nodes.length; i++) {
      if (! _.contains(arr, this.nodes[i])) {
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
  console.log("DomTree::constructor", forrest, node);
  this.root = node || new CTS.DomNode('body', this);
  this.forrest = forrest;
  this.name = "body";
  if ((typeof attributes != 'undefined') && ('name' in attributes)) {
    this.name = attributes.name;
  }
};

// Instance Methods
// ----------------
_.extend(DomTree.prototype, Tree, {
  selectionForSelector: function(selector) {
    // Assumption: root can't be a sibling group
    var jqnodes = this.root.siblings[0].find(selector.selector).toArray();
    var nodes = _.map(jqnodes, function(n) {
      return new DomNode(CTS.$(n), this);
    }, this);
    console.log("Tree", this, "nodes for selection", selector, nodes);
    return new CTS.Selection(nodes);
  }
});

var JsonTree = CTS.JsonTree = function(forrest, root, attributes) {
  this.root = new CTS.JsonNode(root, this);
  this.forrest = forrest;
  this.name = "json";
  if ((typeof attributes != 'undefined') && ('name' in attributes)) {
    this.name = attributes.name;
  }
};

// Instance Methods
// ----------------
_.extend(JsonTree.prototype, Tree, {

  // Creates the keypath leading up to this selector
  selectionForSelector: function(selector) {
    var jqnodes = this.root.siblings[0].find(selector.selector).toArray();
    var nodes = _.map(jqnodes, function(n) {
      return new DomNode(CTS.$(n), this);
    }, this);
    console.log("Tree", this, "nodes for selection", selector, nodes);
    return new CTS.Selection(nodes);
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

  selectionForSelector: function(selector) {
    console.log("Forrest::selectionForSelector trees", this.trees, "selector name", selector.treeName);
    // TODO(eob): The commented out line doesn't work.. but
    // I don't know why. That makes me worried.
    //if (_.contains(this.trees, selector.treeName)) {
    if (typeof this.trees[selector.treeName] != "undefined") {
      console.log("Forrest::SelectionForSelector --> Tree " + selector.treeName + " ::SelectionforSelector");
      return this.trees[selector.treeName].selectionForSelector(selector);
    } else {
      console.log("Nodes for selector bailing");
      return new CTS.Selection([]);
    }
  },

  getPrimaryTree: function() {
    return this.trees.body;
  },

  ingestRules: function(someRuleString) {
    var ruleSet = RuleParser.parse(someRuleString);
    this.addRules(ruleSet);
  },

  /* Adds the DOM as a local tree called `body` and the `window` variable as
   * a tree called window.
   */ 
  addDefaultTrees: function() {
    this.addTree('body', new CTS.DomTree(this));
    this.addTree('window', new CTS.JsonTree(this, window));
  },

  rulesForNode: function(node) {
    console.log("Forrest:::rulesForNode");
    var ret = [];
    _.each(this.rules, function(rule) {
      console.log("Forrest::rulesForNode Rule", rule, "for node", node);
      if ((rule.selector1.matches(node)) || 
          (rule.selector2.matches(node))) {
        ret[ret.length] = rule;
      } else {
        console.log("Failed match", rule.selector1.selector);
        console.log("Failed match", rule.selector2.selector);
      }
    }, this);

    var inlineRules = node.getInlineRules();
   
    if (inlineRules !== null) {
      var ruleSet = RuleParser.parseInline(node, inlineRules);
      if (typeof ruleSet != "undefined") {
        ret = _.union(ret, ruleSet);
      }
    }
    return ret;
  },

  registerRelationsForNode: function(node) {
    console.log("Forrest::RelationsForNode");
    var rules = this.rulesForNode(node);
    console.log("Rules for", node.siblings[0].html(), rules);
    var relations = _.map(rules, function(rule) {
      var selection1 = null;
      var selection2 = null;
      var selector = null;
      var other = null;
      if (rule.selector1.matches(node)) {
        selection1 = new CTS.Selection([node]);
        selection2 = rule.selector2.toSelection(this);
        other = selection2;
      } else {
        selection2 = new CTS.Selection([node]);
        selection1 = rule.selector1.toSelection(this);
        other = selection1;
      }
      var relation = new Relation(selection1, selection2, rule.name, rule.opts, rule.opts1, rule.opts2);
      node.registerRelation(relation);
      // Make sure that we wire up the relations,
      // since some might come in from inline.
      _.each(other.nodes, function(n) {
        n.registerRelation(relation);
      }, this);
    }, this);
    console.log("Returning Relations for", node.siblings[0].html(), relations);
    return relations;
  }

});

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
  render: function(opts) {
    var pt = this.forrest.getPrimaryTree();
    var options = _.extend({}, opts);
    pt.render(options);
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

CTS.Debugging = {
  DumpStack: function() {
    var e = new Error('dummy');
    var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
        .replace(/^\s+at\s+/gm, '')
        .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
        .split('\n');
    console.log(stack);
  },

  Error: function(message, extras) {
    console.log(message, extras);
  }
};

CTS.Debugging.Log = {
  Fatal: function(msg, obj) {
    alert(msg);
    console.log("FATAL", msg, obj);
  }
};



var TreeViz = CTS.Debugging.TreeViz = function(forrest) {
  this.forrest = forrest;
  this.init();
  this.finish();
};

_.extend(TreeViz.prototype, {

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

}).call(this);
