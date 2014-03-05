CTS.registerNamespace('CTS.UI.Picker');

/**
 * Element Picker.
 *
 * Args:
 *  $ - jQuery (can be found at CTS.$ once CTS loads)
 *  q - The Q library (can be found at CTS.Q once CTS loads)
 */
CTS.UI.Picker = function($, q) {
  this._$ = $;
  this._q = q;

  // The promise for picking. Only one pick action possible at a time.
  this._deferred = null;

  // For rate-limiting mousemove responses
  this._lastTime = new Date();

  // For rate-limiting keypress responses
  this._isKeyDown = false;

  // Various magic numbers
  this.CONST = {
    'PREV': 37, // Left
    'NEXT': 39, // Right
    'CHILD': 40, // Down
    'PARENT': 38, // Up
    'SELECT': 13, // Enter
    'QUIT': 27, // Esc
    'MOUSE_MOVEMENT_GRANULARITY': 25, // Millisec
    'UI_CLASS': 'cts-ui-picker-chrome',
    'UI': {
      'BorderThickness': 2,
      'BorderPadding': 5,
      'OptionOnly': {
        'border': '2px solid red',
        'background': 'rgba(255, 0, 0, 0.3)',
        'text': ''
      },
      'Offer': {
        'border': '2px solid blue',
        'background': 'rgba(0, 0, 255, 0.3)',
        'text': 'Click to Edit'
      },
      'NoOffer': {
        'border': 'none',
        'background': 'transparent',
        'text': ''
      }

    }
  };

  // This dictionary stores a copy of these methods with the scope
  // hard wired so that the `this` pointer will address this object
  // instance.
  this.CALLBACK = {
    'keydown': this._$.proxy(this._keyDown, this),
    'keyup': this._$.proxy(this._keyUp, this),
    'mousemove': this._$.proxy(this._mouseMove, this),
    'click': this._$.proxy(this._click, this)
  };

  // The element currently under focus of the picker.
  this._$selected = null;

  // The visual representation of the picker focus in the DOM
  this._$ui = this._$('<div class="cts-ignore ' + this.CONST.UI_CLASS + '"></div>');
  this._$optionTray  = this._$('<div class="cts-ignore ' + this.CONST.UI_CLASS + '"></div>');

  this._$ui.css({
    display: 'none',
    position: 'absolute',
    zIndex: 60000,
    background: this.CONST.UI.Offer.background,
    border: this.CONST.UI.Offer.border
  });

  // Options for the current picking action
  this._currentOpts = {};

};

/*
 * Public methods
 *-----------------------------------------------------*/

/*
 * Returns boolean: whether the picker is active.
 */
CTS.UI.Picker.prototype.isPickInProgress = function() {
  return (this._deferred != null);
};

/**
 * Returns a promise to pick something.
 */
CTS.UI.Picker.prototype.pick = function(opts) {
  console.log("Offer Pick");
  CTS.engine.forrest.stopListening();

  this._currentOpts = opts || {};

  if (this.isPickInProgress()) {
    this.cancel("New pick initiated.");
  }
  this._deferred = this._q.defer();
  this._constructUI();
  return this._deferred.promise;
};

/*
 * Cancel the current picking action.
 */
CTS.UI.Picker.prototype.cancel = function(reason) {
  console.log("Cancel Pick");
  CTS.engine.forrest.startListening();

  if (this.isPickInProgress()) {
    this._destroyUI();
    this._deferred.reject(reason);
    this._deferred = null;
    this._$selected = null
    this._currentOpts = {};
  }
};

/*
 * User interface
 *-----------------------------------------------------*/

CTS.UI.Picker.prototype._constructUI = function() {
  this._$(document)
    .on('keydown', this.CALLBACK.keydown)
    .on('keyup', this.CALLBACK.keyup)
    .on('mousemove', this.CALLBACK.mousemove)
    .on('click', this.CALLBACK.click);

  var h1 = this._$('body').html();
  this._$('body').append(this._$ui);
  var h2 = this._$('body').html();
};

CTS.UI.Picker.prototype._destroyUI = function() {
  this._$(document)
    .off('keydown', this.CALLBACK.keydown)
    .off('keyup', this.CALLBACK.keyup)
    .off('mousemove', this.CALLBACK.mousemove)
    .off('click', this.CALLBACK.click);
  this._$ui.remove();
};

/*
 * Args:
 *  $elem - jQuery object
 */
CTS.UI.Picker.prototype._select = function($elem) {
  console.log("Select", $elem);
  // Behavior on empty selection: nothing
  if ((typeof $elem == 'undefined') || ($elem == null) || ($elem.length == 0)) {
    return;
  }

  // If the selected element is already this, do nothing.
  if ($elem.is(this._$selected)) {
    return;
  }

  var offerElementSelection = this._canSelect($elem);
  var offerElementOptions = this._canOfferOptions($elem);
  var bodyPos = this._$('body').position();
  var w = this._elementWidth($elem);
  var x = this._elementX($elem);

  var left = x - bodyPos.left - this.CONST.UI.BorderPadding;
  var top = ($elem.offset().top - bodyPos.top - this.CONST.UI.BorderPadding);
  var width = w - this.CONST.UI.BorderThickness + (2 * this.CONST.UI.BorderPadding);
  var height = ($elem.outerHeight() - this.CONST.UI.BorderThickness + (2 * this.CONST.UI.BorderPadding));

  var newCss = {
    position: 'absolute',
    left: left  + 'px',
    top: top + 'px',
    width: width + 'px',
    height: height + 'px'
  };

  console.log(newCss);

  if (offerElementSelection) {
    console.log("Offer Selection");
    newCss['background'] = this.CONST.UI.Offer.background;
    newCss['broder'] = this.CONST.UI.Offer.border;
  } else if ((!offerElementSelection) && (offerElementOptions)) {
    console.log("Offer Options");
    newCss['background'] = this.CONST.UI.OptionOnly.background;
    newCss['broder'] = this.CONST.UI.OptionOnly.border;
    this.offerOptions($elem);
  } else {
    console.log("Offer Neither");
    newCss['background'] = this.CONST.UI.NoOffer.background;
    newCss['broder'] = this.CONST.UI.NoOffer.border;
  }
  this._$ui.css(newCss);

  if (offerElementOptions) {
  } else {
  }

  this._$ui.show();
  this._$selected = $elem;
};


CTS.UI.Picker.prototype.makeOptionTray = function($elem) {

};


CTS.UI.Picker.prototype.offerOptions = function($elem) {
  // make option tray
  // show option tray
};

/*
 * Clears current selection.
 */
CTS.UI.Picker.prototype._deselect = function() {
  this._$selected = null;
  this._$ui.hide();
  this._$optionTray.hide();
};

/*
 * Listeners
 *-----------------------------------------------------*/

CTS.UI.Picker.prototype._keyDown = function(event) {
  if (this._isKeyDown) {
    // Browser repeats keydown while key is depressed..
    return;
  }
  this._isKeyDown = true;
  var candidate = null;

  var firstChild = function($e) {
    var kids = $e.children();
    var toSelect = null;
    if (kids.length > 0) {
      toSelect = this._$(kids[0]);
    }
    return toSelect;
  };

  switch (event.which) {
    case this.CONST.PREV:
      candidate = this._$selected.prev();
      while ((candidate.length > 0) && (! this._canSelect(candidate)) && (this._canSelect(candidate))) {
        candidate = candidate.prev();
      }
      if ((candidate != null) && (candidate.length > 0)) {
        this._select(candidate);
      }
      break;
    case this.CONST.NEXT:
      candidate = this._$selected.next();
      while ((candidate.length > 0) && (! this._canSelect(candidate))) {
        candidate = candidate.next();
      }
      if ((candidate != null) && (candidate.length > 0) && (this._canSelect(candidate))) {
        this._select(candidate);
      }
      break;
    case this.CONST.PARENT:
      candidate = this._$selected.parent();
      while ((candidate.length > 0) && (candidate[0] != document.body) && (! this._canSelect(candidate))) {
        candidate = candidate.parent();
      }
      if ((candidate.length > 0) && (this._canSelect(candidate))) {
        this._select(candidate);
      }
      break;
    case this.CONST.CHILD:
      candidate = firstChild(this._$selected);
      while ((candidate != null) && (! this._canSelect(candidate))) {
        candidate = firstChild(candidate);
      }
      if ((candidate != null) && (this._canSelect(candidate))) {
        this._select(toSelect);
      }
      break;
    case this.CONST.SELECT:
      this._complete();
      break;
    case this.CONST.QUIT:
      this.cancel("Pressed Esc");
      break;
  }
  this._swallowEvent(event);
};

CTS.UI.Picker.prototype._keyUp = function(event) {
  this._isKeyDown = false;
};

CTS.UI.Picker.prototype._mouseMove = function(event) {
  // Don't be too hyper about tracking mouse movements.
  var now = new Date();
  if (now - this._lastTime < this.CONST.MOUSE_MOVEMENT_GRANULARITY) {
    return;
  }
  this._lastTime = now;

  var element = event.target;

  if (element.id == this.CONST.UI_ID) {
    // We've selected our own user interface element! Need to
    // figure out what is beneath by momentarily hiding the UI.
    this._$ui.hide();
    element = document.elementFromPoint(event.clientX, event.clientY);
    this._$ui.show();
  }

  $element = this._$(element);

  // If we're over a CTS-UI widget, bail out.
  if (! this._canConsider($element)) {
    this._deselect();
    return;
  }

  // If we can offer selection, let's try.
  if (this._canSelect($element) || this._canOfferOptions($element)) {
    this._select($element);
    return;
  }

  // Look for a parent that is selectable it not.
  while (($element.length > 0) &&
         ($element[0] != document.body) &&
         (! (this._canConsider($element) &&
            (this._canSelect($element) || this._canOfferOptions($element))))) {
    $element = $element.parent();
  }

  if (this._canSelect($element) || this._canConsider($element)) {
    this._select($element);
  } else {
    this._deselect();
  }
};

CTS.UI.Picker.prototype._click = function(event) {
  if (this._canSelect(this._$selected)) {
    this._complete(this._$selected);
    this._swallowEvent(event);
  }
};

/*
 * Completes the current pick.
 */
CTS.UI.Picker.prototype._complete= function(reason) {
  console.log("Complete Pick");
  this._destroyUI();
  CTS.engine.forrest.startListening();
  if (this._deferred != null) {
    this._deferred.resolve(this._$selected);
    this._deferred = null;
    this._$selected = null;
    this._currentOpts = {};
  }
};

/*
 * Utility methods (General)
 *-----------------------------------------------------*/

/*
 * This filters out any CTS elements.
 */
CTS.UI.Picker.prototype._canConsider = function($e) {
  var passesIgnore = true;

  // Don't consider if part of the side tray
  if ($e.is(CTS.UI.tray.$container) || (CTS.UI.tray.$container.find($e).length)) {
    passesIgnore = false;
  }

  // Don't consider if the BODY element.
  if (($e[0] == document.body) || ($e[0] == document.documentElement)) {
    passesIgnore = false;
  }

  return passesIgnore;
};

/**
 * Returns whether the picker is able to select the jQuery element $e
 * according to the 'restrict' mode in the current options.
 *
 * Valid modes:
 *   text: Only permit editing childless nodes
 *   css: Only permit editing nodes with calss `css-class`
 *
 * Planned modes:
 *   cts-value: Only permit editing cts-value nodes
 *   cts-enumerated: Only permit editing cts-enumerated nodes
 *
 */
CTS.UI.Picker.prototype._canSelect = function($e) {
  if ($e == null) {
    return false;
  }
  if (!('restrict' in this._currentOpts)) {
    return true;
  }

  // We're restricted if we're still here.

  if (('value' in this._currentOpts) && (this._currentOpts['value'])) {
    if (typeof $e.attr('data-cts-value') != 'undefined') {
      return true;
    }
    var $$node = CTS.engine.forrest.trees.body.getCtsNode($e);
    if ($$node != null) {
      if ($$node.hasRule('is')) {
        return true;
      }
    }
  }
  return false;
};

CTS.UI.Picker.prototype._elementWidth = function($e) {
  // http://stackoverflow.com/questions/10277323/get-real-width-of-elements-with-jquery
  //if ($e.children().length > 0) {
  //  return $e.outerWidth();
  //}
  var element = $e[0];
  var $wrapper= CTS.$('<div style="display: inline-block"></div>');
  var wrapper = $wrapper[0];
  var result;
  while (element.firstChild) {
    wrapper.appendChild(element.firstChild);
  }
  element.appendChild(wrapper);
  result = wrapper.offsetWidth;
  element.removeChild(wrapper);
  while (wrapper.firstChild) {
    element.appendChild(wrapper.firstChild);
  }
  return result;
};

CTS.UI.Picker.prototype._elementX = function($e) {
  var el = $e[0];
  var _x = 0;
  var _y = 0;
  while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
    _x += el.offsetLeft - el.scrollLeft;
    _y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }
  // _y and _x
  return _x;
};

CTS.UI.Picker.prototype._canOfferOptions = function($e) {
  if ($e == null) {
    return false;
  }

  if (('enumeration' in this._currentOpts) &&
      (this._currentOpts['enumeration'])) {
    var $$node = CTS.engine.forrest.trees.body.getCtsNode($e);
    return ($$node.isEnumerated() || (typeof $e.attr('data-cts-enumeration') != 'undefined'));
  }

  return false;
};

CTS.UI.Picker.prototype._swallowEvent = function(e) {
  e.preventDefault();
  e.stopPropagation();
};
