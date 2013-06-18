module("Single Page", {
  setup : function () {
    window.a = $("<div class='a'></div>").appendTo($('body'));
    window.b = $("<div class='b'></div>").appendTo($('body'));
    window.c = $("<div class='c'></div>").appendTo($('body'));
    window.cts = new CTS.Engine();
	},
	teardown : function () {
    window.a.remove();
    window.b.remove();
    window.c.remove();
 	}
});

var ctsNode = function(name, klass, cts, content) {
  return $("<" + name + " class='" + klass + "' data-cts=\"" + cts + "\">" + content + "</" + name + ">");
};


test("Simple HTML Test", function() {

  var cts = "json: [null, \"is\", \".bar\"]";
  var a = ctsNode('div', "", "[null, 'is', '.bar']", "foo");
  var b = ctsNode('div', "bar", "", "bar");
  window.a.replaceWith(a);
  window.b.replaceWith(b);
  window.a = a;
  window.b = b;
  window.cts.render();
  equal(window.a.html(), "bar");
});



