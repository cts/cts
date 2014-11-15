/*
 * Please note:
 *   This is a particularly ugly solution below because the Google
 *   Spreadsheet API does not allow us to set a cell's value to HTML.
 *   This means we can't simply store the actual HTML Piece
 *   nodes inside the HTML and instead have to save markers (red and
 *   black) which we translate into piece nodes in the web page.
 *
 *   If I can find a way to transmit raw HTML into a cell via the
 *   GSheet API, then the below code reduces to simply making things
 *   draggable -- no extra mumbo jumbo needed!
 */
$(function() {
   $(".square").droppable({
     drop: function(event, ui) {
        var pieceNode = $(ui.draggable);
        var oldContainer = $(pieceNode.parent()).data('ctsnode');
        var newContainer = $(this).data('ctsnode');
        var piece = 'red';
        if (pieceNode.hasClass('black')) {
          piece = 'black';
        }
        oldContainer.setValue(' ');
        newContainer.setValue(piece);
        oldContainer._maybeThrowDataEvent({
          eventName: "ValueChanged",
          node: oldContainer.value,
          ctsNode: oldContainer
        });
        newContainer._maybeThrowDataEvent({
          eventName: "ValueChanged",
          node: newContainer.value,
          ctsNode: newContainer
        });
        newContainer.value.append('<div class="cts-ignore piece ' + piece + '">');
        newContainer.value.find('div').draggable();
     }
   });

   CTS.status.defaultTreeReady.then(function() {
     CTS.engine.rendered.then(function() {
       $.each($('td'), function(idx, val) {
         val = $(val);
         var cts = val.data('ctsnode');
         if (val.html() == 'red') {
           val.append('<div class="cts-ignore piece red">');
         } else if (val.html() == 'black') {
            val.append('<div class="cts-ignore piece black">');
         }
         cts.toggleThrowDataEvents(true);
       });
       $('.piece').draggable();
     });
     CTS.engine.forrest.trees.body.on('ValueChanged', function(evt) {
       console.log("VAL", evt);
     });

   });
});
