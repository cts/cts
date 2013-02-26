// DOM Tree
// ==========================================================================
//
// ==========================================================================
var Tree = CTS.Tree = {
  name: "",
  
  render: function(opts) {
    console.log("render root", this.root);
    this.root.render(opts);
  }

};
