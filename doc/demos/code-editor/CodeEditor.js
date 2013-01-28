function CodeEditor_GetHtml(node) {
  // Get current state
 var state = null;
 if ((typeof t.data() != "undefined") && (t.data() != null)) {
   state = t.data()["state"];
 }
 if (state == null) {
   return "";
 } else if (state == "edit") {
   var pre = node.getChildren().first();
   var html = pre.html();
   html = template.replace(/&lt;/g, "<");
   html = template.replace(/&gt;/g, ">");
   return html;
 } else if (state == "source") {
   var pre = node.getChildren().first();
   var html = pre.html();
   html = template.replace(/&lt;/g, "<");
   html = template.replace(/&gt;/g, ">");
   return html;
 } else if (state == "rendered") {
   return node.html();
 }
}

function CodeEditor_ViewRendered(node) {
  var html = CodeEditor_GetHtml(node);
  node.attr("data-state", "rendered");
  node.html(html);
}

function CodeEditor_ViewSource(node) {
  var html = CodeEditor_GetHtml(node);
  var pre = $('<pre class="prettyprint" />');
  html = template.replace(/</g, "&lt;");
  html = template.replace(/>/g, "&gt;");
  pre.html(html);
  node.html("");
  node.addChild(pre);
  node.attr("data-state", "source");
}

function CodeEditor_ViewEdit(node) {
  var html = CodeEditor_GetHtml(node);
  var textbox = $('<textarea />');
  html = template.replace(/</g, "&lt;");
  html = template.replace(/>/g, "&gt;");
  textbox.html(html);
  node.html("");
  node.addChild(textbox);
  node.attr("data-state", "edit");
}

function CodeEditor_ToggleButton(widgetNode, buttonName, enabled) {
}

function CodeEditor_ButtonClick(e) {
  var btn = $(e.target);
  var state = null;
  if ((typeof t.data() != "undefined") && (t.data() != null)) {
    state = t.data()["state"];
  }
  if (state == "rendered") {
    CodeEditor_ViewRendered(contentNode);
    CodeEditor_ToggleButton(widgetNode, "rendered", false);
    CodeEditor_ToggleButton(widgetNode, "edit", true);
    CodeEditor_ToggleButton(widgetNode, "source", true);
  } else if (state == "edit") {
    CodeEditor_ViewEdit(contentNode);
    CodeEditor_ToggleButton(widgetNode, "rendered", true);
    CodeEditor_ToggleButton(widgetNode, "edit", false);
    CodeEditor_ToggleButton(widgetNode, "source", true);
  } else if (state == "source") {
    CodeEditor_ViewSource(contentNode);
    CodeEditor_ToggleButton(widgetNode, "rendered", true);
    CodeEditor_ToggleButton(widgetNode, "edit", true);
    CodeEditor_ToggleButton(widgetNode, "source", false);
  }
}

function CodeEditor_Initialize(node) {
}

