# Loads all the templates referenced from a page.
# Currently requires Bullfrog to be running.
class Templates
  constructor: () ->
    @toLoad = []
    @loaded = []
    @callback = null

  setCallback: (callback) =>
    @callback = callback

  loadAll: (rules) ->
    for selector, block of rules
      if "template" of block
        template = block["template"]
        address = template["."]["."]
        @toLoad.append(address)

    if @toLoad.length == 0 and @callback
      @callback()
    else if @toLoad.length > 0
      for address in @toLoad
        @_load(address)

  getCached: (address) ->

  _load: (address) ->
    console.log("loading template: " + address)
    if address[0] == '#'
      # it's local to the page
      @._loadResponse(address, $(address).html())
    else
      CTS.Util.fetchRemoteStringBullfrog(address, @._loadResponse)

  _loadResponse: (address, html) ->
    @templates[address] = $(address).html()
    @loaded.append(address)
    if @loaded.length == @toLoad.length
      @._loadComplete()

  _loadComplete: () ->
    if @callback
      @callback()

