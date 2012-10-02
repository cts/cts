test( "Import In-page block", function() {
  var rules = new CTS.Rules();
  rules.loadLocal();
  ok(".articles" in rules.blocks, "Has articles block");
  ok(".articles .h1" in rules.blocks, "Has articles H1 block");
  ok(".articles div" in rules.blocks, "Has articles div block");

  var afterLink = function() {
    test("After remote load", function() {
      ok("#title" in rules.blocks, "Has title block");
      ok(".articles" in rules.blocks, "Has title block");
    });
  };

  rules.setCallback(afterLink);
  rules.loadLinked();
});
