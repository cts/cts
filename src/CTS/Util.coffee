class Util
  @hideNode: (node) ->
    node.addClass(CTS.Options.ClassForInvisible)

  @showNode: (node) ->
    node.removeClass(CTS.Options.ClassForInvisible)

  @nodeHidden: (node) ->
    node.hasClass(CTS.Options.ClassForInvisible)

  @stashData: (node, command, dict) ->
    # NOTE: The implementation of this may need to be fiddled
    # with to make browser-agnostic. For example, I think jQuery
    # doesn't set the data attribute properly in some circumstances
    # when just the node.data(...) syntax is used.
    attr = node.attr("data-"+CTS.Options.AttrForSavedData)
    if not attr? or attr == null
      attr = {}
    attr[command] = dict
    str = JSON.stringify(attr)
    str = str.replace(/\\/g,"\\\\") # \ -> \\'
    str = str.replace(/'/g,"\\'") # ' -> \'
    str = str.replace(/"/g,"'") # " -> \'
    node.attr("data-"+CTS.Options.AttrForSavedData,str)
  
  @getDataStash: (node, command) ->
    str = node.attr("data-"+CTS.Options.AttrForSavedData)
    if typeof str != "undefined"
      str = str.replace(/([^\\])'/g,'$1"') # " -> \'
      str = str.replace(/\\'/g,"'") # ' -> \'
      str = str.replace(/\\\\/g,"\\") # \ -> \\'
      stash = JSON.parse(str)
      if command of stash
        return stash[command]
      else
        return {}
    else
      return {}

  @fetchRemoteStringPlain: (url, callback, xhrParams, params) ->
    $.ajax({
      url: url,
      dataType: 'text',
      success: callback,
      beforeSend: (xhr, settings) ->
        for key of params
          xhr[key] = params[key]
    })
  
  @fetchRemoteStringBullfrog: (url, callback, xhrParams, params) ->
    urlParts = url.split("#")
    params = params || {}
    params['url'] = urlParts[0]
    if urlParts.length > 1
      params['id'] = urlParts[1]

    ribbitUrl = "http://localhost:9999/ribbit?callback=?"

    @.ajax({
      url: urlParts[0],
      dataType: 'text',
      success: callback,
      beforeSend: (xhr, settings) ->
        for key of params
          xhr[key] = params[key]
      data: params
    })
