CTS.registerNamespace('CTS.UI.SSheetBrowser');

/**
 * Proxy Browser
 *
 * Args:
 *  $ - jQuery (can be found at CTS.$ once CTS loads)
 *  q - The Q library (can be found at CTS.Q once CTS loads)
 */
CTS.UI.SSheetBrowser = function($, q, $container, proxy) {
  this._$ = $;
  this._q = q;
  this.proxy = true;
  if (typeof proxy != 'undefined') {
    this.proxy = proxy;
  }
  this.$container = $container;
  this.$root = $('<div class="cts-ui-SSheetBrowser cts-ignore"></div>');
  this.$container.append(this.$root);
  this.$container.on('resize', function() {
    this.onresize();
  });
  this.setup();
};

CTS.UI.SSheetBrowser.prototype.setup = function() {
  var self = this;
  // this.$urldiv = this._$('<div class="cts-ui-SSheetBrowser-url"></div>');
  // this.$urldiv.css({
  //   'padding-bottom': '10px;'
  // });
  // this.$urlinput = this._$('<input placeholder="URL" />');
  // this.$urlinput.css({
  //   border: '2px solid #777',
  //   position: 'relative',
  //   width: '100%',
  //   'padding-left': '5px'
  // });
  // this.$urlinput.keyup(function (e) {
  //   if (e.keyCode == 13) {
  //     self.loadurl();
  //   }
  // });
  // this.$urldiv.append(this.$urlinput);
  this.$root.append(this.$urldiv);

  this.$ssheet = this._$('<div class="ssheet"></div>');
  this.$ssheet.css({
    'border-top': 'none'
  });
  this.$root.append(this.$ssheet);

  this.$tabs = this._$('<ul class="nav nav-pills"></ul>');
  this.$root.append(this.$tabs);

  this.onresize();
};

CTS.UI.SSheetBrowser.prototype.onresize = function() {
  console.log("Ssheet resize");
  // var w = this.$container.width();
  // var h = this.$container.height();
  // this.$root.height(h);
  // this.$root.width(w);
  // // this.$urldiv.width(w);
  // this.$ssheet.width(w);
  // this.$ssheet.height(h - this.$tabs.height());
};


CTS.UI.SSheetBrowser.prototype.clearSheets = function() {
  this.$tabs.html("");
};

CTS.UI.SSheetBrowser.prototype.buildSheets = function() {
  // Assumes this.root is a SSNode.
  this.clearSheets();
  for (var i = 0; i < this.root.children.length; i++) {
    this.buildWorksheet(this.root.children[i]);
  }
  if (this.root.children.length > 0) {
    this.showWorksheet(this.root.children[0]);
  }
};

CTS.UI.SSheetBrowser.prototype.buildWorksheet = function(ws) {
  var self = this;
  var li = CTS.$("<li class='ws-tab'></li>");
  var a = CTS.$("<a href='#'>" + ws.name + "</a></li>");
  li.attr('data-name', ws.name);
  li.on('click', function() {
    self.showWorksheet(ws);
  })
  li.append(a);
  this.$tabs.append(li);
};

CTS.UI.SSheetBrowser.prototype.showWorksheet = function(ws) {
  /*
  this.$tabs.find('li').removeClass('active');
  this.$tabs.find('li[data-name="' + ws.name + '"]').addClass('active');
  var cellfeed = null;
  var itemfeed = null;
  for (var i = 0; i < ws.children.length; i++) {
    if (ws.children[i].kind == 'GCellFeed') {
      cellfeed = ws.children[i];
    } else if (ws.children[i].kind == 'GListFeed') {
      itemfeed = ws.children[i];
    }
  }
  this.showTable(this.$ssheet, cellfeed);
  */
  this.showTable(this.$ssheet, [
    ['FirstName', 'LastName', 'Phone', 'Something'],
    ['Ted', 'Benson', '8628148', 'Something'],
    ['Grace', 'Benson', 'sdf', 'Else'],
    ['Robin', 'Ricketts', 'df', 'Here'],
  ], 4);
};

CTS.UI.SSheetBrowser.ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

CTS.UI.SSheetBrowser.prototype.showTable = function($node, rows, cols) {
  var html = "<table class='sheet'>";
  // Build top header
  html += "</tr>";
  // Now the rows
  var colName = '';
  for (var i = 0; i < rows.length + 1; i++) {
    html += "<tr>";
    if (i == 0) {
      for (var j = 0; j < cols+1; j++) {
        if (j == 0) {
          html += "<td class='colhead rowhead'><div class='wrapper'></div></td>";
        } else {
          var colName = CTS.UI.SSheetBrowser.ALPHABET[(j-1)%26];
          html += "<td class='colhead'><div class='wrapper'>" + colName + "</div></td>";
        }
      }
    } else {
      for (var j = 0; j < rows[i-1].length + 1; j++) {
        var cellName = '';
        if (j > 0) {
          var colName = CTS.UI.SSheetBrowser.ALPHABET[(j-1)%26];
          cellName = colName + j;
        }
        if (j == 0) {
          html += "<td class='rowhead'><div class='wrapper'>" + i + "</div></td>";
        } else if (i == 1) {
          html += "<td class='itemhead " + cellName + "'><div class='wrapper'>" + rows[i-1][j-1] + "</div></td>";
        } else if (i == 2) {
          html += "<td class='firstrow " + cellName + "'><div class='wrapper'>" + rows[i-1][j-1] + "</div></td>";
        } else {
          html += "<td> <div class='wrapper " + cellName + "'>" + rows[i-1][j-1] + "</div></td>";
        }
      }
    }
    html += "</tr>";
  }
  html += "</table>";
  $node.html(html);
};


CTS.UI.SSheetBrowser.prototype.loadurl = function(url) {
  // https://docs.google.com/spreadsheet/ccc?key=0Arj8lnBW4_tZdDNKQmtyd0w4LU5MTFZYMXJ2aG5KMHc&usp=drive_web
  // Let's assume it's the key.

  this.showWorksheet();
  return;

  var spec = {
    kind: 'gsheet',
    url: url
  };
  this.forrest = new CTS.Forrest();
  var self = this;
  CTS.Factory.Tree(spec, this.forrest).then(
    function(tree) {
      self.tree = tree;
      self.root = tree.root;
      self.buildSheets();
    },
    function(err) {
      CTS.Log.Error(error);
    }
  ).done();
};
