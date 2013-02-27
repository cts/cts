// Engine
// ==========================================================================

// Constructor
// -----------
var Engine = CTS.Engine = function(opts, args) {
  var defaults;
  this.opts = opts || {};

  // The main tree.
  this.forrest = null;

  this.initialize.apply(this, args);
};

// Instance Methods
// ----------------
_.extend(Engine.prototype, Events, StateMachine, {

  initialize: function() {
    this.forrest = new CTS.Forrest();
  },

  /**
   * Rendering picks a primary tree. For each node in the tree, we:
   *  1: Process any *incoming* relations for its subtree.
   *  2: Process any *outgoing* tempalte operations
   *  3: 
   */
  render: function(opts) {
    var pt = this.forrest.getPrimaryTree();
    var options = _.extend({}, opts);
    pt.render(options);
  },

  ingestRules: function(rules) {
    this.forrest.ingestRules(rules);
  },

  loadRemoteString: function(params, successFn, errorFn) {
    $.ajax({url: params.url,
            dataType: 'text',
            success: success,
            error: error,
            beforeSend: function(xhr, settings) {
              _.each(params, function(value, key, list) {
                xhr[key] = value;
              }, this);
            }
    });
  },

  /** 
   * Walks CTS through a full page bootup.
   */
  boot: function() {
    console.log("Boot");
    // Boot sequence
    this.fsmInitialize(
      'Start', [
      { 'from':'Start',
          'to':'QueueingCTS',
        'name':'Begin' },
      { 'from':'QueueingCTS',
          'to':'LoadingCTS',
        'name':'QueuedCTS' },
      { 'from':'LoadingCTS',
          'to':'QueueingTrees',
        'name':'LoadedCTS'},
      { 'from':'QueueingTrees',
          'to':'LoadingTrees',
        'name':'QueuedTrees'},
      { 'from':'LoadingTrees',
          'to':'Rendering',
        'name':'LoadedTrees'},
      { 'from':'Rendering',
          'to':'Rendered',
        'name':'Rendered' }
      ]);
    this.on('FsmEdge:Begin', this._fsmQueueCts, this);
    this.on('FsmEdge:LoadedCTS', this._fsmQueueTrees, this);
    this.on('FsmEdge:LoadedTrees', this._fsmRender, this);
    this.fsmTransition('QueueingCTS');
  },

  /**
   * Finds all CTS links and queues their load.
   */
  _fsmQueueCts: function() {
    // Finds all CTS links and queues their load.
    console.log("FSM Queue CTS");
    this.fsmTransition("LoadingCTS");
    this._ctsToLoad = {};
    var hasRemote = false;
    _.each(CTS.$('script[type="text/cts"]'),
      function(elem) {
        var e = CTS.$(elem);
        if (! e.attr('src')) {
          // Load the contents
          this.ingestRules(e.html());
        } else {
          // Queue load
          this._ctsToLoad[e.attr('src')] = true;
          hasRemote = true;
          this.loadRemoteString({'url':e.attr('src')}, _fsmCtsLoadSuccess, _fsmCtsLoadFail);
        }
      }, this
    );
    if (! hasRemote) {
      this.fsmTransition("QueueingTrees");
    } 
  },

  _fsmQueueTrees: function() {
    console.log("FSM Queue Trees");
    this.fsmTransition("LoadingTrees");
    this._treesToLoad = {};
    var hasRemote = false;
    _.each(this.forrest.trees, function(value, key, list) {
      console.log("TREE");
      // Todo
    }, this);
    if (! hasRemote) {
      this.fsmTransition("Rendering");
    }
  },

  _fsmRender: function() {
    console.log("FSM Render");
    this.render();
    this.fsmTransition("Rendered");
  },

  _fsmCtsLoadSuccess: function(data, textStatus, xhr) {
    this.ingestRules(data);
    this._fsmCtsLoaded(xhr.url);
  },

  _fsmCtsLoadFail: function(xhr, textStatus, errorThrown) {
    this._fsmCtsLoaded(xhr.url);
  },

  _fsmTreeLoadSuccess: function(data, textStatus, xhr) {
    //TODO
    this._fsmCtsLoaded(xhr.url);
  },

  _fsmTreeLoadFail: function(xhr, textStatus, errorThrown) {
    this._fsmCtsLoaded(xhr.url);
  },

  _fsmCtsLoaded: function(filename) {
    delete this._ctsToLoad[filename];
    var done = (this._ctsToLoad.length === 0);
    if (done) {
      _fsmTransition("QueueingTrees");
    }
  },

  _fsmTreeLoaded: function(filename) {
    if (done) {
      _fsmTransition("Rendering");
    }
  }
});
