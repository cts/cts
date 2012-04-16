window.Tests = window.Tests || [];

RenderTest = function() {
  
  module("Render");
  
  var engine = new HCSS.Engine();
  test("Node Decoration Retrieval", function() {
    var node = $("<div data-bind='value:foo'>Bar</div>");
    var props = engine.hcssForNode(node);
    console.log(props);
    equal(props["value"][0], "foo");
  });

};

window.Tests.push(RenderTest);
