module("is", {
  setup : function () {
	},
	teardown : function () {
 	}
});

test("IF-EXIST Abstract", function() {
  var a = new CTS.AbstractNode();
  var b = new CTS.AbstractNode();
  var nil = CTS.NonExistantNode;

  a.setValue("a");
  b.setValue("b");

  var r = new CTS.Relation.IfExist(a, b, {});

  equal(a.getValue(), "a");
  equal(b.getValue(), "b");
  r.execute(b);
  equal(a.getValue(), "a");
  equal(b.getValue(), "a");
});


