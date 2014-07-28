

function main($start, $end) {
	console.log("Running in main");

	$("#test").text($start.val() + " " + $end.val());
	requestDirections($start, $end);
}

