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

class Value extends CTS.Commands.Command
  #     value(href): link;
  #     value: name;
  #     value-append: true;
  #
  #   Would result in the following return result
  #
  #     { value: { href: { .: "link" },
  #                   .: { .: "name",
  #                        append: "true" } } }
  constructor: () ->

  signature: () ->
    "value"

  # Interprets arg1 as key-path into context
  # Replaces the contents of this node with resolution 
  # Tells engine not to recurse into contents
  applyTo: (node, context, args, engine) ->
    shouldContinue = false
    shouldRecurse = true

    for target of args
      tup = @._applyToTarget(node, context, args[target], engine, target) 
      shouldContinue = shouldContinue or tup[0]
      shouldRecurse = shouldRecurse and tup[1]
    
    [shouldContinue, shouldRecurse]

  _applyToTarget: (node, context, args, engine, target) ->
    argument = @._resolveArgument(args["."], node)
    value = context.resolve(argument)  #  The bare argument is the keypath

    if engine.opts.DyeNodes
      node.addClass(CTS.Options.ClassForValueNode)

    if target == "."
      console.log("SetValue(", argument, ",", value, ")")
      node.html(value)
      if "type" of args and args["type"] == "html"
        return [true, true]  # Continue? Recurse?
      else
        return [false, false]  # Continue? Recurse?
    else
      if target[0] == "@"
        node.attr(target.substring(1), value)
      else
        console.log("Error: do not understand target", target)
      return [true, true]  # Continue? Recurse?


  # Recovers data
  #### Side Effects
  #
  recoverData: (node, context, args, engine) ->
    shouldContinue = false
    shouldRecurse = true

    for target of args
      tup = @._recoverDataFromTarget(node, context, args[target], engine, target) 
      shouldContinue = shouldContinue or tup[0]
      shouldRecurse = shouldRecurse and tup[1]
    
    [shouldContinue, shouldRecurse]

  _recoverDataFromTarget: (node, context, args, engine, target) ->
    argument = @._resolveArgument(args["."], node)
    if target == "."
      value = node.html()
      console.log("Recovered(", argument, ",", value, ")")
      context.set(argument, value)
      if "type" of args and args["type"] == "html"
        return [true, true]
      else
        return [false, false]  # Continue? Recurse?
    else
      if target[0] == "@"
        value = node.attr(target.substring(1))
      else
        console.log("Error: do not understand target", target)
      if value?
        context.set(argument, value)
      return [true, true]  # Coneinut? Recurse?

  # Recovers template
  recoverTemplate: (node, context) ->
    node.clone()
 
