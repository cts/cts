module("Parser", {
  setup : function () {
	},
	teardown : function () {
	}
});

test("Language Acceptance", function () {
  var kv1 = "key: value;";
  var kv2 = "key: \"value\";";
  var kvs = kv1 + kv2;
  var a = "is { A:B; }";
  var b = "are { A:B;C:D; }";
  var c = "if-exist { A:\"B\";C:D; }";
  var d = "if-exist";

  equal(CTS.Parser.parse(kv1), true);
  equal(CTS.Parser.parse(kv2), true);
  equal(CTS.Parser.parse(kvs), true);
});


