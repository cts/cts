CTS.Xtras.Color = {
  RainbowColors: [
    "#FB0000",
    "#2AFF00",
    "#0000FF",
    "#FFFF00",
    "#FB0070",
    "#FC6C00",
    "#24FFFF",
    "#6800FF",
    "#76FF00",
    "#0063FF",
    "#F900FF",
    "#29FF58"
  ],

  ColorTree: function(tree) {
    var treeToColor = {};
    CTS.Xtras.Color.ColorTreeNode(tree.root, treeToColor, CTS.Xtras.Color.RainbowColors, 0);
  },

  ColorTreeNode: function(node, treeToColor, colorSet) {
    var p = node.getProvenance();
    if (p != null) {
      if (! Fn.isUndefined(p.tree)) {
        if (p.tree.name != null) {
          var color = "";
          if (Fn.isUndefined(treeToColor[p.tree.name])) {
            var nextColor = Fn.keys(treeToColor).length;
            if (nextColor >= colorSet.length) {
              CTS.Log.Error("Ran out of colors");
              color = '#'+Math.floor(Math.random()*16777215).toString(16);
            } else {
              treeToColor[p.tree.name] = colorSet[nextColor];
              color = treeToColor[p.tree.name];
              nextColor++;
            }
          } else {
            color = treeToColor[p.tree.name];
          }
          CTS.Xtras.Color.ColorNode(node, treeToColor[p.tree.name]);
        } else {
          CTS.Log.Error("ColorTreeNode: Tree name is null");
        }
      } else {
        CTS.Log.Error("ColorTreeNode: Tree is undefined");
      }
    } else {
        CTS.Log.Error("ColorTreeNode: Node has no provenance");
    }
  
    // Now color all the children.
    Fn.each(node.getChildren(), function(kid) {
      treeToColor = CTS.Xtras.Color.ColorTreeNode(kid, treeToColor, colorSet);
    });
  
    return treeToColor;
  },

  ColorNode: function(node, color) {
    if (node.kind == "HTML") {
      if (node.value == null) {
        CTS.Log.Error("Can't color node with null value");
      } else {
        var toWrap = node.value;
        if (toWrap.is("img")) {
          toWrap = CTS.$("<div></div>");
          node.value.wrap(toWrap);
        }
        toWrap.css('background-color', color);
        toWrap.css('color', color);
        toWrap.css('background-image', null);
        node.value.css('border', 'none');
        node.value.css('border-color', color);
        node.value.css('background-image', "");
        
      }
    } else {
      CTS.Log.Error("Not sure how to color node of type", node.kind);
    }
  }
};

