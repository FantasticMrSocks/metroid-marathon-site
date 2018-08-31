function pad(n, width, z) {
    z = z || "0";
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function getDateTimeForInput(jsdate) {
    var dateportion = jsdate.getFullYear() + "-" + pad(jsdate.getMonth() + 1, 2) + "-" + pad(jsdate.getDate(), 2);
    var timeportion = pad(jsdate.getHours(),2) + ':' + pad(jsdate.getMinutes(),2);
    return [dateportion, timeportion];
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
            if (game["end_time"]) endTime = game["end_time"];
            if (game["estimate"]) estimate = game["estimate"];

            $row = $("<tr>", {class: "sched_row", id: (1+i) + "_row"});

            $row.append($("<td>", {class: "sched_title"}).append(game["name"]));
            
            if (startTime) {
                var timeAndDate = getDateTimeForInput(startTime)
                var $td = $("<td>", {class: 'sched_start'});
                $td.append($("<input id='" + game["id"] + "_date' type='date' value='" + timeAndDate[0] + "'>"));
                $td.append($("<input id='" + game["id"] + "_time' type='time' value='" + timeAndDate[1] + "'>"));
                $row.append($td);
            } else {
                var $td = $("<td>", {class: 'sched_start'});
                $td.append($("<input id='" + game["id"] + "_date' type='date'>"));
                $td.append($("<input id='" + game["id"] + "_time' type='time'>"));
                $td.append($("<a id='" + game["id"] + "_startnow' href='#' onclick='startnow(" + game["id"] + ")'>").append("Now"));
                $row.append($td);
            }

            var endArray = (endTime ? minutesToHM(endTime) : minutesToHM(0));
            var completionInput = $("<span>").append($("<input id='" + game["id"] + "_hours' type='text' style='width:2em;' value='"  + endArray[0] + "'>"), "h ", $("<input id='" + game["id"] + "_minutes' type='text' style='width:2em;' value='"  + endArray[1] + "'>"), "m")
            $row.append($("<td>", {class: "sched_end"}).append(completionInput));

            $row.append($("<td>", {class: "end_now"}).append($("<a id='" + game["id"] + "_endnow' href=# onclick='endnow(" + game["id"] + ")'>").append("Now")));

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

function startnow(id) {
    var timeAndDate = getDateTimeForInput(new Date(Date.now()));
    $("#" + id + "_date").val(timeAndDate[0]);
    $("#" + id + "_time").val(timeAndDate[1]);
}

function endnow(id) {
    startTimeString = $("#" + id + "_date").val() + " " + $("#" + id + "_time").val();
    if (startTimeString == "undefined undefined") return;
    startTimeMilliseconds = (Date.parse(startTimeString));
    elapsedMilliseconds = Date.now() - startTimeMilliseconds;
    elapsedMinutes = Math.floor(elapsedMilliseconds/60000);
    elapsedHM = minutesToHM(elapsedMinutes);
    $("#" + id + "_hours").val(elapsedHM[0]);
    $("#" + id + "_minutes").val(elapsedHM[1]);
}

function minutesToHM(num_of_minutes) {
    var hours = Math.floor(num_of_minutes/60);
    var minutes = num_of_minutes%60;
    return [hours, minutes]
}

function convertTime(sqlTime) {
    // Split timestamp into [ Y, M, D, h, m, s ]
    var t = sqlTime.split(/[- :]/);
    // Apply each element to the Date function
    var d = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]) + (4 * 60 * 60 * 1000));
    return d;
}

function saveToDB() {
    var updateData = [];

    for (row of $(".sched_row")) {
        var id = row.id;
        var $row = $(row);
        id = id.substr(0, id.indexOf('_'));

        var start_time = $("#" + id + "_date").val() + " " + $("#" + id + "_time").val();
        if (start_time.includes("undefined")) break;
        if (start_time == " ") break;
        var end_time = ($("#" + id + "_hours").val() * 60) + ($("#" + id + "_minutes").val() * 1);

        updateData = updateData.concat({start_time:start_time, end_time:end_time, id:id});
    }

    console.log(updateData);

    if (updateData.length != 0) {
        $.get("script/db.php", {fn: "update", table: "games", data: updateData}, function(data){
            location.reload();
        });
    }
}

$(document).ready(function(){
    generateSchedule();
});