
CTS.loaded.then(function() {
  CTS.on('cts-received-graft', function(evt) {
  

    var ctsNode = evt.target;
    var jqNode = ctsNode.value;

    alert(jqNode.find('.image-slot').html());

  });
});