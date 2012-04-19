window.Tests = window.Tests || [];

ContextTest = function() {
  
  var tree = {
    root: true,
    a: "A",
    c1 : {
      name : "Child 1",
      b: "B",
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

  test("Stack push and pop", function() {
    var ctx = new HCSS.Context(tree);
    ctx.push(ctx.resolve("c1"));
    equal(ctx.resolve("name"), "Child 1");
    ctx.push(ctx.resolve("c2"));
    equal(ctx.resolve("name"), "Child 1 -> Child 2");
    ctx.pop();
    equal(ctx.resolve("name"), "Child 1");
  });

  test("Cascade", function() {
    var ctx = new HCSS.Context(tree);
    ctx.push(ctx.resolve("c1"));
    ctx.push(ctx.resolve("c2"));
    equal(ctx.resolve(".a"), null);
    equal(ctx.resolve(".b"), null);
    ctx.alias("name", "foo");
    ctx.pop()
    equal(ctx.resolve("foo"), "Child 1 -> Child 2");
    ctx.alias(".a", "foo.bar");
    equal(ctx.resolve("foo.bar"), null);
    // resolving a null object
    ctx.alias("B", "foo.bar");
    equal(ctx.resolve("foo.bar"), null);
    ctx.alias("name", "foo");
    equal(ctx.resolve("foo"), "Child 1");
    ctx.alias("name", "name");
    ctx.push(ctx.resolve("c2"));
    equal(ctx.resolve("name"), "Child 1");
    equal(ctx.resolve(".name"), "Child 1 -> Child 2");
  });

};

window.Tests.push(ContextTest);
