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

# Author: Ted Benson <eob@csail.mit.edu>

$ = jQueryHcss

## Parser
#  Parses a string of CTS into a structured object for executing.
class Parser

  # parseBlocks
  # Parse a collection of CTS blocks.
  #
  # **Returns**
  #   A map of selector -> block object (see parseBlock)
  #
  @parseBlocks: (blocks) ->
    ret = {}
    
    # Remove any comments
    clean = blocks.replace(/\/\*(\r|\n|.)*\*\//g,"")

    # Split on the } character. Note that this method of parsing means we
    # don't yet support nested blocks.
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

  # parseBlock 
  # Parses a single CTS block.
  #
  # **Returns**
  #   A triple-nested dictionary mapping property -> target -> { variant -> value }. When 
  #   the target and variant are not specified, the are represented as a period (.).
  #
  #   For example, the following block:
  #
  #     value(href): link;
  #     value: name;
  #     value-append: true;
  #     if-exist: manager;
  #
  #   Would result in the following return result
  #
  #     { value: { href: { .: "link" },
  #                   .: { .: "name",
  #                        append: "true" } },
  #       if:    {    .: { exist: manager } } } 
  #
  #   With the following analogy to python member calls with named arguments
  #   e.g., method(self, key1=arg1, key2=arg2), if we pretend to allow a single
  #   period as a valid variable name.
  #     
  #     METHOD  SELF  KEY1=ARG1       KEY2=ARG2
  #
  #     value(  href, .=link                      )
  #     value(     ., .=name,         append=true )
  #        if(     ., exist=manager               )
  #   
  @parseBlock: (block) ->
    ret = {}
    for rule in block.split(";")
      if rule.trim().length > 0
        loc = rule.indexOf(':')
        if loc >= 0
          property = $.trim(rule.substring(0,loc))
          value = $.trim(rule.substring(loc + 1))
          if property != "" and value != ""
            property = @.parseProperty(property)
            property["value"] = value
            @.foldInPropertyValue(ret, property)
    return ret

  @foldInPropertyValue: (ret, pv) ->
    if not ("target" of pv)
      pv["target"] = "."
    if not ("variant" of pv)
      pv["variant"] = "."
    if not (pv.property of ret)
      ret[pv.property] = {}
    if not (pv.target of ret[pv.property])
      ret[pv.property][pv.target] = {}
    ret[pv.property][pv.target][pv.variant] = pv.value

  # parseProperty
  # Parses a property string.
  #
  # The property string takes one one of the forms:
  #
  #     PROPERTY-VARIANT(TARGET)
  #     PROPERTY(TARGET)
  #     PROPERTY-VARIANT
  #     PROPERTY
  #
  # The implied target, when none is specified, is the contents of the node
  # itself.
  # 
  # For Example
  #
  #     Input:  repeat
  #     Output: { property: repeat }
  #     
  #     Input:  repeat-inner
  #     Output: {property: repeat, variant: inner}
  #
  #     Input:  value(href)
  #     Output: {property: value, target: href}
  #
  #     Input:  value-append(href)
  #     Output: {property: value, variant: append, target: href}
  #
  # **Returns**
  #   A dictionary describing the component of the property string.
  @parseProperty: (prop) ->
    property = null
    variant = null
    target = null
    # First chop off the target, since it's the end
    if prop.trim().length == 0
      return {}
    openParen = prop.indexOf("(")
    if (openParen >= 0)
      target = prop.substring(openParen + 1, prop.length - 1)
      prop = prop.substring(0, openParen)
    # Now shop off the variant, if there is one
    firstDash = prop.indexOf("-")
    if (firstDash >= 0)
      variant = prop.substring(firstDash + 1, prop.length)
      prop = prop.substring(0, firstDash)
    property = prop
    ret = {"property":property}
    ret["variant"] = variant if variant != null
    ret["target"] = target if target != null
    ret
