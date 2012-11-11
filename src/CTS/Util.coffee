class Util
  @lastInserted = null

  @getLastInserted: () ->
    return @lastInserted

  @setLastInserted: (node) ->
    @lastInserted = node

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

  # Stripts the <script> tags out of a string containing HTML.
  # jQuery can't be used to do this because it will execute the script.
  #
  # Args:
  #  htmlString: A string containing HTML
  #
  # Returns:
  #  [htmlWithoutScripts, htmlOnlyScripts]
  #  An array whose first element is the HTML minus script tags, and the second
  #  element is the HTML of just the script elements.
  @stripScriptTags: (htmlString) ->
    noscripts = document.createElement('div')
    noscripts.innerHTML = htmlString
    justscripts = document.createElement('div') 

    scripts = noscripts.getElementsByTagName('script')
    while scripts.length > 0
      # scripts will automatically get shrunk
      script = scripts[0]
      script.parentNode.removeChild(script)
      justscripts.appendChild(script)

    return [noscripts.innerHTML, justscripts.innerHTML]
  
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

  @fetchRemoteStringSameDomain: (url, callback, xhrParams, params) ->
    #console.log("Fetching remote string (same domain)", url)
    urlParts = url.split("#")
    params = params || {}
    params['url'] = urlParts[0]
    if urlParts.length > 1
      params['id'] = urlParts[1]

    firstCallback = (text, status, xhr) ->
      cb = xhr._requestedCallback
      if xhr._idPart
        eid = xhr._idPart.substring(1)
        console.log("ID fragment requested for same-origin template")
        dom = HTMLtoDOM(text)
        e = dom.getElementById(eid)
        if eid
          el = dom.createElement("div")
          el.appendChild(e)
          cb(el.innerHTML, status, xhr)
        else
          cb("", status, xhr)
#        console.log(dom)
#        textNode = $(text)
#        hitNode = null
#        $.each(textNode, (idx, elem) =>
#          n = $(elem)
#          if n.is(xhr._idPart)
#            hitNode = n
#          else
#            res = n.find(xhr._idPart).html()
#            if res != null
#              hitNode = res
#        )
#      else
#        console.log("No ID fragment requested; returning the whole thing")
#      cb(text, status, xhr)

    $.ajax({
      url: urlParts[0],
      dataType: 'text',
      success: firstCallback,
      beforeSend: (xhr, settings) ->
        for key of xhrParams
          xhr[key] = xhrParams[key]
        xhr['_requestedCallback'] = callback
        if urlParts.length > 1
          xhr['_idPart'] = "#" + urlParts[1]
      data: params
    })
  
  @fetchRemoteStringBullfrog: (template, proxyUrl, callback, xhrParams, params) ->
    #console.log("Fetching remote string with bullfrog", template, proxyUrl)
    urlParts = template.split("#")
    params = params || {}
    params['url'] = urlParts[0]
    if urlParts.length > 1
      params['id'] = urlParts[1]

    ribbitUrl = proxyUrl + "?callback=?"

    $.ajax({
      url: proxyUrl,
      dataType: 'jsonp',
      success: callback,
      beforeSend: (xhr, settings) ->
        for key of xhrParams
          xhr[key] = xhrParams[key]
      data: params
    })

  @getUrlParameter: (param, url) ->
    p = param.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]")
    regexS = "[\\?&]" + p + "=([^&#]*)"
    regex = new RegExp(regexS);
    if typeof url == 'undefined'
      url = window.location.search
    results = regex.exec(url)
    if results == null
      return ""
    else
      return decodeURIComponent(results[1].replace(/\+/g, " "))
