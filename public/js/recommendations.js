
function recsOnRoute(route){

	var httpMethod = 'GET',
	    url = 'http://photos.example.net/photos',
	    parameters = {
	        oauth_consumer_key : 'M8PElYRvVHm3PRBqrnYuuQ',
	        oauth_token : '1fg1OcT1-HOlUd7iFckv56rdAMfEW3jt',
	        oauth_nonce : 'kllo9940pd9333jh' + Math.floor(Math.random() * 100000),
	        oauth_timestamp : (new Date()).getTime()/1000, //'1191242096',
	        oauth_signature_method : 'HMAC-SHA1',
	        oauth_version : '1.0',
	    },
	    consumerSecret = 'Xct7S3PtbFJg-KNlMVDwY-Np0Ng',
	    tokenSecret = 'pfkkdhi9sl3r4s00',
	    encodedSignature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret);

	console.log("Request Lat: " + route[0][0]);
	console.log("Request Long: " + route[0][1]);

	var requestURL = 
		"http://api.yelp.com/v2/search?term=food" 
		+ "&amp;ll=" + route[0][0] + "," + route[0][1]
		+ "&amp;oauth_consumer_key=" + parameters[oauth_consumer_key]
		+ "&amp;oauth_token=" + parameters[oath_token];
		+ "&amp;oauth_signature_method=" + parameters[oauth_signature_method]
		+ "&amp;oauth_signature=" + encodedSignature
		+ "&amp;oauth_timestamp=" + oauth_timestamp
		+ "&amp;oauth_nonce=" + parameters[oauth_nonce];

	console.log("request URL: " + requestURL);
}