var afterLink = function() {
  test("Template Tests", function() {
    ok($("#shouldBeBar").html() == "bar", "Should be foo");
  });
};
setTimeout(afterLink, 3000);
