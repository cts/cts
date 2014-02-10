var GSheet = CTS.GSheet = {
  // https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauthauthorize
  _ctsApiClientId: '459454183971-3rhp3qnfrdane1hnoa23eom28qoo146f.apps.googleusercontent.com',
  _ctsApiKey: 'AIzaSyBpNbbqKrk21n6rI8Nw2R6JSz6faN7OiWc',
  _ctsApiClientScopes: 'https://www.googleapis.com/auth/plus.me http://spreadsheets.google.com/feeds/',
  _$loginButton: null,
  _currentToken: null,

  /*
   * Args:
   *   feed: list (objects) | cells (table)
   *   key: spreadsheet key
   *   worksheet: worksheet name or identifier
   *   security: public | private
   *   mode: full | basic
   *   json: false | true
   *   accessToken: false | true
   *
   *  "od6" is the worksheet id for the default.
   */
  _gSheetUrl: function(feed, key, worksheet, security, mode, jsonCallback, accessToken) {
    var url = "http://spreadsheets.google.com/feeds/";
    if (feed != null) {
      url = (url + feed + "/");
    }
    if (key != null) {
      url = (url + key + "/");
    }
    if (worksheet != null) {
      url += (worksheet + "/")
    }
    url += security + "/" + mode;
    if (jsonCallback) {
      url += "?alt=json-in-script&callback=?";
    }
    if (accessToken) {
      if (jsonCallback) {
        url += "&";
      } else {
        url += "?";
      }
      if (CTS.GSheet._currentToken != null) {
        console.log("token", CTS.GSheet._currentToken);
        url += "access_token=" + CTS.GSheet._currentToken.access_token;
      } else {
        console.error("Asked for auth but current token null");
      }
    }
    return url;
  },

  _refreshLoginButtonState: function() {
    if (CTS.GSheet._$loginButton != null) {
      if (CTS.GSheet._currentToken == null) {
        // Not logged in.
        CTS.GSheet._$loginButton.html('Login');
      } else {
        CTS.GSheet._$loginButton.html('Log Out');
      }
    }
  },

  _loginButtonClicked: function() {
    if (CTS.GSheet._$loginButton.html() == 'Login') {
      CTS.GSheet.login();
    } else {
      CTS.GSheet._currentToken == null;
      CTS.GSheet._refreshLoginButtonState();
    }
  },

  _registerCtsCredentials: function() {
    gapi.client.setApiKey(CTS.GSheet._ctsApiKey);
  },

  _authenticationResult: function(authResult) {
   var authorizeButton = document.getElementById('authorize-button');
   if (authResult && !authResult.error) {
     authorizeButton.style.visibility = 'hidden';
     CTS.GSheet._currentToken = gapi.auth.getToken();
     console.log("Token", CTS.GSheet._currentToken);
     CTS.GSheet._refreshLoginButtonState();
   } else {
     CTS.GSheet._currentToken = null;
     console.log("Token", CTS.GSheet._currentToken);
     CTS.GSheet._refreshLoginButtonState();
   }
  },

  login: function() {
    gapi.auth.authorize({
      client_id: CTS.GSheet._ctsApiClientId,
      scope: CTS.GSheet._ctsApiClientScopes},
    CTS.GSheet._authenticationResult);
  },

  isLoggedIn: function() {
    return (CTS.GSheet._currentToken != null);
  },

  getSpreadsheets: function() {
    var deferred = Q.defer();
    var url = CTS.GSheet._gSheetUrl(
        'spreadsheets', null, null, 'private', 'full', true, true);
    var request = CTS.$.getJSON(url);

    request.done(function(json) {
      // TODO: Parse into a spec object.
      console.log("GetSpreadsheets");
      console.log(json);
      deferred.resolve(json);
    });
    request.fail(function(jqxhr, textStatus) {
      console.log("GetSpreadsheets");
      console.log(jqxhr, textStatus);
      deferred.reject(textStatus);
    });

    return deferred.promise;
  },

  getWorksheets: function(key) {
    console.log("Getting worksheets for", key);
    var deferred = Q.defer();
    var url = CTS.GSheet._gSheetUrl('worksheets', key, null, 'private', 'full', true);
    console.log("The URL", url);
    var request = CTS.$.getJSON(url);

    request.done(function(json) {
      // TODO: Parse into a spec object.
      console.log(json);
      deferred.resolve(json);
    });

    request.fail(function(jqxhr, textStatus) {
      console.log(jqxhr, textStatus);
      deferred.reject(textStatus);
    });

    return deferred.promise;

    var worksheetSpec = {
      spreadSheetTitle: null,
      listFeed: null,
      cellFeed: null,
      editUrl: null,
      rowCount: 0,
      colCount: 0,
      title: null,
      updated: null,
      id: null
    };
    var listFeedUrl = null;

    return deferred.promise();
  },

  _parseGItem: function(item) {
    return item['$t'];
  },

  getWorksheetItems: function(spreadsheetKey, worksheetKey, accessToken) {
    console.log("Getting workshee", spreadsheetKey, worksheetKey);
    var deferred = Q.defer();
    var url = CTS.GSheet._gSheetUrl('list', spreadsheetKey, worksheetKey, 'public', 'values', true, accessToken);
    console.log("URL", url);

    var request = CTS.$.getJSON(url);

    request.done(function(json) {
      var spec = {};
      console.log(json);
      spec.title = CTS.GSheet._parseGItem(json.feed.title);
      spec.updated = CTS.GSheet._parseGItem(json.feed.updated);
      spec.id = CTS.GSheet._parseGItem(json.feed.id);
      spec.items = [];
      for (var i = 0; i < json.feed.entry.length; i++) {
        var title = CTS.GSheet._parseGItem(json.feed.entry[i].title);
        var data = {};
        for (var key in json.feed.entry[i]) {
          if ((key.length > 4) && (key.substring(0,4) == 'gsx$')) {
            var k = key.substring(4);
            data[k] = CTS.GSheet._parseGItem(json.feed.entry[i][key]);
          }
        }
        spec.items.push({
          title: title,
          data: data
        });
      }
      deferred.resolve(spec);
    });

    request.fail(function(jqxhr, textStatus) {
      console.log(jqxhr, textStatus);
      deferred.reject(textStatus);
    });

    return deferred.promise;
  },
};
