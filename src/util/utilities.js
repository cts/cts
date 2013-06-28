var Utilities = CTS.Utilities = {
  getUrlParameter: function(param, url) {
    if (typeof url == 'undefined') {
      url = window.location.search;
    }

    var p = param.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + p + "=([^&#]*)";
    var regex = new RegExp(regexS);

    var results = regex.exec(url)
    if (results == null) {
      return null;
    } else {
      return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
  },

  /**
   * Returns array of objects with keys:
   *  type: (link or inline)
   *  content: the cts content for inline
   *  url: the url for links
   *  args: any other args
   *
   * TODO(eob): Provide a root element as optional argument
   * to support ingestion of cts rules from transcluded content.
   */ 
  getTreesheetLinks: function() {
    var ret = [];
    CTS.Fn.each(CTS.$('script[data-treesheet]'), function(elem) {
      var str = CTS.$(elem).attr('data-treesheet');
      if (str != null) {
        var urls = str.split(";");
        for (var i = 0; i < urls.length; i++) {
          var block = {
            type: 'link',
            format: 'string',
            url: urls[i]
          };
          ret.push(block);
        }
      }
    }, this);
    CTS.Fn.each(CTS.$('script[data-theme]'), function(elem) {
      var str = CTS.$(elem).attr('data-theme');
      if (str != null) {
        var block = {
          type: 'link',
          format: 'string',
          url: CTS.Utilities.themeUrl(str)
        };
        ret.push(block);
      }
    }, this);

    CTS.Fn.each(CTS.$('style[type="text/cts"]'), function(elem) {
      var block = {
        type: 'block',
        format: 'string',
        content: CTS.$(elem).html()
      };
      ret.push(block);
    }, this);
    CTS.Fn.each(CTS.$('style[type="json/cts"]'), function(elem) {
      var block = {
        type: 'block',
        format: 'json',
        content: CTS.$(elem).html()
      };
      ret.push(block);
    }, this);
    // TODO(eob): see if this causes it to get the smae element three times...
    // XXX !important
    CTS.Fn.each(CTS.$('link[rel="treesheet"],link[type="txt/cts"],link[type="json/cts"]'), function(elem) {
      var e = CTS.$(elem);
      var type = e.attr('type');
      var format = 'string';
      if (type == 'json/cts') {
        format = 'json';
      }
      var block = {
        type: 'link',
        url: CTS.$(elem).attr('href'),
        format: format
      };
      ret.push(block);
    }, this);
    return ret;
  },

  themeUrl: function(str) {
    // theme urls take the form TYPE/INSTANCE/PAGE 
    // TODO(eob): create more flexible ecosystem
    return "http://treesheets.csail.mit.edu/mockups/" + str + ".cts";
  },

  fixRelativeUrl: function(url, loadedFrom) {
    if ((url === null) || (typeof url == "undefined")) {
      return null;
    }
    if (typeof loadedFrom == 'undefined') {
      return url;
    } else {
      if ((url.indexOf("relative(") == 0) && (url[url.length - 1] == ")")) {
        var fragment = url.substring(9, url.length - 1);
        var prefix = loadedFrom.split("/");
        prefix.pop();
        prefix = prefix.join("/");
        url = prefix + "/" + fragment;
        return url;
      } else {
        return url;
      }
    }
  },

  fetchString: function(params, successFn, errorFn) {
    var deferred = Q.defer();
    var xhr = CTS.$.ajax({
      url: params.url,
      dataType: 'text',
      beforeSend: function(xhr, settings) {
        CTS.Fn.each(params, function(value, key, list) {
          xhr[key] = value;
        }, this);
      }
    });
    xhr.done(function(data, textStatus, jqXhr) {
      deferred.resolve(data, textStatus, jqXhr);
    });
    xhr.fail(function(jqXhr, textStatus, errorThrown) {
      CTS.Log.Error("Couldn't fetch string at:", params.url);
      deferred.reject(jqXhr, textStatus, errorThrown);
    });
    return deferred.promise;
  },

  fetchTree: function(spec, callback, context) {
    if ((spec.url == null) && (spec.name == 'body')) {
      callback.call(context, null, CTS.$('body'));
    } else {
      CTS.Log.Fatal("FETCH TREE NOT IMPLEMENTED");
      callback.call(context, "Not Implemented");
    }
  }

};
 
