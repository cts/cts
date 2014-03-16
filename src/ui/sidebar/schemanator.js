CTS.registerNamespace('CTS.UI.Schemanator');

CTS.UI.Schemanator = function(tray, $page) {
  this._tray = tray; // A Javascript object
  this.$page = $page;
  this.$container = null;
  this.$node = null;
  this.loadMockup();
  this.$itemBucket = null;
};

CTS.UI.Schemanator.prototype.loadMockup = function() {
  this.$container = CTS.$("<div class='cts-ui-schemanator-page'></div>");
  var cts = "@html Schemanator " + CTS.UI.URLs.Mockups.Schemanator + ";";
  CTS.UI.Util.addCss(CTS.UI.URLs.Styles.Schemanator);
  cts += "this :is schemanator | #cts-ui-schemanator;";
  this.$container.attr("data-cts", cts);
  var self = this;
  this.$container.on("cts-received-is", function(evt) {
    self.setupMockup()
    evt.stopPropagation();
  });
  this.$container.appendTo(this.$page);
};

CTS.UI.Schemanator.prototype.setupMockup = function() {
    var self = this;
    this.$node = this.$container.find('.cts-ui-schemanator');
    this.$header = this.$node.find('.cts-ui-header');
    this.$back = this.$node.find('.cts-ui-back');
    this.$back.on('click', function() {
      self._tray.popPage();
    });
    this.$itemBucket = this.$node.find('.cts-ui-item-bucket');
};

CTS.UI.Schemanator.prototype.requestedWidth = function() {
  return 200;
};

CTS.UI.Schemanator.prototype.updateSize = function(height) {
    this.$container.height(height);
    this.$header.width(width);
};

CTS.UI.Schemanator.prototype.offerItems = function(items) {
  if (this.$itemBucket == null) {
    CTS.Log.Error("Item Bucket was null");
    return;
  }
  var html = "";
  for (var i = 0; i < items.length; i++) {
    html += this.htmlForItem(items[i]);
  }
  this.$itemBucket.html(html);
};

CTS.UI.Schemanator.prototype.htmlForItem = function(item) {
  return "<span class='sch-item'>" + item.name + "</span>";
}
