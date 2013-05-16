module("Utilities", {
  setup : function () {
	},
	teardown : function () {
 	}
});

test("getUrlParameter", function() {
  var url1 = "http://www.example.org?a=b&c=d";
  var url2 = "http://www.example.org?a=b";
  var url3 = "http://www.example.org";

  equal(CTS.Utilities.getUrlParameter("a", url1), "b");
  equal(CTS.Utilities.getUrlParameter("a", url2), "b");
  equal(CTS.Utilities.getUrlParameter("a", url3), null);

  equal(CTS.Utilities.getUrlParameter("b", url1), "d");
  equal(CTS.Utilities.getUrlParameter("b", url2), null);
  equal(CTS.Utilities.getUrlParameter("b", url3), null);

  equal(CTS.Utilities.getUrlParameter("c", url1), null);
  equal(CTS.Utilities.getUrlParameter("c", url2), null);
  equal(CTS.Utilities.getUrlParameter("c", url3), null);

});

test("getTreesheetLinks", function() {
  var blocks = CTS.Utilities.getTreesheetLinks();
  equal(blocks.length, 0);

  this.a = $("<style type='text/cts'>FOO</style>").appendTo($('body'));
  blocks = CTS.Utilities.getTreesheetLinks();
  equal(blocks.length, 1);
  equal(blocks[0].type, 'inline');
  equal(blocks[0].content, 'FOO');
  this.a.remove();
  this.a = null;

  this.b = $("<link rel='treesheet' href='http://foo.com' />").appendTo($('body'));
  blocks = CTS.Utilities.getTreesheetLinks();
  equal(blocks.length, 1);
  equal(blocks[0].type, 'link');
  equal(blocks[0].url, 'http://foo.com');
  this.b.remove();
  this.b = null;
});
