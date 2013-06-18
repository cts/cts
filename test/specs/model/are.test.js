module("are", {
  setup : function () {
	},
	teardown : function () {
 	}
});

test("ARE aligns cardinalities", function() {
  equal(CTS.Debugging.TreeTest("1(a b c)", "2", "1 are 2"), "1");
  equal(CTS.Debugging.TreeTest("1(a b c)", "2(d)", "1 are 2"), "1(a)");
  equal(CTS.Debugging.TreeTest("1(a b c)", "2(d e)", "1 are 2"), "1(a a2)");
  equal(CTS.Debugging.TreeTest("1(a b c)", "2(d e f)", "1 are 2"), "1(a a2 a3)");
  equal(CTS.Debugging.TreeTest("1(a b c)", "2(d e f g)", "1 are 2"), "1(a a2 a3 a4)");
  equal(CTS.Debugging.TreeTest("1(a b c)", "2(d e f g h)", "1 are 2"), "1(a a2 a3 a4 a5)");
  equal(CTS.Debugging.TreeTest("1", "2(d e f g h)", "1 are 2"), "1");
  equal(CTS.Debugging.TreeTest("0(1(a b c))", "2(d e f g)", "1 are 2"), "0(1(a a2 a3 a4))");
});

test("ARE Rewrites Rules", function() {
  equal(
    CTS.Debugging.TreeTest(
      "ul(li(span))",
      "names(a b c)",
      "span is a",
      "ul are names"),
    "ul(li(span) li2(span2) li3(span3))");

//  equal(
//    CTS.Debugging.RuleTest(
//      "ul(li(span))",
//      "names(a b c)",
//      "span is a;span is b;span is c",
//      "ul are names"),
//    "ul are names;span is a;span2 is b;span3 is c");
//
//  equal(
//    CTS.Debugging.RuleTest(
//      "ul(li(span))",
//      "names()",
//      "ul are names"),
//    "ul are names");
//
//  equal(
//    CTS.Debugging.RuleTest(
//      "ul(li(div(span)))",
//      "continents(america(usa can mex) europe(gbr fra spa))",
//      "div are america;div are europe",
//      "ul are continents"),
//    "ul are continents;div are america;div2 are europe");
//
//  equal(
//    CTS.Debugging.RuleTest(
//      "ul(li(div(span)))",
//      "continents(america(usa can mex) europe(gbr fra spa))",
//      "span is usa;span is can;span is mex;span is gbr;span is fra;span is spa",
//      "ul are continents;div are america;div are europe",
//      true),
//    "ul are continents;div are america;usa is usa;can is can;mex is mex;div2 are europe;gbr is gbr;fra is fra;spa is spa");

});

test("Are manual test", function() {
    var ts1 = "section(div(wrapper(span)))";
    var ts2 = "data(names(name1 name2 name3))";
    var ts3 = "article(block(content))";
    var rs = [
      "div are names",
      "span is name1",
      "span is name2",
      "span is name3"
    ];

    var t1 = CTS.Debugging.StringToNodes(ts1)[0];
    var t2 = CTS.Debugging.StringToNodes(ts2)[0];
    var t3 = CTS.Debugging.StringToNodes(ts3)[0];

    CTS.Debugging.StringsToRelations(t1, [t2, t3], rs);

    equal(t1.children[0].relations.length, 1);
    equal(t2.children[0].relations.length, 1);
    equal(t2.children[0].children[1].relations.length, 1);
    equal(t2.children[0].children[2].relations.length, 1);

    // Now we will execute just one rule.
    equal(t1.children[0].children.length, 1);
    equal(t1.children[0].children[0].children[0].relations.length, 3);
    
    t1._processIncoming();
    CTS.Debugging.DumpTree(t1);
   
    equal(t1.children[0].children.length, 3);

    equal(t1.children[0].children[0].children[0].relations.length, 1, "span1 one child");
    equal(t1.children[0].children[1].children[0].relations.length, 1, "span2 one child");
    equal(t1.children[0].children[2].children[0].relations.length, 1, "span3 one child");
    
    equal(t1.children[0].children[0].children[0].getValue(), "name1");


//  equal(
//    CTS.Debugging.ForrestTest(
//      "section(div(wrapper(span)))",
//      ["data(names(name1 name2 name3))",
//       "article(block(content))"],
//      ["div are names",
//       "span is name1",
//       "span is name2",
//       "span is name3"
//       ]
//    ),
//    "section(div(wrapper(name1) wrapper2(name2) wrapper3(name3)))",
//    "complex mapping");

});

//test("Two-level ARE", function() {
//  equal(
//    CTS.Debugging.RuleTest(
//      "ul(li(div(span)))",
//      "names(a b c)",
//      "span is usa;span is can;span is mex;span is gbr;span is fra;span is spa",
//      "ul are names"),
//    "ul are names;span is a;span2 is b;span3 is c");
//});
//


