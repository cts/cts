CTS.registerNamespace('CTS.UI.ProxyEditor');

/**
 * Proxy Browser
 *
 * Args:
 *  $ - jQuery (can be found at CTS.$ once CTS loads)
 *  q - The Q library (can be found at CTS.Q once CTS loads)
 */
CTS.UI.ProxyEditor = function($, q, $container, proxy) {
  this._$ = $;
  this._q = q;
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
  this.$table = this._$('<table>' +
    '<tr class="urlbar"><td colspan=2 class="urlbar"></td></tr>' +
    '<tr class="headerbar"><td width="50%" class="editor-head"></td><td class="preview-head"></td></tr>' +
    '<tr class="bigbox"><td id="editor" width="50%" class="editor"></td><td class="preview"></td></tr></table>');
  this.$root.append(this.$table);
  this.$table.find('td.urlbar').append(this.createURLBar());
  this.$editortd = this.$table.find('td.editor');
  this.$editortd.css({'font-size': '14px'});
  this.$previewtd = this.$table.find('td.preview');
  this.proxybrowser = new CTS.UI.ProxyBrowser(this._$, this._q, this.$previewtd, this.proxy, false);
  this.$editorHeadtd = this.$table.find('td.editor-head');
  this.$previewHeadtd = this.$table.find('td.preview-head');
  this.$bixbox = this.$table.find('tr.bigbox');
  this.$editorHeadtd.html('<h2 class="title">' +
    '<img src="/img/userstudy/editor-icon.png" /> Editor</h2>');
  this.$previewHeadtd.html('<h2 class="title">' +
    '<img src="/img/userstudy/preview-icon.png" /> Preview</h2>');
  this.onresize();
};

CTS.UI.ProxyEditor.prototype.createURLBar = function() {
  var self = this;
  this.$urldiv = this._$('<div class="cts-ui-proxyeditor-url"></div>');
  this.$urldiv.css({
    'padding-bottom': '10px;'
  });
  this.$urlinput = this._$('<input placeholder="URL" />');
  this.$urlinput.css({
    border: '2px solid #777',
    position: 'relative',
    width: '100%',
    'padding-left': '5px'
  });
  this.$urlinput.keyup(function (e) {
    if (e.keyCode == 13) {
      self.loadurl();
    }
  });
  this.$urldiv.append(this.$urlinput);
  return this.$urldiv;
};

CTS.UI.ProxyEditor.prototype.onresize = function() {
  console.log("proxy onresize");
  var w = this.$container.width();
  var h = this.$container.height();
  this.$table.height(h);
  this.$table.width(w);
};

CTS.UI.ProxyEditor.prototype.loadurl = function() {
  var url = this.$urlinput.val();
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

CTS.UI.ProxyEditor.prototype.createEditor = function(html) {
  var self = this;
  if (typeof this.editor == 'undefined') {
    this.editor = ace.edit("editor");
    this.editor.getSession().setMode("ace/mode/html");
  }
  this.editor.setValue(html);
};
