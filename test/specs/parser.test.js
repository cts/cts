module("Parser", {
  setup : function () {
	},
	teardown : function () {
	}
});

test("Language Acceptance", function () {
  CTS.Parser.parse("a is b");
});


