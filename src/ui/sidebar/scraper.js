_CTSUI.Scraper = function(tray, $page) {
  this._tray = tray; // A Javascript object
  this.$page = $page;
  this.$container = null;
  this.$node = null;

  this.loadMockup();
};

_CTSUI.Scraper.prototype.loadMockup = function() {
  this.$container = CTS.$("<div class='cts-ui-scraper-page'></div>");
  var cts = "@html scraper " + CTS.UI.URLs.Mockups.scraper + ";";
  CTS.UI.Util.addCss(CTS.UI.URLs.Styles.scraper);
  cts += "this :is scraper | #cts-ui-scraper;";
  this.$container.attr("data-cts", cts);
  var self = this;
  this.$container.on("cts-received-is", function(evt) {
    self.setupMockup()
    evt.stopPropagation();
  });
  this.$container.appendTo(this.$page);
};

_CTSUI.Scraper.prototype.setupMockup = function() {
    var self = this;
    this.$node = this.$container.find('.cts-ui-scraper');
    this.$header = this.$node.find('.cts-ui-header');
    this.$back = this.$node.find('.cts-ui-back');
    this.$back.on('click', function() {
      self._tray.popPage();
    });
};

_CTSUI.Scraper.prototype.requestedWidth = function() {
  return 200;
};

_CTSUI.Scraper.prototype.updateSize = function(height) {
    this.$container.height(height);
    this.$header.width(width);
};

