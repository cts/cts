Events
======


Events are a bit tricky.

     A--------------+   relation   B--------------+
     |   CTS Node   |--------------|   CTS Node   |
     +--------------+              +--------------+
            |                              |
            |                              |
            |                              |
     C--------------+              D--------------+
     |Data Structure|              |Data Structure|
     +--------------+              +--------------+

The three we are interested in are:

* C can throw an event cautht by A
* A pushes a modification (it can't be an event) down to C
* A passes an event to B

The case of moving DOM event in C to a modification in D looks like this:

* User edits C
* C throws modification event
* A catches modification event
* A pushes events through relations
* B catches event via relation
* B modifies D

So the CTS node should have to event listeners. Perhaps the events are the
same, but the listener is different: one from the data structure and one from
the relation.
