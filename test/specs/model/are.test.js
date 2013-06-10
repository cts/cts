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
  equal(CTS.Debugging.QuickTest("1(a b c)", "2(d e f)", "1 are 2"), "1(a b c)");
  equal(CTS.Debugging.QuickTest("1(a b c)", "2(d e f g)", "1 are 2"), "1(a b c c2)");
  equal(CTS.Debugging.QuickTest("1(a b c)", "2(d e f g h)", "1 are 2"), "1(a b c c2 c3)");
  equal(CTS.Debugging.QuickTest("1", "2(d e f g h)", "1 are 2"), "1");
  equal(CTS.Debugging.QuickTest("0(1(a b c))", "2(d e f g)", "1 are 2"), "0(1(a b c c2))");
});

