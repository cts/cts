CTS.Debugging = {
  DumpStack: function() {
    var e = new Error('dummy');
    var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
        .replace(/^\s+at\s+/gm, '')
        .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
        .split('\n');
    console.log(stack);
  },

  DumpTree: function(node, indent) {
    if (typeof indent == 'undefined') {
      indent = 0;
    }
    var indentSp = "";
    var i;
    for (i = 0; i < indent; i++) {
      indentSp += " ";
    }

    console.log(indentSp + "+ " + node.getValue());

    indentSp += "  ";

    for (i = 0; i < node.relations.length; i++) {
      var opp = node.relations[i].opposite(node);
      if (opp != null) {
        opp = opp.getValue();
      } else {
        opp = "null";
      }
      console.log(indentSp + "- " + node.relations[i].name + " " + opp);
    }
    for (i = 0; i < node.children.length; i++) {
      CTS.Debugging.DumpTree(node.children[i], indent + 2);
    }
  },

  NodesToString: function(node) {
    var ret = node.getValue();
    if (node.children.length > 0) {
      ret += "(";
      ret += CTS.Fn.map(node.children, function(child) {
        return CTS.Debugging.NodesToString(child);
      }).join(" ");
      ret += ")";
    }
    return ret;
  },

  RenameTree: function(node, dir) {
    if (typeof dir == 'undefined') {
      dir = {};
    }
    
    var v = node.getValue();
    if (typeof dir[v] == 'undefined') {
      dir[v] = 1;
    } else {
      dir[v]++;
      node.setValue(v + dir[v]);
    }

    for (var i = 0; i < node.children.length; i++) {
      CTS.Debugging.RenameTree(node.children[i], dir);
    }
    return node;
  },

  // NODES := <null> | NODE | NODE NODES
  // NODE := NODE_WO_KIDS | NODE_W_KIDS
  // NODE_WO_KIDS := name
  // NDOE_W_KIDS := name(NODES)
  StringToNodes: function(str) {
    var ret = [];
    var name, parens, firstParen, secondParen;

    var reset = function() {
      name = "";
      parens = 0;
      firstParen = -1;
      secondParen = -1;
    };

    var pop = function() {
      var n = new CTS.Node.Abstract();
      n.setValue(name);
      if (firstParen != -1) {
        // Handle innards.
        var substr = str.substring(firstParen + 1, secondParen);
        CTS.Fn.each(CTS.Debugging.StringToNodes(substr), function(c) {
          n.insertChild(c);
        });
      }
      ret.push(n);
    };

    reset();

    var i = 0;
    var last = null;
    while (i < str.length) {
      var c = str[i++];
      if (c == '(') {
        if (firstParen == -1) {
          firstParen = i - 1;
        }
        parens++;
      } else if (c == ')') {
        secondParen = i - 1;
        parens--;
        if (parens == 0) {
          pop();
          reset();
        }
      } else if ((c == ' ') && (parens == 0)) {
        if (last != ')') {
          pop();
          reset();
        }
      } else {
        if (firstParen == -1) {
          name += c;
        }
      }
      last = c;
    }
    if (name != "") {
      var n = new CTS.Node.Abstract();
      n.setValue(name);
      ret.push(n);
    }
    return ret;
  },

  StringsToRelations: function(root1, others, strs) {
    if (! CTS.Fn.isArray(others)) {
      var item = others;
      others = [item];
    }
    others.push(root1);

    if (typeof strs == 'string') {
      strs = strs.split(";");
    } else if (! CTS.Fn.isArray(strs)) {
      strs = [];
    }

    if ((! CTS.Fn.isUndefined(strs)) && (strs != null)) {
      var rules = CTS.Fn.map(strs, function(str) {
        var parts = str.split(" ");
        var v1 = parts[0];
        var p  = parts[1];
        var v2 = parts[2];
        var n1 = null;
        var n2 = null;
        for (var i = 0; i < others.length; i++) {
          var nn = CTS.Debugging.NodeWithValue(others[i], v2);
          if (nn != null) {
            n2 = nn;
            break;
          }
        }
        for (var i = 0; i < others.length; i++) {
          var nn = CTS.Debugging.NodeWithValue(others[i], v1);
          if (nn != null) {
            n1 = nn;
            break;
          }
        }


        var r = null;
        if (p == "is") {
          r = new CTS.Relation.Is(n1, n2);
        } else if (p == "if-exist") {
          r = new CTS.Relation.IfExist(n1, n2);
        } else if (p == "if-nexist") {
          r = new CTS.Relation.IfNexist(n1, n2);
        } else if (p == "are") {
          r = new CTS.Relation.Are(n1, n2);
        } else if (p == "graft") {
          r = new CTS.Relation.Graft(n1, n2);
        }
        return r;
      });
      return CTS.Fn.filter(rules, function(x) {
        return x != null;
      });
    } else {
      return [];
    }
  },

  NodeWithValue: function(root, value) {
    if (root.getValue() == value) {
      return root;
    } else {
      for (var i = 0; i < root.children.length; i++) {
        var ret = CTS.Debugging.NodeWithValue(root.children[i], value);
        if (ret != null) {
          return ret;
        }
      }
    }
    return null;
  },

  QuickCombine: function(treeStr1, treeStr2, rules, ruleToRun, executeAll) {
    var n1 = CTS.Debugging.StringToNodes(treeStr1)[0];
    var n2 = CTS.Debugging.StringToNodes(treeStr2)[0];
    var rules = CTS.Debugging.StringsToRelations(n1, n2, rules);
    var rulesToRun = CTS.Debugging.StringsToRelations(n1, n2, ruleToRun);

    CTS.Debugging.DumpTree(n1);
    CTS.Debugging.DumpTree(n2);

    var rulesToExecute = rules;

    if (rulesToRun.length > 0) {
      rulesToExecute = rulesToRun;
    }


    if (executeAll) {
      var execRules = function(n) {
        for (var i = 0; i < n.relations.length; i++) {
          n.relations[i].execute(n);
          break;
        }
        for (var j = 0; j < n.children.length; j++) {
          execRules(n.children[j]);
        }
      };
      execRules(n1);
    } else {
      for (var i = 0; i < rulesToExecute.length; i++) {
        rulesToExecute[i].execute(rulesToExecute[i].node1);
      }
    }

    return n1;
  },

  RuleStringForTree: function(node) {
    var ret = [];
    var i;

    for (i = 0; i < node.relations.length; i++) {
      // XXX(eob): Note: ordering is random! Testers take note!
      var r = node.relations[i];
      var rstr = r.node1.getValue() + " "
               + r.name + " " 
               + r.node2.getValue();
      ret.push(rstr);
    }

    for (var i = 0; i < node.children.length; i++) {
      var str = CTS.Debugging.RuleStringForTree(node.children[i]);
      if (str.length > 0) {
        ret.push(str);
      }
    }

    return ret.join(";");
  },

  TreeTest: function(treeStr1, treeStr2, rules, rulesToRun) {
    var n = CTS.Debugging.QuickCombine(treeStr1, treeStr2, rules, rulesToRun);
    return CTS.Debugging.NodesToString(CTS.Debugging.RenameTree(n));
  },

  ForrestTest: function(tree, otherTrees, rules) {
    if (! CTS.Fn.isArray(otherTrees)) {
      otherTrees = [otherTrees];
    }
    var primary = CTS.Debugging.StringToNodes(tree)[0];
    var others = CTS.Fn.map(otherTrees, function(t) {
      return CTS.Debugging.StringToNodes(t)[0];
    }, self);
    CTS.Fn.map(rules, function(r) {
      CTS.Debugging.StringsToRelations(primary, others, r);
    });

    CTS.Log.Info("Beginning Forrest Test")
    CTS.Debugging.DumpTree(primary);
    primary._processIncoming();
    primary = CTS.Debugging.RenameTree(primary);
    CTS.Log.Info("Finished Forrest Test")
    CTS.Debugging.DumpTree(primary);
    return CTS.Debugging.NodesToString(primary);
  },

  RuleTest: function(treeStr1, treeStr2, rules, rulesToRun, executeAll) {
    var n = CTS.Debugging.QuickCombine(treeStr1, treeStr2, rules, rulesToRun, executeAll);
    var n2 = CTS.Debugging.RenameTree(n);
    CTS.Debugging.DumpTree(n2);
    return CTS.Debugging.RuleStringForTree(n2);
  }

};

(function (definition) {

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // RequireJS
    if (typeof define === "function") {
        define(definition);
    // CommonJS
    } else if (typeof exports === "object") {
        definition(require, exports);
    // <script>
    } else {
        window.Cause = definition(void 0, {});
    }

})(function (serverSideRequire, exports) {
"use strict";

function removeCommonSegments(baseSegments, segments) {
  if (segments[0] !== baseSegments[0]) {
    return segments; // nothing in common
  }
  for(var i = 1; i < segments.length; i++) {
    if (segments[i] !== baseSegments[i]) {
      return segments.slice(i);
    }    
  }
  // everything in common
  return [segments[segments.length - 1]];
}



function description(callsite) {
  var text = "";
  if (callsite.getThis()) {
    text += callsite.getTypeName() + '.';
  }
  text += callsite.getFunctionName();
  return text;
}

function FileFilter() {
  this.inQ = false;
}
 
FileFilter.showSystem = false;
FileFilter.reQ = /q\/q\.js$/;
FileFilter.reNative = /^native\s/;

FileFilter.prototype.isSystem  = function(file) {
  if (FileFilter.showSystem) {
    return false;
  }
  if (FileFilter.reQ.test(file)) {
    this.inQ = true;
    return true;
  } else if (this.inQ && FileFilter.reNative.test(file)) {
    return true;
  } else {
    this.inQ = false;
  }
}


function filterAndCount(error, arrayOfCallSite) {
  error.fileNameColumns = 0;
  error.largestLineNumber = 0;
  var baseSegments = window.location.toString().split('/');
  
  var filteredStack = [];
  var fileFilter = new FileFilter();
  for (var i = 0; i < arrayOfCallSite.length; i++) {
    var callsite = arrayOfCallSite[i];
    var file = callsite.getFileName();
    if (!fileFilter.isSystem(file)) {
      file = removeCommonSegments(baseSegments, file.split('/')).join('/');

      if (file.length > error.fileNameColumns) {
        error.fileNameColumns = file.length;
      }
      var line = callsite.getLineNumber();
      if (line > error.largestLineNumber) {
        error.largestLineNumber = line;
      }
      filteredStack.push({file: file, line: line, description: description(callsite)});
    }
  }
  error.lineNumberColumns = (error.largestLineNumber+'').length;
  return filteredStack;
}

function formatStack(error, stackArray) {
  var lineNumberColumns = error.lineNumberColumns || 0;
  var fileNameColumns = error.fileNameColumns || 0;
  
  var textArray = stackArray.map(function toString(callsite, index) {
    // https://gist.github.com/312a55532fac0296f2ab P. Mueller
    //WeinreTargetCommands.coffee  21 - WeinreTargetCommands.registerTarget()
    var text = "";
    var file = callsite.file;
    var line = callsite.line;
    if (!file) {
      console.log("file undefined: ", callsite);
    }
    var blanks = fileNameColumns - file.length;
    if (blanks < 0) {
      console.log("toString blanks negative for "+file);
    }
    while (blanks-- > 0) {
      text += " ";
    };
    text += file;
    blanks = lineNumberColumns - (line+'').length + 1;
    while (blanks-- > 0) {
      text += " ";
    };
    text += line + ' - ';
    
    text += callsite.description;
    return text;
  });
  return textArray.join('\n');
}

var reMueller = /(\s*[^\s]*)\s(\s*[0-9]*)\s-\s/;  // abcd 1234 -
// I would much rather work on the stack before its turned to a string!
function reformatStack(error, stack) {
  var fileNameShift = 0;
  var lineNumberShift = 0;
  var frameStrings = stack.split('\n');
  var m = reMueller.exec(frameStrings[0]);
  if (m) {
    var fileNameFormatted = m[1];
    if (fileNameFormatted.length > error.fileNameColumns) {
      // the other stack will need to step up
      error.fileNameColumns = fileNameFormatted.length;
    } else {
      // We need to move this one over
      fileNameShift = error.fileNameColumns - fileNameFormatted.length;
    }
    var lineNumberFormatted = m[2];
    if (lineNumberFormatted.length > error.lineNumberColumns) {
      error.lineNumberColumns = lineNumberFormatted.length;
    } else {
      lineNumberShift = error.lineNumberColumns - lineNumberFormatted.length;
    }
  
    if (lineNumberShift || fileNameShift) {
      var fileNamePadding = "";
      while (fileNameShift--) {
        fileNamePadding += ' ';
      }
      var lineNumberPadding = "";
      while (lineNumberShift--) {
        lineNumberPadding += ' ';
      }
      
      var oldFileNameColumns = fileNameFormatted.length;
      var frames = frameStrings.map(function splitter(frameString) {
        var fileName = frameString.substr(0, oldFileNameColumns);
        var rest = frameString.substr(oldFileNameColumns);
        return fileNamePadding + fileName + lineNumberPadding + rest;
      });
      return frames.join('\n');
    } else {
      return stack;
    }
  } else {
    console.error("reformatStack fails ", frameStrings);
  }
}

Error.stackTraceLimit = 20;  // cause ten of them are Q
Error.causeStackDepth = 0;

// Triggered by Cause.stack access
Error.prepareStackTrace = function(error, structuredStackTrace) {

  var filteredStack = filterAndCount(error, structuredStackTrace);

  var reformattedCauseStack = ""; 
  if (error instanceof Cause || (error.prev && error.prev.cause)) {
    if (error.prev && error.prev.cause) {
      var cause = error.prev.cause;
      Error.causeStackDepth++;
      var causeStack = cause.stack;  // recurse
      Error.causeStackDepth--;
      reformattedCauseStack = reformatStack(error, causeStack);
    } //  else hit bottom
  }
  // don't move this up, the reformat may change the error.fileNameColumns values
  var formattedStack = formatStack(error, filteredStack);
  if (formattedStack) {
    if (reformattedCauseStack) {  
      formattedStack = formattedStack + '\n' + reformattedCauseStack;
    }  
  } else { //  all got filtered
    formattedStack = reformattedCauseStack;
  }
  return formattedStack;
}

// An Error constructor used as a Cause constructor
function Cause(head) {
  Error.captureStackTrace(this, Cause);  // sets this.stack, lazy
  this.prev = head;
  this.message = 'cause';
  this.fileName = 'q.js'
  this.lineNumber = 1;
}

Cause.externalCause = null;
Cause.setExternalCause  = function(message) {
  Cause.externalCause = message;
}
exports = Cause;

return Cause;

});
