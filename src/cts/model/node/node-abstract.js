CTS.Node.Abstract = function() {
  this.initializeNodeBase();
  this.value = null;
};

CTS.Fn.extend(CTS.Node.Abstract.prototype,
    CTS.Events,
    CTS.Node.Base, {

   _subclass_beginClone: function() {
     var n = new CTS.Node.Abstract();
     n.setValue(this.getValue());

     for (var i = 0; i < this.children.length; i++) {
       var k = this.children[i].clone();
       n.insertChild(k);
     }

     return n;
   }

});

CTS.NonExistantNode = new CTS.Node.Abstract();

