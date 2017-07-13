# Neighborhood-Map
This project uses the [Google Maps API](https://developers.google.com/maps/documentation/javascript/tutorial) to display a map on the page. Users can enter a location and a term to pull up a list of businesses corresponding to that query. A set of markers will be displayed on the markers which, when clicked on, display the business name, phone number, and available hours, as well as the first 3 reviews using the [Yelp API](https://www.yelp.com/developers/documentation/v3). 


### Installing
1. Download repository and open terminal at project root
2. Initialize project directory with `npm init`. Run through prompts by pressing 'enter' on each.
3. Download required packages by typing `npm install superagent node-yelp-fusion express ejs --save`


## Deployment
1. Start server with `node server.js`
2. Navigate to 'localhost:3000/' in your browswer to view page

## Usage
Enter location and a search term to find businesses corresponding to your query. A list of places will show on the left panel. Click on either the marker or the name in the panel to view more information about that specific place.

![Starting page](https://ibb.co/gq5zvF)

## Acknowledgements
This was a class project for Udacity's Full Stack Web Developer Nanodegree course. Please see [here](https://www.udacity.com/) for more details. 




