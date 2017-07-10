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

app.get('/yelp_reviews', function(req, res){

  var place_id = req.query.place_id;

  yelp.reviews(place_id).then(function(response) {
    res.json(response);
  });

});

app.get('/yelp_search', function(req, res){

  var lat = req.query.location.lat;
  var lng = req.query.location.lng;
  var term = req.query.term;

  var yelpSearchTerm = "term=" + term + "&latitude=" + lat + "&longitude=" + lng;

  yelp.search(yelpSearchTerm).then(function(response) {
    res.json(response);
  });

});

// The homepage route of our application does not interface with the MovieAnalyst API and is always accessible. We won’t use the getAccessToken middleware here. We’ll simply render the index.ejs view.
app.get('/', function(req, res){
    res.render('index2');
});

app.listen(3000);
