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

class Parser
  constructor: () ->

  @parseBlocks: (blocks) ->
    ret = {}
    
    # Remove comments
    clean = blocks.replace(/\/\*(\r|\n|.)*\*\//g,"")
   
    chunks = blocks.split("}")
    chunks.pop() # Get rid of the last one; the trail end
    for chunk in chunks
      pair = chunk.split('{')
      selector = $.trim(pair[0])
      block = $.trim(pair[1])
      block = @parseBlock(block)
      if selector != ""
        ret[selector] = block
    return ret 

  @parseBlock: (block) ->
    ret = {}
    rules = block.split(';')
    for rule in rules
      loc = rule.indexOf(':')
      if loc >= 0
        property = $.trim(rule.substring(0,loc))
        value = $.trim(rule.substring(loc + 1))
        if property != "" and value != ""
          #TODO: Eventually going to need something more robust here
          #      This really goes for the whole parser, actually..
          parsedValue = value.split(",")
          ret[property] = parsedValue
    ret


