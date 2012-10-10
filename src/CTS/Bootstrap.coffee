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
#<< CTS/Engine
#<< CTS/Commands/*

class Bootstrap
  constructor: () ->
    # TODO(eob): Option to suppress CTS load
    $(() =>
      @.loadCTS()
    )

  loadCTS: () =>
    # Load the default engine
    CTS.engine = new CTS.Engine()
    console.log("Bootstrap: Loading Remote Rules")
    CTS.engine.rules.setCallback(@.remoteRulesLoaded)
    CTS.engine.rules.load()

  # Called once remote rules have been loaded.
  # Loads local rules and then requests template load.
  remoteRulesLoaded: () =>
    console.log("Bootstrap: Done loading Remote Rules")
    console.log("Bootstrap: Loading Local Rules")
    CTS.engine.rules.loadLocal()
    console.log("Bootstrap: Done loading Local Rules", CTS.engine.rules.blocks)
    console.log("Bootstrap: Prefetching Templates")
    CTS.engine.templates.preLoad(CTS.engine.rules.blocks, @.remoteTemplatesLoaded)

  remoteTemplatesLoaded: () =>
    console.log("Bootstrap: Done prefetching Templates")
    console.log("Bootstrap: Rendering CTS")
    CTS.engine.render()



# 5..4..3..2..
CTS.bootstrap = new CTS.Bootstrap()
# Houston, we have liftoff!
