window.Tests = window.Tests || [];

var SizeOf = function(obj) {
  var count = 0;
  for (var k in obj) {
    ++count;
  }
  return count;
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
    equal(CATS.Parser.parseBlock("b:  a;   a  :a")["b"][0], "a");
    equal(CATS.Parser.parseBlock("b:  a;   a  :  c  ")["a"][0], "c");
  });

  test("Multi Block Parsing", function() {
    var blocks = "a {b:c} d {f:g;z:x}";
    parsed = CATS.Parser.parseBlocks(blocks);
    equal(SizeOf(parsed), 2);
    equal(parsed["a"]["b"][0], "c");
    equal(parsed["d"]["f"][0], "g");
    equal(SizeOf(parsed["a"]), 1);
  });
};

window.Tests.push(ParserTest);
