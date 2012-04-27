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

class RepeatInner
  constructor: () ->

  signature: () ->
    "repeat-inner"

  # Interprets arg1 as key-path into context
  # Replaces the contents of this node with resolution 
  # Tells engine not to recurse into contents
  applyTo: (node, context, args, engine) ->
    n = 1
    kp = args[0]
    if args.length == 2
      n = parseInt(args[0])
      kp = args[1]
      
    collection = context.resolve(kp)

    template = []
    $.each node.children(), (idx, child) =>
      if idx<n
        template.push($(child))
      else
        $(child).remove()

    if collection.length == 0
      # XXX
      # TODO: Need to do this in recoverable fashion
      template.hide()
    else
      templateHtml = node.html()
      node.html("")
      zeroIndex = 0
      for elem in collection
        context.setZeroIndex(zeroIndex)
        newNode = $(templateHtml)
        context.push(elem)
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
    n = 1
    kp = args[0]
    if args.length == 2
      n = parseInt(args[0])
      kp = args[1]
    
    context.set(kp, [])
    context.pushKeypath(kp)

    addIterable = (c) ->
      console.log("Adding Iterable")
      iterable = c.pop()
      console.log(iterable)
      c.head().push(iterable)
      console.log("Container is  is: " + JSON.stringify(c.head()))
   
    firstPush = true 
    $.each(node.children(), (idx, child) =>
      console.log("Head on iteration " + idx + " is: " + JSON.stringify(context.head()))
      if firstPush
        firstPush = false 
        context.push({})
      if (idx % n == 0) and (idx != 0)
        addIterable(context)
        context.push({})
      
      container = $("<div />")
      container.append($(child).clone())
      console.log("Recovering data: " + container.html())
      engine._recoverData(container, context)
    )
    addIterable(context)
    context.pop() # popping container
    [false, false]

  # Recovers template
  recoverTemplate: (node, context) ->
    # Nothing
    [false, false]
