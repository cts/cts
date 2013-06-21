var parser = require("./cts2-parser.js").parser

parser.parse("@tree a b url(http://www.google.com); \n a is b;")

parser.parse("@tree a b url(http://www.google.com); at|a {ap} is {ip} bt|b {bp};");


parser.parse("@tree a b url(http://www.google.com); \n a {ap} is {ip} bt|b {bp};")
