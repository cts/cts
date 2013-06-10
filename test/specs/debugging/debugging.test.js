module("debugging", {
  setup : function () {
	},
	teardown : function () {
 	}
});

test("Create Tree", function() {
  var n = CTS.Debugging.StringToNodes("a");
  console.log(n);
  equal(n[0].getValue(), "a");

  var n2 = CTS.Debugging.StringToNodes("a(b)");
  var r = n2[0];
  equal(r.getChildren().length, 1);
  equal(r.getChildren()[0].getValue(), "b");
});


