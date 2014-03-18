CTS.registerNamespace('CTS.UI.ProxyBrowser');

/**
 * Proxy Browser
 *
 * Args:
 *  $ - jQuery (can be found at CTS.$ once CTS loads)
 *  q - The Q library (can be found at CTS.Q once CTS loads)
 */
CTS.UI.ProxyBrowser = function($, q, $container, proxy) {
  this._$ = $;
  this._q = q;
  this.proxy = true;
  if (typeof proxy != 'undefined') {
    this.proxy = proxy;
  }
  this.$container = $container;
  this.$root = $('<div class="cts-ui-proxybrowser cts-ignore"></div>');
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
    width: '100%',
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
    'border': '1px solid #ccc',
    'border-top': 'none'
  });

  this.$root.append(this.$iframe);

  this.onresize();
};

CTS.UI.ProxyBrowser.prototype.onresize = function() {
  console.log("proxy onresize");
  var w = this.$container.width();
  var h = this.$container.height();
  this.$root.height(h);
  this.$root.width(w);
  this.$urldiv.width(w);
  this.$iframe.width(w);
  this.$iframe.height(h - this.$urldiv.height());
};

CTS.UI.ProxyBrowser.prototype.document = function() {
  return this.$iframe[0].contentDocument;
};

CTS.UI.ProxyBrowser.prototype.loadurl = function() {
  var url = this.$urlinput.val();
  if (this.proxy) {
    url = encodeURIComponent(url);
    var proxy = CTS.UI.URLs.Services.proxy + "?url=" + url;
    this.$iframe.attr('src', proxy);
  } else {
    this.$iframe.attr('src', url);
  }
};
