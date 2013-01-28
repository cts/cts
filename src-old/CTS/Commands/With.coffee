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

class With extends CTS.Commands.Command
  constructor: () ->

  signature: () ->
    "with"

  # Interprets arg1 as key-path into context
  # Replaces the contents of this node with resolution 
  # Tells engine not to recurse into contents
  applyTo: (node, context, args, engine) ->
    defaultTarget = args["."]
    defaultVariant = @._resolveArgument(defaultTarget["."], node)
    success = context.pushKeypath(defaultVariant)
    #if success
    #  console.log("With (render, success):", node.clone(), defaultVariant, " = ", JSON.stringify(context.head()))
    #else
    #  console.log("With (render, fail):", node.clone(), defaultVariant)
    pop = (node, rules, context) ->
      # console.log("With (render, end)", node.clone())
      context.pop()
    if success
      [true, true, null, [pop]]
    else
      [true, true]

  # Recovers data
  #### Side Effects
  #
  recoverData: (node, context, args, engine) ->
    defaultTarget = args["."]
    defaultVariant = @._resolveArgument(defaultTarget["."], node)
    # console.log("With (recover):", node.clone(), defaultVariant)
    context.set(defaultVariant, {})
    context.pushKeypath(defaultVariant)
    pop = (node, rules, context) ->
      # console.log("With (recover, end)", node.clone())
      context.pop()
    [true, true, null, [pop]]

  # Recovers template
  recoverTemplate: (node, context) ->
    node.clone()
 

