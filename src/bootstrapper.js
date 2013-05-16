/*
 * Bootstrapper
 * ==========================================================================
 * 
 * Intended to be mixed into the Engine.
 * 
 * As such, it assumes it is part of the Engine with access to StateMachine
 * and Events.
 * 
 * Methods for mix-in:
 *  * boot
 *
 * "Private" Methods:
 *  All begin with '_bootstrap'
 */
var Bootstrapper = CTS.Bootstrapper = {

  /** 
   * Walks CTS through a full page bootup.
   *
   * Dependencies:
   *  Must be mixed into Engine with StateMachine and Events
   */
  boot: function() {
    CTS.Log.Debug("Bootstrap: Booting up");
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

    this.on('FsmEdge:Begin', this._bootstrap_queue_cts, this);
    this.on('FsmEdge:LoadedCTS', this._bootstrap_queue_trees, this);
    this.on('FsmEdge:LoadedTrees', this._bootstrap_render, this);

    // VROOOOOMMMM!
    this.fsmTransition('QueueingCTS');
  },

  /**
   * Finds all CTS links and queues their load.
   */
  _bootstrap_queue_cts: function() {
    // Finds all CTS links and queues their load.
    CTS.Log.Debug("Bootstrap: Loading CTS");
    this.fsmTransition("LoadingCTS");
    this._bootstrap_cts_to_load = {};
    var hasRemote = false;

    var blocks = CTS.Utilities.getTreesheetLinks();
    _.each(blocks, function(block) {
      if (block.type == 'inline') {
        this.ingestRules(block.content);
      } else if (block.type == 'link') {
        // Queue Load
        this._bootstrap_cts_to_load[block.url] = true;
        hasRemote = true;
        CTS.Utilities.loadRemoteString(block,
          this._bootstrap_cts_load_success, this._bootstrap_cts_load_fail);
      }
    }, this);
    
    if (! hasRemote) {
      this.fsmTransition("QueueingTrees"); // Edge name: LoadedCTS
    } 
  },

  _bootstrap_queue_trees: function() {
    CTS.Log.Debug("Bootstrap: Loading Trees");
    this.fsmTransition("LoadingTrees");
    this._bootstrap_trees_to_load = {};
    var hasRemote = false;
    _.each(this.forrest.trees, function(value, key, list) {
      // Todo
    }, this);
    if (! hasRemote) {
      this.fsmTransition("Rendering");
    }
  },

  _bootstrap_render: function() {
    CTS.Log.Debug("Bootstrap: Rendering");
    this.render();
    this.fsmTransition("Rendered");
  },

  _bootstrap_cts_load_success: function(data, textStatus, xhr) {
    CTS.Log.Debug("Bootstrap: Loaded treesheet", xhr.url);
    this.ingestRules(data);
    this._bootstrap_cts_loaded(xhr.url);
  },

  _bootstrap_cts_load_fail: function(xhr, textStatus, errorThrown) {
    CTS.Log.Error("Bootstrap: CTS Load Failed", xhr.url);
    this._bootstrap_cts_loaded(xhr.url);
  },

  _bootstrap_tree_load_success: function(data, textStatus, xhr) {
    CTS.Log.Debug("Bootstrap: Loaded tree", xhr.url);
    //TODO
    this._bootstrap_tree_loaded(xhr.url);
  },

  _bootstrap_tree_load_fail: function(xhr, textStatus, errorThrown) {
    CTS.Log.Error("Bootstrap: Tree Load Failed", xhr.url);
    this._bootstrap_tree_loaded(xhr.url);
  },

  _bootstrap_cts_loaded: function(filename) {
    delete this._bootstrap_cts_to_load[filename];
    var done = (this._bootstrap_cts_to_load.length === 0);
    if (done) {
      _fsmTransition("QueueingTrees"); // Edge: LoadedCTS
    }
  },

  _bootstrap_tree_loaded: function(filename) {
    delete this._bootstrap_trees_to_load[filename];
    var done = (this._bootstrap_trees_to_load.length === 0);
    if (done) {
      _fsmTransition("Rendering");
    }
  }
};
