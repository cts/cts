window.Tests = window.Tests || [];

CascadeTest = function() {
  
  module("Cascade");
  
  test("Node Decoration Retrieval", function() {
    var node = $("<div data-bind='value:foo'>Bar</div>");
    var props = HCSS.Cascade.rulesForNode(node);
    equal(props["value"][0], "foo");
  });

};

window.Tests.push(CascadeTest);
