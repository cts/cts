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
$ = jQueryHcss

class Template
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
      templateAddress = defaultTargetArgs["."]
      if templateAddress
        template = engine.templates.fetch(templateAddress)
        @._applyTo(node, context, args, engine, template)

  # This method is partitioned out here for testing
  # purposes (so we can test the method in isolation from
  # fetching some fragment from the dom.
  _applyTo: (node, context, args, engine, template) ->
    node.html(template)
    [true, true]

  # Recovers data
  #### Side Effects
  #
  recoverData: (node, context, args, engine) ->
    [true, true]

  # Recovers template
  recoverTemplate: (node, context) ->
    node.clone()

