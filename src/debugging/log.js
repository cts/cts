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


