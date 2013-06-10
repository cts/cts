module("if", {
  setup : function () {
	},
	teardown : function () {
 	}
});

test("if-exist", function() {
  equal(CTS.Debugging.QuickTest("a", "b", "a if-exist b"), "a");
  equal(CTS.Debugging.QuickTest("a(b)", "d", "b if-exist d"), "a(b)");
  equal(CTS.Debugging.QuickTest("a(b)", "c", "b if-exist d"), "a");
});

test("if-nexist", function() {
  equal(CTS.Debugging.QuickTest("a(b)", "d", "b if-nexist d"), "a");
  equal(CTS.Debugging.QuickTest("a(b)", "c", "b if-nexist d"), "a(b)");
});
