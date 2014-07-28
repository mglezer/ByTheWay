
function requestDirections($start, $end){
	var directionsService = new google.maps.DirectionsService();
	var request = {
		origin: $start.val(),
		destination: $end.val(),
		travelMode: google.maps.TravelMode.DRIVING
	};

	directionsService.route(request, handleDirections)
}

function handleDirections(response, status){
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

	return routeCoords;
}