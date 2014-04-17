var url = require("url");
var http = require("http");
var https = require("https");
var cors = require('../helpers/cors');

var gsheetbase = "https://spreadsheets.google.com/feeds";
var gdocbase = "https://docs.google.com/feeds";

exports.returnOptions = function(req, res) {
  cors.addCORSHeaders(req, res);
  res.send(200);
  res.end();
};

exports.gdoc = function(req, res) {
  var path = url.parse(req.url).path;
  console.log(path);
  var loc = gsheetbase + gdocbase;

  var protocol;
  path = path.split("api/gdoc/")[1];
  var location = url.parse(path);

  switch (location.protocol) {
    case "http:":
      protocol = http;
      break;
    case "https:":
      protocol = https;
      break;
    default:
      res.writeHead(400);
      res.end();
      return;
  }
  var options = {
    host: location.host,
    hostname: location.hostname,
    port: +location.port,
    method: req.method,
    path: location.path,
    headers: req.headers,
    auth: location.auth
  };
  delete options.headers.host;
  var gReq = protocol.request(options, function (gRes) {
    res.writeHead(gRes.statusCode, gRes.headers);
    gRes.on("data", function(d) {
      res.write(d);
    });
    gRes.on("end", function () {
      res.addTrailers(gRes.trailers);
      console.log("Ending");
      res.end();
    });
  });
  req.on("data", function(p) {
    gReq.write(p)
  });
  req.on("end", function() {
    gReq.end();
  });
};
