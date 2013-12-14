// Dependent Modules
var fs = require('fs'),
  path = require('path'),
  mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.ttf': 'application/x-font-ttf'
};

function read(filePath, response) {
  var filePath2 = filePath;
  fs.exists(filePath, function(exists) {
    if(exists) {
      serveFile(filePath2, response);  
    } else {
      response.writeHead(404);
      response.end();
      return;
    }
  });
}

function serveFile(filePath, response) {
  console.log('Running readFile for... ' + filePath);

  var dataStream = fs.createReadStream(filePath);

  dataStream.on('error', function(error) {
    response.writeHead(500);
    response.end();
    return;
  });

  var contentType = mimeTypes[path.extname(filePath)];
  
  response.setHeader('Content-Type', contentType);
  response.writeHead(200);
  dataStream.pipe(response);

}  

exports.read = read;