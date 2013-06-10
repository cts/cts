CTS.Debugging = {
  DumpStack: function() {
    var e = new Error('dummy');
    var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
        .replace(/^\s+at\s+/gm, '')
        .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
        .split('\n');
    console.log(stack);
  },

  NodesToString: function(node) {
    var ret = node.getValue();
    if (node.children.length > 0) {
      ret += "(";
      CTS.Fn.map(node.children, function(child) {
        return child.debugPrintTree();
      }).join(" ");
      ret += ")";
    }
    return ret;
  },

  // NODES := <null> | NODE | NODE NODES
  // NODE := NODE_WO_KIDS | NODE_W_KIDS
  // NODE_WO_KIDS := name
  // NDOE_W_KIDS := name(NODES)
  StringToNodes: function(str) {
    var ret = [];
    var name, parens, firstParen, secondParen;

    var reset = function(idx) {
      name = "";
      parens = idx;
      firstParen = -1;
      secondParen = -1;
    };

    var pop = function() {
      var n = new CTS.AbstractNode();
      n.setValue(name);
      if (firstParen != -1) {
        // Handle innards.
        var substr = str.substring(firstParen + 1, secondParen);
        console.log(firstParen, secondParen, substr);
        CTS.Fn.each(CTS.Debugging.StringToNodes(substr), function(c) {
          console.log(c);
          n.insertChild(c);
        });
      }
      ret.push(n);
    };

    reset(0);

    var i = 0;
    while (i < str.length) {
      var c = str[i++];
      if (c == '(') {
        if (firstParen == -1) {
          firstParen = i - 1;
        }
        parens++;
      } else if (c == ')') {
        parens--;
        if (parens == 0) {
          secondParen = i - 1;
          pop();
          reset(0);
        }
      } else {
        if (firstParen == -1) {
          name += c;
        }
      }
    }
    if (name != "") {
      var n = new CTS.AbstractNode();
      n.setValue(name);
      ret.push(n);
    }
    return ret;
  },

  StringsToRelations: function(root1, root2, strs) {
    return CTS.Fn.map(strs.split(";"), function(str) {
      var parts = str.split(" ");
      var v1 = parts[0];
      var p  = parts[1];
      var v2 = parts[2];
      var n1 = CTS.Debugging.NodeWithValue(root1, v1);
      var n2 = CTS.Debugging.NodeWithValue(root2, v2);
      var r = null;
      if (p == "is") {
        r = new CTS.Relation.Is(n1, n2);
      } else if (p == "if-exist") {
        r = new CTS.Relation.IfExist(n1, n2);
      }
      console.log(p);
      return r;
    });
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

  QuickCombine: function(treeStr1, treeStr2, rules) {
    var n1 = CTS.Debugging.StringToNodes(treeStr1)[0];
    var n2 = CTS.Debugging.StringToNodes(treeStr2)[0];
    var rs = CTS.Debugging.StringsToRelations(n1, n2, rules);
    for (var i = 0; i < rs.length; i++) {
      rs[i].execute(rs[i].node1);
    }
    return n1;
  },

  QuickTest: function(treeStr1, treeStr2, rules) {
    var n = CTS.Debugging.QuickCombine(treeStr1, treeStr2, rules);
    return CTS.Debugging.NodesToString(n);
  }

};
