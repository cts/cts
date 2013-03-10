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
  this.a.html('<li>Foo</li><li>Bar</li><li>Baz</li>');
  this.b.html("<div>Foo</div>");

  var engine = new CTS.Engine();
  engine.render({
    callback: function() {
      var tree = engine.forrest.trees['body'];
      var body = tree.root;
      console.log('body', body);
      var bodyKids = body.getChildren();
      equal(bodyKids.length, 1, "only one child of body");
      var A = bodyKids[0];
      equal(A.relations.length, 1, "A has one relation");
      var r = A.relations[0];
      equal(r.name, "are", "that relation is ARE");
      equal(r.selection1.nodes[0], A, "R selection 1 is A");
      equal(r.selection2.nodes.length, 1, "R.S2 is len 1");
      var other = r.selection2.nodes[0];
      equal(other.getRelations().length, 1, "other has one relation");
      equal(r.selection2.nodes[0].getChildren().length, 1, "R.S2 has 1 child");
      var aKids = A.getChildren();
      equal(aKids.length, 1, "Should only be one li in a");
      equal(A.siblings[0].html(), "<li>Foo</li>", "only one item");
      start();
    },
    callbackScope: this
  });
});

asyncTest("ARE aligns cardinalities up", function () {
  this.a.attr('data-cts', 'are: #b;');
  this.a.html('<li>Foo</li>');
  this.b.html("<div>Foo</div><div>Foo</div><div>Foo</div>");

  var engine = new CTS.Engine();
  engine.render({
    callback: function() {
      var tree = engine.forrest.trees['body'];
      var body = tree.root;
      console.log('body', body);
      var bodyKids = body.getChildren();
      equal(bodyKids.length, 1, "only one child of body");
      var A = bodyKids[0];
      equal(A.relations.length, 1, "A has one relation");
      var r = A.relations[0];
      equal(r.name, "are", "that relation is ARE");
      equal(r.selection1.nodes[0], A, "R selection 1 is A");
      equal(r.selection2.nodes.length, 1, "R.S2 is len 1");
      var other = r.selection2.nodes[0];
      equal(other.getRelations().length, 1, "other has one relation");
      equal(r.selection2.nodes[0].getChildren().length, 3, "R.S2 has 3 children");
      var aKids = A.getChildren();
      equal(aKids.length, 3, "Should only be three li's in a");
      equal(A.siblings[0].html(), "<li>Foo</li><li>Foo</li><li>Foo</li>", "three LI html");
      start();
    },
    callbackScope: this
  });
});


//test("ARE aligns cardinalities up", function () {
//  ok(1 == 1, "Passed"); 
//});
//
//test("ARE doesn't touch even cardinatlies", function () {
//  ok(1 == 1, "Passed"); 
//});
