_CTSUI.Switchboard = function($, q, opts) {
  this.opts = opts || {};

  if (typeof this.opts.serverUrl == 'undefined') {
    this.opts.serverUrl = _CTSUI.serverBase + _CTSUI.switchboardPath;
  }

  this._q = q;
  this._$ = $;
  this._opQueue = [];
  this._opSending = null;
  this._flushLock = null; // Null or a promise.
  this._flushAgain = null; // Null or a promise

  // TEMPORARY:
  this.opts.serverUrl = 'cts.php';
};

_CTSUI.Switchboard.prototype.recordOperation = function(operation) {
  console.log("Saving operation: ", operation);
  var tuple = [operation, this._q.defer()];
  this._opQueue.push(tuple);
  return tuple[1].promise;
};

_CTSUI.Switchboard.prototype.flush = function() {
  console.log("Switchboard::flush");
  if (this._flushLock != null) {
    console.log("Switchboard::flush -- Flush already in progress");
    // A flush is already in progress. 
    // So we'll return a promise for the *next* flush.
    if (this._flushAgain == null) {
      console.log("Switchboard::flush -- Creating second flush to come after");
      this._flushAgain = this._q.defer();
    }
    return this._flushAgain.promise;
  } else {
    // No flush is in progress, so we'll perform one and return the promise to
    // finish it.
    this._flushLock = this._q.defer();
    this._opSending = this._opQueue.slice(0); // Clone the array
    console.log("Switchboard::flush -- No flush in progress: performing flush of " + this._opSending.length + " operations");
    this._doFlush();
    return this._flushLock.promise;
  }
};

_CTSUI.Switchboard.prototype._flushComplete = function(success, msg, jqXHR, textStatus) {
  console.log("Switchboard::_flushComplete");
  // Rotate all the locks.
  var oldLock = this._flushLock;
  this._flushLock = this._flushAgain;
  this._flushAgain = null;

  // Now before we do anything, curate the queued operations.
  // If success, prune the ones send. Else, do nothing.
  if (success) {
    console.log("Switchboard::_flushComplete -- Success!");
    this._opQueue = this._opQueue.slice(this._opSending.length);
    // Resolve all sending ops
    var response = msg;
    // TODO: Make sure the same number of ops were received.
    // TODO: Before we flush, verify that we receive confirmation.
    for (var i = 0; i < this._opSending.length; i++) {
      var opResult = response[i];
      this._opSending[i][1].resolve(opResult);
    }
    this._opSending = null;
    oldLock.resolve();
  } else {
    console.log("Switchboard::_flushComplete -- Filed with message", msg);
    this._opSending = null;
    oldLock.reject();
  }

  // If other flushes were pending, do them now.
  if (this._flushLock != null) {
    console.log("Switchboard::_flushComplete -- Doing flush again, since it was scheduled");
    this._doFlush();
  }
};

_CTSUI.Switchboard.prototype._doFlush = function() {
  console.log("Switchboard::_doFlush");
  var self = this;

  // Collet the operations to send.
  var toSend = [];
  for (var i = 0; i < this._opSending.length; i++) {
    toSend.push(this._opSending[i][0]);
  }

  var data = {
    'operations': toSend
  };

  var data = JSON.stringify(data);

  this._$.ajax({
    type: "POST",
    url: this.opts.serverUrl,
    data: data,
    contentType:"application/json; charset=utf-8"
  }).done(function(message) {
    self._flushComplete(true, message, null, null);
  }).fail(function(jqXHR, textStatus) {
    self._flushComplete(false, null, jqXHR, textStatus);
  });
};

_CTSUI.Switchboard.prototype._maybeFlush = function() {
  console.log("Switchboard::_maybeFlush");
  // TODO: It would be nice to pool multiple operations together.
  return this.flush();
};
