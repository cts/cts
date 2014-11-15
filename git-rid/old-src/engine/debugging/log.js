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

