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
    // var source = CTS.Constants.quiltBase + 'api/gsheet/login';
    // CTS.Util.GSheet.loginIframe = CTS.$('<iframe style="display:none;" src="' +
    //   source + '"></iframe>');
    // var catchLogin = function(evt) {
    //   if (typeof(evt) != "undefined") {
    //     if (evt.source == source) {
    //       window.removeEventListener("message", returnData);
    //       var data = evt.data;
    //       console.log("got data", data);
    //     }
    //   }
    // };
    //
    // window.addEventListener("message", catchLogin, false);
    // CTS.$('body').append(CTS.Util.GSheet.loginIframe);
    CTS.Util.GSheet._gapiLoaded.promise.then(
      function() {
        gapi.auth.authorize(
          {
            client_id: CTS.Constants.Google.ClientId,
            scope: CTS.Util.GSheet._ctsApiClientScopes
          },
          CTS.Util.GSheet._authenticationResult
        );
      }
    );
    CTS.Log.Info("Done");
    return CTS.Util.GSheet._loginDefer.promise;
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

  makeProxyUrl: function(url) {
    return 'http:' + CTS.Constants.quiltBase + 'api/gdoc/' + url;
  },

  getSpreadsheets: function() {
    var deferred = Q.defer();
    var url = CTS.Util.GSheet._gSheetUrl(
        'spreadsheets', null, null, 'private', 'full', null, true, true);
    url = CTS.Util.GSheet.makeProxyUrl(url);
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
    url = CTS.Util.GSheet.makeProxyUrl(url);
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
    url = CTS.Util.GSheet.makeProxyUrl(url);
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
    url = CTS.Util.GSheet.makeProxyUrl(url);
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
    url = CTS.Util.GSheet.makeProxyUrl(url);
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
    var deferred = Q.defer();

    var cell = 'R' + rowNum + 'C' + colNum;
    var url = CTS.Util.GSheet._gSheetUrl('cells', ssKey, wsKey, 'private', 'full', cell, false, true);
    url = CTS.Util.GSheet.makeProxyUrl(url);

    var cellurl = "https://spreadsheets.google.com/feeds/cells/" +
      ssKey + "/" + wsKey + "/private/full/" + cell;

    var xmlBody = "<?xml version='1.0' ?>";
    xmlBody += '<entry xmlns="http://www.w3.org/2005/Atom"';
    xmlBody += ' xmlns:gs="http://schemas.google.com/spreadsheets/2006">\n';
    xmlBody += '\t<id>' + cellurl + '</id>\n';
    xmlBody += '\t<link rel="edit" type="application/atom+xml" ';
    xmlBody += 'href="' + cellurl + '" />\n';
    xmlBody += '\t<gs:cell row="' + rowNum + '" col="' + colNum + '" ';
    xmlBody += 'inputValue="' + value + '"/>\n</entry>';

    var request = CTS.$.ajax(url, {
      type: 'PUT',
      headers: {
        'Content-Type': 'application/atom+xml',
        'GData-Version': '3.0',
        'If-Match': '*'
      },
      data: xmlBody
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
    console.log("Modify List Item");
    var deferred = Q.defer();
    var url = itemNode.spec.editLink;
    if (CTS.Util.GSheet._currentToken != null) {
      url += "?access_token=" + CTS.Util.GSheet._currentToken.access_token;
    } else {
      console.error("Asked for auth but current token null");
    }
    url = CTS.Util.GSheet.makeProxyUrl(url);

    var xmlBody = "<?xml version='1.0' ?>";
    xmlBody += '<entry xmlns="http://www.w3.org/2005/Atom"';
    xmlBody += ' xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">\n';
    xmlBody += '\t<link rel="edit" type="application/atom+xml" ';
    xmlBody += 'href="' + itemNode.spec.editLink + '" />\n';
    xmlBody += '\t<id>' + itemNode.getItemId() + '</id>\n';
    for (var i = 0; i < itemNode.children.length; i++) {
      var child = itemNode.children[i];
      xmlBody += '\t<gsx:' + child.key + '>' + child.value + '</gsx:' + child.key + '>\n'
    }
    xmlBody += '</entry>';

    var request = CTS.$.ajax(url, {
      type: 'PUT',
      headers: {
        'Content-Type': 'application/atom+xml',
        'GData-Version': '3.0',
        'If-Match': '*',
        'Authorization': 'AuthSub token="' + CTS.Util.GSheet._currentToken.access_token + '"'
      },
      data: xmlBody
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

  cloneListItem: function(ssKey, wsKey, itemNode) {
    var deferred = Q.defer();

    var url = "https://spreadsheets.google.com/feeds/list/" + ssKey +
          "/" + wsKey + "/private/full?alt=json&callback=?&access_token=" +   CTS.Util.GSheet._currentToken.access_token;
    url = CTS.Util.GSheet.makeProxyUrl(url);

    var xmlBody = "<?xml version='1.0' ?>";
    xmlBody += '<entry xmlns="http://www.w3.org/2005/Atom"';
    xmlBody += ' xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">\n';
    for (var i = 0; i < itemNode.children.length; i++) {
      var child = itemNode.children[i];
      var value = child.value;
      var key = child.key;

      // XXX TEMPORARY FIX FOR BOOLEAN DEFAULTING!
      if ((value == true) || (value == "TRUE") || (value == "True") || (value == "true")) {
        key = false;
      }

      xmlBody += '\t<gsx:' + child.key + '>' + child.value + '</gsx:' + child.key + '>\n'
    }
    xmlBody += '</entry>';

    var request = CTS.$.ajax(url, {
      type: 'POST',
      headers: {
        'Content-Type': 'application/atom+xml',
        'GData-Version': '3.0',
        'Authorization': 'AuthSub token="' + CTS.Util.GSheet._currentToken.access_token + '"'
      },
      data: xmlBody
    });
    request.done(function(json) {
      var itemSpec = CTS.Util.GSheet._getItemSpec(json.entry, ssKey, wsKey);
      deferred.resolve(itemSpec);
    });
    request.fail(function(jqxhr, textStatus) {
      CTS.Log.Error(jqxhr, textStatus);
      deferred.reject(textStatus);
    });

    return deferred.promise;
  }
});
