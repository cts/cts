window.Tests = window.Tests || [];

CommandTests = {
/* 'value':[
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
  ],
  'with':[
   {
     'c':'Basic with traversal',
     't':'<div data-bind="with:ted"><span data-bind="value:name">Bar</span></div>',
     'd':{'ted':{'name':'Ted'}},
     'h':'<div data-bind="with:ted"><span data-bind="value:name">Ted</span></div>'
   },
   {
     'c':'Mixed depth value with traversal',
     't':'<div data-bind="value:foo">bar</div><div data-bind="with:ted"><span data-bind="value:name">Bar</span></div>',
     'd':{'foo':'ABC','ted':{'name':'Ted'}},
     'h':'<div data-bind="value:foo">ABC</div><div data-bind="with:ted"><span data-bind="value:name">Ted</span></div>'
   }
  ], 
  'repeat-inner':[
   {
     'c':'Basic repeat inner',
     't':'<ul data-bind="repeat-inner:names"><li data-bind="value:."></li></ul>',
     'd':{'names':['A','B']},
     'h':'<ul data-bind="repeat-inner:names"><li data-bind="value:.">A</li><li data-bind="value:.">B</li></ul>'
   },
   {
     'c':'Repeat inner with hashes',
     't':'<ul data-bind="repeat-inner:names"><li data-bind="value:name"></li></ul>',
     'd':{'names':[{'name':'A'},{'name':'B'}]},
     'h':'<ul data-bind="repeat-inner:names"><li data-bind="value:name">A</li><li data-bind="value:name">B</li></ul>'
   },
   {
     'c':'Double-nested loop',
     't':'<ul data-bind="repeat-inner:names"><li><ul data-bind="repeat-inner:colors"><li data-bind="value:."></li></ul></li></ul>',
     'd':{'names':[{'colors':['red','green']},{'colors':['blue','green']}]},
     'h':'<ul data-bind="repeat-inner:names"><li><ul data-bind="repeat-inner:colors"><li data-bind="value:.">red</li><li data-bind="value:.">green</li></ul></li><li><ul data-bind="repeat-inner:colors"><li data-bind="value:.">blue</li><li data-bind="value:.">green</li></ul></li></ul>'
   },
   {
     'c':'Repeat inner with with and hashes',
     't':'<ul data-bind="with:data; repeat-inner:names"><li data-bind="value:name"></li></ul>',
     'd':{'data':{'names':[{'name':'A'},{'name':'B'}]}},
     'h':'<ul data-bind="with:data; repeat-inner:names"><li data-bind="value:name">A</li><li data-bind="value:name">B</li></ul>'
   }
  ], */
  'if-exist':[
  {
     'c':'Basic if-exist',
     't':'<ul data-bind="if-exist:name"><li>Yes</li></ul>',
     'd':{'name':'ted'},
     'h':"<ul data-bind=\"if-exist:name\" data-catsdatastash=\"{'if-exist':{'name':'ted'}}\"><li>Yes</li></ul>"
  },
  {
     'c':'Basic if-exist',
     't':'<ul data-bind="if-exist:name"><li>Yes</li></ul>',
     'd':{},
     'h':"<ul data-bind=\"if-exist:name\" class=\"cats-InsivibleNode\"><li>Yes</li></ul>"
  }
  ],
  'if-nexist':[
  {
     'c':'Basic if-exist',
     't':'<ul data-bind="if-nexist:name"><li>Yes</li></ul>',
     'd':{'name':'ted'},
     'h':"<ul data-bind=\"if-nexist:name\" class=\"cats-InsivibleNode\" data-catsdatastash=\"{'if-nexist':{'name':'ted'}}\"><li>Yes</li></ul>"
  },
  {
     'c':'Basic if-exist',
     't':'<ul data-bind="if-nexist:name"><li>Yes</li></ul>',
     'd':{},
     'h':"<ul data-bind=\"if-nexist:name\"><li>Yes</li></ul>"
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

CreateTest = function(command, idx) {
  var T = CommandTests[command][idx];
  var c = T['c'];
  var t = T['t'];
  var d = T['d'];
  var h = T['h'];
  var engine = new CATS.Engine({
    "DyeNodes":false
  });

  var testFunc = function() {
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

    htmlPrime = $("<div />").append(tPrime).html(); 
    equal(htmlPrime, h);
    // Data in object also within original
    equal(DataEquals(dPrime, d), true);

    // We won't enforce this one
    // equal(DataEquals(d, dPrime), true);
  }
  return [c, testFunc];
}

CommandTest = function() {
  for (command in CommandTests) {
    module(command + " Command");
    for (idx in CommandTests[command]) {
      var tuple = CreateTest(command, idx);
      test(tuple[0], tuple[1]);
    } // End for each test in command
  } // End for each command
}; // End command test

window.Tests.push(CommandTest);
