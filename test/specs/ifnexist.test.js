module("if-nexist", {
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

asyncTest("HTML -> HTML, same page", function () {
  ok(1 == 1, "Passed"); 
	//deepEqual(A, B, "should be equal");
  this.a.attr('data-cts', 'ifnexist: #b;');
  this.b.attr('data-cts', 'ifnexist: #c;');
  this.a.html('a');
  this.b.html('b');
  var engine = new CTS.Engine();
  engine.render({
    callback: function() {
      ok(this.a.css('display') == 'none', "a should be hidden");
      ok(this.b.css('display') != 'none', "b should be visible");
      start();
    },
    callbackScope: this
  });
});



