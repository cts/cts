# Copyright (c) 2012 Edward Benson
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Rules
# Author: Ted Benson <eob@csail.mit.edu>

#### Preamble
$ = jQueryHcss

RulesState = 
  NONE_LOADED : 0
  WAIT_FOR_REMOTE: 1

#### Dependencies
#<< CTS/Options
#<< CTS/Parser

##
# Contains methods for loading rules and providing rules for a node.
#
class Rules
  constructor: () ->
    @blocks = {}
    @loadedUrls = []
    @urlsToLoad = 0
    @callback = null
    @state = RulesState.NONE_LOADED

  setCallback: (callback) =>
    @callback = callback

  load: () =>
    # Loads all CTS rules.
    @.loadLinked()
    if @state != RulesState.WAIT_FOR_REMOTE
      @._remoteLoadFinished()

  loadLinked: () =>
    # Loads linked CTS sheets from anywhere in HEAD or BODY.
    # Only loads those that have not been loaded before.
    links = @._findCtsLinks()
    linksToLoad = []
    for link in links
      if link not in @loadedUrls
        linksToLoad.push(link)
    @urlsToLoad = linksToLoad.length
    for link in linksToLoad
      @state = RulesState.WAIT_FOR_REMOTE
      CTS.Util.fetchRemoteStringPlain(link, @._loadLinkResponse, {url: link})

  loadLocal: () =>
    # Searches through the page and attaches the contents of any
    # link element with type text/cts.
    $.each($('script[type="text/cts"]'), (idx, elem) =>
      e = $(elem)
      if not e.attr("src")
        @.loadLocalElement(e)
    )

  loadLocalElement: (elem) =>
    ctsText = elem.html()
    blocks = CTS.Parser.parseBlocks(ctsText)
    @._incorporateBlocks(blocks)

  rulesForNode: (node) =>
    global = @_globalRulesForNode(node)
    inline = @_inlineRulesForNode(node)
    if not global and not inline
      return null

    rules = {}
    if global
      $.extend(rules, global)
    if inline
      $.extend(rules, inline)
    rules


  _incorporateBlocks: (blocks) =>
    $.extend(@blocks, blocks)

  _inlineRulesForNode: (node) =>
    # Returns:
    #   block if there was a block at @data-cts
    #   null if there was no block or a parse error
    if node.data?
      data = node.data()
      if data?
        block = node.data()["cts"]
        if block?
          block = CTS.Parser.parseBlock(block)
          return block
    return null

  _globalRulesForNode: (node) =>
    ret = {}
    hit = false
    for key of @blocks
      if node.is(key)
        hit = true
        $.extend(ret, @blocks[key])
    if hit
      return ret
    return null

  _findCtsLinks: () =>
    ret = []
    $.each($('script[type="text/cts"]'), (idx, elem) =>
      e = $(elem)
      if e.attr("src")
        ret.push(e.attr("src"))
    )
    return ret

  _remoteLoadFinished: () =>
    if @callback
      @callback(this)

  _loadLinkResponse: (text, status, xhr) =>
    blocks = CTS.Parser.parseBlocks(text)
    @._incorporateBlocks(blocks)
    @loadedUrls.push[xhr.url]
    @urlsToLoad = @urlsToLoad - 1
    if @urlsToLoad == 0
      @._remoteLoadFinished()
    

