(function() {
  var $;

  $ = jQueryHcss;

  __t('HCSS').Context = (function() {

    Context.name = 'Context';

    function Context(data) {
      this.aliases = {};
      this.stack = [data];
    }

    Context.prototype.push = function(data) {
      return this.stack.push(data);
    };

    Context.prototype.context = function(data) {
      return this.stack.pop();
    };

    Context.prototype.alias = function(aliasedKeypath, dataKeypath) {
      var value;
      value = this.resolve(dataKeypath);
      return _setKetypath(aliasedKeypath, value, this.aliases);
    };

    Context.prototype.resolve = function(keypath) {
      var kp, stepDownStack, tryAliases;
      kp = keypath.replace(/^\s+/g, "");
      if (kp === '.') {
        return this.stack[this.stack.length - 1];
      } else {
        tryAliases = true;
        stepDownStack = true;
        if (kp[0] === '.') {
          tryAliases = false;
          kp = kp.slice(1, (kp.length - 1) + 1 || 9e9);
        } else if (kp[0] === '!') {
          tryAliases = false;
          stepDownStack = false;
          kp = kp.slice(1, (kp.length - 1) + 1 || 9e9);
        }
        kp = this._parseKeyPath(kp);
        return this._resolveParsedKeypath(kp, tryAliases, stepDownStack);
      }
    };

    Context.prototype._parseKeyPath = function(kp) {
      return kp.split(".");
    };

    Context.prototype._resolveParsedKeypath = function(kp, tryAliases, stepDownStack) {
      var attempt, i, lowerBound, _i, _ref;
      if (tryAliases) {
        attempt = this._resolveParsedKeypathAgainst(kp, this.aliases);
        if (attempt !== null) {
          return attempt;
        }
      }
      lowerBound = stepDownStack ? 0 : this.stack.length - 1;
      for (i = _i = _ref = this.stack.length - 1; _ref <= lowerBound ? _i <= lowerBound : _i >= lowerBound; i = _ref <= lowerBound ? ++_i : --_i) {
        attempt = this._resolveParsedKeypathAgainst(kp, this.stack[i]);
        if (attempt !== null) {
          return attempt;
        }
      }
      return null;
    };

    Context.prototype._resolveParsedKeypathAgainst = function(kp, obj) {
      var key, ptr, _i, _len;
      ptr = obj;
      for (_i = 0, _len = kp.length; _i < _len; _i++) {
        key = kp[_i];
        if (key in ptr) {
          ptr = ptr[key];
        } else {
          return null;
        }
      }
      return ptr;
    };

    Context.prototype._setKetypath = function(kp, value, inObject) {
      kp = kp.replace(/^\s+/g, "");
      return kp = this._parseKeyPath(kp);
    };

    return Context;

  })();

}).call(this);
