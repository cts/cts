window.Tests = window.Tests || [];

CommandTests = {
 'value':[
   {
     'c':'Basic Value Printing',
     't':'<span data-bind="value:foo">Bar</span>',
     'd':{'foo':'oof'},
     'h':'<span data-bind="value:foo">oof</span>'
   },
   {
     'c':'Nested Value Printing',
     't':'<div><span data-bind="value:foo">Bar</span></div>',
     'd':{'foo':'oof'},
     'h':'<div><span data-bind="value:foo">oof</span></div>'
   }

  ]
};

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

CommandTest = function() {
  var engine = new HCSS.Engine({
    "DyeNodes":false
  });
  for (command in CommandTests) {
    module(command + " Command");
    for (Tidx in CommandTests[command]) {
      T = CommandTests[command][Tidx];
      test(T['c'], function() {
        var t = $(T['t']);
        var d = T['d'];
        var h = $(T['h']);
        console.log(t);
        console.log(d);
        console.log(h);

        // Forward rendering works
        engine.render(t,d);
        equal(t.html(), h.html());

        // Can reuse data on own template
        var dPrime = engine.recoverData(t);
        var tPrime = $(T['t']);
        engine.render(tPrime,dPrime);
        equal(tPrime.html(), h.html());

        // Data in object also within original
        equal(DataEquals(dPrime, d), true);

        // We won't enforce this one
        // equal(DataEquals(d, dPrime), true);
      }); // End test function
    } // End for each test in command
  } // End for each command
}; // End command test

window.Tests.push(CommandTest);
