CTS.registerNamespace('CTS.UI.ProxyEditor');

/**
 * Proxy Browser
 *
 * Args: *  $ - jQuery (can be found at CTS.$ once CTS loads)
 *  q - The Q library (can be found at CTS.Q once CTS loads)
 */
CTS.UI.ProxyEditor = function($, q, $container, proxy, config) {
  this._$ = $;
  this._q = q;
  this.name = "";
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
  var self = this;
  this._$(window).on('resize', function() {
    self.onresize();
  });
  this.$root = $('<div class="cts-ui-ProxyEditor cts-ignore"></div>');
  this.$container.append(this.$root);
  this.setup();
};

CTS.UI.ProxyEditor.prototype.setup = function() {
  var self = this;
  this.$table = this._$('<table cellspacing=0 cellpadding=0 class="harness">' +
    '<tr class="headerbar headerbar1"></tr>' +
    '<tr class="bigbox bigbox1"></tr>' +
  //  '<tr class="headerbar headerbar2"></tr>' +
  //  '<tr class="bigbox bigbox2"></tr>' +
    '</table>');
  this.$root.append(this.$table);
  this.$headerrow = this.$table.find('tr.headerbar1');
  //this.$secondheaderrow = this.$table.find('tr.headerbar2');
  this.$mainrow = this.$table.find('tr.bigbox1');
  //this.$secondrow = this.$table.find('tr.bigbox2');

  this.headerrows = [this.$headerrow];//, this.$secondheaderrow];
  this.rows = [this.$mainrow];//, this.$secondrow];
  this.firstRow = [this.setupSheet, this.setupHtml, this.setupPreview];
  //this.secondRow = [];//this.setupCts, this.setupPreview];

  this.pct = [
    parseInt(100.0 / this.firstRow.length)//,
    //parseInt(100.0 / this.secondRow.length)
  ];

  for (var i = 0; i < this.firstRow.length; i++) {
    this.firstRow[i].call(this, 0);
  }
  //for (var i = 0; i < this.secondRow.length; i++) {
  //  this.secondRow[i].call(this, 1);
  //}

  this.onresize();

  var snippet = this.$container.attr('data-snippetid');
  if (snippet != null) {
    console.log("Trying to load snippet", snippet);
    this.loadSnippet(snippet);
  }
};

CTS.UI.ProxyEditor.prototype.createURLBar = function(appendTo, callback) {
  var urlinput = this._$('<input placeholder="URL" />');
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
    main.css({'border-right': '3px solid #ccc', 'border-left': '3px solid #ccc'});
    this.rows[row].append(main);
    this.sheetbrowser = new CTS.UI.SSheetBrowser(this._$, this._q, main, this.proxy, false);
  }
};

CTS.UI.ProxyEditor.prototype.setupPreview = function(row) {
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
    main.css({'border-left': '3px solid #ccc', 'border-right': '3px solid #ccc'});
    this.rows[row].append(main);
    this.proxybrowser = new CTS.UI.ProxyBrowser(this._$, this._q, main, this.proxy, false);
  }

};

CTS.UI.ProxyEditor.prototype.setupHtml = function(row) {
  if (this.config.html) {
    // HEADER
    var editorHeader = this._$('<td width="' + this.pct[row] + '%" class="editor-head"></td>');
    editorHeader.html('<table><tr><td><h2 class="title">' +
      '<img src="/img/userstudy/editor-icon.png" /> HTML</h2></td><td id="htmlurl"></td></tr></table>');
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

    if (typeof this.ctseditor == 'undefined') {
      this.ctseditor = ace.edit("ctseditor");
      this.ctseditor.getSession().setMode("ace/mode/css");
    }
    this.ctseditor.setValue('');
    this.ctseditor.clearSelection();
  }
};

CTS.UI.ProxyEditor.prototype.onresize = function() {
  console.log("proxy onresize");
  this.proxybrowser.onresize();
  this.sheetbrowser.onresize();
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

  // Now we load in the CTS.
  if (html.indexOf('cts.js') == -1) {
    var cts = "<style type='text/cts'>" + this.getCts() + "</style>";
    var ctsLink = "<script src='http://localhost:3000/release/cts.js'></script>";
    var head = cts + ctsLink;
    html = html.replace("</head>", head + "</head>");
  }
  this.proxybrowser.loadhtml(html);
};

CTS.UI.ProxyEditor.prototype.getCts = function() {
  if (typeof this.ctseditor == 'undefined') {
    return '';
  } else {
    return this.ctseditor.getValue();
  }
};

CTS.UI.ProxyEditor.prototype.loadSnippet = function(snippet) {
  var self = this;
  this.snippet = snippet;
  var url = "/snippet/" + snippet + "/json";
  this._$.getJSON(url).done(function(json, textStatus, jqXHR) {
    self.proxybrowser.loadhtml(json.html);
    self.createEditor(json.html);
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log("Could not load snippet", snippet);
  });
};

CTS.UI.ProxyEditor.prototype.setName = function(name) {
  this.name = name;
};

CTS.UI.ProxyEditor.prototype.save = function(csrf) {
  var data = {
    name: this.name,
    html: this.editor.getValue(),
    cts: this.getCts(),
    _csrf: csrf
  }
  var url = "/snippet/" + this.snippet;
  this._$.post(url, data).done(function(json, textStatus, jqXHR) {
    if (typeof json != 'undefined') {
      if (typeof json.redirect != 'undefined') {
        if (json.success) {
          Alertify.log.info("<b>New copy</b> forked for you.");
          window.location.pathname = json.redirect;
        } else {
          Alertify.log.error(json.message);
          window.location.pathname = json.redirect;
        }
      } else {
        Alertify.log.success("Snippet saved.", 1500);
      }
    }
  }).fail(function(jqXHR, textStatus, errorThrown) {
    Alertify.log.error("Snippet could not be saved");
  });
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
