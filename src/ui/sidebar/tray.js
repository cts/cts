CTS.registerNamespace('CTS.UI.Tray');

CTS.UI.Tray = function() {
  this.$body = CTS.$('body');
  this.$body.css({"position": "relative", "overflow-x": "scroll"});
  this._originalBodyMargin = this.$body.css("margin-left");
  this._buttonWidth = 37;

  // Pages inside the tray, such as the theminator
  this._pages = [];

  // The container DIV which contains the CTS to load the HTML impl.
  this.$container = null;

  // The node representing the tray body, loaded by CTS.
  this.$node = null;

  this.loadMockup();
};

CTS.UI.Tray.prototype.loadMockup = function() {
  this.$container = CTS.$("<div class='cts-ui'></div>");
  this.$container.css({
    zIndex: 64999// Important: more than the picker.
  });

  var cts = "@html tray " + CTS.UI.URLs.Mockups.tray + ";";
  CTS.Util.addCss(CTS.UI.URLs.Styles.tray);
  CTS.Util.addCss(CTS.UI.URLs.Styles.bootstrap);
  CTS.Util.addCss(CTS.UI.URLs.Styles.modal);
  CTS.Util.addCss(CTS.UI.URLs.Styles.ionicons);
  cts += "this :is tray | #cts-ui-tray-widget;";
  this.$container.attr("data-cts", cts);
  var self = this;
  this.$container.on("cts-received-is", function(evt) {
    self.setupMockup();
    evt.stopPropagation();
  });
  this.$container.appendTo(this.$body);
};

CTS.UI.Tray.prototype.setupMockup = function() {
  var self = this;
  this.$node = this.$container.find('.cts-ui-tray');
  this.$trayContents = this.$container.find('.cts-ui-tray-contents');

  this.$openButton = CTS.$('#cts-ui-tray-button');
  this.$openButton.on('click', function() {
    this.blur();
    self.open();
  });

  this.$closeButton = this.$node.find('.close-btn');
  this.$closeButton.on('click', function() {
    this.blur();
    self.close();
  });

  var $page = CTS.$('<div id="cts-ui-editor" class="cts-ui-page"></div>');
  $page.appendTo(this.$trayContents);
  this._editor = new CTS.UI.Editor(this, $page);
  this._pages.push(this._editor);

  this.updateSize();
  CTS.$(window).resize(function() {
    self.updateSize();
  });

  // Start in the OFF state.
  this.toggle(false);
};

CTS.UI.Tray.prototype.invokeTheminator = function(page) {
  var $page = CTS.$('<div class="cts-ui-page"></div>');
  $page.hide();
  $page.appendTo(this.$trayContents);
  this._theminator = new CTS.UI.Theminator(this, $page);
  this.pushPage(this._theminator);
};

CTS.UI.Tray.prototype.invokeScraper = function(page) {
  var $page = CTS.$('<div class="cts-ui-page"></div>');
  $page.hide();
  $page.appendTo(this.$trayContents);
  this._scraper = new CTS.UI.Scraper(this, $page);
  this.pushPage(this._scraper);
};

CTS.UI.Tray.prototype.pushPage = function(page) {
  this._pages[this._pages.length - 1].$page.hide();
  this._pages.push(page);
  page.$page.show();
  this.transitionToWidth(page.requestedWidth());
  var windowHeight = CTS.$(window).height();
  page.updateSize(windowHeight);
};

CTS.UI.Tray.prototype.popPage = function() {
  var page = this._pages.pop();
  if (page) {
    page.$page.remove();
  }
  var newPage = this._pages[this._pages.length - 1];
  this.transitionToWidth(newPage.requestedWidth());
  newPage.$page.show();
};

CTS.UI.Tray.prototype.open = function() {
  var self = this;
  this.$openButton.fadeOut(200, function() {
    self.$node.removeClass('closed');
    //this.$node.animate({"left":"0px"});
  });
};

CTS.UI.Tray.prototype.close = function() {
  this.$node.addClass("closed");
  this.$openButton.delay(300).fadeIn(200);
};

CTS.UI.Tray.prototype.updateSize = function() {
  // Set the height of the tray to the window size
  var windowHeight = CTS.$(window).height();
  this.$node.height(windowHeight);
  this.$trayContents.height(windowHeight);
};
