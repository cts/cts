module("are", {
  setup : function () {
    this.a = $("<ul id='a'></ul>").appendTo($("body"));
    this.b = $("<div id='b'></div>").appendTo($("body"));
	},
	teardown : function () {
    this.a.remove();
    this.a = null;
    this.b.remove();
    this.b = null;
	}
});

asyncTest("ARE aligns cardinalities down", function () {
  this.a.attr('data-cts', 'are: #b;');
  this.a.html('<li itemscope>Foo</li><li itemscope>Bar</li><li itemscope>Baz</li></ul>');
  this.b.html("<div>Foo</div>");
  var engine = new CTS.Engine();
  engine.render({
    callback: function() {
      var kids = this.a.children();
      equal(kids.length, 1, "Should only be one li");
      start();
    },
    callbackScope: this
  });
});

test("ARE aligns cardinalities up", function () {
  ok(1 == 1, "Passed"); 
});

test("ARE doesn't touch even cardinatlies", function () {
  ok(1 == 1, "Passed"); 
});
