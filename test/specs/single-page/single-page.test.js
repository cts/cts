module("Single Page", {
  setup : function () {
    window.a = $("<div class='a'></div>").appendTo($('body'));
    window.b = $("<div class='b'></div>").appendTo($('body'));
    window.c = $("<div class='c'></div>").appendTo($('body'));
	},
	teardown : function () {
    //window.a.remove();
    //window.b.remove();
    //window.c.remove();
 	}
});

var ctsNode = function(name, klass, cts, content) {
  return $("<" + name + " class='" + klass + "' data-cts='" + cts + "'>" + content + "</" + name + ">");
};

test("Is", function() {
  var cts = 'json: [null, "is", ".bar"]';
  var a = ctsNode('div', "foo", cts, "foo");
  var b = ctsNode('div', "bar", "", "bar");
  window.a.replaceWith(a);
  window.b.replaceWith(b);
  window.cts = new CTS.Engine();
  window.a = a;
  window.b = b;
  window.cts.render();
  equal(window.a.html(), "bar");
});

test("Are", function() {
  var ctsAre = 'json: [null, "are", ".letters"]';
  var ctsIs = 'json: [null, "is", ".letter"]';
  window.A = $("<div class='a'></div>").appendTo($('body'));
  window.B = $("<div class='b'></div>").appendTo($('body'));
  window.B.html("<div class='letters'><div class='letter'>A</div><div class='letter'>B</div></div>");
  window.A.html("<ul data-cts='" + ctsAre + "'><li data-cts='" + ctsIs + "'></li></ul>");
  window.cts = new CTS.Engine();
  window.cts.render();
  var div = $(A.children()[0]);
  var ul = $(B.children()[0]);
  equal(div.children().length, 2);
  equal($(div.children()[0]).html(), "A");
  equal($(div.children()[1]).html(), "B");
});
