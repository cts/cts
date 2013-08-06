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

test("Two trees present by default", function() {
  var engine = new CTS.Engine();
  var treeSize = _.keys(engine.forrest.trees).length;
  equal(treeSize, 2, "should be equal");
  ok(typeof engine.forrest.trees.body != 'undefined', 'One tree is body');
  ok(typeof engine.forrest.trees.window != 'undefined', 'One tree is window');
});


asyncTest("Properly sized content DOM is constructed", function () {
  this.a.attr('data-cts', 'this :is #b;');
  this.a.html('a');
  this.b.html('b');
  var engine = new CTS.Engine();
  console.log("DOOING IT");
  engine.render({
    callback: function() {
      var treeSize = engine.forrest.getPrimaryTree().root.treeSize();
      console.log("THE TREE", engine.forrest.getPrimaryTree().root);
      equal(treeSize, 2, "Only two nodes should be in primary tree.");
      start();
    },
    callbackScope: this
  });
});

asyncTest("A rule is turned into a relation", function () {
  this.a.attr('data-cts', 'this :is #b;');
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

asyncTest("getSubtreeRelations", function() {
  ok(false, "getSubtreeRelations");
  start();
});

test("ARE results in a depth-two tree", function () {
  this.a.attr('data-cts', 'this :are #b;');
  this.a.html('<li>Foo</li><li>Bar</li><li>Baz</li>');
  this.b.html("<div>Foo</div>");
  var A = new CTS.DomNode(this.a);
  var B = new CTS.DomNode(this.b);
  var Aa = new CTS.Selection([A]);
  var Bb = new CTS.Selection([B]);
  var r = new CTS.Relation(Aa, Bb, 'are');
  A.relations = [r];
  console.log(A.relations);
  console.log(A.getRelations());
  var kids = A.getChildren();
  equal(kids.length, 3, "should be 3");
});

