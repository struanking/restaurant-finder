/*
 * query
*/

function query(params, response) {
  console.log('Running query');
  var databaseUrl = 'mongodb://heroku_app11477222:spl3soda7njusod4t3v5tutakd@ds031877.mongolab.com:31877/heroku_app11477222',
      collections = ['restaurants'],
      db = require('mongojs').connect(databaseUrl, collections),
      center = [],
      radius = +params[3] || 4,
      maxResults = +params[4] || 10,
      geoDistanceMultiplier = 3963.192;

  center.push(+params[1]);
  center.push(+params[2]);
  

  // Connect to the db, run the query, process callback
  db.command(
    {
      geoNear: 'restaurants',
      near: center,
      maxDistance: radius,
      num: maxResults,
      distanceMultiplier: geoDistanceMultiplier,
      spherical: true
    }, function(err, data) {
      if( err || !data) {
        console.log('No data found for center=' + center + ', radius=' + radius);
      } else {
        response.writeHead(200, {"Content-Type": "application/json"});
        response.end(JSON.stringify(data.results));
        console.log('data sent for: ' + center + ', radius=' + radius);
      }
    }
  );
}

exports.query = query;