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
            if (game["end_time"]) endTime = convertTime(game["end_time"]);
            if (game["estimate"]) estimate = 60000 * game["estimate"];

            $row = $("<tr>", {class: "sched_row", id: i + "_row"});

            $row.append($("<td>", {class: "sched_title"}).append(game["name"]));
            
            if (startTime) {
                var time = startTime;
            } else {
                var prevTime = new Date(games[i-1]["start_time"]);
                var prevEst = 60000 * games[i-1]["estimate"];
                var time = new Date(prevTime.getTime() + (prevEst + (60000 * 15)));
                game["start_time"] = time.toISOString();
            }
            $row.append($("<td>", {class: "sched_start"}).append(time.toLocaleString([], {
                                                                    weekday: "short",
                                                                    month: "numeric",
                                                                    day: "numeric",
                                                                    hour: "numeric",
                                                                    minute: "numeric"
                                                                })));

            $row.append($("<td>", {class: "sched_end"}).append(endTime ? endTime : minutesToHM(estimate/60000) + " (est.)"));

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

/* PIZZA TIME */
function loadPizzaIngredients(response){
    console.log(response)
    var data = JSON.parse(response);
    data['feed']['entry'].forEach(function(x){
        var container = document.createElement('tr');
        var name = document.createElement('td')
        var moneyFor = document.createElement('td')
        var moneyAgainst = document.createElement('td')
        name.insertAdjacentText("afterbegin",x['gsx$name']['$t'])
        name.classList.add("name")
        moneyFor.insertAdjacentText("afterbegin",x['gsx$for']['$t'])
        moneyFor.classList.add("moneyFor")
        moneyAgainst.insertAdjacentText("afterbegin",x['gsx$against']['$t'])
        moneyAgainst.classList.add("moneyAgainst")
        container.insertAdjacentElement("afterbegin",moneyAgainst)
        container.insertAdjacentElement("afterbegin",moneyFor)
        container.insertAdjacentElement("afterbegin",name)
        document.getElementById("master-table").insertAdjacentElement("afterend",container)
    })
}

$(document).ready(function(){
    generateSchedule();
    
    //for ($bio of generateBios()) {
    //    $("#bios").append($bio);
    //}

    $.get('http://extra-life.org/api/participants/365330/donations',
        null,
        function(e) {
            $("#donation_heading").text("Recent Donations");
            if (e.length === 0)
            {
                $("#donation_list").append("None yet!");
                return;
            }

            for (var i = 0; i < e.length; i++) {
                if (i > 4) break;
                var $donation = $("<div class='donation'>");
                var $donation_info = $("<div class='donation_info'>");
                $donation_info.append($("<p class='donation_name'>").text((e[i]["displayName"] ? e[i]["displayName"] : "The Anonymoose")));
                $donation_info.append($("<div class='divider'>"));
                $donation_info.append($("<p class='donation_amount'>").text("$" + e[i]["amount"]));
                $donation.append($donation_info);
                if (e[i]["message"]) {
                    $donation.append($("<div class='divider'>"));
                    $donation.append($("<p class='donation_message'>").text(e[i]["message"]));
                }

                $("#donation_list").append($donation);
            }
        }
    );

    // PIZZA TIME
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://spreadsheets.google.com/feeds/list/1nFbTeBQ2uFGm6VLprC112hPALU57gZB-FrblntEOZuw/1/public/values?alt=json", true);
    xhr.onload = function(e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                loadPizzaIngredients(xhr.responseText)
            }
        }
    };
    xhr.onerror = function (e) {
        console.error(xhr.statusText);
    };
    xhr.send(null);
})
