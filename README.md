Cascading Tree Sheets
=====================

Cascading Tree Sheets are like CSS for web structure. This project contains a
number of sub-projects, all packaged together for ease of development:

   *  Cascading Tree Sheets Engine (Javascript)
      *see:* `src/engine`
   *  CTS-UI (Javascript), a widget to help you edit sites with CTS
      *see:* `src/ui`
   *  A Server project to handle remote edits

This is the Javascript implementation of [Cascading Tree Sheets
(CTS)](http://www.treesheets.org). 

Running the Development Environment
-----------------------------------

You'll need NodeJS, NPM, and Grunt to start.  Once you've cloned the
repository, run `npm install` to get the required Node packages to build the
project.

Then just run 

     grunt server

This causes a number of processes to run in parallel:

   *  Runs server on :3000
   *  Runs file server on :3001
   *  Watches and recompiles upon file change


Testing Things Out
------------------

### Getting the bookmarklet link

Once you've got the development server running, you'll want to grab the
development bookmarklet link. This will inject CTS into any web page.

Visit the following page:

    http://localhost:9000/development-bookmarklet.html

And drag the bookmarklet link to the toolbar of your browser.

Testing
-------

I use [qUnit](http://qunitjs.com/), a jUnit-like testing framework for Javascript.
