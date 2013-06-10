var AbstractNode = CTS.AbstractNode = function() {
  this.initializeNodeBase();
};

CTS.Fn.extend(CTS.AbstractNode.prototype,
    CTS.Events,
    CTS.StateMachine,
    CTS.NodeStateMachine,
    CTS.Node, {
});

CTS.NonExistantNode = new CTS.AbstractNode();

