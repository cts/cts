CTS.registerNamespace('CTS.UI.Modal');

/**
 * Modal Dialogue
 *
 * This is currently a light-weight wrapper around a customized version of alertify.js.
 * which has been modified to support asking the user to choose among options. This helps:
 *   1. Provide a layer of encapsulation around third-party UI libraries, and
 *   2. Provide the Q-based deferment method that CTS and CTS-UI use.
 *
 * Dependencies:
 *  lib/alertify.js
 *
 * Args:
 *  $    - jQuery (can be found at CTS.$ once CTS loads)
 *  q    - The Q library (can be found at CTS.Q once CTS loads)
 */
CTS.UI.Modal = function($, q) {
  this._$ = $;
  this._q = q;
  this._deferred = null;
};

/*
 * Public methods
 *-----------------------------------------------------*/


/**
 * Presents an alert with OK button.
 *
 * Params:
 *   title   - null, or the Title of the modal.
 *   body    - null, or the body of the modal.
 *
 * Note: either the title or body must contain a non-empty string.
 *
 * Returns via promise:
 *   When the "OK" button clicked
 */
CTS.UI.Modal.prototype.alert = function(title, body) {
  var deferred = this._deferred = this._q.defer();
  var content = this._makeContent(title, body);
  Alertify.dialog.alert(content, function() {
      deferred.resolve();
  });
  return deferred.promise;
};

/**
 * Presents a dialog box with a yes/no answer buttons.
 *
 * Params:
 *   title   - null, or the Title of the modal.
 *   body    - null, or the body of the modal.
 *
 * Note: either the title or body must contain a non-empty string.
 *
 * Returns via promise:
 *   If the "yes" option clicked.
 * Rejects via promise:
 *   If the "no" option clicked.
 */
CTS.UI.Modal.prototype.confirm = function(title, body) {
  var deferred = this._deferred = this._q.defer();
  var content = this._makeContent(title, body);
  Alertify.dialog.confirm(content,
    function() {
      deferred.resolve();
    }, function() {
      deferred.reject("Canceled");
    }
  );
  return deferred.promise;
};

/**
 * Presents a question with text answer to be filled in.
 *
 * Params:
 *   title   - null, or the Title of the modal.
 *   body    - null, or the body of the modal.
 *
 * Note: either the title or body must contain a non-empty string.
 *
 * Returns via promise:
 *   The selection.
 * Rejects via promise:
 *   "No input" if no data entered.
 *   "Canceled" if the cancel button clicked.
 */
CTS.UI.Modal.prototype.prompt = function(title, body) {
  var deferred = this._deferred = this._q.defer();
  var content = this._makeContent(title, body);
  Alertify.dialog.prompt(content,
    function(answer) {
      if (answer == "") {
        deferred.reject("No input");
      } else {
        deferred.resolve(answer);
      }
    },
    function() {
      deferred.reject("Canceled");
    }
  );
  return deferred.promise;
};


/**
 * Presents a question with text answer to be filled in.
 *
 * Params:
 *   title   - null, or the Title of the modal.
 *   body    - null, or the body of the modal.
 *
 * Note: either the title or body must contain a non-empty string.
 *
 * Returns via promise:
 *   The selection.
 * Rejects via promise:
 *   "No input" if no data entered.
 *   "Canceled" if the cancel button clicked.
 */
CTS.UI.Modal.prototype.login = function(title, body) {
  var deferred = this._deferred = this._q.defer();
  var content = this._makeContent(title, body);
  Alertify.dialog.login(content,
    function(tuple) {
      deferred.resolve(tuple);
    },
    function() {
      deferred.reject("Canceled");
    }
  );
  return deferred.promise;
};

/**
 * Presents a set of choices to the user as radio-button options.
 *
 * Params:
 *   title   - null, or the Title of the modal.
 *   body    - null, or the body of the modal.
 *   choices - A list of strings that represent the choices
 *
 * Note: either the title or body must contain a non-empty string.
 *
 * Returns via promise:
 *   The choice.
 * Rejects via promise:
 *   "No input" if no choice selected.
 *   "Canceled" if the cancel button clicked.
 */
CTS.UI.Modal.prototype.select = function(title, body, choices) {
  var deferred = this._deferred = this._q.defer();
  var content = this._makeContent(title, body);
  var alertify_choices = {'choices': choices};
  Alertify.dialog.choose(content,
    function(choice) {
      if (choice == "") {
        deferred.reject("No input");
      } else {
        deferred.resolve(choice);
      }
    }, function() {
      deferred.reject("Canceled");
    },
    alertify_choices
  );
  return deferred.promise;
};

CTS.UI.Modal.prototype.cancel = function() {
  if (this._deferred != null) {
    this._deferred.reject("Canceled");
    this._deferred = null;
  }
};


/*
 * Helper methods
 *-----------------------------------------------------*/

/**
 * Combines the optional title and body components of the message
 */
CTS.UI.Modal.prototype._makeContent = function(title, body) {
  var msg = "";
  if ((typeof title != 'undefined') && (title != null)) {
    msg += '<h2 style="color: black;">' + title + '</h2>';
  }
  if ((typeof body != 'undefined') && (body != null)) {
    msg += '<div style="color: black;">' + body + '</div>';
  }
  return msg;
};
