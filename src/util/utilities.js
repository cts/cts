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
    CTS.Fn.each(CTS.$('style[type="text/cts"]'), function(elem) {
      var block = {
        type: 'inline',
        content: $(elem).html()
      };
      ret.append(block);
    }, this);
    CTS.Fn.each(CTS.$('link[rel="treesheet"]'), function(elem) {
      var block = {
        type: 'link',
        url: $(elem).attr('href')
      };
      ret.append(block);
    }, this);
    return ret;
  },

  loadRemoteString: function(params, successFn, errorFn) {
    $.ajax({url: params.url,
            dataType: 'text',
            success: success,
            error: error,
            beforeSend: function(xhr, settings) {
              CTS.Fn
      .each(params, function(value, key, list) {
                xhr[key] = value;
              }, this);
            }
    });
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
 
