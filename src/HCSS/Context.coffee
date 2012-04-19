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

#module = (name) ->
#  window[name] = window[name] or {}
# Ensure the DSS namespace
#module 'HCSS'

#### Context
class Context
  constructor: (data) ->
    @aliases = {}
    @stack = [data]

  head: () ->
    @stack[@stack.length - 1]

  tail: () ->
    @stack[0]

  push: (data) ->
    @stack.push(data)

  pushKeypath: (keypath) ->
    obj = @.resolve(keypath)
    @.push(obj)

  pop: (data) ->
    @stack.pop()

  # aliasedKeypath must be of the form `Foo.Bar.Baz` -- none of the special prefixes
  # are allowed
  alias: (dataKeypath, aliasedKeypath) ->
    value = @.resolve(dataKeypath)
    @._setKeypath(aliasedKeypath, value, @.aliases)

  # There are three types of keypaths that are each evaluated in a separate
  # manner.
  #
  # *  A single dot '.' refers to the top of the Context stack
  # *  A sequence of dot-separated keys Foo.Bar.Baz is matched against
  #     *  The alias object
  #     *  The top of the stack
  # *  A sequence of dot-separated keys /beginning with a dot/ .Foo.Bar.Baz 
  #    is matched only against the head of the stack
  #
  resolve: (keypath) ->
    # Remove all whitespace
    kp = keypath.replace /^\s+/g, ""
    # Special case for the '.' variable (like the this pointer for data)
    if kp == '.'
      return @stack[@stack.length - 1]
    else
      tryAliases = true
      if kp[0] == '.'
        tryAliases = false
        kp = kp[1..kp.length - 1]
      kp = @._parseKeyPath(kp)
      return @._resolveParsedKeypath(kp, tryAliases)

  set: (keypath, value) ->
    @._setKeypath(keypath, value, @stack[@stack.length - 1])

  # Parses a keypath using dot notation after stripping it of whitespace
  _parseKeyPath: (kp) ->
    kp.split(".")

  # Resolves the parsed keypath by first checking against the alias object
  # and then stepping down the stack, checking each frame along the way
  _resolveParsedKeypath: (kp, tryAliases) ->
    # Possibly match against the alias object
    if tryAliases
      attempt = @._resolveParsedKeypathAgainst(kp, @aliases)
      return attempt if attempt != null

    # Cut off the cascade down the stack unless it was requested
    #lowerBound = if stepDownStack then 0 else @stack.length - 1
    #for i in [(@stack.length - 1)..lowerBound]
    #  attempt = @._resolveParsedKeypathAgainst(kp, @stack[i])
    #  return attempt if attempt != null
    # TODO: Need a good way to distinguish between null and "absence"
    
    attempt = @._resolveParsedKeypathAgainst(kp, @stack[@stack.length - 1])
    return attempt
    
  # Attempt to resolve the keypath against the given object
  # FUTURE: This function can be overridden to handle, i.e., RDF 
  _resolveParsedKeypathAgainst: (kp, obj) ->
    if obj == null
      return null
    ptr = obj
    for key in kp
      if typeof ptr == "object" and key of ptr # TODO: This will ignore null values, I believe
        ptr = ptr[key]
      else
        # TODO: Need a good way to distinguish between null and "absence"
        return null
    return ptr

  # Copies `value` into `inObject` at location `kp`
  # Builds the keypath if it does not exist and does so
  # destructively if necessary, overwriting values
  _setKeypath: (kp, value, inObject) ->
    kp = kp.replace /^\s+/g, ""
    kp = @._parseKeyPath(kp)
    ptr = inObject
    last = kp.pop()
    for key in kp
      if key of ptr
        if typeof ptr[key] == 'object'
          ptr = ptr[key]
        else
          ptr[key] = {}
          ptr = ptr[key]
      else
        ptr[key] = {}
        ptr = ptr[key]
    ptr[last] = value
      

