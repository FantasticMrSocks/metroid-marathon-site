function convertTime(sqlTime) {
    // Split timestamp into [ Y, M, D, h, m, s ]
    var t = sqlTime.split(/[- :]/);
    // Apply each element to the Date function
    var d = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]) + (4 * 60 * 60 * 1000));
    return d;
}

var gamedata = [];

function generateSchedule(){

    $("#sched").parent().append($("<p>", {class:"center", id:"loading"}).append("Loading..."));
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
            if (game["estimate"]) estimate = 60000 * game["estimate"];

            $row = $("<tr>", {class: "sched_row", id: i + "_row"});

            $row.append($("<td>", {class: "sched_title"}).append(game["name"]));
            
            if (startTime) {
                var time = startTime;
            } else {
                var prevTime = new Date(games[i-1]["start_time"]);
		var prevEnd = null;
                if (games[i-1]["end_time"]) {
		    prevEnd = 60000 * games[i-1]["end_time"];
		} else {
                    prevEnd = 60000 * games[i-1]["estimate"];
		}
                var time = new Date(prevTime.getTime() + (prevEnd + (60000 * (game["name"] == "Offline" ? 0 : 15))));
            }
            game["start_time"] = time.toISOString();
            $row.append($("<td>", {class: "sched_start"}).append(time.toLocaleString([], {
                                                                    weekday: "short",
                                                                    month: "numeric",
                                                                    day: "numeric",
                                                                    hour: "numeric",
                                                                    minute: "numeric"
                                                                })));

            $row.append($("<td>", {class: "sched_end"}).append(endTime ? minutesToHM(endTime) : `${minutesToHM(estimate / 60000)} (est.)`));

            games[i] = game;
            if (!game["hidden"]) {
                rows.push($row);
            }
        }

        $("#loading").css("display","none");
        for ($row of rows) {
            $("#sched").append($row);
        }
    }, "json");
}

function generateBios(){
    $("#bios").parent().append($("<p>", {class:"center", id:"bio_loading"}).append("Bios Loading..."));
    $.get("script/db.php", {fn:"get",tbl:"staff"}, function(data){
        $("#bio_loading").css("display","none");
        var bios = $.extend(true, [], data);

        for (var i = 0; i < bios.length; i++) {
            var bio = bios[i];

            var $bio_div = $("<div class='bio'>");
            if (i%2 == 0) $bio_div.css("flex-direction", "row-reverse")
            var img = bio["img"] ? `img/bios/${bio["img"]}` : "img/bios/doofy.png";
            $bio_div.append($("<div class='bio_img'>").append($(`<img src='${img}' alt='${bio["name"]}' />`)));

            $bio_div.append($("<div class='divider'>"));

            var $bio_body = $("<div class='bio_body center'>");
            for (element of ["name","handle","fave","bio"]) {
                if (bio[element]) {
                    if (element == "handle") {
                        var text = `"${bio[element]}"`;
                    } else if (element == "fave") {
                        var text = `Favorite Non-Metroid:<br />${bio[element]}`
                    } else {
                        var text = bio[element]
                    }
                    $bio_body.append($(`<p class='bio_${element}'>`).append(text));
                }
            }

            var $bio_links = $("<div class='bio_links'>");
            if (bio["twitter"]) $bio_links.append($(`<a href='https://twitter.com/${bio["twitter"]}'>`).append(`<img src='img/t.svg' alt='${bio["twitter"]} on Twitter' height='50' width='50'/>`));
            if (bio["twitch"]) $bio_links.append($(`<a href='https://twitch.tv/${bio["twitch"]}'>`).append(`<img src='img/GlitchIcon_Purple_64px.png' alt='${bio["twitch"]} on Twitch' height='50' width='50'/>`));
            $bio_body.append($bio_links);

            $bio_div.append($bio_body);

            $("#bios").append($bio_div);
        }
    }, "json");
}

function minutesToHM(num_of_minutes) {
    var hours = Math.floor(num_of_minutes/60);
    var minutes = num_of_minutes%60;
    return (hours > 0 ? hours + "h" : "") + (minutes > 0 ? minutes + "m" : "")
}

$(document).ready(function(){
    generateSchedule();
    generateBios();

    $.get('script/tiltify.py?op=donations', null, function(e){
        $("#donation_heading").text("Recent Donations");
        for (var i = 0; i < e.length; i++) {
            if (i > 4) break;
            var $donation = $(`<div class='donation' id='donation_${e[i]["id"]}'>`);
            var $donation_info = $("<div class='donation_info'>");
            $donation_info.append($("<p class='donation_name'>").text((e[i]["name"] ? e[i]["name"] : "Anonymous")));
            $donation_info.append($("<div class='divider'>"));
            $donation_info.append($("<p class='donation_amount'>").text("$" + e[i]["amount"]));
            $donation.append($donation_info);
            if (e[i]["comment"]) {
                $donation.append($("<div class='divider'>"));
                $donation.append($("<p class='donation_message'>").text(e[i]["comment"]));
            }

            $("#donation_list").append($donation);
        }
    });

    $.get('script/tiltify.py?op=campaign', null, function(e){
        var formatter = new Intl.NumberFormat('en-US', {style: 'currency', currency:'USD'})
        $("#campaign_heading").text("Event");
        $("#campaign_about").text(e["description"])
        $("#campaign_about").append("<div class='divider' style='margin-top:10px;margin-bottom:25px;'>")
        $("#progress").append($("<div id='progress_bar'>"))
        $("#progress_bar").append($(`<div id='current_progress' style='width:${Math.min(e["amountRaised"] / e["fundraiserGoalAmount"] * 100, 100)}%;'>`))
        $("#progress_bar").append($(`<p class='goal_label'>Goal: ${formatter.format(e["fundraiserGoalAmount"])}</p>`))
        $("#current_progress").append($(`<p class='progress_label'${e["amountRaised"] / e["fundraiserGoalAmount"] < 0.5 ? " style='left:100%;'" : ""}>Raised: ${formatter.format(e["amountRaised"])}</p>`))
    });
})
