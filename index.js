// Dependent Modules
var server = require('./modules/server'),
  router = require('./modules/router');

// Start server
server.start(router.route);