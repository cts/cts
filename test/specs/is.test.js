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

asyncTest("IS text -> text on same page", function () {
	//deepEqual(A, B, "should be equal");
  this.a.attr('data-cts', 'is: #b;');
  this.a.html('a');
  this.b.html('b');
  var engine = new CTS.Engine();
  engine.render({
    callback: function() {
      equal(this.a.html(), this.b.html(), "should be equal");
      equal(this.a.html(), 'b', "should be 'b'");
      equal(this.b.html(), 'b', "should be 'b'");
      //t = new CTS.Debugging.TreeViz(engine.forrest);
      start();
    },
    callbackScope: this
  });
});

asyncTest("IS HTML -> HTML on same page", function () {
	//deepEqual(A, B, "should be equal");
  this.a.attr('data-cts', 'is: #b;');
  this.a.html('a');
  this.b.html('<div><b>FOO</b></div>');
  var engine = new CTS.Engine();
  engine.render({
    callback: function() {
      equal(this.b.html(), '<div><b>FOO</b></div>', "should be HTML");
      equal(this.a.html(), this.b.html(), "should be equal");
      start();
    },
    callbackScope: this
  });
});
