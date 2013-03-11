DataEquals = function(obj, hash) {
  for (key in obj) {
    var val = obj[key];
    if (typeof val == "object") {
      if (DataEquals(obj[key], hash[key]) == false)
        return false
    }
    else {
      if (val != hash[key])
        return false
    }
  }
  return true;
}

CreateTest = function(template, data, result) {
  var engine = new CATS.Engine();
  var t = template;
  var d = data;
  var h = result;
  console.log("Creating test for:");
  console.log(template);
  console.log(t);
  var testFunc = function() {
    console.log("running test for template");
    console.log(t);
    // Forward rendering works
    var tNode = $(t);
    engine.render(tNode,d);
    
    html = $("<div />").append(tNode).html() 
    equal(html, h);

    // Can reuse recovered data on own template
    var dPrime = engine.recoverData(tNode);
    //console.log("recovered data");
    //console.log(dPrime);
    var tPrime = $(t);
    engine.render(tPrime,dPrime);

    htmlPrime = FixHtml(tPrime);
    
    equal(htmlPrime, h);
    // Data in object also within original
    equal(DataEquals(dPrime, d), true);

    // We won't enforce this one
    // equal(DataEquals(d, dPrime), true);
  }
  return testFunc;
}

window.TheTests = [];

window.FixHtml = function(html) {
  if (typeof html != "string") {
    html = $("<div />").append($(html)).html();
  }
  html = html.replace(/\n/g, "");
  html = html.replace(/>\s+</g, "><");
  html = $("<div />").append($(html)).html();
  return html;
}

CreateTests = function() {
  var e = new CATS.Engine();
  var commands = e.recoverData($('body'));
  console.log("Commands");
  console.log(commands);
  commands = commands.commands;
  for (ci in commands) {
    var command = commands[ci];
    window.TheTests.push(["module", command.name]);
    for (ti in command.tests) {
      var t = command.tests[ti];
      eval('t.data = ' + t.data + ';');
      t.template = FixHtml(t.template);
      t.rendered = FixHtml(t.rendered);
      console.log("About to create tests for template");
      console.log(t.template);
      tst = CreateTest(t.template, t.data, t.rendered);
      window.TheTests.push([t.name, tst]);
    }
  }
};

