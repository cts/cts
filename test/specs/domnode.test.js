module("DomNode", {
  setup : function () {
    this.a = $("<div id='a'><div id='b'></div></div>").appendTo($("body"));
    this.c = $("<div id='c'><div id='d'></div><div id='e'>e</div></div>").appendTo($("body"));
    window.cts = new CTS.Engine();
	},
	teardown : function () {
    this.a.remove();
    this.a = null;
    this.c.remove();
    this.c = null;
    window.cts.forrest.stopListening();
    window.cts.shutdown();
    window.cts = null;
	}
});

asyncTest("Register, Unregister, and Destroy", function () {
  var self = this;
  window.cts.boot();
  window.cts.booted.then(
    function() {
      var A = window.cts.forrest.trees.body.getCtsNode(self.a);
      var C = window.cts.forrest.trees.body.getCtsNode(self.c);
      equal(A.getChildren().length, 1, "should be 1");
      equal(C.getChildren().length, 2, "should be 2");
      start();
    }
  );
});

