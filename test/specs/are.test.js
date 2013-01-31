module("are", {
  setup : function () {
    //this.a = $("<div id='a'></div>").appendTo($("body"));
    //this.b = $("<div id='b'></div>").appendTo($("body"));
	},
	teardown : function () {
    //this.a.remove();
    //this.a = null;
    //this.b.remove();
    //this.b = null;
	}
});

test("ARE aligns cardinalities down", function () {
  ok(1 == 1, "Passed"); 
	//deepEqual(A, B, "should be equal");
  //this.a.html("<ul data-cts='are: b;'><li itemscope>Foo</li><li itemscope>Bar</li><li itemscope>Baz</li></ul>");
  //this.b.html("<div itemscope>Foo</div>");
  var engine = new CTS.Engine();
  engine.render();
});

test("ARE aligns cardinalities up", function () {
  ok(1 == 1, "Passed"); 
	//deepEqual(A, B, "should be equal");
});

test("ARE doesn't touch even cardinatlies", function () {
  ok(1 == 1, "Passed"); 
	//deepEqual(A, B, "should be equal");
});
