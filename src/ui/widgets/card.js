/**
 * Card
 *
 * This is a UI widget for flipping an element over.
 *
 * Implementation adapted from:
 *  http://davidwalsh.name/css-flip
 *
 * Args:
 *  $       - jQuery (can be found at CTS.$ once CTS loads)
 *  $front  - The front of the card
 *  $back   - The back of the card
 */
_CTSUI.Card = function($, $front, $back) {
  this.$ = $;
  this.$front = $front;
  this.$back = $back;
  if (typeof $back == 'undefined') {
    this.$back = this.$('<div></div>');
  }

  this.initializeCss();
  this.initializeCard();
  this._showingFront = true;
};


/** Adds CSS to the HEAD if it isn't already
  */
_CTSUI.Card.CssAdded = false;
_CTSUI.Card.Css = "<style>" +
  ".cts-ui-card { -webkit-perspective: 1000; -moz-perspective: 1000; perspective: 1000; }" +
  ".cts-ui-card-flipper { "+
     "-webkit-transition: 0.6s; -moz-transition: 0.6s; transition: 0.6s; " +
     "-webkit-transform-style: preserve-3d; -moz-transform-style: preserve-3d; transform-style: preserve-3d; " +
     "position: relative } " +
  ".cts-ui-card-front, .cts-ui-card-back {" +
     "-webkit-backface-visibility: hidden; -moz-backface-visibility: hidden; backface-visibility: hidden; " +
    "position: absolute; top: 0; left: 0;} " +
  ".cts-ui-card-front { z-index: 2; }" +
  ".flip .cts-ui-card-flipper {-webkit-transform: rotateY(180deg); -moz-transform: rotateY(180deg); transform: rotateY(180deg) }" +
  ".cts-ui-card-back { -webkit-transform: rotateY(180deg); -moz-transform: rotateY(180deg); transform: rotateY(180deg); }" +
  "</style>";

_CTSUI.Card.prototype.initializeCss = function() {
  if (! _CTSUI.Card.CssAdded) {
    this.$('head').append(_CTSUI.Card.Css);
    _CTSUI.Card.CssAdded = true;
  }
};

/** Replaces the element in the DOM with a card structure.
 *
 */
_CTSUI.Card.prototype.initializeCard = function() {
  // Set the width and height.
  var width = 320;
  var height = 480;

  var widthPx = width + 'px';
  var heightPx = height+ 'px';

  this.$front.wrap("<div class='cts-ui-card-front'></div>");
  this.$frontContainer = this.$(this.$front.parent());

  this.$frontContainer.wrap("<div class='cts-ui-card-flipper'></div>");
  this.$flipper = this.$(this.$frontContainer.parent());

  this.$backContainer = this.$("<div class='cts-ui-card-back'></div>");
  this.$backContainer.append(this.$back);
  this.$flipper.append(this.$backContainer);

  this.$flipper.wrap("<div class='cts-ui-card'></div>");
  this.$card = this.$(this.$flipper.parent());

  this.$frontContainer.css('height', heightPx);
  this.$backContainer.css('height', heightPx);
  this.$card.css('height', heightPx);

  this.$frontContainer.css('width', widthPx);
  this.$backContainer.css('width', widthPx);
  this.$card.css('width', widthPx);

};

_CTSUI.Card.prototype.showBack = function() {
  if (! this._showingFront) {
    return;
  }
  this._showingFront = false;
  this.$card.addClass('flip');
};

_CTSUI.Card.prototype.showFront = function() {
  if (this._showingFront) {
    return;
  }
  this._showingFront = true;
  this.$card.removeClass('flip');
};
