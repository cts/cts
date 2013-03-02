module("DomNode", {
  setup : function () {
    this.a = $("<div id='a'>a</div>").appendTo($("body"));
    this.b = $("<div id='b'>b</div>").appendTo($("body"));
    this.c = $("<div id='c'>c</div>").appendTo($("body"));
    this.d = $("<div id='d'>d</div>").appendTo($("body"));
	},
	teardown : function () {
    this.a.remove();
    this.a = null;
    this.b.remove();
    this.b = null;
    this.c.remove();
    this.c = null;
    this.d.remove();
    this.d = null;
	}
});

test("IS Incoming, 1 <- 1", function () {
  var A = new CTS.DomNode(this.a);
  var B = new CTS.DomNode(this.b);
  var BB = new CTS.Selection([B]);
  A.isIncoming(BB);
  equal(this.b.html(), "b", "should be b");
  equal(this.a.html(), "b", "should be b");
});

test("IS Incoming, 1 <- 2", function () {
  var A = new CTS.DomNode(this.a);
  var B = new CTS.DomNode(this.b);
  var C = new CTS.DomNode(this.c);
  var BC = new CTS.Selection([B, C]);
  A.isIncoming(BC);
  equal(this.a.html(), "bc", "should be bc");
});

test("IS Incoming, 2 <- 2", function () {
  var A = new CTS.DomNode([this.a, this.d]);
  var B = new CTS.DomNode(this.b);
  var C = new CTS.DomNode(this.c);
  var BC = new CTS.Selection([B, C]);
  A.isIncoming(BC);
  equal(this.a.html(), "bc", "should be bc");
  equal(this.d.html(), "bc", "should be bc");
});

test("IS Incoming, 2 <- 1", function () {
var A = new CTS.DomNode([this.a, this.d]);
var B = new CTS.DomNode(this.b);
var C = new CTS.DomNode(this.c);
var BB = new CTS.Selection([B]);
A.isIncoming(BB);
equal(this.a.html(), "b", "should be bb");
equal(this.d.html(), "b", "should be bb");
});

test("IS Incoming, 1 <- 0", function () {
var A = new CTS.DomNode([this.a, this.d]);
var BB = new CTS.Selection([]);
A.isIncoming(BB);
equal(this.a.html(), "", "should be empty");
});







