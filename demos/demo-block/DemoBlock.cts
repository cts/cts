.cts-demo {
  template: http://localhost:8000/demos/demo-block/widgets.html#DemoBlock;
  with: @data-name;
  value: demoBlock;
  value-type: html;
}

.cts-demo .template {
  value: template;
  value-type: html;
}

.cts-demo .data {
  value: data;
  value(data-format): format;
  value(data-formatsAllowed): formatsAllowed;
}

.cts-demo .rendered {
  value: rendered;
}

.cts-demo .demoBody {
  value: demoBlock;
  value-type: html;
}
