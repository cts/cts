
var __t;

__t = function(ns, expose) {
  var curr, index, part, parts, _i, _len;
  curr = null;
  parts = [].concat = ns.split(".");
  for (index = _i = 0, _len = parts.length; _i < _len; index = ++_i) {
    part = parts[index];
    if (curr === null) {
      curr = eval(part);
      if (expose != null) {
        expose[part] = curr;
      }
      continue;
    } else {
      if (curr[part] == null) {
        curr = curr[part] = {};
        if (expose != null) {
          expose[part] = curr;
        }
      } else {
        curr = curr[part];
      }
    }
  }
  return curr;
};

var CATS = {};

(function() {
  var $;

  $ = jQueryHcss;

  __t('CATS').Cascade = (function() {

    Cascade.name = 'Cascade';

    function Cascade() {}

    Cascade.blocks = {};

    Cascade.attachSheet = function(str) {
      var blks;
      blks = CATS.Parser.parseBlocks(str);
      console.log(Cascade.blocks);
      $.extend(Cascade.blocks, blks);
      return console.log(Cascade.blocks);
    };

    Cascade.sheetRulesForNode = function(node) {
      var hit, key, ret;
      ret = {};
      hit = false;
      for (key in Cascade.blocks) {
        if (node.is(key)) {
          hit = true;
          $.extend(ret, Cascade.blocks[key]);
        }
      }
      if (!hit) {
        return null;
      }
      return ret;
    };

    Cascade.inlineRulesForNode = function(node) {
      var block, data, hadSpecific, parsed, ret;
      ret = {};
      hadSpecific = false;
      if (node.data != null) {
        data = node.data();
        if (typeof data !== "undefined") {
          block = node.data()["bind"];
          if (typeof block !== "undefined") {
            hadSpecific = true;
            parsed = CATS.Parser.parseBlock(block);
            ret = $.extend(ret, parsed);
          }
        }
      }
      if (hadSpecific) {
        return ret;
      } else {
        return null;
      }
    };

    Cascade.rulesForNode = function(node) {
      var inlineRules, rules, sheetRules;
      sheetRules = Cascade.sheetRulesForNode(node);
      inlineRules = Cascade.inlineRulesForNode(node);
      if (sheetRules === null && inlineRules === null) {
        return null;
      }
      rules = {};
      if (sheetRules !== null) {
        $.extend(rules, sheetRules);
      }
      if (inlineRules !== null) {
        $.extend(rules, inlineRules);
      }
      return rules;
    };

    return Cascade;

  })();

  $ = jQueryHcss;

  __t('CATS.Commands').Attr = (function() {

    Attr.name = 'Attr';

    function Attr() {}

    Attr.prototype.signature = function() {
      return "attr";
    };

    Attr.prototype.applyTo = function(node, context, args, engine) {
      var attr, keypath, value;
      attr = args[0];
      keypath = args[1];
      value = context.resolve(keypath);
      node.attr(attr, value);
      return [true, true];
    };

    Attr.prototype.recoverData = function(node, context, args, engine) {
      var attr, keypath, value;
      attr = args[0];
      keypath = args[1];
      value = node.attr(attr);
      context.set(keypath, value);
      return [true, true];
    };

    Attr.prototype.recoverTemplate = function(node, context) {
      return node.clone();
    };

    return Attr;

  })();

  $ = jQueryHcss;

  __t('CATS.Commands').Data = (function() {

    Data.name = 'Data';

    function Data() {}

    Data.prototype.signature = function() {
      return "data";
    };

    Data.prototype.applyTo = function(node, context, args, engine) {
      engine._recoverData(node, context);
      return [true, true];
    };

    Data.prototype.recoverData = function(node, context, args, engine) {
      return [true, true];
    };

    Data.prototype.recoverTemplate = function(node, context) {
      return node.clone();
    };

    return Data;

  })();

  $ = jQueryHcss;

  __t('CATS.Commands').IfExist = (function() {

    IfExist.name = 'IfExist';

    function IfExist() {}

    IfExist.prototype.signature = function() {
      return "if-exist";
    };

    IfExist.prototype.applyTo = function(node, context, args, engine) {
      var data, value;
      value = context.resolve(args[0]);
      if (value === null) {
        CATS.Util.hideNode(node);
        return [false, false];
      } else {
        CATS.Util.showNode(node);
        data = {};
        data[args[0]] = value;
        CATS.Util.stashData(node, this.signature(), data);
        return [true, true];
      }
    };

    IfExist.prototype.recoverData = function(node, context, args, engine) {
      var data, k, v;
      if (CATS.Util.nodeHidden(node)) {
        return [false, false];
      }
      data = CATS.Util.getDataStash(node, this.signature());
      for (k in data) {
        v = data[k];
        context.set(k, v);
      }
      return [true, true];
    };

    IfExist.prototype.recoverTemplate = function(node, context) {
      return node.clone();
    };

    return IfExist;

  })();

  $ = jQueryHcss;

  __t('CATS.Commands').IfNExist = (function() {

    IfNExist.name = 'IfNExist';

    function IfNExist() {}

    IfNExist.prototype.signature = function() {
      return "if-nexist";
    };

    IfNExist.prototype.applyTo = function(node, context, args, engine) {
      var data, value;
      value = context.resolve(args[0]);
      if (value !== null) {
        CATS.Util.hideNode(node);
        data = {};
        data[args[0]] = value;
        CATS.Util.stashData(node, this.signature(), data);
        return [false, false];
      } else {
        CATS.Util.showNode(node);
        return [true, true];
      }
    };

    IfNExist.prototype.recoverData = function(node, context, args, engine) {
      var data, k, v;
      if (CATS.Util.nodeHidden(node)) {
        data = CATS.Util.getDataStash(node, this.signature());
        for (k in data) {
          v = data[k];
          context.set(k, v);
        }
        return [false, false];
      } else {
        return [true, true];
      }
    };

    IfNExist.prototype.recoverTemplate = function(node, context) {
      return node.clone();
    };

    return IfNExist;

  })();

  $ = jQueryHcss;

  __t('CATS.Commands').RepeatInner = (function() {

    RepeatInner.name = 'RepeatInner';

    function RepeatInner() {}

    RepeatInner.prototype.signature = function() {
      return "repeat-inner";
    };

    RepeatInner.prototype.applyTo = function(node, context, args, engine) {
      var collection, elem, kp, n, newNode, template, templateHtml, zeroIndex, _i, _len,
        _this = this;
      n = 1;
      kp = args[0];
      if (args.length === 2) {
        n = parseInt(args[0]);
        kp = args[1];
      }
      collection = context.resolve(kp);
      template = [];
      $.each(node.children(), function(idx, child) {
        if (idx < n) {
          return template.push($(child));
        } else {
          return $(child).remove();
        }
      });
      if (collection.length === 0) {
        CATS.Util.hideNode(template);
      } else {
        templateHtml = node.html();
        node.html("");
        zeroIndex = 0;
        for (_i = 0, _len = collection.length; _i < _len; _i++) {
          elem = collection[_i];
          context.setZeroIndex(zeroIndex);
          newNode = $(templateHtml);
          context.push(elem);
          node.append(newNode);
          console.log("repeat-inner rending");
          console.log(newNode);
          engine._render(newNode, context);
          context.pop();
          zeroIndex += 1;
        }
      }
      context.setZeroIndex(0);
      return [false, false];
    };

    RepeatInner.prototype.recoverData = function(node, context, args, engine) {
      var addIterable, firstPush, kp, n,
        _this = this;
      n = 1;
      kp = args[0];
      if (args.length === 2) {
        n = parseInt(args[0]);
        kp = args[1];
      }
      context.set(kp, []);
      context.pushKeypath(kp);
      addIterable = function(c) {
        var iterable;
        console.log("Adding Iterable");
        iterable = c.pop();
        console.log(iterable);
        c.head().push(iterable);
        return console.log("Container is  is: " + JSON.stringify(c.head()));
      };
      firstPush = true;
      $.each(node.children(), function(idx, child) {
        console.log("Head on iteration " + idx + " is: " + JSON.stringify(context.head()));
        if (firstPush) {
          firstPush = false;
          context.push({});
        }
        if ((idx % n === 0) && (idx !== 0)) {
          addIterable(context);
          context.push({});
        }
        return engine._recoverData($(child), context);
      });
      addIterable(context);
      context.pop();
      return [false, false];
    };

    RepeatInner.prototype.recoverTemplate = function(node, context) {
      return [false, false];
    };

    return RepeatInner;

  })();

  $ = jQueryHcss;

  __t('CATS.Commands').Template = (function() {

    Template.name = 'Template';

    function Template() {}

    Template.prototype.signature = function() {
      return "template";
    };

    Template.prototype.applyTo = function(node, context, args, engine) {
      var template, templateRef;
      templateRef = args[0];
      template = this.fetchTemplate(templateRef);
      return this._applyTo(node, context, args, engine, template);
    };

    Template.prototype.fetchTemplate = function(ref) {
      return $(ref).html();
    };

    Template.prototype._applyTo = function(node, context, args, engine, template) {
      console.log(node.parent().html());
      node.html(template);
      console.log("Just resplaced TEMPLATE of node");
      console.log(node.html());
      console.log(node.parent().html());
      return [true, true];
    };

    Template.prototype.recoverData = function(node, context, args, engine) {
      return [true, true];
    };

    Template.prototype.recoverTemplate = function(node, context) {
      return node.clone();
    };

    return Template;

  })();

  $ = jQueryHcss;

  __t('CATS.Commands').Value = (function() {

    Value.name = 'Value';

    function Value() {}

    Value.prototype.signature = function() {
      return "value";
    };

    Value.prototype.applyTo = function(node, context, args, engine) {
      var value;
      value = context.resolve(args[0]);
      node.html(value);
      if (engine.opts.DyeNodes) {
        node.addClass(CATS.Options.ClassForValueNode);
      }
      return [false, false];
    };

    Value.prototype.recoverData = function(node, context, args, engine) {
      var value;
      value = node.html();
      context.set(args[0], value);
      return [false, false];
    };

    Value.prototype.recoverTemplate = function(node, context) {
      return node.clone();
    };

    return Value;

  })();

  $ = jQueryHcss;

  __t('CATS.Commands').With = (function() {

    With.name = 'With';

    function With() {}

    With.prototype.signature = function() {
      return "with";
    };

    With.prototype.applyTo = function(node, context, args, engine) {
      context.pushKeypath(args[0]);
      return [true, true];
    };

    With.prototype.recoverData = function(node, context, args, engine) {
      context.set(args[0], {});
      context.pushKeypath(args[0]);
      return [true, true];
    };

    With.prototype.recoverTemplate = function(node, context) {
      return node.clone();
    };

    return With;

  })();

  $ = jQueryHcss;

  __t('CATS').Context = (function() {

    Context.name = 'Context';

    function Context(data) {
      this.aliases = {};
      if (data != null) {
        this.stack = [data];
      } else {
        this.stack = [{}];
      }
      this.contextVars = {};
    }

    Context.prototype.head = function() {
      return this.stack[this.stack.length - 1];
    };

    Context.prototype.tail = function() {
      return this.stack[0];
    };

    Context.prototype.push = function(data) {
      return this.stack.push(data);
    };

    Context.prototype.pushKeypath = function(keypath) {
      var obj;
      obj = this.resolve(keypath);
      return this.push(obj);
    };

    Context.prototype.pop = function(data) {
      return this.stack.pop();
    };

    Context.prototype.alias = function(dataKeypath, aliasedKeypath) {
      var value;
      value = this.resolve(dataKeypath);
      return this._setKeypath(aliasedKeypath, value, this.aliases);
    };

    Context.prototype.setZeroIndex = function(idx) {
      this.contextVars['zeroIndex'] = idx;
      return this.contextVars['oneIndex'] = idx + 1;
    };

    Context.prototype.resolve = function(keypath) {
      var kp, tryAliases;
      kp = keypath.replace(/^\s+/g, "");
      if (kp === '.') {
        return this.stack[this.stack.length - 1];
      } else {
        tryAliases = true;
        if (kp[0] === '.') {
          tryAliases = false;
          kp = kp.slice(1, (kp.length - 1) + 1 || 9e9);
        } else if (kp[0] === '$') {
          kp = kp.slice(1, (kp.length - 1) + 1 || 9e9);
          return this._resolveContextVar(kp);
        }
        kp = this._parseKeyPath(kp);
        return this._resolveParsedKeypath(kp, tryAliases);
      }
    };

    Context.prototype.set = function(keypath, value) {
      console.log("SET " + keypath + " to " + value);
      if (keypath === ".") {
        return this.stack[this.stack.length - 1] = value;
      } else {
        return this._setKeypath(keypath, value, this.stack[this.stack.length - 1]);
      }
    };

    Context.prototype._parseKeyPath = function(kp) {
      return kp.split(".");
    };

    Context.prototype._resolveContextVar = function(kp) {
      if (kp in this.contextVars) {
        return this.contextVars[kp];
      } else {
        return null;
      }
    };

    Context.prototype._resolveParsedKeypath = function(kp, tryAliases) {
      var attempt;
      if (tryAliases) {
        attempt = this._resolveParsedKeypathAgainst(kp, this.aliases);
        if (attempt !== null) {
          return attempt;
        }
      }
      attempt = this._resolveParsedKeypathAgainst(kp, this.stack[this.stack.length - 1]);
      return attempt;
    };

    Context.prototype._resolveParsedKeypathAgainst = function(kp, obj) {
      var key, ptr, _i, _len;
      if (obj === null) {
        return null;
      }
      ptr = obj;
      for (_i = 0, _len = kp.length; _i < _len; _i++) {
        key = kp[_i];
        if (typeof ptr === "object" && key in ptr) {
          ptr = ptr[key];
        } else {
          return null;
        }
      }
      return ptr;
    };

    Context.prototype._setKeypath = function(kp, value, inObject) {
      var key, last, ptr, _i, _len;
      kp = kp.replace(/^\s+/g, "");
      kp = this._parseKeyPath(kp);
      ptr = inObject;
      last = kp.pop();
      for (_i = 0, _len = kp.length; _i < _len; _i++) {
        key = kp[_i];
        if (key in ptr) {
          if (typeof ptr[key] === 'object') {
            ptr = ptr[key];
          } else {
            ptr[key] = {};
            ptr = ptr[key];
          }
        } else {
          ptr[key] = {};
          ptr = ptr[key];
        }
      }
      return ptr[last] = value;
    };

    return Context;

  })();

  $ = jQueryHcss;

  __t('CATS').Engine = (function() {

    Engine.name = 'Engine';

    function Engine(options) {
      this.opts = $.extend({}, CATS.Options.Default(), options);
      this.commands = [];
      this._loadBasicCommandSet();
    }

    Engine.prototype.render = function(node, data) {
      var context;
      node = node || $('html');
      data = data || window;
      context = new CATS.Context(data);
      return this._render(node, context);
    };

    Engine.prototype.recoverData = function(node) {
      var context,
        _this = this;
      node = node || $('html');
      context = new CATS.Context({});
      $.each(node, function(i, e) {
        return _this._recoverData($(e), context);
      });
      return context.tail();
    };

    Engine.prototype._render = function(jqnode, context) {
      var _this = this;
      return $.each(jqnode, function(i, node) {
        var cats, command, kid, recurse, res, _i, _j, _len, _len1, _ref, _ref1, _results;
        node = $(node);
        recurse = true;
        cats = CATS.Cascade.rulesForNode(node);
        if (cats !== null) {
          _ref = _this.commands;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            command = _ref[_i];
            if (command.signature() in cats) {
              res = command.applyTo(node, context, cats[command.signature()], _this);
              recurse = recurse && res[1];
              if (!res[0]) {
                break;
              }
            }
          }
        }
        if (recurse) {
          _ref1 = node.children();
          _results = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            kid = _ref1[_j];
            _results.push(_this._render($(kid), context));
          }
          return _results;
        }
      });
    };

    Engine.prototype._recoverData = function(node, context) {
      var cats, command, kid, recurse, res, _i, _j, _len, _len1, _ref, _ref1, _results;
      recurse = true;
      cats = CATS.Cascade.rulesForNode(node);
      if (cats !== null) {
        _ref = this.commands;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          command = _ref[_i];
          if (command.signature() in cats) {
            res = command.recoverData(node, context, cats[command.signature()], this);
            recurse = recurse && res[1];
            if (!res[0]) {
              break;
            }
          }
        }
      }
      if (recurse) {
        _ref1 = node.children();
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          kid = _ref1[_j];
          _results.push(this._recoverData($(kid), context));
        }
        return _results;
      }
    };

    Engine.prototype._loadBasicCommandSet = function() {
      this._addCommand(new CATS.Commands.With());
      this._addCommand(new CATS.Commands.Data());
      this._addCommand(new CATS.Commands.IfExist());
      this._addCommand(new CATS.Commands.IfNExist());
      this._addCommand(new CATS.Commands.Attr());
      this._addCommand(new CATS.Commands.Template());
      this._addCommand(new CATS.Commands.RepeatInner());
      return this._addCommand(new CATS.Commands.Value());
    };

    Engine.prototype._addCommand = function(command) {
      return this.commands.push(command);
    };

    return Engine;

  })();

  __t('CATS').Options = (function() {

    Options.name = 'Options';

    function Options() {}

    Options.Default = function() {};

    Options.AttrForSavedData = "catsdatastash";

    Options.ClassForValueNode = "cats-DataValueNode";

    Options.ClassForInvisible = "cats-InsivibleNode";

    Options.DyeNodes = true;

    return Options;

  })();

  $ = jQueryHcss;

  __t('CATS').Parser = (function() {

    Parser.name = 'Parser';

    function Parser() {}

    Parser.parseBlocks = function(blocks) {
      var block, chunk, chunks, clean, pair, ret, selector, _i, _len;
      ret = {};
      clean = blocks.replace(/\/\*(\r|\n|.)*\*\//g, "");
      chunks = blocks.split("}");
      chunks.pop();
      for (_i = 0, _len = chunks.length; _i < _len; _i++) {
        chunk = chunks[_i];
        pair = chunk.split('{');
        selector = $.trim(pair[0]);
        block = $.trim(pair[1]);
        block = this.parseBlock(block);
        if (selector !== "") {
          ret[selector] = block;
        }
      }
      return ret;
    };

    Parser.parseBlock = function(block) {
      var loc, parsedValue, property, ret, rule, rules, value, _i, _len;
      ret = {};
      rules = block.split(';');
      for (_i = 0, _len = rules.length; _i < _len; _i++) {
        rule = rules[_i];
        loc = rule.indexOf(':');
        if (loc >= 0) {
          property = $.trim(rule.substring(0, loc));
          value = $.trim(rule.substring(loc + 1));
          if (property !== "" && value !== "") {
            parsedValue = value.split(",");
            ret[property] = parsedValue;
          }
        }
      }
      return ret;
    };

    return Parser;

  })();

  __t('CATS').Util = (function() {

    Util.name = 'Util';

    function Util() {}

    Util.hideNode = function(node) {
      return node.addClass(CATS.Options.ClassForInvisible);
    };

    Util.showNode = function(node) {
      return node.removeClass(CATS.Options.ClassForInvisible);
    };

    Util.nodeHidden = function(node) {
      return node.hasClass(CATS.Options.ClassForInvisible);
    };

    Util.stashData = function(node, command, dict) {
      var attr, str;
      attr = node.attr("data-" + CATS.Options.AttrForSavedData);
      if (!(attr != null) || attr === null) {
        attr = {};
      }
      attr[command] = dict;
      str = JSON.stringify(attr);
      str = str.replace(/\\/g, "\\\\");
      str = str.replace(/'/g, "\\'");
      str = str.replace(/"/g, "'");
      return node.attr("data-" + CATS.Options.AttrForSavedData, str);
    };

    Util.getDataStash = function(node, command) {
      var stash, str;
      str = node.attr("data-" + CATS.Options.AttrForSavedData);
      if (typeof str !== "undefined") {
        str = str.replace(/([^\\])'/g, '$1"');
        str = str.replace(/\\'/g, "'");
        str = str.replace(/\\\\/g, "\\");
        stash = JSON.parse(str);
        if (command in stash) {
          return stash[command];
        } else {
          return {};
        }
      } else {
        return {};
      }
    };

    return Util;

  })();

}).call(this);
