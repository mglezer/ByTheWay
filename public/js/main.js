
function ResultsDisplayer($container, $map_canvas){
	this.$container = $container;
	this.results = null;
	this.geocoder = new google.maps.Geocoder();
	this.$map_canvas = $map_canvas;
	this.map = new google.maps.Map(this.$map_canvas[0], {});

	this.markers = [];
}

ResultsDisplayer.prototype.handleRecs = function(data){
	this.results = data;
	this.updateDisplay();
}

ResultsDisplayer.prototype.clearMarkers = function(){
	for (var i = 0; i < this.markers.length; i++){
		var marker = this.markers[i];
		marker.setMap(null);
	}
	this.markers = [];
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
		for (var i = 0; i < this.results.topListings.length; i++){
			var listing = this.results.topListings[i];
			$("#results-table").append(
				"<tr class='listing_container' id = '" + listing['id'] + "'>"
				+"<td>"
					+ "<div class='image_container'>"
						+ "<img class='rest_image' src='" 
							+ (listing['image_url'] === undefined ? "images/yelp_logo.png" : listing['image_url']) 
						+ "'></img>" 
					+ "</div>"
					+ "<div class='desc_container'>"
						+ "<h3 class='rest_title'>" + (i + 1) + ". <a href='" + listing['url'] + "' target='_blank'>" + listing['name'] + "</a></h3>"
						+ "<div class='rest_rating'><img class='rest_rating_image' src='" + listing['rating_img_url'] + "'></img></div>"
						+ "<span class='rest_category'>" + listing['categories'][0][0] + "</span>"
					+ "</div>"
				+ "</td>"
				+ "</tr>");

			this.markListing(listing, i + 1);
		}
	}
}

ResultsDisplayer.prototype.markListing = function(listing, rank){
	var marker;
	if (listing['location']['coordinate'] != undefined){
		var myLatlng = new google.maps.LatLng(
			listing['location']['coordinate']['latitude'],
			listing['location']['coordinate']['longitude']);

		var imageURL = "http://maps.google.com/mapfiles/kml/paddle/" + (rank <= 10 ? rank : "red-blank") + ".png";

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
		this.geocoder.geocode( {address: streetAddress},
			function(results, status) {
			     if (status == google.maps.GeocoderStatus.OK) {
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

			     } else {
			       alert("Geocode was not successful for the following reason: " + status);
			     }
		  }.bind(this));
	}

	else return;

	$("#" + listing['id']).mouseenter(function(){
		marker.setIcon('http://maps.google.com/mapfiles/kml/paddle/grn-stars.png');
	});

	$("#" + listing['id']).mouseleave(function(){
		marker.setIcon();
	});


}

