module("tree-construction", {
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

asyncTest("Properly sized content DOM is constructed", function () {
  this.a.attr('data-cts', 'is: #b;');
  this.a.html('a');
  this.b.html('b');
  var engine = new CTS.Engine();
  engine.render({
    callback: function() {
      var treeSize = engine.forrest.getPrimaryTree().root.treeSize();
      equal(treeSize, 2, "should be equal");
      start();
    },
    callbackScope: this
  });
});
