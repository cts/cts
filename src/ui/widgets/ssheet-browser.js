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
};


CTS.UI.SSheetBrowser.prototype.showTable = function($node, cf) {
  var row = 0;
  var hadOne = true;
  var html = "<table>";

  while (hadOne) {
    hadOne = false;
    html += "<tr>";
    console.log(html);
    for (var col = 0; col < cf.children.length; col++) {
      var rn = cf.children[col];
      html += "<td>";
      if (row < rn.children.length) {
        hadOne = true;
        var cell = rn.children[row];
        html += cell.value;
      }
      html += "</td>";
      row += 1;
    }
    html += "</tr>";
    console.log(html);
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
    function(err) {
      CTS.Log.Error(error);
    }
  ).done();
};
