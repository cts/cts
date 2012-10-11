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

class Repeat extends CTS.Commands.Command
  constructor: () ->

  signature: () ->
    "repeat"

  # Interprets arg1 as key-path into context
  # Replaces the contents of this node with resolution 
  # Tells engine not to recurse into contents
  # Notation: COMMAND(TARGET)-VARIANT: VALUE
  #
  # { target1: {target config} }
  # target config:
  # { variant1: value, ... }
  # Defaults are a period '.'
  # 
  # If you have the CTS command
  #  repeat: people
  #
  # That gives you the args
  # { '.': { '.': 'people'} }
  # 
  # If you have
  #  repeat: people
  #  repeat-offsetstart: 4
  #  repeat-step: 2
  #
  # You'll get
  #
  # { '.': { '.': people,
  #          'offsetstart': '4',
  #          'step': '2' }}
  #             
  applyTo: (node, context, args, engine) ->
    defaultTarget = args["."]
    defaultArg = defaultTarget["."]

    step = 1
    # HASH MEMBERSHIP IS of, NOT in
    if "step" of defaultTarget
      step = parseInt(defaultTarget["step"])
    
    collection = context.resolve(defaultArg)

    template = []
    $.each node.children(), (idx, child) =>
      if idx<step
        template.push($(child))
      else
        $(child).remove()

    if not collection? or collection.length == 0
      CTS.Util.hideNode(node)
    else
      templateHtml = node.html()
      node.html("")
      zeroIndex = 0
      for elem in collection
        context.setZeroIndex(zeroIndex)
        newNode = $(templateHtml)
        context.push(elem)
        console.log("console head (render repeat)", context.head(), newNode)
        node.append(newNode)
        engine._render(newNode, context)
        context.pop()
        zeroIndex += 1
    context.setZeroIndex(0)
    [false, false]

  # Recovers data
  #### Side Effects
  #
  recoverData: (node, context, args, engine) ->
    defaultTarget = args["."]
    defaultArg = defaultTarget["."]
    console.log("Recover kp", defaultArg)
    step = 1
    if "step" in defaultTarget
      step = parseInt(defaultTarget["step"])
 
    context.set(defaultArg, [])
    context.pushKeypath(defaultArg)

    addIterable = (c) ->
      iterable = c.pop()
      c.head().push(iterable)
   
    firstPush = true 

    $.each(node.children(), (idx, child) =>
      if firstPush
        firstPush = false 
        context.push({})
      if (idx % step == 0) and (idx != 0)
        addIterable(context)
        context.push({})
      engine._recoverData($(child), context)
    )
    addIterable(context)
    context.pop() # popping container
    [false, false]

  # Recovers template
  recoverTemplate: (node, context) ->
    # Nothing
    [false, false]
