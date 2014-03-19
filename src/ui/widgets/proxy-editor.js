CTS.registerNamespace('CTS.UI.ProxyEditor');

/**
 * Proxy Browser
 *
 * Args:
 *  $ - jQuery (can be found at CTS.$ once CTS loads)
 *  q - The Q library (can be found at CTS.Q once CTS loads)
 */
CTS.UI.ProxyEditor = function($, q, $container, proxy, config) {
  this._$ = $;
  this._q = q;
  this.config = config || {};
  if (typeof this.config.sheet == 'undefined') {
    this.config.sheet = true;
  }
  if (typeof this.config.html == 'undefined') {
    this.config.html = true;
  }
  if (typeof this.config.preview == 'undefined') {
    this.config.preview = true;
  }

  this.proxy = true;
  if (typeof proxy != 'undefined') {
    this.proxy = proxy;
  }
  this.$container = $container;
  this.$root = $('<div class="cts-ui-ProxyEditor cts-ignore"></div>');
  this.$container.append(this.$root);
  this.$container.on('resize', function() {
    this.onresize();
  });
  this.setup();
};

CTS.UI.ProxyEditor.prototype.setup = function() {
  var self = this;
  this.$table = this._$('<table cellspacing=0 cellpadding=0 class="harness">' +
    '<tr class="headerbar headerbar1"></tr>' +
    '<tr class="bigbox bigbox1"></tr>' +
    '<tr class="headerbar headerbar2"></tr>' +
    '<tr class="bigbox bigbox2"></tr>' +
    '</table>');
  this.$root.append(this.$table);
  this.$headerrow = this.$table.find('tr.headerbar1');
  this.$secondheaderrow = this.$table.find('tr.headerbar2');
  this.$mainrow = this.$table.find('tr.bigbox1');
  this.$secondrow = this.$table.find('tr.bigbox2');

  this.headerrows = [this.$headerrow, this.$secondheaderrow];
  this.rows = [this.$mainrow, this.$secondrow];
  this.firstRow = [this.setupSheet, this.setupHtml];
  this.secondRow = [this.setupCts, this.setupPreview];

  this.pct = [
    parseInt(100.0 / this.firstRow.length),
    parseInt(100.0 / this.secondRow.length)
  ];

  for (var i = 0; i < this.firstRow.length; i++) {
    this.firstRow[i].call(this, 0);
  }
  for (var i = 0; i < this.secondRow.length; i++) {
    this.secondRow[i].call(this, 1);
  }

  this.onresize();
};

CTS.UI.ProxyEditor.prototype.createURLBar = function(appendTo, callback) {
  urlinput = this._$('<input placeholder="URL" />');
  urlinput.css({
    border: '2px solid #777',
    'padding-left': '5px',
    'width': '300px'
  });
  urlinput.keyup(function (e) {
    if (e.keyCode == 13) {
      callback(urlinput.val());
    }
  });
  appendTo.append(urlinput);
};

CTS.UI.ProxyEditor.prototype.setupSheet = function(row) {
  console.log("Setup sheet");
  if (this.config.sheet) {
    // HEADER
    var sheetHeader = this._$('<td width="' + this.pct[row] + '%" class="sheet-head"></td>');
    sheetHeader.html('<table><tr><td><h2 class="title">' +
      '<img src="/img/userstudy/sheet-icon.png" /> Sheet</h2></td><td id="sheeturl"></td></tr></table>');
    this.headerrows[row].append(sheetHeader);
    var self = this;
    this.createURLBar(sheetHeader.find("#sheeturl"), function(url) {
      self.loadsheet(url);
    });

    // BODY
    var main = this._$('<td width="' + this.pct[row] + '%"></td>');
    this.rows[row].append(main);
    this.sheetbrowser = new CTS.UI.SSheetBrowser(this._$, this._q, main, this.proxy, false);
  }
};

CTS.UI.ProxyEditor.prototype.setupPreview = function(row) {
  console.log("Setup preview");
  if (this.config.preview) {
    var previewHeader = this._$('<td width="' + (this.pct[row] + 1) + '%" class="preview-head"></td>');
    previewHeader.html('<table><tr><td><h2 class="title">' +
      '<img src="/img/userstudy/preview-icon.png" /> Preview</h2></td><td id="previewurl"></td></tr></table>');
    this.headerrows[row].append(previewHeader);

    var btn = this._$('<button class="btn btn-sm btn-primary">Reload</button>');
    var self = this;
    btn.on('click', function() {
      self.transferHtml();
    });
    previewHeader.find('#previewurl').append(btn);

    // Body
    var main = this._$('<td width="' + (this.pct[row] + 1) + '%" class="preview"></td>');
    this.rows[row].append(main);
    this.proxybrowser = new CTS.UI.ProxyBrowser(this._$, this._q, main, this.proxy, false);
  }

};

CTS.UI.ProxyEditor.prototype.setupHtml = function(row) {
  console.log("Setup HTML");
  if (this.config.html) {
    // HEADER
    var editorHeader = this._$('<td width="' + this.pct[row] + '%" class="editor-head"></td>');
    editorHeader.html('<table><tr><td><h2 class="title">' +
      '<img src="/img/userstudy/editor-icon.png" /> Editor</h2></td><td id="htmlurl"></td></tr></table>');
    this.headerrows[row].append(editorHeader);

    var self = this;
    this.createURLBar(editorHeader.find("#htmlurl"), function(url) {
      self.loadurl(url);
    });

    var editor = this._$('<td width="' + this.pct[row] + '%" id="editor" class="editor"></td>');
    this.rows[row].append(editor);
  }
};

CTS.UI.ProxyEditor.prototype.setupCts = function(row) {
  console.log("Setup CTS");
  if (this.config.html) {
    // HEADER
    var editorHeader = this._$('<td width="' + this.pct[row] + '%" class="editor-head"></td>');
    editorHeader.html('<table><tr><td><h2 class="title">' +
      '<img src="/img/userstudy/editor-icon.png" /> Treesheet</h2></td><td id="htmlurl"></td></tr></table>');
    this.headerrows[row].append(editorHeader);
    var editor = this._$('<td width="' + this.pct[row] + '%" id="ctseditor" class="ctseditor"></td>');
    this.rows[row].append(editor);
  }
};

CTS.UI.ProxyEditor.prototype.onresize = function() {
  console.log("proxy onresize");
  var w = this.$container.width();
  var h = this.$container.height();
  this.$table.height(h);
  this.$table.width(w);
};

CTS.UI.ProxyEditor.prototype.loadurl = function(url) {
  if (this.proxy) {
    url = encodeURIComponent(url);
    url = CTS.UI.URLs.Services.proxy + "?url=" + url;
  }
  var self = this;
  this._$.get(url, {
    mimeType: 'text/html'
  }).done(function(data, textStatus, jqXHR) {
    self.proxybrowser.loadhtml(data);
    self.createEditor(data);
  }).fail(function(jqXHR, textStatus, errorThrown) {

  });
};

CTS.UI.ProxyEditor.prototype.loadsheet = function(url) {
  this.sheetbrowser.loadurl(url);
};

CTS.UI.ProxyEditor.prototype.transferHtml = function() {
  var html = this.editor.getValue();
  this.proxybrowser.loadhtml(html);
};

CTS.UI.ProxyEditor.prototype.createEditor = function(html) {
  var self = this;
  if (typeof this.editor == 'undefined') {
    this.editor = ace.edit("editor");
    this.editor.getSession().setMode("ace/mode/html");
  }
  this.editor.setValue(html);
  this.editor.clearSelection();
};
