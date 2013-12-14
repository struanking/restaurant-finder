// Dependent Modules
var fs = require('fs'),
    file = require('./file'),
    mongoDb = require('./query');

function route(pathname, response) {

  var params = pathname.split('/'),
      app;

  if (params[0] === null || params[0] === '') {
    params.splice(0, 1);
  }

  app = params[0];
  
  console.log('Requesting... ' + app);

  switch (app) {
    case 'query':
      mongoDb.query(params, response);
      break;
    case 'static':
      file.read(params.join('/'), response);
      break;
    case '':
    case '/':
      file.read('static/html/home.html', response);
      break;
    default:
  }
}

exports.route = route;