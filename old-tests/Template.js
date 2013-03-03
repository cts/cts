var afterLink = function() {
  test("Template Tests", function() {
    ok($("#t1").html() == "<h1>Hello</h1>", "H1 Hello");
  });
};
setTimeout(afterLink, 3000);
