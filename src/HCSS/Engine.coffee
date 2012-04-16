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

## Context
# Author: Ted Benson <eob@csail.mit.edu>

#### Preamble
$ = jQueryHcss

#### Engine
class Engine
  constructor: (evaluator) ->
    @evaluator = evaluator
    @commands = []
    @commandDict = {}
    @._loadBasicCommandSet()

  render: (node, data) ->
    # Default to node=HTML and data=window
    node = node || $('html')
    data = data || window
    context = new HCSS.Context(data)
    @._render(node, context)

  _render: (node, context) ->
    recurse = true
    for command in commands
      if @._commandApplies(node, command)
        args = @._argsForCommand(node, command)
        res = command.applyTo(node, context, args, @)
        # The result object has two values. The first tell us whether
        # or not to continue with the commands for this node. The second
        # tells us whether or not to recurse at the end.
        recurse = recurse and res[1]
        break unless res[0]
    if recurse
      for kid in node.children()
        @._render(kid, context)
    
  _commandApplies: (node, command) ->
    true

  _argsForCommand: (node, command) ->
    null

  _loadBasicCommandSet: () ->

  _addCommand: (command) ->
    @commandDict[command.property] = command
    @commands.push(command)

