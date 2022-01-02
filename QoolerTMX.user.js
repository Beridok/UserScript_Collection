// ==UserScript==
// @name         QooLer TMX
// @namespace    http://tampermonkey.net/
// @version      0.6.8
// @description  Adds few QoL features to TMX sections.
// @author       Beridok
// @match        *.tm-exchange.com/*
// @exclude      http://nations.tm-exchange.com/main.aspx?action=usershow
// @updateURL    https://dl.dropboxusercontent.com/s/tpyk3pry5bpj02i/TMXAPI.user.js
// @grant        none
// ==/UserScript==

//Script's showcase: https://www.youtube.com/watch?v=yDEnlD2BxW0
/*
Reason to have "else if", despite being negation of first 'if', is that there are multiple sub sites,
so each might have needed future tweaks, separate for each title.
*/

//Config part
//
var defaultState = "date"; //Change to "age", if "age" should appear first, instead of date (like you already clicked "get age".
var columnOrderNo = 0; //Position of new column. 0 = first, 5 = last.
var columnName = "Date"; //Name of new column.
var padRAW = 4; //Size of "empty" spaces in table of raw data.
var firstRowColor = "chocolate";
//
//End of config

console.info && console.info('%c «%s» %c—— %c %s ',
        'background:#000000; color:#7ebe45', GM_info.script.name,
        'background:#000000; color:dimlight',
        'background:#3c424d; color:#ffffff', GM_info.script.version);

//Coding...
var xch = window.location.origin.replace('https://', '').split('.'); //Splits URL domain part with "dots", to detect sections of TMX.
var storeMe = []; //Memory for dates, to restore pulled data. Avoids straining TMX API.
var clickableNow = false; //variable to prevent using button too early
var wrText;

if ( window.location.pathname !== "/apiget.aspx" ) {
    if ( xch[0] === "united" ) { wrText = document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1)').innerHTML; }
    else if ( xch[0] !== "united" ) { wrText = document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1)').innerHTML; }
}

if ( window.location.search === "?action=auto%23auto" ) { //Those stupid links in older TMX than Forever... it's cool to replace them when possible...
    if ( document.querySelector('#ShowBookmark') === null ) { console.log("Page does not have bookmark link."); } //If no bookmark link, log message into console...
    else { history.replaceState('nothing', 'Title', document.querySelector('#ShowBookmark').href); } // but if it exist, put bookmark link into address bar.
}

//Determines what is "track page". Must include "trackshow" in URL and be in tm-exchange domain.
if ( xch[1] === "tm-exchange" && wrText !== "No world record !" && window.location.search.indexOf('trackshow') > -1 )
{
    //This place is "Offline World Records" text within table with replays.
    var place = document.querySelector('#Table2 > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)');
    place.addEventListener('click', function (event) { APIclink(); }); //Get into API link on click

    //Creates button to convert dates to age, and vice versa...
    var button = document.createElement("Button"); //Create button.
    button.setAttribute("id", "apibutton"); //Attribute that allows addresing button.
    if ( defaultState === "date" ){
        button.setAttribute("class", "turn2age");
        button.innerHTML = "<a>Get Age</a>"; //What button contains.
    } //Attribute to change button, so it's toggle-able.
    else if ( defaultState === "age" ){
        button.setAttribute("class", "turn2date");
        button.innerHTML = "<a>Get Date</a>"; //What button contains.
    }

    //Attaches button to place near report button.
    if ( xch[0] === "united" ) { document.querySelector('#_ctl3_Windowrow10').insertBefore(button, document.querySelector('#_ctl3_DoReport2')); }
    else if ( xch[0] !== "united" ) { document.querySelector('#ctl03_Windowrow10').insertBefore(button, document.querySelector('#ctl03_DoReport2')); }

    //Avoid URL change while clicking newly added button...
    document.querySelector('#apibutton').addEventListener('click', function(event) { event.preventDefault(); });

    //Replace texts... (to fit the size)
    if ( xch[0] === "united" ) { document.querySelector('#_ctl3_DoReport2').innerHTML = "Report broken or cheated replay to moderators."; }
    else if ( xch[0] !== "united" ) { document.querySelector('#ctl03_DoReport2').innerHTML = "Report broken or cheated replay to moderators."; }

    //Make text align
    if ( xch[0] === "tmnforever" ) { document.querySelector('#ctl03_DoReport2').style = "float:right;margin-top:0.125rem;margin-right:2.3rem"; }//;margin-left:2.4rem"; }
    else if ( xch[0] === "united" ) { document.querySelector('#_ctl3_DoReport2').style = "float:right;margin-top:0.125rem;margin-right:2.3rem"; }//;margin-left:2.4rem"; }
    else { document.querySelector('#ctl03_DoReport2').style = "float:right;margin-top:0.125rem;margin-right:0.55rem"; } //margin-left:0.55rem"; } //Make text align}

	var placeAlt = document.querySelector('#apibutton');
    placeAlt.style = "font-size:inherit";
	placeAlt.addEventListener('click', function (event) { //this allows button to switch functions after each click...
        if ( clickableNow === true ) { //flag deciding if data has been yet parsed... only proceed if data is downloaded
            if ( placeAlt.className === "turn2age" ) {
                changeFormat2Age();
                placeAlt.className = "turn2date";
                placeAlt.innerHTML = "<a>Get Date</a>";
            }
            else {
                changeFormat2Date();
                placeAlt.className = "turn2age";
                placeAlt.innerHTML = "<a>Get Age</a>";
            }
        }
    });

    //RAW button.
    var placeRAW = document.querySelector('#apibutton').cloneNode(); //makes clone of "API button"
    placeAlt.after(placeRAW); //inserts into HTML
    placeRAW.textContent = "RAW";
    placeRAW.style = "margin-left:10px; float:right; font-size:inherit";
    placeRAW.setAttribute("id", "rawbutton");
    document.querySelector('#rawbutton').addEventListener('click', function(event) { event.preventDefault(); APIclink(); }); //Avoid URL change.
}

//In case of something I didn't predict, it will be displayed in console.
else if ( wrText === "No world record !" ) {
    console.log("Track has no replays uploaded.");
}
else {
    console.log("Unusual TMX link - current page is not exact track page.");
}

//Get into API link
function APIclink(){
	var locA = window.location.toString(); //Get current page link
	var locB = locA.replace('main', 'apiget').replace('trackshow', 'apitrackrecords'); //Turn trackpage link into API link.
	window.location.href = locB; //Navigate user into URL (changes URL without reloading page).
    //FROM: http://nations.tm-exchange.com/main.aspx?action=trackshow&id=1328#auto
	//INTO: http://nations.tm-exchange.com/apiget.aspx?action=apitrackrecords&id=1328#auto
}

//Function allwing to change style of all items of same class...
function styleMe(className, style2Apply) {
    var elems = document.querySelectorAll(className);
    var index = 0, length = elems.length;
    for ( ; index < length; index++) {
        elems[index].style = style2Apply;
    }
}

//When on API data display page...
if ( window.location.pathname === "/apiget.aspx" )
{
    //Initial labels for table
    var labels = ["Replay ID", "Player ID", "Player Name", "Time (ms)", "Replay Upload Date", "Track Version (Date)", "Param1", "Score"];
    if ( xch[0] === "united" ) { labels[3] = "Score / Time (ms)"; }
    var tempData = document.querySelector('body').textContent;
    var dataOfPlayers = tempData.split('\n');

    //Remove unnecessary characters from the content
    for ( let j = 0; j < dataOfPlayers.length; j++ )
    {
        if ( dataOfPlayers[j].indexOf('\n') > - 1 ) { dataOfPlayers[j] = dataOfPlayers[j].replace('\n', '').replace('\t\t\t', '\t').split('\t'); }
        else {
            dataOfPlayers[j] = dataOfPlayers[j].replace('\t\t\t', '\t').split('\t');
        }
        dataOfPlayers[j].pop();
    }
    if ( dataOfPlayers[0].length ) { labels.push("Param2", "Param3"); } //Add two parameters, if they exist.
    dataOfPlayers.unshift(labels); //Puts labels as first element of Array...
    if ( dataOfPlayers[dataOfPlayers.length-1] === "\n" ) { dataOfPlayers.pop(); } //For last element of array being Enter line, remove it...
    //console.log(dataOfPlayers); //debug

    function createTable(tableData) {
        var table = document.createElement('table');
        var tableBody = document.createElement('tbody');

        tableData.forEach(function(rowData) {
            var row = document.createElement('tr');

            rowData.forEach(function(cellData) {
                var cell = document.createElement('td');
                cell.appendChild(document.createTextNode(cellData));
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });

        table.cellPadding = "3";
        table.cellSpacing = "2";
        table.border = "3";
        table.setAttribute('style', 'float:left');
        table.appendChild(tableBody);
        //document.body.appendChild(table);
        document.querySelector('body').innerHTML = table.outerHTML;
    }

    createTable(dataOfPlayers);
    styleMe('td', 'padding:'+padRAW+'px');

    document.querySelector('body > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1)').style = "color:"+firstRowColor;
}

//Stolen from internet: https://stackoverflow.com/a/37256530
function dateDiff(date) {
    date = date.split('-');
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var yy = parseInt(date[0]);
    var mm = parseInt(date[1]);
    var dd = parseInt(date[2]);
    var years, months, days, result;
    // months
    months = month - mm;
    if (day < dd) {
        months = months - 1;
    }
    // years
    years = year - yy;
    if (month * 100 + day < mm * 100 + dd) {
        years = years - 1;
        months = months + 12;
    }
    // days
    days = Math.floor((today.getTime() - (new Date(yy + years, mm + months - 1, dd)).getTime()) / (24 * 60 * 60 * 1000));

    //double digit always...
    if ( days.toString().length === 1 ) { days = "0"+days; }
    if ( months.toString().length === 1 ) { months = "0"+months; }
    if ( years.toString().length === 1 ) { years = "0"+years; }

    //Rules of displaying. If differences are minimal... formatting shenannigans :D
    if ( days === "00" && months === "00" && years === "00" ) { result = "Today"; }
    else if ( days === "01" && months === "00" && years === "00" ) { result = "Yesterday"; }
    else if ( months === "00" && years === "00" ) { result = days+"d"; }
    else if ( years === "00" ) { result = months+"m"+days+"d"; }
    else { result = years+"y"+months+"m"+days+"d"; }
    return result;
}

function changeFormat2Age(){ //Change Date into Age displayed in YyMmDd (capital letters turns into digits).
    //Used below to read how many rows are in "Offline World Records" table.
    var tableRows;
    if ( xch[0] === "united" ) { tableRows = document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1)').children; }
	else if ( xch[0] !== "united" ) { tableRows = document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1)').children; }

    var columnNo = columnOrderNo+1;
    var replayDate, j;
	for ( let i = 0; i < tableRows.length; i++ ) //Iterate over each row...
	{
		if ( i === 0 || i === 2 || i === 12 ) { //one of "label" rows
            if ( xch[0] === "united" ) { document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1)').children[i].children[columnOrderNo].innerHTML = "Age"; }
			else if ( xch[0] !== "united" ) { document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1)').children[i].children[columnOrderNo].innerHTML = "Age"; }
        }
        else {
            j = i+1;
            //Get date from cell.
            if ( xch[0] === "united" ) { replayDate = document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child('+j+') > td:nth-child('+columnNo+')').innerHTML; }
			else if ( xch[0] !== "united" ) { replayDate = document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child('+j+') > td:nth-child('+columnNo+')').innerHTML; }

            var old = replayDate;
             //Align to right, for nicer looks. //Get date from cell. }
            if ( xch[0] === "united" ) { document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child('+j+') > td:nth-child('+columnNo+')').style = "text-align:right;"; }
			else if ( xch[0] !== "united" ) { document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child('+j+') > td:nth-child('+columnNo+')').style = "text-align:right;"; }
             //Replace field with formatted age.
            if ( xch[0] === "united" ) { document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child('+j+') > td:nth-child('+columnNo+')').innerHTML = dateDiff(old); }
			else if ( xch[0] !== "united" ) { document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child('+j+') > td:nth-child('+columnNo+')').innerHTML = dateDiff(old); }
        }
    }
}

function changeFormat2Date() {
	var tableRowsCount;
     //Read how many rows are in "Offline World Records" table.
    if ( xch[0] === "united" ) { tableRowsCount = document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1)').children.length; }
    else if ( xch[0] !== "united" ) { tableRowsCount = document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1)').children.length; }
	for ( let i = 0; i < tableRowsCount; i++ ) //Iterate over every element in table...
	{
		//Not all rows in table are data - some are labels (e.g. "Score").
		//And rows number is bigger than player data.
		var j = 0;
		if ( i == 0 ) { j = 0; } // I think it doesn't matter at all XD
		else if ( i < 2 ) { j = i-1; } //First row
		else if ( i < 12 ) { j = i-2; } //Third row
		else if ( i >= 12 ) { j = i-3; } //Pre-last row (if you're out of top10)

        var ROW;
        //Current row from table to work on
        if ( xch[0] === "united" ) { ROW = document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1)').children[i].children[columnOrderNo]; }
		else if ( xch[0] !== "united" ) { ROW = document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1)').children[i].children[columnOrderNo]; }
		if ( i === 0 || i === 2 || i === 12 ) { //one of "label" rows
			ROW.innerHTML = columnName; //Put new column name
		}
		else {
			var timed = storeMe[j][4];
			ROW.innerHTML = timed.substring(0,10);
		}
	}

} //Get data back to Date format.

//Function below process response of API into result on screen.
//Which is adding another column and insert data in each new cell.
function processResponse(XMLresponse){
	var time = '', newCell = [], dataPlayers; //Variables to be replaced later
    dataPlayers = XMLresponse.split('<BR>'); //<BR> is separator of raw data. Splits data into 11 arrays. }
    storeMe = dataPlayers; //store data in separate variable
	//console.log(dataPlayers);

    //for older type of TMX website... (pre-TMNF)
    if ( xch[0] !== "tmnforever" && xch[0] !== "united" ){
        styleMe('.WindowTableCell1 td', 'padding:1px 2px 1px 2px');
        styleMe('.WindowTableCell2 td', 'padding:1px 2px 1px 2px');
    }

    //Read how many rows are in "Offline World Records" table.
	var tableRowsCount;
    if ( xch[0] === "united" ) { tableRowsCount = document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1)').children.length; }
    else if ( xch[0] !== "united" ) { tableRowsCount = document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1)').children.length; }

	for ( let i = 0; i < tableRowsCount; i++ ) //Iterate over every element in table...
	{
		//Not all rows in table are data - some are labels (e.g. "Score").
		//And rows number is bigger than player data.
		var j = 0;
		if ( i == 0 ) { j = 0; } // I think it doesn't matter at all XD
		else if ( i < 2 ) { j = i-1; } //First row
		else if ( i < 12 ) { j = i-2; } //Third row
		else if ( i >= 12 ) { j = i-3; } //Pre-last row (if you're out of top10)

		var ROW;
        if ( xch[0] === "united" ) { ROW = document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1)').children[i]; }
        else if ( xch[0] !== "united" ) { ROW = document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1)').children[i]; } //Current row from table to work on
		if ( i === 0 || i === 2 || i === 12 ) { //one of "label" rows
			newCell[i] = ROW.insertCell(columnOrderNo); //insert new cell in position
			newCell[i].innerHTML = columnName; //Put new column name
			if ( i === 0 ) {
				newCell[i].width = "36"; //Change width to sustain space...
				newCell[i].className = "WindowHeader1"; //Put same style (of header)
				}
			else {
				newCell[i].className = "WindowHeader2"; //Put same style (of header)
			}
		}
		else {
            //Formatting shennanigans - split data into well formatted arrays...
			if ( dataPlayers[j].indexOf('\r\n') > - 1 )
			{
				dataPlayers[j] = dataPlayers[j].replace('\r\n', '').split('\t');
			}
			else {
                dataPlayers[j] = dataPlayers[j].split('\t');
            }
			time = dataPlayers[j][4]; //this cell contains age of replay...
			newCell[i] = ROW.insertCell(columnOrderNo); //Put data into cell...
			newCell[i].innerHTML = time.substring(0,10); //Crop data to only first 10 characters - so it's YYYY-MM-DD (without hours and minutes).
            ROW.children[0].style = "text-align:right";
		}
	}

    //Some adjustments to width of columns, so it fits all data. Might need to tweak it in future.
    //Adds a little more gap in the table
    if ( xch[0] === "united" ) { document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1)').cellSpacing = "1"; }
    else if ( xch[0] !== "united" ) { document.querySelector('#ctl03_Windowrow11 > table:nth-child(1)').cellSpacing = "1"; }
    document.querySelector('td.WindowHeader1:nth-child(1)').width = 55;

    //Switch from "World Record" to shorter name, to keep one line formatting in some cases, e.g. Kappa's nickname here: http://nations.tm-exchange.com/main.aspx?action=trackshow&id=2661#auto
    var outdated = false; //To address outdated replays (track was updated)
    if ( document.querySelectorAll('.icon-exclamation-sign').length > 2 ) { outdated = true; }

    //table columns width shennanigans
    var WRlength;
    if ( xch[0] !== "united" ) {
        WRlength = document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > a:nth-child(1)').textContent.trim().length;
    }
    else if ( xch[0] === "united" ) {
        document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').textContent = "WR";
        WRlength = document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > a:nth-child(1)').textContent.trim().length;
        if ( WRlength == 7 ) { document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').width = 26; }
        else if ( WRlength == 8 ) { document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').width = 28; }
        else if ( WRlength == 9 ) { document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').width = 32; }
        else if ( WRlength >= 10 ) { document.querySelector('#_ctl3_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').width = 38; }
        if ( outdated === true ) {
            var current = parseInt(document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').width);
            current += 6; //increase width by 6
            document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').width = current;
        }
    }
    console.log(WRlength);

    if ( xch[0] !== "united" ) {
        document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').textContent = "WR";
        if ( xch[0] === "tmnforever" )
        {
            //document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2)').style["font-weight"] === "bold"
            if ( WRlength == 7 ) { document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').width = 26; }
            else if ( WRlength == 8 ) { document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').width = 28; }
            else if ( WRlength == 9 ) { document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').width = 32; }
            else if ( WRlength >= 10 ) { document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').width = 38; }
        } //#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)
        else { document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').width = 52; }
        if ( outdated === true ) {
            var currentX = parseInt(document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').width);
            currentX += 6; //increase width by 6
            document.querySelector('#ctl03_Windowrow11 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').width = currentX;
        }
    }
    //No "else if", because it might need to override (overwrite?) some widths that were declared earlier (above)
	if ( xch[0] === "tmnforever" || xch[0] === "united" ){
        document.querySelector('td.WindowHeader1:nth-child(1)').width = 33;
        document.querySelector('td.WindowHeader1:nth-child(4)').width = 38;
        document.querySelector('td.WindowHeader1:nth-child(5)').width = 15; //Score
        document.querySelector('td.WindowHeader1:nth-child(6)').width = 6; //LB
    }
    //styleMe('.WindowTableCell1', 'padding:1px 3px 1px 3px');
}

(function APIlinkShow(){
    if ( wrText !== "No world record !" )
    {
        var locA = window.location.toString(); //Get current page URL
        var locB = locA.replace('main', 'apiget').replace('trackshow', 'apitrackrecords');
        //replace parts of URL to get "API LINK", that pulls data

        var xmlhttp = new XMLHttpRequest; //JSHint suggests including brackets?
        xmlhttp.onreadystatechange = function(){
            if( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) //Only on successful try...
            {
                var response = xmlhttp.responseText;
                clickableNow = true;
                processResponse(response); //Calls function to change page based on data.
                if ( defaultState === "age" ) { changeFormat2Age(); } //If someone prefers age over "date", then format it immediately after pulling data
            }
        };
        xmlhttp.open('GET', locB); //Here we point where is data.
        xmlhttp.send();
    }
}
)(); //Autolaunch function