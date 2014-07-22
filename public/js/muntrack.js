// Copyright (c) 2014 Nikhil Benesch <nikhil.benesch@gmail.com>
//
// This file is part of mun.track.
//
// mun.track is free software: you can redistribute it and/or modify it under
// the terms of the GNU Affero General Public License version 3 as published by
// the Free Software Foundation.
//
// mun.track is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
// details.
//
// You should have received a copy of the GNU Affero General Public License
// along with mun.track. If not, see <http://www.gnu.org/licenses/>.

var VERSION = "1.5";
var SOCKET_URL = "http://mobile.muntrackapp.com";

var countryList = [ //member states
					"Afghanistan", "Albania", "Algeria", 
				    "Andorra", "Angola",  
					"Antigua and Barbuda", "Argentina", "Armenia", "Australia",
					"Austria", "Azerbaijan", 
					
					"Bahamas", "Bahrain", "Bangladesh", "Barbados", 
					"Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", 
					"Bosnia And Herzegovina", "Botswana", "Brazil", 
					"Brunei Darussalam", "Brunei", "Bulgaria",  
					"Burkina Faso", "Burundi", 
					
					"Cabo Verde", "Cambodia", "Cameroon", "Canada", 
					"Central African Republic", "CAR", "Chad", "Chile", "China", 
					"Colombia", "Comoros", 
					"Congo", "Costa Rica", "Cote D'Ivoire", "Croatia", 
					"Cuba", "Cyprus", "Czech Republic", 
					
					"Democratic People's Republic of Korea", "DPRK", "North Korea"
					"DR Congo", "Democratic Republic of the Congo","Denmark", 
					"Djibouti", "Dominica", "Dominican Republic", 
					
					"Ecuador", "Egypt", 
					"El Salvador", "Equatorial Guinea", 
					"Eritrea", "Estonia", "Ethiopia", 
					
					"Fiji", "Finland", "France", 
					
					"Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", 
					"Grenada", "Guatemala", "Guinea", "Guinea Bissau", 
					"Guyana", 
					
					"Haiti", "Honduras","Hungary", 
					
					"Iceland", "India", "Indonesia", "Iran", "Iraq", 
					"Ireland", "Israel", "Italy", 
					
					"Jamaica", "Japan", "Jordan",
					
					"Kazakhstan", "Kenya", "Kiribati", "Kuwait", 
					"Kyrgyzstan", 
					
					"Lao People's Democratic Republic", "Laos", 
					"Latvia", "Lebanon", "Lesotho", 
					"Liberia", "Libya", "Liechtenstein",
					"Lithuania", "Luxembourg", 
					
				    "Madagascar", "Malawi", "Malaysia", 
					"Maldives", "Mali", "Malta", 
					"Marshall Islands", "Mauritania", "Mauritius", 
					"Mexico", "Micronesia, Federated States Of", "Micronesia",
				    "Monaco", 
					"Mongolia", "Morocco", "Mozambique", "Myanmar", 
					
					"Namibia", "Nauru", "Nepal", 
					"Netherlands", "New Zealand", "Nicaragua", "Niger", 
					"Nigeria", "Norway", 
					
					"Oman", 
					
					"Pakistan", 
					"Palau", "Panama", "Papua New Guinea", "Paraguay", 
					"Peru", "Philippines", "Poland", "Portugal", 
					
					"Qatar", 
					
					"Republic of Korea", "South Korea", 
					"Republic of Moldova", "Moldova",
					"Romania", "Russian Federation", "Russia",
					"Rwanda", 
					
				    "Saint Kitts And Nevis", "Saint Lucia", 
				    "Saint Vincent And The Grenadines", "Samoa", "San Marino", 
					"Sao Tome And Principe", "Saudi Arabia", "Senegal", "Serbia" , "Seychelles", 
					"Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", 
					"South Africa", "South Sudan", "Spain", "Sri Lanka", 
					"Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", 
					"Syrian Arab Republic", "Syria", 
					
					"Tajikistan", "Thailand", 
					"The former Yugoslav Republic of Macedonia", "Macedonia",
					"Timor-Leste", "Togo", "Tonga", "Trinidad And Tobago", 
					"Tunisia", "Turkey", "Turkmenistan", "Tuvalu", 
					
					"Uganda", "Ukraine", "United Arab Emirates", 
					"United Kingdom of Great Britain and Northern Ireland", 
					"United Kingdom", "UK",
					"United States of America", "United States", "USA"
				    "Uruguay", "Uzbekistan", 
					
					"Vanuatu", "Venezuela, Bolivarian Republic of",
					"Venezuela", "Viet Nam", 
					
					"Yemen", 
					
					"Zambia", "Zimbabwe",
					//non-member states
					"Holy See*", "Vatican City*",
					"State of Palestine*", "Palestine*"
					];

var isCountryPrompt = false;
var isPrompt = false;
var isFullScreenShowing = false;
var mobileCode = null;
var callback = null;

var country;
var timer = null;

var list = 0;
var quorum = null;
var current = [0, 0, 0];
var title = "mun.track";
var names = ["Rolling", "General", "Voting"];
var times = [0, 0, 0];
var countries = [[], [], []];
var extensions = [0, 0, 0];
var extensionTimes = [0, 0, 0];
var tally = [0, 0, 0];

var socket = {
	code: randomString(6),
	connected: false,

	_socket: null,

	connect: function(code) {
		var self = this;

		this._socket = io.connect(SOCKET_URL);
		this._socket.on("connect", function() {
			self.connected = true;
			self._socket.emit("code", self.code);
			print("mobile connection initialized! &nbsp;&nbsp;&nbsp;code: " + self.code);
		});
		this._socket.on("command", function(command) {
			console.log(command);
			process(command);
		});
	},

	publish: function(event, message) {
		this._socket.emit(event, message);
	}
};


$(document).ready(function() {
	$("#help").dialog({
		modal: true, width: 450,
		resizable: false, draggable: false,
		show: "fade", hide: "fade",
		close: function() { $("#command").focus() },
		autoOpen: false
	});

	$("#update").dialog({
		modal: true, width: 300, minHeight: 50,
		resizable: false, draggable: false,
		show: "fade", hide: "fade",
		close: function() { $("#command").focus() },
		buttons: { "Got it, thanks!": function() { $(this).dialog("close") } },
		autoOpen: false
	});

	$("#vote").dialog({
		modal: true, dialogClass: "big",
		width: 900, minHeight: 50,
		resizable: false, draggable: false,
		show: "fade", hide: "explode",
		close: function() { print("mun.track ready"); $("#controller").css("zIndex", 1); $("#command").focus() },
		autoOpen: false
	});

	$("#timer").dialog({
		modal: true, dialogClass: "big",
		width: 900, minHeight: 50,
		resizable: false, draggable: false,
		show: "fade", hide: "explode",
		close: function() { print("mun.track ready"); $("#controller").css("zIndex", 1); $("#command").focus() },
		autoOpen: false
	});

	$("#fullscreen").dialog({
		modal: true, dialogClass: "big",
		width: 800, minHeight: 50,
		show: "fade", hide: "explode",
		resizable: false, draggable: false,
		close: function() { $("#command").focus() },
		autoOpen: false//, closeOnEscape: false
	});

	$("#urlupdated").dialog({
		modal: true, dialogClass: "big",
		width: 800, minHeight: 50,
		show: "fade", hide: "explode",
		resizable: false, draggable: false,
		close: function() { $("#command").focus() },
		autoOpen: false//, closeOnEscape: false
	});


	retrieve();
	boot();
	setInterval(store, 10000);
	setInterval(checkFullScreen, 500);

	$(window).resize(checkFullScreen);


	$("#command").keydown(keydownHandler);
	$("#command").keyup(function() {
		if (isCountryPrompt && isPrompt && $(this).val().length > 3) {
			print(findCountry($(this).val()));
		}
	});
	$("body").mouseup(function() {
		$("#command").focus();
	});
	$(window).unload(function() {
		//
	});
	$("#command").focus();
});

function keydownHandler(event) {
	if (event.which == 13) { //enter
			var command = $("#command").val();
			$("#command").val("");
			process(command);
		} else if (event.which == 32 && !isPrompt) { //spacebar
			if (!timer) {
				timer = setInterval(tick, 1000);
			} else {
				clearInterval(timer);
				timer = null;
			}
			$("#command").val("");
			event.stopPropagation();
			return false;
		} else if (event.which == 27) { //escape
			isPrompt = false;
			callback = null;
			$(this).val("");
			print("mun.track ready");
		}
}

function checkFullScreen() {
	if ($(window).height() < screen.height - 50) {
		if (!isFullScreenShowing) {
			isFullScreenShowing = true;
			//$("#fullscreen").dialog("open");
		}
	} else {
		if (isFullScreenShowing) {
			isFullScreenShowing = false;
			$("#fullscreen").dialog("close");
		}
	}
}

function tick() {
	var seconds = parseInt($('#info-time').html());
	if (seconds > 0) {
		$('#info-time').html((parseInt($('#info-time').html()) - 1) + ' seconds');
	}
	if (seconds <= 11) {
		$('#info-time').css("color", "yellow");
	}
	if (seconds <= 1) {
		$('#info-time').css("color", "red");
		clearTimeout(timer);
		timer = null;
	}
	publishTime();
}

function publishTime() {
	if (socket.connected) {
		var string = $('#info-time').html() + ", " + $('#info-extensions').html();
		socket.publish("time", string);
	}
}

function print(string) {
	$("#console").html("&gt; " + string);
	if (socket.connected) {
		socket.publish("message", string);
	}
}

function prompt(text, callbackIn, defaultVal) {
	print(text);
	if (defaultVal) {
		$("#command").val(defaultVal).select();
	}

	isPrompt = true;
	isCountryPrompt = false;
	callback = callbackIn;
}

function promptCallback(input) {
	isPrompt = false;
	isCountryPrompt = false;
	print("mun.track ready");

	callback(input);
}

function process(command) {
	store();

	if (isPrompt) {
		promptCallback(command);
		return;
	}

	switch ($.trim(command.toLowerCase())) {
		case "about":
		case "version":
			about();
			break;
		case "a":
		case "add":
			prompt("add? (q to exit)", add);
			isCountryPrompt = true;
			break;
		case "b":
		case "boot":
			boot();
			break;
		case "c":
		case "change":
			prompt("change?", change);
			break;
		case "clear":
			prompt("CLEAR?", clear, "no");
			break;
		case "d":
		case "del":
		case "delete":
			prompt("delete? (q to exit)", deleter);
			break;
		case "e":
		case "extend":
			extend();
			break;
		case "x":
		case "esc":
		case "exit":
			keydownHandler({ which: 27 }); //simulate escape
			break;
		case "f":
		case "flip":
			prompt("flip?", flip);
			break;
		case "h":
		case "?":
		case "help":
			help();
			break;
		case "i":
		case "insert":
			prompt("insert?", insert);
			isCountryPrompt = true;
			break;
		case "m":
		case "mobile":
			mobile();
			break;
		case "n":
		case "next":
			next();
			break;
		case "p":
		case "prev":
		case "previous":
			prev();
			break;
		case "s":
		case "switch":
			switcher();
			break;
		case "sh":
		case "settitle":
			prompt("set topic to?", setTitle, $("#title").html());
			break;
		case "sq":
		case "setquorum":
			prompt("set quorum to?", setQuorum, parseInt($("#info-quorum").html()));
			break;
		case "st":
		case "settime":
			prompt("set time to?", setTime, parseInt($("#info-time").html()));
			break;
		case "se":
		case "setext":
		case "setexts":
		case "setextensions":
			prompt("set extensions to?", setExtensions, extensions[list]);
			break;
		case "space":
			keydownHandler({ which: 32 }); //simulate spacebar
			break;
		case "t":
		case "timer":
			prompt("set timer to? (mm:ss)", startTimer, "5:00");
			break;
		case "v":
		case "vote":
			vote();
			break;
		default:
			print("unrecognized command. try again?");
	}
}

function help() {
	$("#help").dialog("open");
}

function update() {
	$("#update").dialog("open");
}

function startTimer() {
	$("#timer").dialog("open");
	$("#controller").css("zIndex", 5000);
	$("#command").focus();
}

function vote() {
	$("#vote").dialog("open");
	$("#controller").css("zIndex", 5000);
	$("#command").focus();
	$("#vote-results").hide().removeClass();

	tally = [0, 0, 0];
	tallyResults();
	prompt("for?", tallyFor);
}

function tallyFor(input) {
	tally[0] = parseInt(input) || 0;
	tallyResults();
	prompt("against?", tallyAgainst);
}

function tallyAgainst(input) {
	tally[1] = parseInt(input) || 0;
	tallyResults();
	var estimate = parseInt($("#info-quorum").html()) - tally[0] - tally[1];
	prompt("abstaining?", tallyAbstain, (estimate > 0 ? estimate : "0"));
}

function tallyAbstain(input) {
	tally[2] = parseInt(input) || 0;
	tallyResults();

	var result = (tally[0] > Math.ceil(quorum / 2.0) )? "passes" : "fails";
	$("#vote-results").html(result).addClass(result);

	prompt("resolution " + result + ". reveal?", tallyReveal, "yes");
}

function tallyReveal() {
	$("#vote-results").show("slow");
	$("#controller").css("zIndex", 1);
	print("esc to exit");
}

function tallyResults() {
	$("#vote-tally").html("For " + tally[0] + ", Against " + tally[1] + ", Abstaining " + tally[2]);
}

function about() {
	print("v" + VERSION + " - developed by <a href=\"http://www.designbynikhil.com\">nikhil benesch</a>");
}

function mobile() {
	if (!socket.connected) {
		socket.connect();
		print("mobile connection initializing... code: " + socket.code);
	} else {
		print("mobile connection initialized. &nbsp;&nbsp;&nbsp; code: " + socket.code);
	}
}

function randomString(length) {
	var string = "";
	for (var i = 0; i < length; i++) {
		var num = Math.floor(Math.random() * 25) + 65;
		string += String.fromCharCode(num);
	}
	return string;
}

function setTitle(input) {
	title = input;
	$("#title").html(input);
}

function setQuorum(input) {
	quorum = parseInt(input);
	if (isNaN(quorum) && quorum !== null) {
		print("not a number");
		return;
	}
	$("#info-quorum").html(quorum + " delegates");
	$("#info-majority").html(Math.ceil(quorum / 2.0));
	$("#info-thirdmajority").html(Math.ceil(quorum * (2.0/3.0)));
	$("#info-20percent").html(Math.ceil(quorum * .20));
	$("#info-10percent").html(Math.ceil(quorum * .10));
}

function setTime(input) {
	time = parseInt(input);
	if (isNaN(time)) {
		print("not a number");
		return;
	}
	times[list] = time;

	$("#info-time").html(time + " seconds");
}

function setExtensions(input) {
	extension = parseInt(input);
	if (isNaN(extension)) {
		print("not a number");
		return;
	}
	extensions[list] = extension;

	prompt("set extension time to?", setExtensionTime, extensionTimes[list]);
}

function setExtensionTime(input) {
	time = parseInt(input);
	if (isNaN(time)) {
		print("not a number");
		return;
	}
	extensionTimes[list] = time;

	$("#info-extensions").html(extensions[list] + "x " + time + "s");
}

function switcher() {
	list++;
	if (list > 2) list = 0;

	boot();
}

function boot() {
	generateList();
	setTime(times[list]);
	setExtensionTime(extensionTimes[list]);
	if (quorum) setQuorum(quorum);
	$("#speaker-list-title").html(names[list] + " Speakers List");
	$("#info-time").css("color", "white");
	$("#info-extensions").css("color", "white");
	publishTime();

	clearTimeout(timer);
	timer = null;
}

function add(input) {
	if (input != "quit" && input != "q") {
		countries[list].push(findCountry(input));
		generateList();

		prompt("add? (q to exit)", add);
		isCountryPrompt = true;
	}
}

function extend() {
	rextensions = parseInt($("#info-extensions").html());
	if (rextensions > 0) {
		$("#info-time").css("color", "white");
		$("#info-extensions").html((rextensions - 1) + "x " + extensionTimes[list] + "s");
		$("#info-time").html((parseInt($("#info-time").html()) + extensionTimes[list]) + " seconds");
		publishTime();
	} else {
		$("#info-extensions").css("color", "red");
		print("no remaining extensions!")
	}
	clearTimeout(timer);
	timer = null;
}

function clear(input) {
	if (input == "yes") {
		countries[list] = [];
		current[list] = 0;
		generateList();
	}
}

function change(input) {
	print("which number?");
	country = parseInt(input);
	if (isNaN(country) || country > countries[list].length || country < 0) {
		print("invalid country");
		return;
	}

	prompt("change to?", changeTo);
	isCountryPrompt = true;
}

function changeTo(input) {
	countries[list][country-1] = findCountry(input);
	generateList();
}

function flip(input) {
	country = parseInt(input) - 1;
	if (isNaN(input) || input > countries[list].length || input < 0) {
		print("invalid country");
		return;
	}

	prompt("with?", flipper);
}

function flipper(input) {
	var country2 = parseInt(input) - 1;
	if (isNaN(country2) || country2 > countries[list].length || country2 < 0) {
		print("invalid country");
		return;
	}

	var temp = countries[list][country];
	countries[list][country] = countries[list][country2];
	countries[list][country2] = temp;

	generateList();
}

function insert(input) {
	country = findCountry(input);

	prompt("insert where?", insertWhere);
}

function insertWhere(input) {
	position = parseInt(input) - 1;
	if (isNaN(position) || position > countries[list].length || position < 0) {
		print("invalid country");
		return;
	}

	countries[list].splice(position, 0, country);
	generateList();
}

function deleter(input) {
	if (input != "quit" && input != "q") {
		country = parseInt(input);
		if (isNaN(country)) {
			print("not a number");
			return;
		}
		countries[list].splice(country - 1, 1);
		if (country < current[list]) current[list]--;

		generateList();

		prompt("delete? (q to exit)", deleter);
	}
}

function next() {
	if (current[list] <= countries[list].length - 2) current[list]++;
	boot();
}

function prev() {
	if (current[list] > 0) current[list]--;
	boot();
}

function generateList() {
	$("#speaker-list").html("");
	$("#speaker-list").removeClass().addClass("list" + list);
	if (list == 2) {
		var output = "<ul class=\"left\"><li class=\"bold\">For</li>";
		for (var i = 0; i < countries[list].length; i += 2) {
			var style = ">";
			if (i < current[list]) style = " class=\"strike\">";
			else if (i == current[list]) style = " class=\"current\">";
			output += "<li" + style + (i + 1) + ".&nbsp;&nbsp;" + countries[list][i] + "</li>";
		}

		output += "</ul><ul class=\"right\"><li class=\"bold\">Against</li>";
		for (var i = 1; i < countries[list].length; i += 2) {
			var style = ">";
			if (i < current[list]) style = " class=\"strike\">";
			else if (i == current[list]) style = " class=\"current\">";
			output += "<li" + style + (i + 1) + ".&nbsp;&nbsp;" + countries[list][i] + "</li>";
		}
		output += "</ul>";

		$("#speaker-list").html(output);
	} else {
		for (var i = 0; i < countries[list].length; i++) {
			var style = ">";
			if (i < current[list]) style = " class=\"strike\">";
			else if (i == current[list]) style = " class=\"current\">";
			$("#speaker-list").append("<li" + style + (i + 1) + ".&nbsp;&nbsp;" + countries[list][i] + "</li>");
		}
	}

	if (countries[list].length > 0 && $("#speaker-list li.current").length > 0) {
		$("#speaker-list").scrollTo($("#speaker-list li.current"));
	}
}

function findCountry(input) {
    if (input.length > 20) return input;
    var min = 5;
    var country = input;

    for (var i = 0; i < countryList.length; i++) {
      ld = levenshtein(input, countryList[i]);
      if (ld < min) {
      	min = ld;
        country = countryList[i];
      }
    }

	return country;
}

function levenshtein(a, b) {
    var si;
    var c;
    var n = a.length;
    var m = b.length;
    if (!n)
      return m;
    if (!m)
      return n;

    var mx = [];
    for (var i=0; i <= n; i++) {
      mx[i] = [];
      mx[i][0] = i;
    }
    for (var j = 0; j <= m; j++)
      mx[0][j] = j;
    for (var i = 1; i <= n; i++) {
      si = a.charAt(i - 1);
      for (var j = 1; j <= m; j++)
        mx[i][j] = Math.min(mx[i - 1][j] + 1, mx[i][j - 1] + 1, mx[i - 1][j - 1] + (si == b.charAt(j - 1) ? 0 : 1));
    }
    return mx[n][m];
}

function retrieve() {
	var obj = JSON.parse($.cookie("data"));
	if (obj) {
		if (obj.version != VERSION) {
			update();
			return;
		}
		quorum = obj.quorum;
		times = obj.times;
		countries = obj.countries;
		current = obj.current;
		extensions = obj.extensions;
		extensionTimes = obj.extensionTimes;
		mobileCode = obj.mobileCode;
		list = obj.list;
		title = obj.title;
		setTitle(title);
	} else {
		process("?");
	}
}

function store() {
	var obj = { quorum: quorum, times: times, countries: countries, current: current, extensions: extensions, extensionTimes: extensionTimes, mobileCode: mobileCode, title: title, list: list, version: VERSION };
	$.cookie("data", JSON.stringify(obj), { expires: 7000 });
}
