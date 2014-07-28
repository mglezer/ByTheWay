

function main($start, $end) {
	requestDirections($start, $end);
}


function ResultsDisplayer($container){
	this.$container = $container;
}


function handleRecs(data){
	console.log("Inside handleRecs");
	console.log("Data received from server:");
	console.log(data);
	if (data == null){
		$("#test").text("Error: Unable to find route/recommendations");
	}
	else{
		$("#results-container").empty(); //clear out the old results
		g = document.createElement('table');
		g.setAttribute("id", "results-table");

		$("#results-container").append(g);
		// $("#results-table").append("<tr> \
		// 								<th> Ranking </th> \
		// 								<th> Name </th> \
		// 								<th> Image </th> \
		// 								<th> Rating </th> \
		// 								<th> Categories </th> \
		// 							</tr>");

		for (var i = 0; i < data.topListings.length; i++){
			var listing = data.topListings[i];
			// $("#results-table").append("<tr id = '" + listing['id'] + "'>"
			// 								+ "<td> " + (i + 1) + ".</td>"
			// 								+ "<td> " + "<a href='" + listing['url'] + "'>" + listing['name'] + "</a></td>"
			// 								+ "<td> <img src='" + listing['image_url'] + "'></img> </td>" 
			// 								+ "<td> <img src='" + listing['rating_img_url'] + "'></img></td>"
			// 								+ "<td> " + listing['categories'][0] + "</td>"
			// 							+ "</tr>");

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

			markListing(listing, i + 1);
		}
	}
}

function markListing(listing, rank){
	var marker;
	if (listing['location']['coordinate'] != undefined){
		var myLatlng = new google.maps.LatLng(
			listing['location']['coordinate']['latitude'],
			listing['location']['coordinate']['longitude']);

		var imageURL = "http://maps.google.com/mapfiles/kml/paddle/" + (rank <= 10 ? rank : "red-blank") + ".png";

		marker = new google.maps.Marker({
		      position: myLatlng,
		      map: map,
		      title: listing['name']
		});

		var contentString = "<img src = '" + listing['image_url'] + "'></img>"
							+ "<div>"
							+ "<h3>" + listing['name'] + "</h3>" 
							+ "<img src = '" + listing['rating_img_url'] + "'</img>"
							+ "</div>";
							
		var infowindow = new google.maps.InfoWindow({
			content: contentString
		});

		google.maps.event.addListener(marker, 'click', function(){
			infowindow.open(map, marker);
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
		geocoder.geocode( {address: streetAddress},
			function(results, status) {
			     if (status == google.maps.GeocoderStatus.OK) {
			       marker = new google.maps.Marker({
			           map: map,
			           position: results[0].geometry.location,
			           title: listing['name']
			       });

			       var contentString = "<img src = '" + listing['image_url'] + "'></img>"
			       					+ "<div>"
			       					+ "<h3>" + listing['name'] + "</h3>" 
			       					+ "<img src = '" + listing['rating_img_url'] + "'</img>"
			       					+ "</div>";

			       var infowindow = new google.maps.InfoWindow({
			       	content: contentString
			       });

			       google.maps.event.addListener(marker, 'click', function(){
			       	infowindow.open(map, marker);
			       });

			     } else {
			       alert("Geocode was not successful for the following reason: " + status);
			     }
		  });
	}

	else return;

	$("#" + listing['id']).mouseenter(function(){
		marker.setIcon('http://maps.google.com/mapfiles/kml/paddle/grn-stars.png');
	});

	$("#" + listing['id']).mouseleave(function(){
		marker.setIcon();
	});


}

