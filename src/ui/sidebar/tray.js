CTS.registerNamespace('CTS.UI.Tray');

CTS.UI.Tray = function() {
  this.$body = CTS.$('body');
  this._originalBodyMargin = this.$body.css("margin-left");
  this.$body.css({"position": "relative", "overflow-x": "scroll"});
  this._width = 100;
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
  this.$body.animate({"left": ((this._width + 1) + "px")});

  var cts = "@html tray " + CTS.UI.URLs.Mockups.tray + ";";
  CTS.Util.addCss(CTS.UI.URLs.Styles.tray);
  CTS.Util.addCss(CTS.UI.URLs.Styles.bootstrap);
  CTS.Util.addCss(CTS.UI.URLs.Styles.modal);
  CTS.Util.addCss(CTS.UI.URLs.Styles.ionicons);
  cts += "this :is tray | #cts-ui-tray;";
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

  this._button = this.$node.find('.cts-ui-expand-tray-button');
  this._button.on('click', function() {
    self.toggle();
  });

  this._buttonContainer = this.$node.find('.cts-ui-expand-tray');
  this._buttonContainer.css({ zIndex: 65000 });

  var $page = CTS.$('<div class="cts-ui-page"></div>');
  $page.appendTo(this.$trayContents);
  this._editor = new CTS.UI.Editor(this, $page);
  this._pages.push(this._editor);

  this.updateSize();
  CTS.$(window).resize(function() {
    self.updateSize();
  });

  this.toggle();
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

CTS.UI.Tray.prototype.transitionToWidth = function(width, completeFn) {
  this._width = width;
  var outerWidth = width + this._buttonWidth;
  this.$node.find('.cts-ui-tray-contents').animate({
    'width': width + 'px'
  });
  this.$node.animate({
    'width': outerWidth + 'px'
  });
  var spec2 = {
    'left': ((this._width + 1) + "px"),
  };
  this.$node.find('.cts-ui-expand-tray').animate(spec2);
};

CTS.UI.Tray.prototype.isOpen = function() {
  return this.$node.css("left") == "0px";
};

CTS.UI.Tray.prototype.open = function() {
    //var fromTop = CTS.$(window).scrollTop();
  this.$node.animate({"left":"0px"});
    //CTS.$(window).scrollTop(fromTop);
  this.$body.animate({"left": ((this._width + 1) + "px")});
};

CTS.UI.Tray.prototype.close = function() {
    //var fromTop = CTS.$(window).scrollTop();
  this.$node.animate({"left":("-" + (this._width + 1) + "px")});
    //CTS.$(window).scrollTop(fromTop);
  this.$body.animate({"left":"0px"});
};

CTS.UI.Tray.prototype.toggle = function() {
  if (this.isOpen()) {
    this.close();
    this.$node.removeClass("cts-ui-open");
    this.$node.addClass("cts-ui-closed");
  } else {
    this.open();
    this.$node.removeClass("cts-ui-closed");
    this.$node.addClass("cts-ui-open");
  } 
};

CTS.UI.Tray.prototype.updateSize = function() {
  // Set the height of the tray to the window size
  var windowHeight = CTS.$(window).height();
  this.$node.height(windowHeight);
  this.$trayContents.height(windowHeight);
  for (var i = 0; i < this._pages.length; i++) {
    this._pages[i].updateSize(windowHeight, this._width);
  }
};
