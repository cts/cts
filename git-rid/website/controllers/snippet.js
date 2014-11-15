var Snippet = require('../models/Snippet');

exports.getIndex = function(req, res) {
  Snippet.find({latestVersion: true}, function(err, snippets) {
    if (err) {
      res.write(500, "Database error");
      console.log(err);
      return;
    }
    res.render('cts/snippet/index', {
      snippets: snippets,
      name: 'Snippets'
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
    var csrf = "";
    res.render('cts/snippet/view', {
      snippet: snippet,
      sources: sources,
      uisources: uisources
    });
  });
};

exports.saveSnippet = function(req, res) {
  // Soft login requirement.
  if (! req.user) {
    res.json({'redirect':  '/login', 'success': false, 'message': 'Please Log In'});
    return;
  }

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
    if (snippet.user_id != req.user.id) {
      // No problem. We'll create a new snippet.
      snippet.duplicateForUser(req.user, req.body, function(err, newSnippet) {
        if (err) {
          res.send(500, err);
          console.log(err);
          return;
        }
        if (newSnippet == null) {
          res.send(500, "Couldn't save");
          console.log("Couldn't save");
          return;
        }
        res.json({'redirect':  '/snippet/' + newSnippet.id, success: true});
      });
    } else {
      // We own this snippet. Add to the version history.
      snippet.advanceVersion(req.body, function(err, newSnippet) {
        if (err) {
          res.send(500, err);
          console.log(err);
          return;
        }
        if (newSnippet == null) {
          res.send(500, "Couldn't save");
          console.log("Couldn't save");
          return;
        }
        res.send(200);
      });
    }
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
