window.Tests = window.Tests || [];

ContextTest = function() {
  
  var tree = {
    root: true,
    c1 : {
      name : "Child 1",
      c1 : {
        name : "Child 1 -> Child 1"
      },
      c2 : {
        name : "Child 1 -> Child 2"
      }
    },
    c2 : {
      name : "Child 2"
    }
  }

  module("Context");

  test("Key-path handling", function() {
    var ctx = new HCSS.Context(tree);
    equal(ctx.resolve("root"), true);
    equal(ctx.resolve("c1.name"), "Child 1");
    equal(ctx.resolve("c2.name"), "Child 2");
    equal(ctx.resolve("c3"), null);
  });

};

window.Tests.push(ContextTest);
