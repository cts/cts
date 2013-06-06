CTS.Log = {

  Fatal: function(msg, args) {
    alert(msg);
    console.log("FATAL", msg, obj);
  },

  Error: function(message, args) {
    console.log(message, args);
  },

  Warn: function(message, args) {
  },

  Debug: function(message, args) {
  },

  Info: function(message, args) {
    if (typeof args == 'undefined') {
      args = [];
    }
    args.unshift(message);
    console.log.call(this, args);
  }

};


