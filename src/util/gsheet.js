var GSheet = CTS.GSheet = {

  _ctsApiClientId: '459454183971.apps.googleusercontent.com',
  _ctsApiKey: 'AIzaSyBpNbbqKrk21n6rI8Nw2R6JSz6faN7OiWc',
  _ctsApiClientScopes: 'https://www.googleapis.com/auth/plus.me',

  /*
   * Args:
   *   feed: list (objects) | cells (table)
   *   key: spreadsheet key
   *   worksheet: worksheet name or identifier
   *   security: public | private
   *   mode: full | basic
   *   json: false | true
   *
   *  "od6" is the worksheet id for the default.
   */
  _gSheetUrl: function(feed, key, worksheet, security, mode, jsonCallback, accessToken) {
    var url = "http://spreadsheets.google.com/feeds/" +
                feed + "/" +
                key + "/";
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
      url += "access_token=" + accessToken;
    }
    return url;
  },

  _registerCtsCredentials: function() {
    gapi.client.setApiKey(CTS.GSheet._ctsApiKey);
  },

  _authenticate: function() {
    gapi.auth.authorize({
      client_id: CTS.GSheet._ctsApiClientId,
      scope: CTS.GSheet._ctsApiClientScopes,
      immediate: true},
    CTS.GSheet._authenticationResult);
  },

  _authenticationResult: function() {
   var authorizeButton = document.getElementById('authorize-button');
   if (authResult && !authResult.error) {
     authorizeButton.style.visibility = 'hidden';
     alert("success");
   } else {
     authorizeButton.style.visibility = '';
     alert("faile");
   }
  },

  getWorksheets: function(key) {
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


  }

};
