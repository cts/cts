CTS.registerNamespace('CTS.UI.ProxyBrowser');

/**
 * Proxy Browser
 *
 * Args:
 *  $ - jQuery (can be found at CTS.$ once CTS loads)
 *  q - The Q library (can be found at CTS.Q once CTS loads)
 */
CTS.UI.ProxyBrowser = function($, q, $container) {
  this._$ = $;
  this._q = q;
  this.$container = $container;
  this.$root = $('<div class="cts-ui-proxybrowser"></div>');
  this.$container.append(this.$root);
  this.$container.on('resize', function() {
    this.onresize();
  });
  this.setup();
};

CTS.UI.ProxyBrowser.prototype.setup = function() {
  var self = this;
  this.$urldiv = this._$('<div class="cts-ui-proxybrowser-url"></div>');
  this.$urldiv.css({
    'padding-bottom': '10px;'
  });
  this.$urlinput = this._$('<input placeholder="URL" />');
  this.$urlinput.css({
    border: '2px solid #777',
    position: 'relative',
    width: 'calc(100% - 10px)',
    'margin-left': '5px',
    'margin-right': '5px',
    'padding-left': '5px'
  });
  this.$urlinput.keyup(function (e) {
    if (e.keyCode == 13) {
      self.loadurl();
    }
  });
  this.$urldiv.append(this.$urlinput);
  this.$root.append(this.$urldiv);

  this.$iframe = this._$('<iframe></iframe>');
  this.$iframe.css({
    'margin-left': '5px',
    'margin-right': '5px',
    'border': 'none'
  });

  this.$root.append(this.$iframe);

  this.onresize();
};

CTS.UI.ProxyBrowser.prototype.onresize = function() {
  console.log("onresize");
  var w = this.$container.width();
  var h = this.$container.height();
  this.$root.height(h);
  this.$root.width(w);
  this.$urldiv.width(w);
  this.$iframe.width(w);
  this.$iframe.height(h - this.$urldiv.height());
};

CTS.UI.ProxyBrowser.prototype.loadurl = function() {
  var url = this.$urlinput.val();
  url = encodeURIComponent(url);
  var proxy = CTS.UI.URLs.Services.proxy + "?url=" + url;
  this.$iframe.attr('src', proxy);
};
