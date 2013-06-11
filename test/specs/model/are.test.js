module("are", {
  setup : function () {
	},
	teardown : function () {
 	}
});

test("ARE aligns cardinalities", function() {
  equal(CTS.Debugging.TreeTest("1(a b c)", "2", "1 are 2"), "1");
  equal(CTS.Debugging.TreeTest("1(a b c)", "2(d)", "1 are 2"), "1(a)");
  equal(CTS.Debugging.TreeTest("1(a b c)", "2(d e)", "1 are 2"), "1(a b)");
  equal(CTS.Debugging.TreeTest("1(a b c)", "2(d e f)", "1 are 2"), "1(a b c)");
  equal(CTS.Debugging.TreeTest("1(a b c)", "2(d e f g)", "1 are 2"), "1(a b c c2)");
  equal(CTS.Debugging.TreeTest("1(a b c)", "2(d e f g h)", "1 are 2"), "1(a b c c2 c3)");
  equal(CTS.Debugging.TreeTest("1", "2(d e f g h)", "1 are 2"), "1");
  equal(CTS.Debugging.TreeTest("0(1(a b c))", "2(d e f g)", "1 are 2"), "0(1(a b c c2))");
});

test("ARE Rewrites Rules", function() {
  equal(
    CTS.Debugging.TreeTest(
      "ul(li(span))",
      "names(a b c)",
      "span is a;span is b;span is c",
      "ul are names"),
    "ul(li(span) li2(span2) li3(span3))");

  equal(
    CTS.Debugging.RuleTest(
      "ul(li(span))",
      "names(a b c)",
      "span is a;span is b;span is c",
      "ul are names"),
    "ul are names;span is a;span2 is b;span3 is c");
});



