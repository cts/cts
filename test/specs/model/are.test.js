module("are", {
  setup : function () {
	},
	teardown : function () {
 	}
});

test("ARE aligns cardinalities", function() {
  equal(CTS.Debugging.QuickTest("1(a b c)", "2", "1 are 2"), "1");
  equal(CTS.Debugging.QuickTest("1(a b c)", "2(d)", "1 are 2"), "1(a)");
  equal(CTS.Debugging.QuickTest("1(a b c)", "2(d e)", "1 are 2"), "1(a b)");
  equal(CTS.Debugging.QuickTest("1(a b c)", "2(d e f g)", "1 are 2"), "1(a b c c)");
});


