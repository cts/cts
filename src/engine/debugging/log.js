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
    return CTS.LogLevel >= 0;
  },
   
  // 1: Error
  Error: function() {
    return CTS.LogLevel >= 1;
  },

  // 2: Warn
  Warn: function() {
    return CTS.LogLevel >= 2;
  },

  // 3: Debug
  Debug: function() {
    return CTS.LogLevel >= 3;
  },

  // 4: Info
  Info: function() {
    return CTS.LogLevel >= 4;
  }
};

CTS.Log = {

  Fatal: function(msg) {
    alert(msg);
    CTS.Log._LogWithLevel("FATAL", CTS.LogLevel.Fatal, arguments);
  },

  Error: function(message) {
    if (1 >= CTS.Log.Level) {
      CTS.Log._LogWithLevel("ERROR", CTS.LogLevel.Error, arguments);
    }
  },

  Warn: function(message) {
    CTS.Log._LogWithLevel("WARN", CTS.LogLevel.Warn, arguments);
  },

  Debug: function(message) {
    CTS.Log._LogWithLevel("DEBUG", CTS.LogLevel.Debug, arguments);
  },

  Info: function(message) {
    CTS.Log._LogWithLevel("INFO", CTS.LogLevel.Info, arguments);
  },

  // To be considered private.
  _LogWithLevel: function(levelName, levelFn, args) {
    if (console && levelFn()) {
      var args = Array.prototype.slice.call(args);
      args.unshift(levelName);
      console.log.apply(console, args);
    }
  }

};

