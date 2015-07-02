Cascading Tree Sheets
=====================


Cascading Tree Sheets (CTS) is a CSS-like language to describe web structure.

This is the Javascript implementation of [Cascading Tree Sheets
(CTS)](http://www.treesheets.org). 

Dependencies
------------

Before you get started, make sure you have installed the following tools:

   * NodeJS + NPM
   * Grunt 
   
Initial Development Setup
-------------------------

To set up a brand new CTS development environment, perform the following steps:

1. Create a new, **empty** directory and from within it, run: 

    bash -c "$(curl -fsSL https://raw.githubusercontent.com/cts/cts/master/initial-setup.sh)"
    
2. Change into the `cts` directory that was just created.
2. Run `npm install`
3. Run `grunt setup`

This will link the dependencies of that project to the other repositories downloaded by the setup script.

Building CTS
-------------

You can build CTS by running `grunt` from inside the `cts` project. You'll find the output in the `build` directory.

License
-------

This software is made available under the BSD License.
