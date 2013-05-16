module("Bootstrapper", {
  setup : function () {
	},
	teardown : function () {
 	}
});

asyncTest("Inline sheets loaded", function() {
  var engine = CTS.Engine();
  this.a = $("<style type='text/cts'>.A is .B;</style>").appendTo($('body'));
  blocks = CTS.Utilities.getTreesheetLinks();
  engine.on('FsmEdge:LoadedCTS', function() {
    this.a.remove();
    this.a = null;
    equal(true, false);
    start();
  }, this);
  engine.boot();
});

asyncTest("Linked sheets loaded", function() {
  var engine = CTS.Engine();
  this.a = $("<link rel='treesheet' href='assets/aisb.cts' />>").appendTo($('body'));
  blocks = CTS.Utilities.getTreesheetLinks();
  engine.on('FsmEdge:LoadedCTS', function() {
    this.a.remove();
    this.a = null;
    equal(true, false);
    start();
  }, this);
  engine.boot();
});

