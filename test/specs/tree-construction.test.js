module("tree-construction", {
  setup : function () {
    this.a = $("<div id='a'></div>").appendTo($("body"));
    this.b = $("<div id='b'></div>").appendTo($("body"));
    this.script = $("<script type='text/cts'></script>").appendTo($('body'));
	},
	teardown : function () {
    this.a.remove();
    this.a = null;
    this.b.remove();
    this.b = null;
    this.script.remove();
    this.script = null;
	}
});

asyncTest("Two trees present by default", function() {
  this.a.attr('data-cts', 'is: #b;');
  this.a.html('a');
  this.b.html('b');
  var engine = new CTS.Engine();
  engine.render({
    callback: function() {
      var treeSize = _.keys(engine.forrest.trees).length;
      equal(treeSize, 2, "should be equal");
      ok(typeof engine.forrest.trees.body != 'undefined', 'One tree is body');
      ok(typeof engine.forrest.trees.window != 'undefined', 'One tree is window');
      start();
    },
    callbackScope: this
  });
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

asyncTest("Relation is created", function () {
	//deepEqual(A, B, "should be equal");
  this.a.attr('data-cts', 'is: #b;');
  this.a.html('a');
  this.b.html('b');
  var engine = new CTS.Engine();
  engine.render({
    callback: function() {
      var relations = engine.forrest.getPrimaryTree().root.subtreeRelations();
      equal(relations.length, 1, "should be one relation in tree");
      start();
    },
    callbackScope: this
  });
});
