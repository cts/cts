CTS.registerNamespace('CTS.Server');

CTS.Fn.extend(CTS.Server, {
  _token: null,
  _loginDeferred: null,

  // Returns a promise.
  login: function() {
    if (CTS.Server._loginDeferred == null) {
      CTS.Server._loginDeferred = Q.defer();
      CTS.Server._login();
    }
    return CTS.Server._loginDeferred.promise;
  },

  logout: function() {
    CTS.Server._token = null;
    CTS.Server._loginDeferred = null;
  },

  request: function(path, opts) {
    CTS.Server._token = null;
    CTS.Server._loginDeferred = null;
  },

  _login: function() {
    var loginurl = CTS.Constants.quiltBase + 'login-popup';
    var popup = window.open(loginurl,'targetWindow',
       'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,' +
       'resizable=no,width=350,height=400');
    window.addEventListener("message", CTS.Server._loginMessage, false);
  },

  _loginMessage: function(msg) {

  },

  _loginSuccess: function(token) {
    CTS.Server._token = token;
    CTS.Server._loginDeferred.resolve().done();
  },

  _loginFail: function(reason) {
    CTS.Server._loginDeferred.reject(reason).done();
    CTS.Server._loginDeferred = null;
  },

  // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauthauthorize
  _ctsApiClientScopes: 'https://www.googleapis.com/auth/plus.me http://spreadsheets.google.com/feeds/ https://www.googleapis.com/auth/drive',
  _loginStateModified: null,
  _currentToken: null,
  _loginDefer: Q.defer(),
  _gapiLoaded: Q.defer(),

  _loadGApi: function() {
    gapi.load("auth:client,drive-share", function() {
      CTS.Util.GSheet._gapiLoaded.resolve();
    });
  }
});
