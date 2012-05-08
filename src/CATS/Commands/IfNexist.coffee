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

class IfNExist
  constructor: () ->

  signature: () ->
    "if-nexist"

  # Interprets arg1 as key-path into context
  # Replaces the contents of this node with resolution 
  # Tells engine not to recurse into contents
  applyTo: (node, context, args, engine) ->
    value = context.resolve(args[0])
    if value != null
      # XXX TODO: This is going to cause recovery problems
      # if it came from the bookmarks. Need to account for that somehow
      CATS.Util.hideNode(node)
      data = {} # Odd, I can't seem to do this in one line w/o coffee failing
      data[args[0]] = value
      CATS.Util.stashData(node, @.signature(), data)
      return [false, false]
    else
      CATS.Util.showNode(node)
      return [true, true]

  # Recovers data
  #### Side Effects
  recoverData: (node, context, args, engine) ->
    if CATS.Util.nodeHidden(node)
      # Oddly, if the node is hidden, it means something was there.
      # So we recover the data but we do not continue recursion.
      # Bizarre
      data = CATS.Util.getDataStash(node, @.signature())
      for k of data
        v = data[k]
        context.set(k,v)
      return [false, false]
    else
      # If it's not hidden, it means the thing *didn't* exist, which means
      # there is no data to recover but we should continue extraction down this 
      # subtree
      return [true, true]

  # Recovers template
  recoverTemplate: (node, context) ->
    node.clone()
 
