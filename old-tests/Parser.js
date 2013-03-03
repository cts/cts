window.Tests = window.Tests || [];

var SizeOf = function(obj) {
  var count = 0;
  for (var k in obj) {
    ++count;
  }
  return count;
}

DataEquals = function(obj, hash) {
  for (key in obj) {
    var val = obj[key];
    if (typeof val == "object") {
      if (DataEquals(obj[key], hash[key]) == false)
        return false
    }
    else {
      console.log(key);
      console.log(val);
      if (val != hash[key])
        return false
    }
  }
  return true;
}

ParserTest = function() {
  
  module("Parser");

  test("Block Parsing", function() {
    equal(SizeOf(CATS.Parser.parseBlock(";")), 0);
    equal(SizeOf(CATS.Parser.parseBlock("")), 0);
    equal(SizeOf(CATS.Parser.parseBlock(":;")), 0);
    equal(SizeOf(CATS.Parser.parseBlock(":sdfsdf;")), 0);
    equal(SizeOf(CATS.Parser.parseBlock("isdfsdf:;")), 0);
  
    equal(SizeOf(CATS.Parser.parseBlock("a:a;")), 1);
    equal(SizeOf(CATS.Parser.parseBlock("a:a;a:a;")), 1);
    equal(SizeOf(CATS.Parser.parseBlock(" a:a;a :a;")), 1);
    equal(SizeOf(CATS.Parser.parseBlock("b:a;a:a;")), 2);
    equal(SizeOf(CATS.Parser.parseBlock("b:  a;   a  :a;")), 2);
    equal(SizeOf(CATS.Parser.parseBlock("b:  a;   a  :a")), 2);
    equal(SizeOf(CATS.Parser.parseBlock("a:a")), 1);
  });

  test("Multi Block Parsing", function() {
    var blocks = "a {b:c} d {f:g;z:x}";
    parsed = CATS.Parser.parseBlocks(blocks);
    equal(SizeOf(parsed), 2);
    equal(parsed["a"]["b"]["."]["."], "c");
    equal(SizeOf(parsed["a"]), 1);
  });

  test("Property Parsing", function() {
    equal(true, DataEquals(
      CATS.Parser.parseProperty("foo"),
      {property:"foo"}
    ));
    equal(true, DataEquals(
      CATS.Parser.parseProperty("foo-spark"),
      {property:"foo", variant:"spark"}
    ));
    equal(true, DataEquals(
      CATS.Parser.parseProperty("foo-variant(target)"),
      {property:"foo", variant:"variant", target:"target"}
    ));
    equal(true, DataEquals(
      CATS.Parser.parseProperty("foo(target)"),
      {property:"foo", target:"target"}
    ));
    equal(true, DataEquals(
      CATS.Parser.parseProperty("-variant(target)"),
      {property:"", variant:"variant", target:"target"}
    ));
  });

  test("Block Parsing", function() {
    equal(true, DataEquals(
      CATS.Parser.parseBlock("value:name"),
      {"value":{".":{".":"name"}}}
    ));
    equal(true, DataEquals(
      CATS.Parser.parseBlock("value(href):name"),
      {"value":{"href":{".":"name"}}}
    ));
    equal(true, DataEquals(
      CATS.Parser.parseBlock("value-append(href):name"),
      {"value":{"href":{"append":"name"}}}
    ));
    equal(true, DataEquals(
      CATS.Parser.parseBlock("value-append(href):name;value(href):data"),
      {"value":{"href":{"append":"name", ".":"data"}}}
    ));
    equal(true, DataEquals(
      CATS.Parser.parseBlock("if-exist:something;value-append(href):name;value(href):data"),
      {"if":{".":{"exist":"something"}},"value":{"href":{"append":"name", ".":"data"}}}
    ));
    equal(true, DataEquals(
      CATS.Parser.parseBlock("if-exist:something;if-nexist:2;value-append(href):name;value(href):data"),
      {"if":{".":{"exist":"something","nexist":"2"}},"value":{"href":{"append":"name", ".":"data"}}}
    ));
  });

  test("Blocks Parsing", function() {
    var s = "b{  if-exist:something;value-append(href):name;value(href):data } a{if-exist:something;if-nexist:2;value-append(href):name;value(href):data}";
    var d = {
      "a":{
        "if":{
          ".":{
            "exist":"something",
            "nexist":"2"
          }
        },
        "value":{
          "href":{
            "append":"name",
            ".":"data"
          }
        }
      },
      "b":{
        "if":{
          ".":{
            "exist":"something"
          }
        },
        "value":{
          "href":{
            "append":"name",
            ".":"data"
          }
        }
      }
    };
    var dd = CATS.Parser.parseBlocks(s);
    equal(true, DataEquals(dd, d));
  });


};

window.Tests.push(ParserTest);
