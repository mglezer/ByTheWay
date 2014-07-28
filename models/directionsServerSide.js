var gm = require('googlemaps');

exports.requestDirections = function (start, end, callback){

	var URL = "http://maps.googleapis.com/maps/api/directions \
	/json?origin=Toronto&destination=Montreal&key=API_KEY;";

	// // var directionsService = new gm.DirectionsService();
	// var request = 
	// {
	// 	origin: start,
	// 	destination: end,
	// 	travelMode: gm.TravelMode.DRIVING
	// };

	// gm.route(request, handleDirections);
}

function handleDirections(response, status, callback){
	var routeCoords = null;

	if (status == google.maps.DirectionsStatus.OK) {

		console.log("Received valid directions!!");
		var warnings = document.getElementById("warnings_panel");
		warnings.innerHTML = "" + response.routes[0].warnings + "";

		var myRoute = response.routes[0].legs[0];

		var str;
		for(key in myRoute) {
			str += key + ': ' + myRoute[key] + '<br/>';
			$("#test").html(str);
		}

		var routePolyLine = response.routes[0].overview_polyline;

		routeCoords = polyline.decode(routePolyLine);

		console.log(routeCoords);
	}
	else {
		console.log("Google Maps: Bad Request!!");
	}

	callback(routeCoords);
}