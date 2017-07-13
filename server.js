'use strict';

var request = require('superagent');
var express = require('express');
var app = express();
const url = require('url');

var clientId = 'ROsk2ClVgLyX4T0M4CE5ow';
var clientSecret = 'tpwUNiEpcIAtdbOfnBFiIhTsUnydgb0DM33RJ2ZOULJFPbHGIqm8EmQGhcWe9JBm';

var Yelp = require('node-yelp-fusion');
var yelp = new Yelp({ id: clientId, secret: clientSecret });

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/public/views/');

app.use(express.static(__dirname + '/public'));


// Endpoint for finding reviews about a businesses given an id
app.get('/yelp_reviews', function(req, res){

  var place_id = req.query.place_id;

  yelp.reviews(place_id).then(function(response) {
    res.json(response);
  });

});

// Endpoint for finding businesses based on location and search term
app.get('/yelp_search', function(req, res){

  var lat = req.query.location.lat;
  var lng = req.query.location.lng;
  var term = req.query.term;

  var yelpSearchTerm = "term=" + term + "&latitude=" + lat + "&longitude=" + lng;

  yelp.search(yelpSearchTerm).then(function(response) {
    res.json(response);
  });

});

app.get('/', function(req, res){
    res.render('index');
});

app.listen(3000);
