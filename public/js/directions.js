
function RequestManager($form, $start, $end, $map_canvas, $results_container) {
	this.$form = $form;
	this.$start = $start;
	this.$end = $end;
	this.$map_canvas = $map_canvas;

	this.directionsService = new google.maps.DirectionsService();
	this.directionsDisplay = new google.maps.DirectionsRenderer();

	this.resultsDisplayer = new ResultsDisplayer($results_container, $map_canvas);
	this.directionsDisplay.setMap(this.resultsDisplayer.map);
	this.initialize();

	//Take over form submissions
	var self = this;
	$form.submit(function(){
		self.requestDirections();
		return false;
	});
}

RequestManager.prototype.initialize = function() {
}

RequestManager.prototype.reset = function(){
	initialize();
}

RequestManager.prototype.requestDirections = function(){
	var request = {
		origin: this.$start.val(),
		destination: this.$end.val(),
		travelMode: google.maps.TravelMode.DRIVING
	};

	this.directionsService.route(request, this.handleDirections.bind(this));
}

RequestManager.prototype.handleDirections = function(response, status){
	var routeCoords = null;

	if (status == google.maps.DirectionsStatus.OK) {
		$("#map-container").removeClass("invisible");
		this.directionsDisplay.setDirections(response);

		console.log("Received valid directions!!");
		var warnings = document.getElementById("warnings_panel");
		warnings.innerHTML = "" + response.routes[0].warnings + "";
		var myRoute = response.routes[0].legs[0];
		var routePolyLine = response.routes[0].overview_polyline;
		routeCoords = polyline.decode(routePolyLine);
		console.log(JSON.stringify(routeCoords));

		$.ajax({
		  type: "POST",
		  url: "trip",
		  data: {directions: JSON.stringify({coordinates: routeCoords, 
		  									 distance: response.routes[0].legs[0].distance.value}),
			search_term: $("#search_term").val(),
			exact_match: $("#exact_match_box").is(':checked'),
			max_distance: $("#max_distance").val()},
		  success: this.resultsDisplayer.handleRecs.bind(this.resultsDisplayer),
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