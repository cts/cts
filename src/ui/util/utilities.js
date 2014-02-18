_CTSUI.Util = {
  addCss: function(url) {
    var link = document.createElement('link')
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', url);
    document.getElementsByTagName('head')[0].appendChild(link);
  },

  uniqueSelectorFor: function($node) {
    // Taken from:
    // http://stackoverflow.com/questions/5706837/get-unique-selector-of-element-in-jquery
    var path;
    while ($node.length) {
        var realNode = $node[0], name = realNode.localName;
        if (!name) break;
        name = name.toLowerCase();
        var parent = $node.parent();
        var sameTagSiblings = parent.children(name);
        if (sameTagSiblings.length > 1) { 
            allSiblings = parent.children();
            var index = allSiblings.index(realNode) + 1;
            if (index > 1) {
                name += ':nth-child(' + index + ')';
            }
        }
        path = name + (path ? '>' + path : '');
        $node = parent;
    }
    return path;
  },

  elementHtml: function($e) {
    var $x = $e.clone();
    var $c = CTS.$("<div></div>");
    $c.append($x);
    return $c.html();
  }
};
