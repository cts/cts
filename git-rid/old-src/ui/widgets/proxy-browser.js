CTS.registerNamespace('CTS.UI.ProxyBrowser');

/**
 * Proxy Browser
 *
 * Args:
 *  $ - jQuery (can be found at CTS.$ once CTS loads)
 *  q - The Q library (can be found at CTS.Q once CTS loads)
 */
CTS.UI.ProxyBrowser = function($, q, $container, proxy, showurl) {
  this._$ = $;
  this._q = q;
  if (typeof showurl == 'undefined') {
    this.showurl = true;
  } else {
    this.showurl = showurl;
  }
  this.proxy = true;
  if (typeof proxy != 'undefined') {
    this.proxy = proxy;
  }
  this.$container = $container;
  this.$root = $('<div style="height: 100%; width: 100%" class="cts-ui-proxybrowser cts-ignore"></div>');
  this.$container.append(this.$root);
  this.$container.on('resize', function() {
    this.onresize();
  });
  this.setup();
};

CTS.UI.ProxyBrowser.prototype.setup = function() {
  var self = this;
  if (this.showurl) {
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
        self.urlchanged();
      }
    });
    this.$urldiv.append(this.$urlinput);
    this.$root.append(this.$urldiv);
  }

  this.$iframe = this._$('<iframe style="height: 100%; width: 100%"></iframe>');
  this.$iframe.css({
    'border': 'none'
  });

  this.$root.append(this.$iframe);
  this.onresize();
};

CTS.UI.ProxyBrowser.prototype.onresize = function() {
  console.log("proxy onresize");
  var w = this.$container.width();
  var h = this.$container.height();
  //this.$root.height(h);
  //this.$root.width(w);
  if (this.showurl) {
    this.$urldiv.width(w);
    //this.$iframe.height(h - this.$urldiv.height());
  } else {
    //this.$iframe.height(h);
  }
  //this.$iframe.width(w);
};

CTS.UI.ProxyBrowser.prototype.document = function() {
  return this.$iframe[0].contentDocument;
};

CTS.UI.ProxyBrowser.prototype.urlchanged = function() {
  var url = this.$urlinput.val();
  if (this.proxy) {
    url = encodeURIComponent(url);
    var proxy = CTS.UI.URLs.Services.proxy + "?url=" + url;
    this.loadurl(proxy);
  } else {
    this.loadurl(url);
  }
};

CTS.UI.ProxyBrowser.prototype.loadurl = function(url) {
  this.$iframe.attr('src', url);
};

CTS.UI.ProxyBrowser.prototype.loadhtml = function(url) {
  this.$iframe[0].contentWindow.document.open();
  this.$iframe[0].contentWindow.document.write(url);
  this.$iframe[0].contentWindow.document.close();
};
