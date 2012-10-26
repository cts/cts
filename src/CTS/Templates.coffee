
#<< CTS/Commands/Template

# Loads all the templates referenced from a page.
# Currently requires Bullfrog to be running.
class Templates
  constructor: () ->
    @templates = {}
    @templateCommand = new CTS.Commands.Template()
    @preloadCount = 0
    @preloadCallback = null

  fetch: (name, proxy) ->
    console.log("Templates: Fetching", name)
    return @templates[name]

  preLoad: (rules, callback) =>
    @preloadCount = 0
    @preloadCallback = callback
    toLoad = []
    template = @templateCommand.signature()
    for selector, block of rules
      if @.needsLoad(block)
        @preloadCount += 1
        toLoad.push(block)
    if @preloadCount == 0
      console.log("Templates: No templates to preload. Calling callback.")
      @preloadCallback()
    else
      console.log("Templates: Preloading", @preloadCount, "templates")
      for block in toLoad
        @.load(block, @._preloadResponse)

  _preloadResponse: () =>
    @preloadCount -= 1
    console.log("Templates: Preload Callback", @preloadCount)
    if @preloadCount == 0 and @preloadCallback != null
      @preloadCallback()
    @preloadCallback = null

  needsLoad: (rules) ->
    if rules != null and @templateCommand.signature() of rules
      tBlock = rules[@templateCommand.signature()]
      tName = tBlock["."]["."]  # Default target, default variant
      if tName of @templates
        return false
      else
        console.log("Templates needs load because of", tName)
        return true
    else
      return false

  load: (rules, callback) ->
    if rules != null and @templateCommand.signature() of rules
      tBlock = rules[@templateCommand.signature()]
      tName = tBlock["."]["."]  # Default target, default variant
      tProxy = tBlock["."]["proxy"]
      if tName in @templates
        @templates[tName]
      else
        if @.isLocal(tName)
          @.loadLocal(tName)
          callback() # Load Complete
        else
          @.loadRemote(tName, tProxy, callback)

  isLocal: (tName) ->
    return tName[0] == "#"

  loadLocal: (tName) ->
    value = $(tName).html()
    @templates[tName] = value
    return value

  loadRemote: (tName, proxy, callback) =>
    #console.log("Template: Loading remote", tName)
    save = { 'tname': tName, 'callback': callback }
    if proxy?
      CTS.Util.fetchRemoteStringBullfrog(tName, proxy, @._loadRemoteResponse, save)
    else
      CTS.Util.fetchRemoteStringSameDomain(tName, @._loadRemoteResponse, save)

  _loadRemoteResponse: (text, status, xhr) =>
    #console.log("Template Load Remote Response", xhr, text)
    callback  = xhr.callback
    tName = xhr.tname
    console.log("Templates: Loaded remote", tName)
    @templates[tName] = text
    callback()

