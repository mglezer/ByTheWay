var directionsService = new google.maps.DirectionsService();
var directionsDisplay;
var map;
var geocoder;
var resultsDisplayer;

function initialize() {
	directionsDisplay = new google.maps.DirectionsRenderer();
	geocoder = new google.maps.Geocoder();
	var chicago = new google.maps.LatLng(41.850033, -87.6500523);
	var mapOptions = {
		// zoom: 7,
		// center: chicago
	}
	map = new google.maps.Map(document.getElementById("my-map-canvas"), mapOptions);
	directionsDisplay.setMap(map);
	resultsDisplayer = new ResultsDisplayer();

}

function requestDirections($start, $end){
	var request = {
		origin: $start.val(),
		destination: $end.val(),
		travelMode: google.maps.TravelMode.DRIVING
	};

	directionsService.route(request, handleDirections);
}

function handleDirections(response, status){
	var routeCoords = null;

	if (status == google.maps.DirectionsStatus.OK) {
		directionsDisplay.setDirections(response);

		console.log("Received valid directions!!");
		var warnings = document.getElementById("warnings_panel");
		warnings.innerHTML = "" + response.routes[0].warnings + "";
		var myRoute = response.routes[0].legs[0];
		var routePolyLine = response.routes[0].overview_polyline;
		routeCoords = polyline.decode(routePolyLine);
		console.log(JSON.stringify(routeCoords));
		//Send routeCoords back to the server
		// $.post("trip", {directions: JSON.stringify(routeCoords),
		// 	search_term: $("#search_term").val(),
		// 	exact_match: $("#exact_match_box").is(':checked'),
		// 	max_distance: $("#max_distance").val()}, handleRecs);

		$.ajax({
		  type: "POST",
		  url: "trip",
		  data: {directions: JSON.stringify(routeCoords),
			search_term: $("#search_term").val(),
			exact_match: $("#exact_match_box").is(':checked'),
			max_distance: $("#max_distance").val()},
		  success: handleRecs,
		  beforeSend: function(){
		  	$("#results-container").empty();
		  	var g = document.createElement("img");
		  	g.setAttribute("src", "images/spinner.GIF");
		 	$("#results-container").append(g);
		  }
		});

	}
	else {
		console.log("Google Maps: Bad Request!!");
		handleRecs(null);
	}

}