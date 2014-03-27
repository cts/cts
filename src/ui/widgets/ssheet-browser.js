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
  this.setup();
};

CTS.UI.SSheetBrowser.prototype.setup = function() {
  var self = this;

  this.$table = this._$('<table class="ssheet-ui"></table>');
  this.$tableone = this._$('<tr class="one"></tr>');
  this.$tabletwo = this._$('<tr class="two"></tr>');
  this.$tableonetd = this._$('<td></td>');
  this.$tabletwotd = this._$('<td></td>');
  this.$tableone.append(this.$tableonetd);
  this.$tabletwo.append(this.$tabletwotd);

  this.$ssheet = this._$('<div class="ssheet"></div>');
  this.$ssheet.css({
    'border-top': 'none'
  });

  this.$tabs = this._$('<ul class="worksheets-list nav nav-pills"></ul>');

  this.$root.append(this.$table);
  this.$table.append(this.$tableone);
  this.$table.append(this.$tabletwo);

  this.$tableonetd.append(this.$ssheet);
  this.$tabletwotd.append(this.$tabs);

  this.onresize();
};

CTS.UI.SSheetBrowser.prototype.onresize = function() {
  var w = this.$container.width();
  var h = this.$container.height();
  console.log("container height", h);
  this.$tableonetd.height(h - 35);
  this.$tabletwotd.height(25);
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
  this.showTable(this.$ssheet, this.makeTable(cellfeed));
};

CTS.UI.SSheetBrowser.prototype.makeTable = function(cf) {
  var ret = [];
  for (var i = 0; i < cf.children.length; i++) {
    var column = cf.children[i];
    for (var j = 0; j < column.children.length; j++) {
      var cell = column.children[j];
      var row = parseInt(cell.row);
      var col = parseInt(cell.colNum);
      var val = cell.value;
      while (ret.length < row) {
        ret.push([]);
      }
      if (ret[row-1].length < (col-1)) {
        ret[row-1][col-1] = val;
      } else {
        while (ret[row-1].length < col-1) {
          ret[row-1].push("");
        }
        ret[row-1][col-1] = val;
      }
    }
  }
  return ret;
};

CTS.UI.SSheetBrowser.ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

CTS.UI.SSheetBrowser.prototype.showTable = function($node, rows, cols) {
  if (typeof cols == 'undefined') {
    cols = 0;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].length > cols) {
        cols = rows[i].length;
      }
    }
  }
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
      for (var j = 0; j < cols + 1; j++) {
        var cellName = '';
        if (j > 0) {
          var colName = CTS.UI.SSheetBrowser.ALPHABET[(j-1)%26];
          cellName = colName + j;
        }
        if (j == 0) {
          html += "<td class='rowhead'><div class='wrapper'>" + i + "</div></td>";
        } else {
          var val = '';
          var klass = '';
          if ((j-1) < rows[i-1].length) {
            val = rows[i-1][j-1];
          }
          if (i == 1) {
            klass = 'itemhead'
          } else if (i == 1) {
            klass = 'firstrow';
          }
          html += "<td class='" + klass + " " + cellName + "'><div class='wrapper'>" + val + "</div></td>";
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
    function(e) {
      console.log(e);
      CTS.Log.Error(e);
    }
  ).done();
};
