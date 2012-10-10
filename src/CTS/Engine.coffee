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
#<< CTS/Options
#<< CTS/Context
#<< CTS/Parser
#<< CTS/Rules
#<< CTS/Util
#<< CTS/Templates
#<< CTS/Commands/*


#### Engine
class Engine
  constructor: (options) ->
    @opts = $.extend {}, CTS.Options.Default(), options
    @commands = []
    @rules = new CTS.Rules()
    @templates = new CTS.Templates()
    @._loadBasicCommandSet()

  render: (node, data) ->
    # Default to node=HTML and data=window
    node = node || $('html')
    data = data || window
    context = new CTS.Context(data)
    @._render(node, context)

  recoverData: (node) ->
    console.log("RECOVER", node)
    node = node || $('html')
    context = new CTS.Context({})
    $.each node, (i,e) =>
      @._recoverData($(e), context)
    context.tail()

  _render: (jqnode, context) =>
     # Account for the fact that node might actually be a jQuery selector
     # that has returned a list of elements
     $.each jqnode, (i,node) =>
       node = $(node)
       rules = @rules.rulesForNode(node)
       if @templates.needsLoad(rules)
         @templates.load(rules, () =>
           @._renderNodeWithRules(node, rules, context)
         )
       else
         @._renderNodeWithRules(node, rules, context)

  _renderNodeWithRules: (node, rules, context) =>
    recurse = true
    scripts = []
    functions = []
    if rules != null
      for command in @commands
        if command.signature() of rules
          res = command.applyTo(node, context, rules[command.signature()], @)
          # The result object has two values. The first tell us whether
          # or not to continue with the commands for this node. The second
          if res.length > 2 and res[2] != null
            for script in res[2]
              scripts.push(script)
          if res.length > 3 and res[3] != null
            for f in res[3]
              functions.push(f)
  
          # tells us whether or not to recurse at the end.
          recurse = recurse and res[1]
          break unless res[0]
      
    if recurse
      for kid in node.children()
        #console.log("Parent->Child", node, $(kid))
        @._render($(kid), context)
    for f in functions
      f(node, rules, context)
    for script in scripts
      # Convert to a real script tag
      # TODO(eob): Fix this terrible hack.
      console.log("Engine: Executing scripts")
      scriptBody = script.html();
      scriptBody = scriptBody.replace(/&gt;/g, ">");
      scriptBody = scriptBody.replace(/&amp;/g, "&");
      scriptBody = scriptBody.replace(/&lt;/g, "<");
      realScript = $('<script />').html(scriptBody)
      $('body').append(realScript)


  _recoverData: (jqnode, context) =>
    # Account for the fact that node might actually be a jQuery selector
    # that has returned a list of elements
    $.each jqnode, (i,node) =>
      node = $(node)
      rules = @rules.rulesForNode(node)
      if @templates.needsLoad(rules)
        console.log("Engine: Recover data (needs load)", node.clone(), rules)
        @templates.load(rules, () =>
          @._recoverDataWithRules(node, rules, context)
        )
      else
        console.log("Engine: Recover data", node.clone(), rules)
        @._recoverDataWithRules(node, rules, context)


  _recoverDataWithRules: (node, rules, context) ->
    console.log("Engine: Recover data with rules", node.clone(), rules)
    recurse = true
    functions = []
    if rules != null
      for command in @commands
        if command.signature() of rules 
          res = command.recoverData(node, context, rules[command.signature()], @)
          if res.length > 3 and res[3] != null
            for f in res[3]
              functions.push(f)
 
          recurse = recurse and res[1]
          break unless res[0]
    if recurse
      for kid in node.children()
        @._recoverData($(kid), context)
    for f in functions
      f(node, rules, context)

  _loadBasicCommandSet: () ->
    @._addCommand(new CTS.Commands.Data())
    @._addCommand(new CTS.Commands.With())
    @._addCommand(new CTS.Commands.If())
    @._addCommand(new CTS.Commands.Template())
    @._addCommand(new CTS.Commands.Repeat())
    @._addCommand(new CTS.Commands.Value())

  _addCommand: (command) ->
    @commands.push(command)

