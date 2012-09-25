# Copyright (c) 2012 Edward Benson
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

## Context
# Author: Ted Benson <eob@csail.mit.edu>

#### Preamble
$ = jQueryHcss

#### Dependencies
#<< Options.coffee
#<< Context.coffee
#<< Parser.coffee
#<< Rules.coffee
#<< Utils.coffee
#<< Commands/*


#### Engine
class Engine
  constructor: (options) ->
    @opts = $.extend {}, CATS.Options.Default(), options
    @commands = []
    @._loadBasicCommandSet()
    CATS.Cascade.attachInlineSheets()

  render: (node, data) ->
    # Default to node=HTML and data=window
    node = node || $('html')
    data = data || window
    context = new CATS.Context(data)
    @._render(node, context)

  recoverData: (node) ->
    node = node || $('html')
    context = new CATS.Context({})
    $.each node, (i,e) =>
      @._recoverData($(e), context)
    context.tail()

  _render: (jqnode, context) ->
   # Account for the fact that node might actually be a jQuery selector
   # that has returned a list of elements
   $.each jqnode, (i,node) =>
     node = $(node)
     recurse = true
     cats = CATS.Cascade.rulesForNode(node)
     if cats != null
       for command in @commands
         if command.signature() of cats
           res = command.applyTo(node, context, cats[command.signature()], @)
           # The result object has two values. The first tell us whether
           # or not to continue with the commands for this node. The second
           # tells us whether or not to recurse at the end.
           recurse = recurse and res[1]
           break unless res[0]
     if recurse
       for kid in node.children()
         @._render($(kid), context)
  
  _recoverData: (node, context) ->
    recurse = true
    cats = CATS.Cascade.rulesForNode(node)
    if cats != null
      for command in @commands
        if command.signature() of cats
          res = command.recoverData(node, context, cats[command.signature()], @)
          recurse = recurse and res[1]
          break unless res[0]
    if recurse
      for kid in node.children()
        @._recoverData($(kid), context)

  _loadBasicCommandSet: () ->
    @._addCommand(new CATS.Commands.With())
    @._addCommand(new CATS.Commands.Data())
    @._addCommand(new CATS.Commands.IfExist())
    @._addCommand(new CATS.Commands.IfNExist())
    @._addCommand(new CATS.Commands.Attr())
    @._addCommand(new CATS.Commands.Template())
    @._addCommand(new CATS.Commands.RepeatInner())
    @._addCommand(new CATS.Commands.Value())

  _addCommand: (command) ->
    @commands.push(command)

