module("graft", {
  setup : function () {
	},
	teardown : function () {
 	}
});

test("GRAFT with no downstream rules", function() {
  equal(
    CTS.Debugging.TreeTest("a(b)", "b(c)", "a graft b"),
    "a(c)");

  equal(
    CTS.Debugging.TreeTest("a(b(c d))", "e(f(g h))", "a graft e"),
    "a(f(g h))");
});

test("GRAFT with wrapping", function() {
  equal(
    CTS.Debugging.TreeTest(
      "section(div(span))",
      "article(block(content))",
      null,
      "div graft article;content is span;"),
    "section(div(block(span)))");

  var ts1 = "section(div(span))";
  var ts2 = "article(block(content))";
  var t1 = CTS.Debugging.StringToNodes(ts1)[0];
  var t2 = CTS.Debugging.StringToNodes(ts2)[0];
  var rs = ["div graft article", "content is span"];
  CTS.Debugging.StringsToRelations(t1, [t2], rs);
  
  var div = t1.children[0];
  equal(div.children.length, 1, "Div has one child");
  var span = div.children[0];
  equal(span.relations.length, 1, "Span has one child");

  equal(span.relations[0].opposite(span).getValue(), "content", "Graft opposite check");
  equal(span.getValue(), "span", "Span should be span");
  
  t1._processIncoming();
 
  equal(span.getValue(), "span", "Span should still be span");
  var block = div.children[0];
  equal(block.getValue(), "block", "Child of div is now block");
  var blockChild = block.children[0];
  equal(span.relations[0].opposite(span).getValue(), "content");

});

test("Graft's cloning doesn't result in duplicate rules in source tree", function() {
  var ts1 = "section(div(span))";
  var ts2 = "article(block)";
  var ts3 = "names(name1 name2 name3)";
  var t1 = CTS.Debugging.StringToNodes(ts1)[0];
  var t2 = CTS.Debugging.StringToNodes(ts2)[0];
  var t3 = CTS.Debugging.StringToNodes(ts3)[0];
  var rs = 
        ["section are names",
       "div graft article"
       ];
  CTS.Debugging.StringsToRelations(t1, [t2, t3], rs);

  var div1 = t1.children[0];
  equal(div1.getValue(), "div", "div is wrapper");
  equal(div1.relations.length, 1, "div has one relation");
  t1._processIncoming();
  equal(div1.getValue(), "div", "post: div is wrapper");
  equal(div1.relations.length, 1, "post: div has one relation");
});

test("Graft and Are coordinate well", function() {
  var ts1 = "section(div(wrapper(span)))";
  var ts2 = "article(block(content))";
  var ts3 = "names(name1 name2 name3)";
  var t1 = CTS.Debugging.StringToNodes(ts1)[0];
  var t2 = CTS.Debugging.StringToNodes(ts2)[0];
  var t3 = CTS.Debugging.StringToNodes(ts3)[0];
  var rs = 
   [
    "div are names",
    "span is name1",
    "span is name2",
    "span is name3",
    "wrapper graft article",
    "content is span"
  ];

  CTS.Debugging.StringsToRelations(t1, [t2, t3], rs);

  var div1 = t1.children[0];
  equal(div1.getValue(), "div", "div is wrapper");
  equal(div1.relations.length, 1, "div has one relation");
  // We'll manually process all the rules except graft.

  // ARE
  t1.children[0].relations[0].execute(t1.children[0]);
  console.log("DUMB");
  CTS.Debugging.DumpTree(t1);

  var span1 = t1.children[0].children[0].children[0];
  var span2 = t1.children[0].children[1].children[0];
  var span3 = t1.children[0].children[2].children[0];

  equal(span1.relations.length, 2, "Span1 has two relations"); 
  equal(span2.relations.length, 2, "Span2 has two relations"); 
  equal(span3.relations.length, 2, "Span3 has two relations");
  
  // IS
  equal(span1.getValue(), "span");
  span1.relations[0].execute(span1);
  equal(span1.getValue(), "name1");

  equal(span2.getValue(), "span");
  span2.relations[0].execute(span2);
  equal(span2.getValue(), "name2");

  equal(span3.getValue(), "span");
  span3.relations[0].execute(span3);
  equal(span3.getValue(), "name3", "Span3 is Name3");

  // Now we manually process the graft
  var w1 = t1.children[0].children[0];
  var w2 = t1.children[0].children[1];
  var w3 = t1.children[0].children[2];

  equal(w1.getValue(), "wrapper");
  equal(w2.getValue(), "wrapper");
  equal(w3.getValue(), "wrapper");

  equal(w1.relations.length, 1);
  equal(w2.relations.length, 1);
  equal(w3.relations.length, 1);

  // Execute a single GRAFT
  w1.relations[0].execute(w1);

  var block1 = w1.children[0];
  equal(block1.getValue(), "block");

  var content1 = block1.children[0];
  equal(content1.getValue(), "name1");

});

test("GRAFT with wrapping", function() {
  equal(
    CTS.Debugging.ForrestTest(
      "section(div(wrapper(span)))",
      ["data(names(name1 name2 name3))",
       "article(block(content))"],
      ["div are names",
       "span is name1",
       "span is name2",
       "span is name3",
       "wrapper graft article",
       "content is span"
       ]
    ),
    "section(div(wrapper(block(name1)) wrapper2(block2(name2)) wrapper3(block3(name3))))",
    "More complex mapping");
});

