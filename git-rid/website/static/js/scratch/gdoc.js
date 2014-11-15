CTS.status.libraryLoaded.then(function() {

  CTS.$('#authorize-button').click(function() {
    CTS.Util.GSheet.login();
  });

  CTS.$('#getsheets').click(
    function() {
      CTS.Util.GSheet.getSpreadsheets().then(
        function(sheets) {
          var s = '<table>';
          for (var i = 0; i < sheets.length; i++) {
            var sheet = sheets[i];
            s += "<tr><th>" + sheet.key + "</th>";
            s += "<td>" + sheet.title + "</td></tr>";
          }
          s += "</table>";
          CTS.$('#res').html(s);
        },
        function(err) {
          console.err(err);
        }
      );
    }
  );

  CTS.$('#maketree').click(function() {
    var forrest = new CTS.Forrest();
    var sskey = CTS.$('#spreadsheetid').val();
    var spec = {
      sskey: sskey
    };
    var tree = new CTS.Tree.GSpreadsheet(forrest, spec);
    var root = new CTS.Node.GSpreadsheet(spec, tree);
    tree.setRoot(root);
    root.realizeChildren().then(
      function() {
        CTS.$('#res').html("tree is in window.thetree");
        window.thetree = tree;
      },
      function(reason) {
        CTS.$('#res').html(reason);
      });
  });

  CTS.$('#create').click(CTS.Util.GSheet.createSpreadsheet);

  CTS.$('#getworksheets').click(function() {
    var key = CTS.$('#spreadsheetid').val();
    CTS.Util.GSheet.getWorksheets(key).then(
      function(sheets) {
        var s = '<table>';
        for (var i = 0; i < sheets.length; i++) {
          var sheet = sheets[i];
          s += "<tr><th>" + sheet.key + "</th>";
          s += "<td>" + sheet.title + "</td></tr>";
        }
        s += "</table>";
        CTS.$('#res').html(s);
      },
      function(err) {
        console.err(err);
      }
    );
  });

  CTS.$('#setCell').click(function() {
    var ss = CTS.$('#spreadsheetid').val();
    var ws = CTS.$('#worksheetid').val();
    var row = CTS.$('#rowNum').val();
    var col = CTS.$('#colNum').val();
    var val = CTS.$('#cellValue').val();
    var promise = CTS.Util.GSheet.modifyCell(
      ss, ws, row, col, val
    );
  });

  CTS.$('#getdata').click(function() {
    var ss = CTS.$('#spreadsheetid').val();
    var ws = CTS.$('#worksheetid').val();
    CTS.Util.GSheet.getWorksheetItems(ss, ws).then(
      function(sheet) {
      console.log(sheet);
       var headers = {};
       for (var i = 0; i < sheet.items.length; i++) {
         for (var key in sheet.items[i].data) {
           headers[key] = 1;
         }
       }
       var h = [];
       for (var key in headers) {
         h.push(key);
       }
       var s = "<table><tr>";
       for (var hea in h) {
         s += "<th>" + hea + "</th>"
       }
       s += "</tr>";

       for (var i = 0; i < sheet.items.length; i++) {
         s += "<tr>";
         for (var j = 0; j < h.length; j++) {
           s += "<td>";
           if (typeof sheet.items[i].data[h[j]] != 'undefined') {
             s += sheet[i].data[h[j]];
           }
           s += "</td>";
         }
         s += "</tr>";
       }
       s += "</table>";
       CTS.$('#res').html(s);
      },
      function(err) {
        console.err(err);
      }
    );
  });

  var testCollab = function(key) {
    gapi.load("auth:client,drive-realtime,drive-share", function() {
      gapi.drive.realtime.load(key,
        function(f) {

        },
        function(f) {
        }
      );
    });
  };

});
