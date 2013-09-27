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

//asyncTest("Is", function() {
//  var cts = 'this :is .bar;';
//  var a = ctsNode('div', "foo", cts, "foo");
//  var b = ctsNode('div', "bar", "", "bar");
//  window.a.replaceWith(a);
//  window.b.replaceWith(b);
//  window.cts = new CTS.Engine();
//  window.a = a;
//  window.b = b;
//  window.cts.boot().then(
//    function() {
//      equal(window.a.html(), "bar");
//      start();
//    }
//  );
//});

asyncTest("Are", function() {
  window.data = $("<div class='b'></div>").appendTo($('body'));
  window.data.html("<div class='letters'><div class='letter'>A</div><div class='letter'>B</div></div>");

  var ctsAre = 'this :are .letters;';
  var ctsIs = 'this :is .letter;';
  window.sinkContainer = $("<div class='a'></div>").appendTo($('body'));
  window.sinkContainer.html("<ul data-cts='" + ctsAre + "'><li data-cts='" + ctsIs + "'></li></ul>");
  window.sink = $(sinkContainer.children()[0]);
  alert(sink.html());

  window.cts = new CTS.Engine();
  window.cts.boot().then(
    function() {
      equal(sink.children().length, 2);
      equal($(sink.children()[0]).html(), "A");
      equal($(sink.children()[1]).html(), "B");
      start();
    }
  );
});
