
function ResultsDisplayer($container, $map_canvas){
	this.$container = $container;
	this.results = null;
	this.geocoder = new google.maps.Geocoder();
	this.$map_canvas = $map_canvas;
	this.map = new google.maps.Map(this.$map_canvas[0], {
		mapTypeControl: false,
		panControl: false,
		zoomControl: false,
		streetViewControl: false
	});

	this.markers = [];
}

ResultsDisplayer.ENTRIES_PER_PAGE = 10;

ResultsDisplayer.prototype.handleRecs = function(data){
	this.results = data;
	this.lowIndex = 0;
	this.updateDisplay();

	$('html, body').animate({
	       scrollTop: this.$map_canvas.offset().top
	   }, 1000);
}

ResultsDisplayer.prototype.clearMarkers = function(){
	for (var i = 0; i < this.markers.length; i++){
		var marker = this.markers[i];
		marker.setMap(null);
	}
	this.markers = [];
}

ResultsDisplayer.prototype.shouldShow = function(listing){
	var ind = this.results.topListings.indexOf(listing);
	return  ind >= this.lowIndex 
			&& ind < this.lowIndex + ResultsDisplayer.ENTRIES_PER_PAGE;
}

ResultsDisplayer.prototype.updateDisplay = function(){
	this.clearMarkers();

	console.log(this.results);
	if (this.results == null){
		$("#test").text("Error: Unable to find route/recommendations");
	}
	else{
		this.$container.empty(); //clear out the old results
		g = document.createElement('table');
		g.setAttribute("id", "results-table");

		$("#results-container").append(g);
		var numListingsRemaining = Math.min(ResultsDisplayer.ENTRIES_PER_PAGE, 
			this.results.topListings.length - this.lowIndex);

		for (var i = 0; i < numListingsRemaining; i++){
			var ranking = this.lowIndex + i;
			var listing = this.results.topListings[this.lowIndex + i];
			$("#results-table").append(
				"<tr class='listing_container' id = '" + listing['id'] + "'>"
				+"<td>"
					+ "<div class='image_container'>"
						+ "<img class='rest_image' src='" 
							+ (listing['image_url'] === undefined ? "images/yelp_logo.png" : listing['image_url']) 
						+ "'></img>" 
					+ "</div>"
					+ "<div class='desc_container'>"
						+ "<h3 class='body_title'>" + (ranking + 1) + ". <a href='" + listing['url'] + "' target='_blank'>" + listing['name'] + "</a></h3>"
						+ "<div class='rest_rating'><img class='rest_rating_image' src='" + listing['rating_img_url'] + "'></img>"
						+ " " + listing['review_count'] + " reviews</div>"
						+ "<span class='rest_category'>" + (listing['categories'] !== undefined ? listing['categories'][0][0] : "") + "</span>"
					+ "</div>"
				+ "</td>"
				+ "</tr>");

			this.markListing(listing, ranking, 10);
		}

		$("#results-container").append("<div id='results-stepper' style='text-align: center'>"
			+"<span id='prev-stepper' class='comment body_title'>Prev</span>"
			+ " | "
			+"<span id='next-stepper' class='comment body_title'>Next</span>"
			+"</div>");

		if (this.lowIndex >= ResultsDisplayer.ENTRIES_PER_PAGE){
			$("#prev-stepper").removeClass('comment');
			$("#prev-stepper").click(function(event){
				event.preventDefault();
				this.lowIndex -= ResultsDisplayer.ENTRIES_PER_PAGE;	
				this.updateDisplay();
			}.bind(this));
		}

		if (this.lowIndex + ResultsDisplayer.ENTRIES_PER_PAGE < this.results.topListings.length){
			$("#next-stepper").removeClass('comment');

			$("#next-stepper").click(function(event){
				event.preventDefault();
				this.lowIndex += ResultsDisplayer.ENTRIES_PER_PAGE;	
				this.updateDisplay();
			}.bind(this));
		}
	}
}

ResultsDisplayer.getNextTimeout = function(timeout){
	return 10 + Math.random()*(timeout*2);
}

ResultsDisplayer.prototype.markListing = function(listing, ranking, timeout){
	var marker;
	var imageURL = "http://maps.google.com/mapfiles/kml/paddle/" + 
		((ranking % 10) + 1) + ".png";

	if (listing['location']['coordinate'] != undefined){
		var myLatlng = new google.maps.LatLng(
			listing['location']['coordinate']['latitude'],
			listing['location']['coordinate']['longitude']);

		marker = new google.maps.Marker({
		      position: myLatlng,
		      map: this.map,
		      title: listing['name']
		});
		this.markers.push(marker);

		var contentString = "<img src = '" + listing['image_url'] + "'></img>"
							+ "<div>"
							+ "<h3>" + listing['name'] + "</h3>" 
							+ "<img src = '" + listing['rating_img_url'] + "'</img>"
							+ "</div>";
							
		var infowindow = new google.maps.InfoWindow({
			content: contentString
		});

		google.maps.event.addListener(marker, 'click', function(){
			infowindow.open(this.map, marker);
		});
	}

	else if (listing['location']['address'] != undefined
			&& listing['location']['city'] != undefined
			&& listing['location']['state_code'] != undefined
			&& listing['location']['postal_code'] != undefined) {

		var streetAddress = listing['location']['address'][0]
				+ ", " + listing['location']['city'] 
				+ ", " + listing['location']['state_code'] 
				+ " " + listing['location']['postal_code'];

		var sendRequest = function(){
			this.geocoder.geocode( {address: streetAddress},
				function(results, status) {
				     if (status == google.maps.GeocoderStatus.OK) {
				     	if (this.shouldShow(listing)){
				     		console.log(listing['id'] + " was successfully geocoded using timeout " + timeout +".");
							marker = new google.maps.Marker({
							   map: this.map,
							   position: results[0].geometry.location,
							   title: listing['name']
							});
							this.markers.push(marker);

							var contentString = "<img src = '" + listing['image_url'] + "'></img>"
												+ "<div>"
												+ "<h3>" + listing['name'] + "</h3>" 
												+ "<img src = '" + listing['rating_img_url'] + "'</img>"
												+ "</div>";

							var infowindow = new google.maps.InfoWindow({
								content: contentString
							});

							google.maps.event.addListener(marker, 'click', function(){
								infowindow.open(this.map, marker);
							});
					   }

				     } else {
				       console.log("Geocode was not successful for the following reason: " + status);
				       timeout = ResultsDisplayer.getNextTimeout(timeout); //exponential backoff
				       console.log(listing['id'] + " is timing out with value " + timeout);
				       setTimeout(sendRequest, timeout);
				     }
			  }.bind(this));
		}.bind(this);
		timeout = ResultsDisplayer.getNextTimeout(timeout);
		setTimeout(sendRequest, timeout);
	}

	else return;

	$("#" + listing['id']).mouseenter(function(){
		if (marker !== undefined){
			marker.setIcon('http://maps.google.com/mapfiles/kml/paddle/grn-stars.png');
		}
	});

	$("#" + listing['id']).mouseleave(function(){
		if (marker !== undefined){
			marker.setIcon();
		}
	});


}

