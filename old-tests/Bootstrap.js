var afterLink = function() {
  test("After remote load", function() {
    ok($("#shouldBeFoo").html() == "foo", "Should be foo");
    ok($("#shouldBeBar").html() == "bar", "Should be foo");
  });
};
setTimeout(afterLink, 3000);
