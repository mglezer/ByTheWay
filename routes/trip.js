var routeRecs = require('../models/routeRecs.js');


var yelp = require("yelp").createClient({
  consumer_key: "M8PElYRvVHm3PRBqrnYuuQ", 
  consumer_secret: "Xct7S3PtbFJg-KNlMVDwY-Np0Ng",
  token: "1fg1OcT1-HOlUd7iFckv56rdAMfEW3jt",
  token_secret: "_bJxZBI_ZtsPBxv7W4qbR_xBJ-k"
});

var LAT = 0,
	LONG = 1;

var METERS_PER_MILE = 1609.34;

var UNLIMITED_MILES = 100;

var GRANULARITY = 10,
	NUM_LISTINGS = 10,
	SHOW_ALL = -1 //sentinal value for showing all results;

var ratings,
	pointsCompleted;

function toMiles(meters){
	return meters/METERS_PER_MILE;
}

function toMeters(miles){
	return miles*METERS_PER_MILE;
}

exports.viewPost = function(req, res){
	var route = JSON.parse(req.param('directions'));
	var search_term = req.param('search_term');
	console.log("Search term is: " + search_term);
	ratings = [];
	pointsCompleted = 0;

	if (route instanceof Array){
		console.log("Successfully parsed directions array!");
	}
	console.log(req);
	var exactMatch = (req.param('exact_match') === 'true');
	console.log("Exact match: " + exactMatch);

	var maxDistance = parseInt(req.param('max_distance'));

	console.log("Max distance is: " + req.param('max_distance'));

	for (var i = 0; i < route.length; i += GRANULARITY){
		//Only search the last 
		var routeLengthRounded = route.length - route.length % GRANULARITY;

		if (i > 0 && i < routeLengthRounded){
			investigatePoint(i, search_term, exactMatch, maxDistance, route, res);
		}
	}
}

function investigatePoint(i, searchTerm, exactMatch, maxDistance, route, res){
	yelp.search({term: searchTerm, ll: route[i][LAT] + ", " + route[i][LONG]}, function(error, data) {
		//Find the highest rated restaurant around this leg of the trip
		// console.log(error);
		// console.log(data);

		var numListingsShown = exactMatch ? SHOW_ALL : NUM_LISTINGS;
		var filteredListings = filter(data.businesses, searchTerm, exactMatch, maxDistance);
		var localTopListings = getTop(numListingsShown, filteredListings);

		console.log("Pushing " + localTopListings + " onto ratings array");

		// ratings.push(localMaxListing);
		// ratings = ratings.concat(localTopListings);

		for (var j = 0; j < localTopListings.length; j++){
			ratings.push(localTopListings[j]);
		}
		pointsCompleted++;

		console.log("Performing lookup for point " + i);

		if (lookupComplete(route)){
			if (ratings != null){
				// console.log("Ratings is not null!");
				// console.log(ratings);
			}
			var globalTopListings = getTop(numListingsShown, ratings);
			console.log("Found global maximum!");
			// res.render('trip', {data: globalTopListings});
			res.json({topListings: globalTopListings});
			// console.log(JSON.stringify(globalTopListings));
		}
	});
}

function filter(listings, searchTerm, exactMatch, maxDistance){
	var ret = [];
	for (var i = 0; i < listings.length; i++){
		var listing = listings[i];
		if (!exactMatch || listing['name'].indexOf(searchTerm) > -1){
			var distance = toMiles(parseInt(listing['distance']));
			console.log("Distance of restaurant is " + distance + " in miles.");
			if (maxDistance == UNLIMITED_MILES || distance <= maxDistance){
				ret.push(listing);
			}
		}
	}

	return ret;
}


//For now, we are checking every point on the route for 
//restaurants.
function lookupComplete(route){
	// console.log("route.length: " + route.length);
	// console.log("Actual ratings.length: " + ratings.length);
	// console.log("Required ratings.length: " + (Math.floor(route.length/GRANULARITY) - 1));
	// return Math.floor(route.length/GRANULARITY) - 1 == ratings.length;
	return pointsCompleted == Math.floor(route.length/GRANULARITY) - 1;
}

function getTop(n, listings){
	var uniqListings = getUnique(listings);
	uniqListings.sort(compListings);

	if (uniqListings.length < n || n == SHOW_ALL){
		return uniqListings.slice(0).reverse();
	}
	else {
		return uniqListings.slice(uniqListings.length - n, uniqListings.length).reverse();
	}
}

function getUnique(listings){
	var u = {}, a = [];
	for (var i = 0, l = listings.length; i < l; i++){
		var id = listings[i]['id'];
		if (u.hasOwnProperty(id)){
			continue;
		}
		a.push(listings[i]);
		u[id] = 1;
	}
	return a;
}


function compListings(a, b){
	if (a.rating > b.rating || (a.rating == b.rating && a.review_count > b.review_count)){
		return 1;
	}
	else if (a.rating == b.rating && a.review_count == b.review_count){
		return 0;
	}
	else 
		return -1;
}

//Returns the highest rated listing among an array of Yelp listings
function getMaxListing(listings){
	var maxRating = 0,
		maxListing = null;

	for (var j = 0; j < listings.length; j++){
		var listing = listings[j];
		// console.log("j: " + j + " listings[j] = listing = " + listings[j]);
		// console.log("listing.rating = " + listing.rating);
		// console.log("maxRating = " + maxRating);

		//Break ties with review count
		if (compListings(listing, maxListing) == 1){
			maxListing = listing;
		}
		// if (listing.rating > maxRating || (listing.rating == maxRating && listing.review_count > maxListing.review_count)) {
		// 	maxListing = listing;
		// 	maxRating = listing.rating;
		// }
	}

	return maxListing;
}