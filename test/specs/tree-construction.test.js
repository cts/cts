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
  console.log("DOOING IT");
  engine.render({
    callback: function() {
      var treeSize = engine.forrest.getPrimaryTree().root.treeSize();
      console.log("THE TREE", engine.forrest.getPrimaryTree().root);
      equal(treeSize, 2, "should be equal");
      start();
    },
    callbackScope: this
  });
});

asyncTest("A rule is turned into a relation", function () {
  this.a.attr('data-cts', 'is: #b;');
  this.a.html('a');
  this.b.html('b');
  var engine = new CTS.Engine();
  engine.render({
    callback: function() {
      var root = engine.forrest.getPrimaryTree().root;
      var kidsOfRoot = root.getChildren();
      equal(kidsOfRoot.length, 1, "should be one");
      var A = kidsOfRoot[0];
      equal(A.relations.length, 1, "should be one");
      var r = A.relations[0];
      equal(r.name, "is", "The relation should be IS");
      var s1 = r.selection1;
      equal(s1.nodes.length, 1, "Should be one");
      equal(s1.nodes[0], A, "Should be equal");
      var s2 = r.selection2;
      equal(s2.nodes.length, 1, "should be one");
      start();
    },
    callbackScope: this
  });
});

asyncTest("ARE results in a depth-two tree", function () {
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

