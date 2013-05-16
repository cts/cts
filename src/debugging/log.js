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
  }

};


