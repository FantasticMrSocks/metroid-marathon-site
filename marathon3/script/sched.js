function pad(n, width, z) {
    z = z || "0";
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function generateSchedule(){

    $("#sched").parent().append($("<p>", {class:"center", id:"sch_loading"}).append("Schedule Loading..."));
    $.get("script/db.php", {fn:"get",tbl:"games"}, function(data){
        gamedata = data;
        var games = $.extend(true, [], gamedata);
        var rows = [];

        for (var i = 0; i < games.length; i++) {
            var game = games[i];

            var startTime = null;
            var endTime = null;
            var estimate = null

            if (game["start_time"]) startTime = convertTime(game["start_time"]);
            if (game["end_time"]) endTime = convertTime(game["end_time"]);
            if (game["estimate"]) estimate = 60000 * game["estimate"];

            $row = $("<tr>", {class: "sched_row", id: i + "_row"});

            $row.append($("<td>", {class: "sched_title"}).append(game["name"]));
            
            if (startTime) {
                var dateportion = startTime.getFullYear() + "-" + pad(startTime.getMonth() + 1, 2) + "-" + pad(startTime.getDate(), 2);
                var timeportion = pad(startTime.getHours(),2) + ':' + pad(startTime.getMinutes(),2);
                var $td = $("<td>", {class: 'sched_start'});
                $td.append($("<input type='date' value='" + dateportion + "'>"));
                $td.append($("<input type='time' value='" + timeportion + "'>"));
                $row.append($td);
            } else {
                var $td = $("<td>", {class: 'sched_start'});
                $td.append($("<input type='date'>"));
                $td.append($("<input type='time'>"));
                $row.append($td);
            }

            $row.append($("<td>", {class: "sched_end"}).append(endTime ? minutesToHM(endTime/60000) : minutesToHM(estimate/60000) + " (est.)"));

            $row.append($("<td>", {class: "end_now"}).append($("<a href='#now'>").append("Now")));

            games[i] = game;
            if (!game["hidden"]) {
                rows.push($row);
            }
        }

        $("#sch_loading").css("display","none");
        for ($row of rows) {
            $("#sched").append($row);
        }
    }, "json");
}

function minutesToHM(num_of_minutes) {
    var hours = Math.floor(num_of_minutes/60);
    var minutes = num_of_minutes%60;
    return (hours > 0 ? hours + "h" : "") + (minutes > 0 ? minutes + "m" : "")
}

function convertTime(sqlTime) {
    // Split timestamp into [ Y, M, D, h, m, s ]
    var t = sqlTime.split(/[- :]/);
    // Apply each element to the Date function
    var d = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]) + (4 * 60 * 60 * 1000));
    return d;
}

$(document).ready(function(){
    generateSchedule();
});