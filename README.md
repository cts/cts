Cascading Tree Sheets
=====================

This is the Javascript implementation of [Cascading Tree Sheets
(CTS)](http://www.treesheets.org). CTS does for structure what CSS does for
style.

Running the Development Environment
-----------------------------------

To host CTS-JS on your development machine, just run:

     grunt web_server

This will host CTS at `http://localhost:9000/release/cts.js', which is
designed to work with other projects under the CTS umbrella.

### Getting the bookmarklet link

Once you've got the development server running, you'll want to grab the
development bookmarklet link. This will inject CTS into any web page.

Visit the following page:

    http://localhost:9000/development-bookmarklet.html

And drag the bookmarklet link to the toolbar of your browser.

### Changing the code and re-running

From a separate console, run grunt in the project root:

    grunt

This will rebuild `release/cts.js`. 

Development
-----------

You'll need NodeJS, NPM, and Grunt to start, this project just uses that to
manage the build environment. CTS has no dependencies on NodeJS.

Once you've cloned the repository, run `npm install` to get the required Node
packages to build the project.

Testing
-------

I use [qUnit](http://qunitjs.com/), a jUnit-like testing framework for Javascript.
