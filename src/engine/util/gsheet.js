CTS.registerNamespace('CTS.Util.GSheet');

CTS.Fn.extend(CTS.Util.GSheet, {
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
  },

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
  _gSheetUrl: function(feed, key, worksheet, security, mode, cell, jsonCallback, accessToken) {
    var url = "https://spreadsheets.google.com/feeds/";
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
    if (cell != null) {
      url += ('/' + cell)
    }
    if (jsonCallback) {
      url += "?alt=json-in-script&callback=?";
    }
    if (accessToken) {
      if (jsonCallback) {
        url += "&";
      } else {
        url += "?";
      }
      if (CTS.Util.GSheet._currentToken != null) {
        url += "access_token=" + CTS.Util.GSheet._currentToken.access_token;
      } else {
        console.error("Asked for auth but current token null");
      }
    }
    return url;
  },

  isLoggedIn: function() {
    return (CTS.Util.GSheet._currentToken != null);
  },

  logout: function() {
    CTS.Util.GSheet._currentToken = null;
    if (typeof this._loginStateModified == 'function') {
      this._loginStateModified();
    }
  },

  _registerCtsCredentials: function() {
    gapi.client.setApiKey(CTS.Constants.Google.ApiKey);
  },

  _authenticationResult: function(authResult, token) {
   if (authResult && !authResult.error) {
     if (typeof token == 'undefined') {
       CTS.Util.GSheet._currentToken = gapi.auth.getToken();
     } else {
       CTS.Util.GSheet._currentToken = token;
       gapi.auth.setToken(token);
     }
     CTS.Util.GSheet._loginDefer.resolve();
   } else {
     CTS.Util.GSheet._currentToken = null;
     CTS.Util.GSheet._loginDefer.reject();
   }
   if (typeof CTS.Util.GSheet._loginStateModified == 'function') {
     CTS.Util.GSheet._loginStateModified();
   }
  },

  maybeLogin: function() {
    if (this._currentToken == null) {
      return CTS.Util.GSheet.login();
    } else {
      return CTS.Util.GSheet._loginDefer.promise;
    }
  },

  login: function() {
    // Load API via IFRAME to Treesheets server. Unfortunate but required.
    debugger;
    CTS.Util.GSheet.loginIframe = CTS.$('<iframe style="display:none;" src="' +
      CTS.Constants.quiltBase + 'api/gsheet/login"></iframe>');
    CTS.$('body').append(CTS.Util.GSheet.loginIframe);

    //
    //
    //
    // CTS.Util.GSheet._gapiLoaded.promise.then(
    //   function() {
    //     gapi.auth.authorize(
    //       {
    //         client_id: CTS.Constants.Google.ClientId,
    //         scope: CTS.Util.GSheet._ctsApiClientScopes
    //       },
    //       CTS.Util.GSheet._authenticationResult
    //     );
    //   }
    // );
    // CTS.Log.Info("Done");
    // return CTS.Util.GSheet._loginDefer.promise;
  },

  isLoggedIn: function() {
    return (CTS.Util.GSheet._currentToken != null);
  },

  createSpreadsheet: function(title) {
    var url = "https://www.googleapis.com/drive/v2/files";
    var deferred = Q.defer();
    var boundary = '-------314159265358979323846';
    var delimiter = "\r\n--" + boundary + "\r\n";
    var close_delim = "\r\n--" + boundary + "--";
    var contentType = 'application/vnd.google-apps.spreadsheet';
    var metadata = {
      'title': title,
      'mimeType': contentType
    };
    var csvBody = '';
    var base64Data = btoa(csvBody);
    var multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + contentType + '\r\n' +
      'Content-Transfer-Encoding: base64\r\n' +
      '\r\n' +
      base64Data +
      close_delim;

    var request = gapi.client.request({
      'path': '/upload/drive/v2/files',
      'method': 'POST',
      'params': {'uploadType': 'multipart'},
      'headers': {
        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
      },
      'body': multipartRequestBody});
    request.execute(function(resp) {
      if (typeof resp.error != 'undefined') {
        CTS.Log.Error('create error', resp.error);
        deferred.reject(resp.error);
      } else {
        deferred.resolve(resp);
      }
    });
    return deferred.promise;
  },

  getSpreadsheets: function() {
    var deferred = Q.defer();
    var url = CTS.Util.GSheet._gSheetUrl(
        'spreadsheets', null, null, 'private', 'full', null, true, true);
    var request = CTS.$.getJSON(url);

    request.done(function(json) {
      var ret = [];
      for (var i = 0; i < json.feed.entry.length; i++) {
        var sheet = json.feed.entry[i];
        var title = CTS.Util.GSheet._parseGItem(sheet.title);
        var id = CTS.Util.GSheet._parseGItem(sheet.id);
        var spec = {
          title: title,
          id: id
        };
        var parts = spec.id.split('/');
        spec['key'] = parts[parts.length - 1];
        ret.push(spec);
      }
      deferred.resolve(ret);
    });
    request.fail(function(jqxhr, textStatus) {
      deferred.reject(textStatus);
    });

    return deferred.promise;
  },

  getWorksheets: function(key) {
    var deferred = Q.defer();
    var url = CTS.Util.GSheet._gSheetUrl('worksheets', key, null, 'private', 'full', null, true, true);
    var request = CTS.$.getJSON(url);
    request.done(function(json) {
      var ret = [];
      for (var i = 0; i < json.feed.entry.length; i++) {
        var worksheet = json.feed.entry[i];
        var spec = {
          kind: 'worksheet',
          title: CTS.Util.GSheet._parseGItem(worksheet.title),
          id: CTS.Util.GSheet._parseGItem(worksheet.id),
          colCount: parseInt(CTS.Util.GSheet._parseGItem(worksheet['gs$colCount'])),
          rowCount: parseInt(CTS.Util.GSheet._parseGItem(worksheet['gs$rowCount'])),
          updated: CTS.Util.GSheet._parseGItem(worksheet.updated)
        };
        var parts = spec.id.split('/');
        spec['wskey'] = parts[parts.length - 1];
        spec['sskey'] = key;
        ret.push(spec);
      }
      deferred.resolve(ret);
    });

    request.fail(function(jqxhr, textStatus) {
      deferred.reject([jqxhr, textStatus]);
    });

    return deferred.promise;
  },

  _parseGItem: function(item) {
    return item['$t'];
  },

  _getItemData: function(entry) {
    var data = {};
    for (var key in entry) {
      if ((key.length > 4) && (key.substring(0,4) == 'gsx$')) {
        var k = key.substring(4);
        data[k] = CTS.Util.GSheet._parseGItem(entry[key]);
      }
    }
    return data;
  },

  _getItemSpec: function(entry, sskey, wskey) {
    var itemSpec = {
      title: CTS.Util.GSheet._parseGItem(entry.title),
      id: CTS.Util.GSheet._parseGItem(entry.id),
      data: CTS.Util.GSheet._getItemData(entry),
      editLink: entry.link[1].href,
      json: entry
    };
    if (sskey) {
      itemSpec.sskey = sskey;
    }
    if (wskey) {
      itemSpec.wskey = wskey;
    }

    // Fix the edit link to remove the trailing version, which appears to be
    // causing problems.
    if (itemSpec.editLink.indexOf(itemSpec.id) != -1) {
      itemSpec.editLink = itemSpec.id;
    }
    return itemSpec;
  },

  getListFeed: function(spreadsheetKey, worksheetKey) {
    var deferred = Q.defer();
    var url = CTS.Util.GSheet._gSheetUrl('list', spreadsheetKey, worksheetKey, 'private', 'full', null, true, true);

    var request = CTS.$.getJSON(url);

    request.done(function(json) {
      var spec = {};
      spec.title = CTS.Util.GSheet._parseGItem(json.feed.title);
      spec.updated = CTS.Util.GSheet._parseGItem(json.feed.updated);
      spec.id = CTS.Util.GSheet._parseGItem(json.feed.id);
      spec.items = [];
      if (typeof json.feed.entry != 'undefined') {
        for (var i = 0; i < json.feed.entry.length; i++) {
          var itemSpec = CTS.Util.GSheet._getItemSpec(json.feed.entry[i]);
          spec.items.push(itemSpec);
        }
      }
      deferred.resolve(spec);
    });

    request.fail(function(jqxhr, textStatus) {
      CTS.Log.Error(jqxhr, textStatus);
      deferred.reject(textStatus);
    });

    return deferred.promise;
  },

  getCellFeed: function(spreadsheetKey, worksheetKey) {
    var deferred = Q.defer();
    var url = CTS.Util.GSheet._gSheetUrl('cells', spreadsheetKey, worksheetKey, 'private', 'full', null, true, true);

    var request = CTS.$.getJSON(url);

    request.done(function(json) {
      var spec = {};
      spec.title = CTS.Util.GSheet._parseGItem(json.feed.title);
      spec.updated = CTS.Util.GSheet._parseGItem(json.feed.updated);
      spec.id = CTS.Util.GSheet._parseGItem(json.feed.id);
      spec.rows = {};

      if (json.feed.entry) {
        for (var i = 0; i < json.feed.entry.length; i++) {
          var cell = CTS.Util.GSheet._parseGItem(json.feed.entry[i].title);
          var content = CTS.Util.GSheet._parseGItem(json.feed.entry[i].content);
          var letterIdx = 0;
          // This might be a formula!
          var inputValue = json.feed.entry[i]['gs$cell'].inputValue;
          while (isNaN(parseInt(cell[letterIdx]))) {
            letterIdx++;
          }
          var row = cell.slice(0, letterIdx);
          var col = parseInt(cell.slice(letterIdx));
          var colNum = parseInt(json.feed.entry[i]['gs$cell']['col'])

          if (typeof spec.rows[row] == "undefined") {
            spec.rows[row] = {};
          }
          spec.rows[row][col] = {
            content: content,
            colNum: colNum,
            inputValue: inputValue,
            isComputed: (inputValue != content)
          };
        }
      }
      deferred.resolve(spec);
    });

    request.fail(function(jqxhr, textStatus) {
      CTS.Log.Error(jqxhr, textStatus);
      deferred.reject(textStatus);
    });

    return deferred.promise;
  },


  getCell: function(spreadsheetKey, worksheetKey, row, col) {
    var deferred = Q.defer();
    var url = CTS.Util.GSheet._gSheetUrl('cells', spreadsheetKey, worksheetKey, 'private', 'full', null, true, true);
    url = url + '&min-row=' + row + '&max-row=' + row + '&min-col=' + col + '&max-col=' + col;
    var request = CTS.$.getJSON(url);

    request.done(function(json) {
      if ((typeof json.feed.entry != 'undefined') && (json.feed.entry.length == 1)) {
        deferred.resolve(CTS.Util.GSheet._parseGItem(json.feed.entry[0].content));
      } else {
        deferred.reject("Cell entry didn't return");
      }
    });
    request.fail(function(jqxhr, textStatus) {
      CTS.Log.Error(jqxhr, textStatus);
      deferred.reject(textStatus);
    });

    return deferred.promise;
  },

  modifyCell: function(ssKey, wsKey, rowNum, colNum, value) {
    // The Google Docs API incorrectly responds to OPTIONS preflights, so
    // we are completely blocked from sending non-GET requests to it from
    // within the browser. For now we'll proxy via the CTS server. Ugh.
    var deferred = Q.defer();
    var request = CTS.$.ajax({
      url: CTS.Constants.quiltBase + 'api/gsheet/updatecell',
      type: 'POST',
      data: {
        rowNum: rowNum,
        colNum: colNum,
        ssKey: ssKey,
        wsKey: wsKey,
        value: value,
        token: this._currentToken.access_token
      }
    });
    request.done(function(json) {
      deferred.resolve();
    });
    request.fail(function(jqxhr, textStatus) {
      CTS.Log.Error(jqxhr, textStatus);
      deferred.reject(textStatus);
    });
    return deferred.promise;
  },

  modifyListItem: function(ssKey, wsKey, itemNode) {
    // The Google Docs API incorrectly responds to OPTIONS preflights, so
    // we are completely blocked from sending non-GET requests to it from
    // within the browser. For now we'll proxy via the CTS server. Ugh.
    var deferred = Q.defer();
    var properties = {};
    for (var i = 0; i < itemNode.children.length; i++) {
      var child = itemNode.children[i];
      properties[child.key] = child.value;
    }
    var data = {
      item: itemNode.getItemId(),
      properties: properties,
      ssKey: ssKey,
      wsKey: wsKey,
      token: this._currentToken.access_token,
      editLink: itemNode.spec.editLink
    };
    var request = CTS.$.ajax({
      url: CTS.Constants.quiltBase + 'api/gsheet/updatelistitem',
      type: 'POST',
      data: data
    });
    request.done(function(json) {
      CTS.Log.Info("Update Success!");
      deferred.resolve();
    });
    request.fail(function(jqxhr, textStatus) {
      CTS.Log.Info("Update Fail!");
      deferred.reject(textStatus);
    });
    return deferred.promise;
  },

  cloneListItem: function(ssKey, wsKey, itemNode) {
    // The Google Docs API incorrectly responds to OPTIONS preflights, so
    // we are completely blocked from sending non-GET requests to it from
    // within the browser. For now we'll proxy via the CTS server. Ugh.
    var deferred = Q.defer();

    var properties = {};
    for (var i = 0; i < itemNode.children.length; i++) {
      var child = itemNode.children[i];
      properties[child.key] = child.value;
      // XXX TEMPORARY FIX FOR BOOLEAN DEFAULTING!
      if ((child.value == true) || (child.value == "TRUE") || (child.value == "True") || (child.value == "true")) {
        properties[child.key] = false;
      }
    }
    var data = {
      properties: properties,
      ssKey: ssKey,
      wsKey: wsKey,
      token: this._currentToken.access_token
    };
    var request = CTS.$.ajax({
      url: CTS.Constants.quiltBase + 'api/gsheet/appendlistitem',
      type: 'POST',
      data: data,
      dataType: 'json'
    });
    request.done(function(json) {
      var itemSpec = CTS.Util.GSheet._getItemSpec(json.entry, ssKey, wsKey);
      deferred.resolve(itemSpec);
    });
    request.fail(function(jqxhr, textStatus) {
      CTS.Log.Error("Request Failed");
      deferred.reject(textStatus);
    });
    return deferred.promise;
  }
});
