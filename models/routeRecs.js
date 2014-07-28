
var yelp = require("yelp").createClient({
  consumer_key: "consumer-key", 
  consumer_secret: "consumer-secret",
  token: "token",
  token_secret: "token-secret"
});

exports.findRecs = function(route){
	// Request API access: http://www.yelp.com/developers/getting_started/api_access

	// See http://www.yelp.com/developers/documentation/v2/search_api
	yelp.search({term: "food", location: route[0][0] + route[0][1]}, function(error, data) {
	  console.log(error);
	  console.log(data);
	});

}