/*
 * State Machine for Node Rendering 
 * ================================
 *
 * Intended as a Mix-In to Node.
 */

CTS.NodeStateMachine = {  

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
      this.on('FsmEntered:ProcessedIncoming', this._onProcessedIncoming, this);
      this.on('FsmEdge:FailedConditional', this._onFailedConditional, this);
      this.on('FsmEntered:Finished', this._onFinished, this);
   },

  render: function(opts) {
    console.log(this, "render");

    if (! CTS.Fn.isUndefined(opts)) {
      if (CTS.Fn.has(opts, 'callback')) {
        var scope = this;
        if (CTS.Fn.has(opts, 'callbackScope')) {
          scope = opts.callbackScope;
        }
        this.once('FsmEntered:Finished', opts.callback, scope);
      }
    }

    this.fsmTransition("BeginRender");
  },


  _onBeginRender: function() {
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
        console.log("Performed is");
        // We did a value map, so move to Processed state.
        // TODO(eob): what if we want to interpret the value as cts-laden html?
        this.fsmTransition("ProcessedIncoming");
      } else if (this._performAre()) {
        this.fsmTransition("ProcessIncomingChildren");
      } else {
        this.fsmTransition("ProcessIncomingChildren");
      }
    }
  },

  _onProcessIncomingChildren: function() {
    console.log(this, "onProcessChildren");

    // Now we've created any children we're interested in.
    // Decide how to proceed.
    var kids = this.getChildren();
    this.outstandingChildren = kids.length;
    if (this.outstandingChildren === 0) {
      this.fsmTransition("ProcessedIncoming");
    } else {
      // Listen to finish events
      CTS.Fn.each(kids, function(child) {
        child.on("FsmEntered:Finished", this._onChildFinished, this);
      }, this);
      // Execute children.
      // TODO(eob): Explore parallelization options.
      CTS.Fn.each(kids, function(child) {
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
    console.log("Trans to finish");
    this.fsmTransition("Finished");
  },

  _onFailedConditional: function() {
    this.failedConditional();
    this.fsmTransition("Finished");
  },

  _onFinished: function() {
  },

  /***********************/

  _processIncoming: function() {
    // Do incoming nodes except graft
    this._processIncomingRelations('if-exist');
    this._processIncomingRelations('if-nexist');
    this._processIncomingRelations('is');
    this._processIncomingRelations('are');

    CTS.Log.Info("Dump Pre");
    CTS.Debugging.DumpTree(this);
    // Do children
    for (var i = 0; i < this.children.length; i++) {
      this.children[i]._processIncoming();
    }
    CTS.Log.Info("Dump Post");
    CTS.Debugging.DumpTree(this);

    // Do graft
    this._processIncomingRelations('graft', true);
  },

  _processIncomingRelations: function(name, once) {
    console.log("proc inc from node", this.getValue(), name);
    for (var i = 0; i < this.relations.length; i++) {
      if (this.relations[i].name == name) {
        if (this.relations[i].node1.equals(this)) {
          this.relations[i].execute(this);
          console.log("found one " + this.relations[i].name, name);
          if (once) {
            break;
          }
        }
      }
    }
  }

};
