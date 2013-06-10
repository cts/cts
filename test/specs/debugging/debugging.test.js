module("debugging", {
  setup : function () {
	},
	teardown : function () {
 	}
});

test("Create Tree", function() {
  var n = CTS.Debugging.StringToNodes("a");
  equal(n[0].getValue(), "a");

  var n2 = CTS.Debugging.StringToNodes("a(b)");
  var r = n2[0];
  equal(r.getChildren().length, 1);
  equal(r.getChildren()[0].getValue(), "b");

  var s3 = "a(b)";
  var n3 = CTS.Debugging.StringToNodes(s3);
  equal(CTS.Debugging.NodesToString(n3[0]), s3);
});


