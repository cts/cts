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

class If extends CTS.Commands.Command
  constructor: () ->

  signature: () ->
    "if"

  applyTo: (node, context, args, engine) ->
    defaultArgs = args['.']
    show = true
    data = {}
    if 'exist' of defaultArgs
      valueKey = @._resolveArgument(defaultArgs['exist'], node)
      value = context.resolve(valueKey)
      if value != null
        data[valueKey] = value
      else
        show = false
    if 'nexist' of defaultArgs
      valueKey = @._resolveArgument(defaultArgs['nexist'], node)
      value = context.resolve(valueKey)
      if value != null
        data[valueKey] = value
        show = false

    CTS.Util.stashData(node, @.signature(), data)

    if show
      CTS.Util.showNode(node)
      return [true, true]
    else
      CTS.Util.hideNode(node)
      return [false, false]

  recoverData: (node, context, args, engine) ->
    data = CTS.Util.getDataStash(node, @.signature())
    for k of data
      v = data[k]
      context.set(k,v)

    if CTS.Util.nodeHidden(node)
      return [false, false]
    else 
      return [true, true]
  
  recoverTemplate: (node, context) ->
    node.clone()
 

