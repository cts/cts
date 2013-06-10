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
     n.realizeChildren();
     return n;
   }
});

CTS.NonExistantNode = new CTS.AbstractNode();

