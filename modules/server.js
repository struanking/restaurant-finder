// Dependent Modules
var http = require("http"),
    url = require("url"),
    sys = require("sys");

var FILE_ROOT = '../html/';

function start(route) {
  // Environment variables
  var PORT = process.env.PORT || 5000;

  function onRequest(request, response) {
    request.addListener('end', function () {
      var pathname;

      if (request.method !== 'GET') {
        response.writeHead(405);
        response.end('Unsupported request method', 'utf8');
        return;
      }

      try {
        pathname = url.parse(request.url).pathname;

        //if (pathname !== '/favicon.ico') {
          console.log("Request for " + pathname + " received.");
          route(pathname, response);
        //}

      } catch (err) {
        sys.puts(err);
        response.writeHead(500);
        response.end('Internal Server Error');
      }
    });
  }

  http.createServer(onRequest).listen(PORT);
}

exports.start = start;