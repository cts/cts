CTS.Log = {

  Fatal: function(msg, args) {
    alert(msg);
    console.log("CTS FATAL", msg, args);
  },

  Error: function(message, args) {
    console.log("CTS ERROR", message, args);
  },

  Warn: function(message, args) {
    console.log("CTS WARN", message, args)
  },

  Debug: function(message, args) {
    console.log("CTS DEBUG", message, args);
  },

  Info: function(message, args) {
    if (typeof args == 'undefined') {
      args = [];
    }
    args.unshift(message);
    console.log.call(this, args);
  }

};


