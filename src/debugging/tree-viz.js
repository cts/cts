var TreeViz = CTS.Debugging.TreeViz = function(forrest) {
  this.forrest = forrest;
  this.init();
  this.finish();
};

_.extend(TreeViz.prototype, {

  write: function(html) {
    this.win.document.write(html);
  },
  
  init:  function() {
    this.win = window.open(
        "",
        "CTS Tree Visualization",
        "width=1000,height=800,scrollbars=1,resizable=1"
    );
    this.win.document.open();
    this.write("<html><head>");
    this.write('<script src="http://d3js.org/d3.v3.min.js"></script>');
    this.write('<script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>');
    this.write('<script src="http://people.csail.mit.edu/eob/files/cts/extras/tree.js"></script>');
    this.write('<link rel="stylesheet" href="http://people.csail.mit.edu/eob/files/cts/extras/tree.css"></script>');
    this.writeTree(this.forrest.getPrimaryTree());
    this.write('</head><body><div id="chart"></div>');
  },

  finish: function() {
    this.write("</body><html>");
    this.win.document.close();
  },
  
  writeTree: function(tree) {
    this.write("<script>");
    this.write("window.treeData = ");
    this.writeNode(tree.root); 
    this.write(";");
    this.write("</script>");
  },

  writeNode: function(node) {
    this.write("{");
    this.write('name:"' + node.debugName() + '"');
    var kids = node.getChildren();
    console.log(kids);
    console.log("Kids size for node", node, kids.length);
    if ((typeof kids != "undefined") && (kids.length > 0)) {
      this.write(', children: [');
      for (var i = 0; i < kids.length; i++) {
        this.writeNode(kids[i]);
        if (i < kids.length - 1) {
          this.write(",");
        }
      }
      this.write(']');
    }
    this.write("}");
  }
});
