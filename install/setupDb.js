/*
 * Set DB
 * run after query: db.restaurants.ensureIndex({loc: "2d"});
*/

//Helper
global.assert = require('assert');
global.fs = require('fs');
global.Step = require('lib/step');

// A mini expectations module to ensure expected callback fire at all.
var expectations = {};
global.expect = function expect(message) {
  expectations[message] = new Error("Missing expectation: " + message);
}
global.fulfill = function fulfill(message) {
  delete expectations[message];
}
process.addListener('exit', function () {
  Object.keys(expectations).forEach(function (message) {
    throw expectations[message];
  });
});

// Data
var restaurants = [

{"name":"@15 Abchurch Lane Restaurant & Bar","address":"15 Abchurch Lane, London, EC4N 7BW","loc":{"lon":-0.087989,"lat":51.511749},"topTableKey":42445},
{"name":"@Siam","address":"48 Frith Street, London, W1D 4SF","loc":{"lon":-0.131561,"lat":51.513556},"topTableKey":76972},
{"name":"@Thai","address":"30 Greyhound Road, Hammersmith, London, W6 8NX","loc":{"lon":-0.218408,"lat":51.485073},"topTableKey":89002},
{"name":"St Chads Place","address":"6 St Chad's Place, London, WC1X 9HH","loc":{"lon":-0.119133,"lat":51.530713},"topTableKey":92910},
{"name":"1 Lombard Street Brasserie","address":"1 Lombard Street, London, EC3V 9AA","loc":{"lon":-0.089019,"lat":51.512907},"topTableKey":13951}

];

var mongo = require('mongodb');
var db = new mongo.Db('restaurants', new mongo.Server('localhost', 27017, {}), {w:1});

Step(
  function() {
    db.open(this);
  },
  function(err, client) {
    client.createCollection("markers", {w:1}, this);
  },
  function(err, col) {
    for (var i = 0; i < restaurants.length; i++) {
      col.insert(restaurants[i], {w:1}, function(err, result) {});
      //col.save(restaurants[i], {w:1}, function(err, result) {});
      //col.insert({"name":"King's Fords", "affiliation":"Ford", "loc":{"lon":51.10682735591432,"lat":-114.11773681640625}}, {w:1}, function(err, result) {});
      //col.save({"name":"Struan's Fords", "affiliation":"Ford", "loc":{"lon":51.10682735591432,"lat":-114.11773681640625}}, {w:1}, function(err, result) {});
    }
  }
);