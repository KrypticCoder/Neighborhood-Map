var map;
var placeInfoWindow;
var defaultValue = {
    location: "San Francisco, CA",
    coords: { lat: 37.7576792, lng: -122.5078121 },
    query: "pizza"
};

function mapLoadingError(){
    window.alert("Map could not be loaded. Please make sure your API key is correct.");
}

// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage('http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor + 
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
    return markerImage;
}

var ViewModel = function(){

    var self = this;

    self.placesSearch = ko.observable(defaultValue.query);
    self.zoomToAreaText = ko.observable(defaultValue.location);

    self.filter = ko.observable("");

    self.placeMarkers = ko.observableArray([]);

    self.filteredMarkers = ko.computed(function() {

        for(var i = 0; i < self.placeMarkers().length; i++){
            self.placeMarkers()[i].setVisible(false);
        }

        var filter = self.filter().toLowerCase();
        var newMarkers = [];

        if (!filter) {            
            newMarkers =  self.placeMarkers();
        } else {
            newMarkers = ko.utils.arrayFilter(self.placeMarkers(), function(marker) {

                if (self.stringContains(marker.title.toLowerCase(), filter)){

                    return true;
                } else {
                    return false;
                }
                
            });

        }

        for( i = 0; i < newMarkers.length; i++){
            newMarkers[i].setVisible(true);
        }

        console.log('placeMarkers = ', self.placeMarkers().length);
        console.log('newMarkers = ', newMarkers.length);   
        return newMarkers;

    }, this);

    // function caleld when user clicks 'Zoom'
    self.zoom = function(){ 
        self.zoomToArea();
    };  

    // function called when user clicks 'GO'
    self.searchForText = function(){
        self.zoom();
        var query = self.placesSearch();
        if(query !== ''){
            self.textSearchPlaces();
        } else {
            window.alert('Please specify a search query first');
        }        
    };

    // function called when user selects an item from search box options
    self.autoSearch = function(searchBox){
        self.zoom();
        self.searchBoxPlaces(searchBox);
    };

    // handler for when a marker is clicked
    self.getMarkerInfo = function(marker){
        placeInfoWindow.marker = marker;
        self.getPlacesDetails(marker, placeInfoWindow);
        self.animateMarker(marker);
    };

    // checks if a subString is in a string
    self.stringContains = function(string, subString){
        return string.indexOf(subString) !== -1;
    };

    // This function will loop through the listings and hide them all.
     self.hideMarkers = function(markers) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setVisible(false);
        }
    };

    // This function takes the input value in the find nearby area text input
    // locates it, and then zooms into that area. This is so that the user can
    // show all listings, then decide to focus on one area of the map.
    self.zoomToArea = function() {
        self.hideMarkers(self.placeMarkers);
        self.placeMarkers([]);

        // Initialize the geocoder.
        var geocoder = new google.maps.Geocoder();
        // Get the address or place that the user entered.
        var address = self.zoomToAreaText();
        // Make sure the address isn't blank.
        if (address === '') {
            window.alert('You must enter an area, or address.');
        } else {
            // Geocode the address/area entered to get the center. Then, center the map
            // on it and zoom in
            geocoder.geocode(
                { address: address,
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    map.setZoom(15);
                } else {
                    window.alert('We could not find that location - try entering a more' +
                        ' specific place.');
                }
            });
        }
    };

    // This function fires when the user selects a searchbox picklist item.
    // It will do a nearby search using the selected query string or place.
    self.searchBoxPlaces = function(searchBox) {
        self.hideMarkers(self.placeMarkers);
        self.placeMarkers([]);
        var places = searchBox.getPlaces();
        // For each place, get the icon, name and location.
        self.createMarkersForPlaces(places);
        if (places.length === 0) {
            window.alert('We did not find any places matching that search!');
        }
    };

    // This function firest when the user select "go" on the places search.
    // It will do a nearby search using the entered query string or place.
    self.textSearchPlaces = function() {
        var bounds = map.getBounds();
        self.hideMarkers(self.placeMarkers);
        self.placeMarkers([]);
        var placesService = new google.maps.places.PlacesService(map);
        placesService.textSearch({
            query: self.placesSearch(),
            bounds: bounds
        }, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                self.createMarkersForPlaces(results);
            }
        });
    };

    // this function creates markers for each place found in either places search.
    self.createMarkersForPlaces = function(places){
        var markerColor = '900C3F';
        var markerURL = 'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor + 
        '|40|_|%E2%80%A2';
        var bounds = new google.maps.LatLngBounds();
        for(var i = 0; i < places.length; i++){
            var place = places[i];
            var icon = {
                url: markerURL,
                size: new google.maps.Size(35, 35),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(15, 34),
                scaledSize: new google.maps.Size(25, 30),
            };

            var marker = new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location,
                animation: google.maps.Animation.DROP,
                id: place.place_id,
            });

            // Create a single infowwindow to be used with the place details information
            // so that only one is open at once.
            // If a marker is clicked, do a place details search on it in the next function.
            marker.addListener('click', self.markerClick);

            self.placeMarkers.push(marker);

            if(place.geometry.viewport){
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        }
        map.fitBounds(bounds);
    };

    self.animateMarker = function(marker){
        // start animation
        marker.setAnimation(google.maps.Animation.BOUNCE);

        // stop animation after 3 bounces
        window.setTimeout(function(){
            marker.setAnimation(null);
        }, 1400);
    };

    // handler for when a marker is clicked
    self.markerClick = function(){

        if(placeInfoWindow.marker == this){
            console.log("This infowindow already is on this marker.");
        } else {
            self.getPlacesDetails(this, placeInfoWindow);

            self.animateMarker(this);
        }
    };

    // This is the PLACE DETAILS search - it's the most detailed so it's only
    // executed when a marker is selected, indicating the user wants more
    // details about that place.
    self.getPlacesDetails = function(marker, infowindow){

        var innerHTML = '';
        var atLeastOne = false;

        var service = new google.maps.places.PlacesService(map);
        service.getDetails({
            placeId: marker.id
        }, function(place, status){
            if(status === google.maps.places.PlacesServiceStatus.OK){
                // Set the marker property on this infowindow so it isn't created again
                infowindow.marker = marker;
                innerHTML = '<div class="infowindow">';
                if(place.name){
                    innerHTML += '<strong>' + place.name + '</strong>';
                }
                if(place.formatted_address){
                    innerHTML += '<br>' + place.formatted_address;
                }
                if (place.formatted_phone_number) {
                    innerHTML += '<br>' + place.formatted_phone_number;
                }
                if (place.opening_hours) {
                    innerHTML += '<br><br><strong>Hours:</strong><br>' +
                    place.opening_hours.weekday_text[0] + '<br>' +
                    place.opening_hours.weekday_text[1] + '<br>' +
                    place.opening_hours.weekday_text[2] + '<br>' +
                    place.opening_hours.weekday_text[3] + '<br>' +
                    place.opening_hours.weekday_text[4] + '<br>' +
                    place.opening_hours.weekday_text[5] + '<br>' +
                    place.opening_hours.weekday_text[6];
                }
                if (place.photos) {
                    innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
                        {maxHeight: 100, maxWidth: 200}) + '">';
                }

                innerHTML += '<br><br><strong>Reviews</strong><br></div>';

                infowindow.setContent(innerHTML);
                infowindow.open(map, marker);
                // Make sure the marker property is cleared if the infowindow is closed.
                infowindow.addListener('closeclick', function() {
                    infowindow.marker = null;
                });
            }
        });


        // construct json object to be sent to server 
        var parameters = {
            term: marker.title,
            location: {
                lat: marker.position.lat(),
                lng: marker.position.lng()
            }
        };
            
        // call yelp search endpoint to find id of business
        $.ajax({
            url: '/yelp_search',
            data: parameters,
            success: function(res){
                if(res.businesses.length){

                    var placeID = res.businesses[0].id;
                    var webURL = res.businesses[0].url;


                    // get reviews for that business
                    $.ajax({
                        url: '/yelp_reviews',
                        data: {place_id: placeID},

                        success: function(res){


                            var length = res.reviews.length;

                            // only want top 3 reviews
                            if(length > 3){
                                length = 3;
                            } 

                            if(length){
                                atLeastOne = true;
                                for(var i = 0; i < length; i++){
                                    var name = res.reviews[i].user.name;
                                    var text = res.reviews[i].text;
                                    var rating = res.reviews[i].rating;

                                    var image = '../images/small/small_' + String(rating) + '.png';

                                    innerHTML += '<div class="review">' + 
                                        '<div class="review-name">' + name + '</div>' +
                                        '<div class="review-rating"><img src="' + image + '"></div>' + 
                                        '<div class="review-text">' + text + '</div>' +
                                    '</div><br>';

                                }
                            }

                            innerHTML += '<a href="' + webURL + '"><img src="../images/yelp_logo.png" class="yelpLogo"></a>';

                            if(atLeastOne){
                                infowindow.setContent(innerHTML);
                                infowindow.open(map, marker);
                            } else {
                                innerHTML = '<i>No Reviews</i>';
                                infowindow.setContent(innerHTML);

                            }
                            

                        },
                        error: function(res){
                            window.alert('Could not connect to Yelp Reviews endpoint');
                        }
                    });
                }
            },
            error: function(res){
                window.alert('Could not connect to Yelp Search endpoint');
            }
        });

    };
};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);


function initMap() {

    placeInfoWindow = new google.maps.InfoWindow();

    var styles = [];

    // populate styles array with styles from 'styles.json'
    $.ajax({
        dataType: "json",
        url: '../styles.json',
        async: false,
        success: function(data){
            styles = data.styles;
        }
    });

    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: defaultValue.coords.lat, lng: defaultValue.coords.lng },
        zoom: 13,
        styles: styles,
        mapTypeControl: false
    });

    google.maps.event.addDomListener(window, 'resize', function() {
        map.fitBounds(map.getBounds()); 
    });


    // This autocomplete is for use in the geocoder entry box.
    var zoomAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById('zoom-to-area-text'));
    
    // Bias the boundaries within the map for the zoom to area text.
    zoomAutocomplete.bindTo('bounds', map);

     // Create a searchbox in order to execute a places search
    var searchBox = new google.maps.places.SearchBox(
        document.getElementById('places-search'));
    
    // Bias the searchbox to within the bounds of the map.
    searchBox.setBounds(map.getBounds());

    // Listen for the event fired when the user selects a prediction from the
    // picklist and retrieve more details for that place.
    searchBox.addListener('places_changed', function() {
        viewModel.autoSearch(searchBox);
    });

    viewModel.searchForText();
}