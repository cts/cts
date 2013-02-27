module("is", {
  setup : function () {
    this.a = $("<div id='a'></div>").appendTo($("body"));
    this.b = $("<div id='b'></div>").appendTo($("body"));
	},
	teardown : function () {
    this.a.remove();
    this.a = null;
    this.b.remove();
    this.b = null;
	}
});

asyncTest("IS innerHTML -> innerHTML on same page", function () {
  ok(1 == 1, "Passed"); 
	//deepEqual(A, B, "should be equal");
  this.a.attr('data-cts', 'is: #b;');
  this.a.html('a');
  this.b.html('b');
  var engine = new CTS.Engine();
  engine.render({
    callback: function() {
      equal(this.a.html(), this.b.html(), "should be equal");
      equal(this.a.html(), 'b', "should be 'b'");
      start();
    },
    callbackScope: this
  });
});
