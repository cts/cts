// Node
// --------------------------------------------------------------------------
// 
// A Node represents a fragment of a tree which is annotated with CTS.
//
// Nodes are responsible for understanding how to behave when acted on
// by certain relations (in both directions). The differences between
// different types of trees (JSON, HTML, etc) are concealed at this level.

CTS.Node = {

  initializeStateMachine: function() {
    this.fsmInitialize(
      'Ready', [
      { 'from':'Ready',
          'to':'BeginRender',
        'name':'BeginRender'},
      { 'from':'BeginRender',
          'to':'ProcessIncoming',
        'name':'ProcessIncoming'},
      { 'from':'ProcessIncoming',
          'to':'ProcessIncomingChildren',
        'name':'ProcessIncomingChildren'},
      { 'from':'ProcessIncomingChildren',
          'to':'ProcessedIncoming',
        'name':'ProcessedIncoming'},
      { 'from':'ProcessIncoming',
          'to':'FailedConditional',
        'name':'FailedConditional'},
      { 'from':'FailedConditional',
          'to':'Finished',
        'name':'Finished_Invisible'},
      { 'from':'ProcessedIncoming',
          'to':'Finished',
        'name':'Finished_NoTemplate'},
      { 'from':'ProcessIncomming',
          'to':'ProcessedIncoming',
        'name':'SkipRecursion'}
    ]);

    this.on('FsmEdge:BeginRender', this._onBeginRender, this);
    this.on('FsmEdge:ProcessIncoming', this._onProcessIncoming, this);
    this.on('FsmEntered:ProcessIncomingChildren', this._onProcessIncomingChildren, this);
    this.on('FsmEdge:ProcessedIncoming', this._onProcessedIncoming, this);
    this.on('FsmEdge:FailedConditional', this._onFailedConditional, this);
    this.on('FsmEntered:Finished', this._onFinished, this);
  },

  render: function(opts) {
    console.log(this, "render");

    if (! _.isUndefined(opts)) {
      if (_.has(opts, 'callback')) {
        var scope = this;
        if (_.has(opts, 'callbackScope')) {
          scope = opts.callbackScope;
        }
        this.once('FsmEntered:Finished', opts.callback, scope);
      }
    }

    this.fsmTransition("BeginRender");
  },

  getChildren: function() {
    if (_.isUndefined(this.children) || _.isNull(this.children)) {
      this._createChildren();
    }
    return this.children;
  },

  treeSize: function() {
    return 1 + this.getChildren().length;
  },

  getInlineRules: function() {
    return null;
  },

  _onBeginRender: function() {
    this.node.css("border", "1px solid red");
    console.log(this, "onBeginRender");
    this.fsmTransition("ProcessIncoming");
  },

  _onProcessIncoming: function() {
    console.log(this, "onProcessIncoming");
    if (! this._performConditional()) {
      console.log("Fail conditional");
      this.fsmTransition("FailedConditional");
    } else {
      if (this._performIs()) {
        // We did a value map, so move to Processed state.
        // TODO(eob): what if we want to interpret the value as cts-laden html?
        this.fsmTransition("ProcessedIncoming");
      } else if (this._performRepeat()) {
        this.fsmTransition("ProcessIncomingChildren");
      } else {
        this.fsmTransition("ProcessIncomingChildren");
      }
    }
  },

  _onProcessIncomingChildren: function() {
    console.log(this, "onProcessChildren");
    this.node.css("border", "1px solid yellow");

    // Now we've created any children we're interested in.
    // Decide how to proceed.
    var kids = this.getChildren();
    this.outstandingChildren = kids.length;
    if (this.outstandingChildren === 0) {
      this.fsmTransition("ProcessedIncoming");
    } else {
      // Listen to finish events
      _.each(kids, function(child) {
        child.on("FsmEntered:Finished", this._onChildFinished, this);
      }, this);
      // Execute children.
      // TODO(eob): Explore parallelization options.
      _.each(kids, function(child) {
        console.log("RENDERING CHILD");
        child.render();
      }, this);
    }
  },

  _onChildFinished: function() {
    this.outstandingChildren = this.outstandingChildren - 1;
    if (this.outstandingChildren === 0) {
      this.fsmTransition("ProcessedIncoming");
    }
  },

  _onProcessedIncoming: function() {
    this.fsmTransition("Finished");
  },

  _onFailedConditional: function() {
    this.node.hide();
    this.fsmTransition("Finished");
  },

  _onFinished: function() {
    this.node.css("border", "1px solid green");
  },

  _performConditional: function() {
    var rules = _.filter(this.rules, function(rule) {
      return ((rule.name == "ifexist") &&
          (rule.head().matches(this)));
    }, this);

    if (rules.length === 0) {
      // No conditionality restrictions
      return true;
    } else {
      return _.all(rules, function(rule) {
        var otherNodes = rule.tail().toSelection(this.tree.forrest);
        if ((! _.isUndefined(otherNodes)) && (otherNodes.length > 0)) {
          return true;
        } else {
          return false;
        }
      }, this);
    }
  },

  _performIs: function() {
    console.log("Perform IS on", this, this.node.html(), this.rules);
    // If there is an incoming value node, handle it.
    // Just take the last one.
    var rule = null;
    _.each(this.rules, function(r) {
      if (r.name == "is") {
        if (r.head().matches(this)) {
          rule = r;
        }
      }
    }, this);

    if (rule) {
      console.log("Found IS rule");
      this.isIncoming(rule.tail().toSelection(this.tree.forrest));
      return true;
    } else {
      return false;
    }
  },

  _performAre: function() {
    console.log("Perform ARE on", this, this.node.html(), this.rules);
    var rule = null;
    _.each(this.rules, function(r) {
      if (r.name == "are") {
        if (r.head().matches(this)) {
          rule = r;
        }
      }
    }, this);

    if (rule) {
      console.log("Found ARE rule");
      this.areIncoming(rule.tail().toSelection(this.tree.forrest));
      return true;
    } else {
      return false;
    }
  },

  _performRepeat: function() {
    var rules = _.filter(this.rules, function(rule) {
      return ((rule.name == "repeat") && (rule.head().matches(this)));
    }, this);

    if (rules.length > 0) {
      // TODO(eob): Figure out what to do if > 1 rule
      var rule = rules[rules.length - 1];
      /*
       * Here is where things get tricky. "repeat" is really a bit of a functor
       * over the relations: it redraws down-tree relations such that each respective
       * item matches up.
       */

      // Get the source selection.
      var sourceSelection = rule.tail().toSelection(this.tree.forrest);

      if ((typeof sourceSelection.length != "undefined") && (sourceSelection.length > 0)) {
      } else {
      }

      return true;
    } else {
      return false;
    }

  }

};
