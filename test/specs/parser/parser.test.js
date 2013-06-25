module("Parser", {
  setup : function () {
	},
	teardown : function () {
 	}
});

test("Raw Parser", function() {
  var cts = "@tree html foo url(http://www.google.com);";
  var spec = CTS.Parser.CtsImpl.parse(cts);
  equal(typeof spec.headers, 'object', "Has headers");
  equal(spec.headers.length, 1, "Has one header");

  cts = "@tree html foo url(http://www.google.com);@css url(foo.css);";
  spec = CTS.Parser.CtsImpl.parse(cts);
  equal(typeof spec.headers, 'object', "Has headers");
  equal(spec.headers.length, 2, "Has one header");
  equal(spec.headers[0][0], 'tree', "First is tree");
  equal(spec.headers[1][0], 'css', "Second is css");

  cts = "@tree html foo url(http://www.google.com); @js url(js.js); @css url(foo.css);";
  spec = CTS.Parser.CtsImpl.parse(cts);
  equal(typeof spec.headers, 'object', "Has headers");
  equal(spec.headers.length, 3, "Has one header");
  equal(spec.headers[0][0], 'tree', "First is tree");
  equal(spec.headers[1][0], 'js', "Second is js");
  equal(spec.headers[2][0], 'css', "Second is css");

  cts = "@js url(js.js); a :is b;";
  spec = CTS.Parser.CtsImpl.parse(cts);
  equal(spec.headers.length, 1, "Has two headers");
  equal(spec.relations.length, 1, "Has one relation (sp)");
  equal(spec.relations[0].selectionSpec1.selectorString, "a", "ss1");
  equal(spec.relations[0].selectionSpec2.selectorString, "b", "ss2");
  equal(spec.relations[0].name, "is", "name");


  cts = "a :is b;";
  spec = CTS.Parser.CtsImpl.parse(cts);
  equal(spec.relations.length, 1, "Has one relation");
  equal(spec.relations.length, 1, "Has one relation (sp)");
  equal(spec.relations[0].selectionSpec1.selectorString, "a", "ss1");
  equal(spec.relations[0].selectionSpec2.selectorString, "b", "ss2");
  equal(spec.relations[0].name, "is", "name");

  cts = "a :is b;";
  spec = CTS.Parser.CtsImpl.parse(cts);
  equal(spec.relations.length, 1, "Has one relation");
  equal(spec.relations.length, 1, "Has one relation (sp)");
  equal(spec.relations[0].selectionSpec1.selectorString, "a", "ss1");
  equal(spec.relations[0].selectionSpec2.selectorString, "b", "ss2");
  equal(spec.relations[0].name, "is", "name");

  cts = "#a :is b;";
  spec = CTS.Parser.CtsImpl.parse(cts);
  equal(spec.relations.length, 1, "Has one relation");
  equal(spec.relations.length, 1, "Has one relation (sp)");
  equal(spec.relations[0].selectionSpec1.selectorString, "#a", "ss1");
  equal(spec.relations[0].selectionSpec2.selectorString, "b", "ss2");
  equal(spec.relations[0].name, "is", "name");

  cts = "a :is b ;";
  spec = CTS.Parser.CtsImpl.parse(cts);
  equal(spec.relations.length, 1, "Has one relation (sp)");
  equal(spec.relations[0].selectionSpec1.selectorString, "a", "ss1");
  equal(spec.relations[0].selectionSpec2.selectorString, "b", "ss2");
  equal(spec.relations[0].name, "is", "name");

  cts = "foo|a :is bar|b ;";
  spec = CTS.Parser.CtsImpl.parse(cts);
  equal(spec.relations.length, 1, "Has one relation (sp)");
  equal(spec.relations[0].selectionSpec1.treeName, "foo", "tree1");
  equal(spec.relations[0].selectionSpec1.selectorString, "a", "ss1");
  equal(spec.relations[0].selectionSpec2.selectorString, "b", "ss2");
  equal(spec.relations[0].selectionSpec2.treeName, "bar", "tree2");
  equal(spec.relations[0].name, "is", "name");

  cts = "a :is bar|b ;";
  spec = CTS.Parser.CtsImpl.parse(cts);
  equal(spec.relations.length, 1, "Has one relation (sp)");
  equal(spec.relations[0].selectionSpec1.selectorString, "a", "ss1");
  equal(spec.relations[0].selectionSpec2.selectorString, "b", "ss2");
  equal(spec.relations[0].selectionSpec2.treeName, "bar", "tree2");
  equal(spec.relations[0].name, "is", "name");

  cts = "foo|a :is b;";
  spec = CTS.Parser.CtsImpl.parse(cts);
  equal(spec.relations.length, 1, "Has one relation (sp)");
  equal(spec.relations[0].selectionSpec1.treeName, "foo", "tree1");
  equal(spec.relations[0].selectionSpec1.selectorString, "a", "ss1");
  equal(spec.relations[0].selectionSpec2.selectorString, "b", "ss2");
  equal(spec.relations[0].name, "is", "name");
});

test("Comments", function() {
  // Ignores comments
  cts = "/* HAHAHA */ a :is b;";
  spec = CTS.Parser.CtsImpl.parse(cts);
  equal(spec.relations.length, 1, "Has one relation (sp)");
  equal(spec.relations[0].selectionSpec1.selectorString, "a", "ss1");
  equal(spec.relations[0].selectionSpec2.selectorString, "b", "ss2");
  equal(spec.relations[0].name, "is", "name");

  cts = "/* HAHAHA */a :is b;";
  spec = CTS.Parser.CtsImpl.parse(cts);
  equal(spec.relations.length, 1, "Has one relation (sp)");
  equal(spec.relations[0].selectionSpec1.selectorString, "a", "ss1");
  equal(spec.relations[0].selectionSpec2.selectorString, "b", "ss2");
  equal(spec.relations[0].name, "is", "name");


  // Ignores newlines
  cts = "/* foo \n bar \n css */ foo|a /* this \n is \n */ :is b;";
  spec = CTS.Parser.CtsImpl.parse(cts);
  equal(spec.relations.length, 1, "Has one relation (sp)");
  equal(spec.relations[0].selectionSpec1.treeName, "foo", "tree1");
  equal(spec.relations[0].selectionSpec1.selectorString, "a", "ss1");
  equal(spec.relations[0].selectionSpec2.selectorString, "b", "ss2");
  equal(spec.relations[0].name, "is", "name");

  // Ignores newlines
  cts = "/* foo \n bar \n css */foo|a/* this \n is \n */:is b;";
  spec = CTS.Parser.CtsImpl.parse(cts);
  equal(spec.relations.length, 1, "Has one relation (sp)");
  equal(spec.relations[0].selectionSpec1.treeName, "foo", "tree1");
  equal(spec.relations[0].selectionSpec1.selectorString, "a", "ss1");
  equal(spec.relations[0].selectionSpec2.selectorString, "b", "ss2");
  equal(spec.relations[0].name, "is", "name");
});

test("Spec Parser", function() {
  cts = "foo|a :is b;";
  spec = CTS.Parser.parse(cts);
  equal(spec.relationSpecs.length, 1, "one relation spec");
  equal(spec.relationSpecs[0].name, "is", "it is an is");
  equal(spec.relationSpecs[0].selectionSpec1.treeName, "foo", "first is foo");
  equal(spec.relationSpecs[0].selectionSpec2.treeName, "body", "second is foo");
});

asyncTest("Complicated", function() {
  var hard = $.ajax("/test/assets/example0.cts");
  hard.done(function(cts) {
    var s = Date.now();
    spec = CTS.Parser.parse(cts);
    var t = Date.now();
    equal(spec.relationSpecs.length, 9, "9 relations");
    equal(spec.relationSpecs[4].selectionSpec1.treeName, "mockup", "mockup");
    equal(spec.relationSpecs[4].selectionSpec1.selectorString, "#articlecontainer", "ac");
    start();
  });
});
