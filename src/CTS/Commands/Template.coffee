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

#### Dependencies
#<< CTS/Commands/Command

$ = jQueryHcss

class Template extends CTS.Commands.Command
  #     template: foo.html#bar
  #
  #   Would result in the following return result
  #
  #     { template: { .: { .: "foo.html#bar" }}}
  constructor: () ->

  signature: () ->
    "template"

  applyTo: (node, context, args, engine) ->
    # TODO: Enable cross-site linking here.
    defaultTargetArgs = args["."]
    if defaultTargetArgs
      templateAddress = @._resolveArgument(defaultTargetArgs["."], node)
      if templateAddress
        template = engine.templates.fetch(templateAddress, defaultTargetArgs["proxy"])
        @._applyTo(node, context, args, engine, template)

  # This method is partitioned out here for testing
  # purposes (so we can test the method in isolation from
  # fetching some fragment from the dom.
  _applyTo: (node, context, args, engine, template) ->
    CTS.Util.setLastInserted(node)
    console.log("----- Begin Template Application ------")
    # Get any script elements in the template

    tup = CTS.Util.stripScriptTags(template)

    templateNoScript = tup[0]
    templateScript = tup[1]

    templateElem = $('<div class="cts-template" />')
    templateElem.html(templateNoScript)

    scriptsToReturn = null
    if templateScript.length > 0
      scriptsToReturn = templateScript
    
    node.html(templateElem)

    if scriptsToReturn
      [false, true, scriptsToReturn] # Continue? Recurse?
    else
      [false, true]  # Continue? Recurse?

  # Recovers data
  #### Side Effects
  #
  recoverData: (node, context, args, engine) ->
    [true, true]

  # Recovers template
  recoverTemplate: (node, context) ->
    node.clone()



