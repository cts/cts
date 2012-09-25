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

class IfExist
  constructor: () ->

  signature: () ->
    "if-exist"

  # Interprets arg1 as key-path into context
  # Replaces the contents of this node with resolution 
  # Tells engine not to recurse into contents
  applyTo: (node, context, args, engine) ->
    value = context.resolve(args[0])
    if value == null
      CTS.Util.hideNode(node)
      return [false, false]
    else
      CTS.Util.showNode(node)
      # Save the data used to make this decision 
      # XXX TODO: This is going to cause recovery problems
      # if it came from the bookmarks. Need to account for that somehow
      data = {} # Odd, I can't seem to do this in one line w/o coffee failing
      data[args[0]] = value
      CTS.Util.stashData(node, @.signature(), data)
      return [true, true]

  # Recovers data
  #### Side Effects
  recoverData: (node, context, args, engine) ->
    if CTS.Util.nodeHidden(node)
      return [false, false]
    
    data = CTS.Util.getDataStash(node, @.signature())
    for k of data
      v = data[k]
      context.set(k,v)
    
    return [true, true]

  # Recovers template
  recoverTemplate: (node, context) ->
    node.clone()
 

