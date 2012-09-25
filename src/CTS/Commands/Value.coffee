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

class Value
  constructor: () ->

  signature: () ->
    "value"

  # Interprets arg1 as key-path into context
  # Replaces the contents of this node with resolution 
  # Tells engine not to recurse into contents
  applyTo: (node, context, args, engine) ->
    value = context.resolve(args[0])
    node.html(value)
    if engine.opts.DyeNodes
      node.addClass(CTS.Options.ClassForValueNode)
    [false, false]

  # Recovers data
  #### Side Effects
  #
  recoverData: (node, context, args, engine) ->
    value = node.html()
    context.set(args[0], value)
    [false, false]

  # Recovers template
  recoverTemplate: (node, context) ->
    node.clone()
 

