CTS.Node.Abstract = function() {
  this.initializeNodeBase();
  this.value = null;
};

CTS.Fn.extend(CTS.Node.Abstract.prototype,
    CTS.Events,
    CTS.Node.Base, {

   _subclass_beginClone: function() {
     var d = Q.defer();
     var n = new CTS.Node.Abstract();
     n.setValue(this.getValue());
     var kidPromises = CTS.Fn.map(this.children, function(kid) {
       return kid.clone();
     });
     Q.all(kidPromises).then(
       function(kids) {
         for (var i = 0; i < kids.length; i++) {
           kids[i].parentNode = n;
           n.insertChild(kids[i]);
         }
         deferred.resolve(n);
       },
       function(reason) {
         d.reject(reason);
       }
     )
     return d.promise;
   },

   getValue: function() {
     return "";
   }

});

CTS.NonExistantNode = new CTS.Node.Abstract();
