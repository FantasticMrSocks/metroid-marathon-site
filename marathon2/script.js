function generateTable(){
    rows = [];

    for (var i = 0; i < games.length; i++) {
        var game = games[i];
        $row = $("<tr>", {class: "sched_row", id:game["abbr"] + "_row"});

        $row.append($("<td>", {class: "sched_title"}).append(game["name"]));
        
        if (game["start"]) {
            var time = new Date(game["start"]);
        } else {
            var prevTime = new Date(games[i-1]["start"])
            var time = new Date(prevTime.getTime() + (60000 * games[i-1]["estimate"]) + (60000 * 30))
            game["start"] = time.toISOString()
        }
        $row.append($("<td>").append(time.toLocaleString([], {
                                                                weekday: "short",
                                                                month: "numeric",
                                                                day: "numeric",
                                                                hour: "numeric",
                                                                minute: "numeric"
                                                             })));

        $row.append($("<td>").append(game["complete"] ? minutesToHM(game["complete"]) : minutesToHM(game["estimate"]) + " (est.)"));

        $row.append($("<td>").append(game["player"]));

        if ("hidden" in game) {
            $row.css("display", "none")
        }

        games[i] = game;
        rows.push($row);
    }

    return rows;
}

function generateBios(){
    gen_bios = [];

    for (var i = 0; i < bios.length; i++) {
        var bio = bios[i];

        var $bio_div = $("<div class='bio'>");
        if (i%2 == 0) $bio_div.css("flex-direction", "row-reverse")
        var img = bio["img"] ? "img/" + bio["img"] : "img/II.png";
        $bio_div.append($("<div class='bio_img'>").append($("<img src='" + img + "' alt='" + bio["name"] + "' />")));

        $bio_div.append($("<div class='divider'>"));

        var $bio_body = $("<div class='bio_body center'>");
        for (element of ["name","handle","fave","text"]) {
            if (bio[element]) {
                if (element == "handle") {
                    var text = 'aka "' + bio[element] + '"';
                } else if (element == "fave") {
                    var text = "Favorite Metroid: " + bio[element]
                } else {
                    var text = bio[element]
                }
                $bio_body.append($("<p class='bio_" + element + "'>").append(text));
            }
        }

        var $bio_links = $("<div class='bio_links'>");
        if (bio["twitter"]) $bio_links.append($("<a href='https://twitter.com/" + bio["twitter"] + "'>").append("<img src='img/Twitter_Logo_WhiteOnImage.png' alt='" + bio["twitter"] + "on Twitter' height='50' width='50'/>"));
        if (bio["twitch"]) $bio_links.append($("<a href='https://twitch.tv/" + bio["twitch"] + "'>").append("<img src='img/Glitch_White_RGB.png' alt='" + bio["twitch"] + "on Twitch' height='50' width='50'/>"));
        $bio_body.append($bio_links);

        $bio_div.append($bio_body);

        gen_bios.push($bio_div);
    }

    return gen_bios
}

function minutesToHM(num_of_minutes) {
    var hours = Math.floor(num_of_minutes/60);
    var minutes = num_of_minutes%60;
    return (hours > 0 ? hours + "h" : "") + (minutes > 0 ? minutes + "m" : "")
}

$(document).ready(function(){
    for ($row of generateTable()) {
        $("#sched").append($row);
    }
    for ($bio of generateBios()) {
        $("#bios").append($bio);
    }

    $.get('https://www.extra-life.org/index.cfm?fuseaction=donorDrive.participantDonations&participantID=246713&format=json', null, function(e){
        $("#donation_heading").text("Recent Donations");
        for (var i = 0; i < e.length; i++) {
            if (i > 4) break;
            var $donation = $("<div class='donation'>");
            var $donation_info = $("<div class='donation_info'>");
            $donation_info.append($("<p class='donation_name'>").text((e[i]["donorName"] ? e[i]["donorName"] : "Anonymous")));
            $donation_info.append($("<div class='divider'>"));
            $donation_info.append($("<p class='donation_amount'>").text("$" + e[i]["donationAmount"]));
            $donation.append($donation_info);
            if (e[i]["message"]) {
                $donation.append($("<div class='divider'>"));
                $donation.append($("<p class='donation_message'>").text(e[i]["message"]));
            }

            $("#donation_list").append($donation);
        }
    });
})
