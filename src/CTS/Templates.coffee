
#<< CTS/Commands/Template

# Loads all the templates referenced from a page.
# Currently requires Bullfrog to be running.
class Templates
  constructor: () ->
    @templates = {}
    @templateCommand = new CTS.Commands.Template()

  fetch: (name, proxy) ->
    console.log("Fetching template", name)
    return @templates[name]

  needsLoad: (rules) ->
    if rules != null and @templateCommand.signature() of rules
      tBlock = rules[@templateCommand.signature()]
      tName = tBlock["."]["."]  # Default target, default variant
      if tName in @templates
        return false
      else
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
    save = { 'tname': tName, 'callback': callback }
    if proxy?
      CTS.Util.fetchRemoteStringBullfrog(tName, proxy, @._loadRemoteResponse, save)
    else
      CTS.Util.fetchRemoteStringSameDomain(tName, @._loadRemoteResponse, save)

  _loadRemoteResponse: (text, status, xhr) =>
    console.log(xhr)
    callback  = xhr.callback
    tName = xhr.tname
    console.log("Gor response for", tName)
    @templates[tName] = text
    callback()

