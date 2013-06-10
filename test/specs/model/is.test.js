module("is", {
  setup : function () {
	},
	teardown : function () {
 	}
});

test("IS replaces value", function() {
  equal(CTS.Debugging.QuickTest("a", "b", "a is b"), "b");
  equal(CTS.Debugging.QuickTest("a(b)", "c", "b is c"), "a(c)");
  equal(CTS.Debugging.QuickTest("a(b c d)", "e", "d is e"), "a(b c e)");
  equal(CTS.Debugging.QuickTest("a(b c d)", "e(f(g))", "d is g"), "a(b c g)");
});
