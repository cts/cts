CTS.Parser.CtsImpl = {
  parse: function(str) {

    // First, remove all comments
    str = CTS.Parser.CtsImpl.RemoveComments(str);

    var i = 0;
    var c;
    var relations = [];
    var ats = [];
    while (i < str.length) {
      c = str[i];
      if ((c == ' ') || (c == '\n') || (c == '\t') || (c == '\r')) {
        i++;
      } else if (c == "@") {
        tup = CTS.Parser.CtsImpl.AT(str, i+1);
        console.log(tup);
        i = tup[0];
        ats.push(tup[1]);
      } else {
        tup = CTS.Parser.CtsImpl.RELATION(str, i);
        i = tup[0];
        relations.push(tup[1]);
      }
    }
    return {headers: ats, relations: relations};
  },

  RemoveComments: function(str) {
    var inQuestion = str;
    var lastChar = '';
    var i = 0;
    var inComment = false;
    var commentOpen = null;
    // no nesting allowed
    while (i < inQuestion.length) {
      if (! inComment) {
        if ((inQuestion[i] == '*') && (lastChar == '/')) {
          inComment = true;
          commentOpen = i-1;
        }
        lastChar = inQuestion[i];
      } else {
        if ((inQuestion[i] == '/') && (lastChar == '*')) {
          var prefix = inQuestion.substring(0, commentOpen);
          inQuestion = prefix + " " + inQuestion.substring(i+1);
          inComment = false;
          i = i - (i - commentOpen) + 1;
          commentOpen = null;
          lastChar = '';
        } else {
          lastChar = inQuestion[i];
        }
      }
      i++;
    }
    if (inComment) {
      inQuestion = inQuestion.substring(0, commentOpen);
    }
    if (inQuestion != str) {
      console.log("BEFORE", str);
      console.log("AFTER", inQuestion);
    }
    return inQuestion;
  },

  AT: function(str, i) {
    var start = i;
    while ((i < str.length) && (str[i] != ';')) {
      i++;
    }
    var s = str.substring(start, i);
    var parts = s.split(" ");
    for (var k = 0; i < parts.length; k++) {
      parts[k].trim();
    }
    return [i+1, parts];
  },

  RELATION: function(str, i) {
    var tup = CTS.Parser.CtsImpl.SELECTOR(str, i, false);
    console.log("RS1", tup);
    i = tup[0];
    var s1 = tup[1];

    tup = CTS.Parser.CtsImpl.RELATOR(str, i);
    i = tup[0];
    var r = tup[1][0];
    var kv = tup[1][1];
    console.log("KV SSSSSTILL", JSON.stringify(kv));

    var tup = CTS.Parser.CtsImpl.SELECTOR(str, i, true);
    i = tup[0];
    var s2 = tup[1];

    return [i, new RelationSpec(s1, s2, r, kv)];
  },

  SELECTOR: function(str, i, second) {
    console.log("Selector ", second ? "two" : "one", str.substring(i));
    var spaceLast = false;
    var spaceThis = false;
    var bracket = 0;
    var kv = null;
    var start = i;
    var treeName = 'body';
    var selector = null;
    var cont = true;

    while ((i < str.length) && cont) {
      if ((kv === null) && (str[i] == '{')) {
        selector = str.substring(start, i).trim();
        var tup = CTS.Parser.CtsImpl.KV(str, i+1);
        i = tup[0] - 1; // Necessary -1
        kv = tup[1];
      } else if (str[i] == '[') {
        bracket++;
      } else if (str[i] == ']') {
        bracket--;
      } else if ((str[i] == '|') && (bracket == 0) && (kv === null)) {
        treeName = str.substring(start, i).trim();
        start = i+1;
      } else if (((!second) && spaceLast && (str[i] == ':')) 
               ||( second && (str[i] == ';'))) {
        if (kv === null) {
          selector = str.substring(start, i).trim();
        }
        cont = false;
      } else if (second && (str[i] == ';')) {
      }
      spaceLast = ((str[i] == ' ') || (str[i] == '\t') || (str[i] == '\n'));
      i++;
    }

    return [i, new SelectionSpec(treeName, selector, kv)];
  },

  KV: function(str, i) {
    console.log("KV", str.substring(i));
    var ret = {};
    while ((i < str.length) && (str[i] != '}')) {
      var t1 = CTS.Parser.CtsImpl.KEY(str, i);
      i = t1[0];
      var t2 = CTS.Parser.CtsImpl.VALUE(str, i);
      i = t2[0];
      ret[t1[1]] = t2[1];
    }
    console.log("KV RES", JSON.stringify(ret), str.substring(i+1));
    return [i+1, ret];
  },

  KEY: function(str, i) {
    console.log("KEY", str);
    var start = i;
    while ((i < str.length) && (str[i] != ':')) {
      i++;
    }
    return [i+1, str.substring(start, i).trim()];
  },

  VALUE: function(str, i) {
    console.log("VAL", str);
    var start = i;
    while ((i < str.length) && (str[i] != ",") && (str[i] != "}")) {
      i++;
    }
    var val = str.substring(start, i).trim();
    if (str[i] == ",") {
      return [i+1, val];
    } else {
      return [i, val]; // Parent needs to see } for terminal condition.
    }
  },

  RELATOR: function(str, i) {
    console.log("relator ", str.substring(i));
    var kv = {};
    var start = i;
    var cont = true;
    while ((i < str.length) && (str[i] != ' ') && (str[i] != '\n') && (str[i] != '\t') && (str[i] != '\r')) {
      i++;
    }
    while ((i < str.length) && ((str[i] == ' ') || (str[i] == '\n') || (str[i] == '\t') || (str[i] == '\r'))) {
      i++;
    }
    if (str[i] == "{") {
      var tup = CTS.Parser.CtsImpl.KV(str, i+1);
      i = tup[0];
      kv = tup[1];
    }
    return [i, [str.substring(start, i).trim(), kv]];
  }
};

