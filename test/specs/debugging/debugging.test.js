module("debugging", {
  setup : function () {
	},
	teardown : function () {
 	}
});

test("Single Node", function() {
  var n = CTS.Debugging.StringToNodes("a");
  equal(n[0].getValue(), "a");
});

test("Multiple Nodes", function() {
  var n = CTS.Debugging.StringToNodes("a b");
  equal(n.length, 2);
});

test("Single Child", function() {
  var n2 = CTS.Debugging.StringToNodes("a(b)");
  var r = n2[0];
  equal(r.getChildren().length, 1);
  equal(r.getChildren()[0].getValue(), "b");
});

test("String Recovery - Single Child", function() {
  var s3 = "a(b)";
  var n3 = CTS.Debugging.StringToNodes(s3);
  equal(CTS.Debugging.NodesToString(n3[0]), s3);
});

test("Multiple Children", function() {
  var s = "a(b c d)";
  var n = CTS.Debugging.StringToNodes(s)[0];
  equal(n.getChildren().length, 3);
});
