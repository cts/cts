var AbstractNode = CTS.AbstractNode = function() {
  this.initializeNodeBase();
};

CTS.Fn.extend(CTS.AbstractNode.prototype,
    CTS.Events,
    CTS.StateMachine,
    CTS.NodeStateMachine,
    CTS.Node, {

   _subclass_beginClone: function() {
     var n = new AbstractNode ();
     n.setValue(this.getValue());

     for (var i = 0; i < this.children.length; i++) {
       var k = this.children[i].clone();
       n.insertChild(k);
     }

     return n;
   },

   descendantOf: function(other) {
     var p = this.parentNode;
     var foundIt = false;
     if (this == other) {
       return true;
     }
     while ((!foundIt) && (p != null)) {
       if (p == other) {
         foundIt = true;
       }
       p = p.parentNode;
     }
     return foundIt;
   }

});

CTS.NonExistantNode = new CTS.AbstractNode();

