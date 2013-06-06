Language Package
================

This package contains the objects which represent a CTS sheet and all its
directives before realizing them as relations between real, instantiated trees.

For example, at this level, we're working with CSS selector strings instead of
actual DOM nodes, and URLs instead of actual DOM trees.

One aspect of the runtime environment this level misses, therefore, is inline
CTS that may occur on a particular DOM node.

The general flow of CTS processing is:

PARSER    -->          SPEC             -->        MODEL
(string)        (selectors, urls)           (DOM Trees, Nodes)

The ENGINE, and all work that gets done, works only on the MODEL.
