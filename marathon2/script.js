function generateTable(){
	rows = [];

	for (var i = 0; i < games.length; i++) {
		var game = games[i]
		$row = $("<tr>", {class: "sched_row", id:game["abbr"] + "_row"});

		$row.append($("<td>").append(game["name"]));
		
		if (game["start"]) {
			var time = new Date(game["start"]);
		} else {
			var prevTime = new Date(games[i-1]["start"])
			var time = new Date(prevTime.getTime() + (60000 * games[i-1]["estimate"]) + (60000 * 15))
			game["start"] = time.toISOString()
		}
		$row.append($("<td>").append(time.toLocaleString()));

		$row.append($("<td>").append(game["complete"] ? minutesToHM(game["complete"]) : minutesToHM(game["estimate"]) + " (est.)"));

		$row.append($("<td>").append(game["player"]));

		if ("hidden" in game) {
			$row.css("display", "hidden")
		}

		games[i] = game;
		rows.push($row);
	}

	return rows;
}

function minutesToHM(num_of_minutes) {
	var hours = Math.floor(num_of_minutes/60);
	var minutes = num_of_minutes%60;
	return (hours > 0 ? hours + "h" : "") + (minutes > 0 ? minutes + "m" : "")
}

$(document).ready(function(){
	for ($row of generateTable()) {
		$("#sched").append($row)
	}
})