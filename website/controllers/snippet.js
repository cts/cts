var Snippet = require('../models/Snippet');

exports.getIndex = function(req, res) {
  Snippet.find(function(err, snippets) {
    if (err) {
      res.write(500, "Database error");
      console.log(err);
      return;
    }
    res.render('cts/snippet/index', {
      snippets: snippets
    });
  });
};

exports.getSnippet = function(req, res) {
  var gruntConfig = require('../../grunt-config');
  var sources = gruntConfig.variants.engine.development.sources;
  var uisources = gruntConfig.variants.ui.development.sources;

  Snippet.findById(req.params.snippet, function(err, snippet) {
    if (err) {
      res.send(500, "Error");
      console.log(err);
      return;
    }
    if (snippet == null) {
      res.send(400, "Couldn't find snippet");
      return;
    }
    res.render('cts/snippet/view', {
      snippet: snippet,
      sources: sources,
      uisources: uisources
    });
  });
};

exports.getSnippetJson = function(req, res) {
  Snippet.findById(req.params.snippet, function(err, snippet) {
    if (err) {
      res.send(500, "Error");
      console.log(err);
      return;
    }
    if (snippet == null) {
      res.send(400, "Couldn't find snippet");
      return;
    }
    var json = {
      id: snippet.id,
      name: snippet.name,
      html: snippet.html
    };
    res.json(json);
  });
};

exports.createSnippet = function(req, res) {
  var s = new Snippet({user_id: req.user.id});
  s.save(function(err) {
    if (err) {
      res.write(500, "Couldn't save");
      console.log(err);
      return;
    }
    res.redirect('/snippet/' + s.id);
  });
};
