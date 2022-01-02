// ==UserScript==
// @name        HLTB DefaultValuePicker
// @version     0.4.3
// @description Picks some values while submitting time by default - check lines 20-25 in script.
// @author      beridok
// @namespace   beridok@gmail.com
// @include     https://howlongtobeat.com/*
// @updateURL   https://dl.dropboxusercontent.com/s/diu8krl0mzro6o2/HLTB_US.user.js
// @run-at      document-end
// @grant       none
// @noframes
// ==/UserScript==

/* globals $ */

(function(){
    "use strict";

    var config = {
        platform : "PC", //Write default platform with exact Uppercase.
        field : "Completed", //Retired/Custom1/Custom2/Custom3/Playing/Backlog/Replays
        storefront : "Steam", //Name your default Storefront
        fp : true, //true/false/null => define if it should choose "Yes, first playthrough". Inputting 'false' will give "No, this is replay". Inputting 'none' will do nothing.
        df : 1, //Delay factor - increase this, if default options does not seem to load, due to slower connection to site.
    };

    console.info && console.info('%c «%s» %c—— %c %s ',
                                 'background:#000000; color:#7ebe45', GM_info.script.name,
                                 'background:#000000; color:dimgray',
                                 'background:#3c424d; color:#ffffff', GM_info.script.version);

    var gameID = window.location.search.substring(4);

    //Reason behind this approach is to simply change Div selectors, in case of something going wrong...
    var quickAddDivPlatform = '#quick_add_plat_'+gameID;
    var quickAddDivStorefront = '#quick_add_store_'+gameID;
    var submitDivPlatform = "fieldset.in:nth-child(5) > div:nth-child(1) > select:nth-child(2)";
    var submitDivStorefront = "fieldset.in:nth-child(5) > div:nth-child(2) > select:nth-child(2)";

    if ( config.df <= 0 ) { config.df = 1; }
    //Zabezpieczenie gdyby ktoś wpisał zero do konfiguracji. Potrzebne jest jakieś opóźnienie
    //Security in case of someone entering 0 as value... we need some delay factor

    //On game subpage, change value of quickadd buttons, according to defaults in script's config...
    if ( window.location.pathname === "/game" )
    {
        setTimeout(() => {
            //document.querySelector(quickAddDivPlatform).textContent = dc.platform;
            document.querySelector(quickAddDivPlatform).value = config.platform;
            document.querySelector(quickAddDivStorefront).value = config.storefront;
        }, 100*config.df );
    }

    //During submission of playthrough...
    if ( window.location.pathname === "/submit" ) {
        setTimeout(() => {
            //Depending on default value, click one of the checkboxes...
            //Minor bug: Does not check if already checkbox is check - therefore resulting in unchecking during edit of HLTB submission
            switch ( config.field ) {
                case "Completed":
                    document.querySelector('#list_cp').click();
                    break;
                case "Retired":
                    document.querySelector('#list_rt').click();
                    break;
                case "Custom1":
                    document.querySelector('#list_c').click();
                    break;
                case "Custom2":
                    document.querySelector('#list_c2').click();
                    break;
                case "Custom3":
                    document.querySelector('#list_c3').click();
                    break;
                case "Playing":
                    document.querySelector('#list_p').click();
                    break;
                case "Backlog":
                    document.querySelector('#list_b').click();
                    break;
                case "Replays":
                    document.querySelector('#list_r').click();
                    break;
                default:
                    console.log('You entered wrong "Add to List" field. Check line 20 in UserScript - uppercase and if there is no typographic error');
                    break;
            }

            //Select new values...
            document.querySelector(submitDivPlatform).value = config.platform;
            document.querySelector(submitDivStorefront).value = config.storefront;

            //Click "Steam icon" to pull current progress (time spent in the game so far);
            document.querySelector("fieldset.in:nth-child(8) > div:nth-child(1) > div:nth-child(1) > img:nth-child(1)").click();

            //setTimeout(() => {
            var firstPlaythrough = document.querySelector('#play_num').value;
            if ( config.fp === true ) { firstPlaythrough = 1; }
            else if ( config.fp === false ) { firstPlaythrough = 2; }
            else if ( config.fp === null ) { firstPlaythrough = 0; }
            else { console.log('You entered wrong "First Playthrough" value. Check line 22 in UserScript. It can only be: true, false or null.'); }
            //}, 50);

        }, 100*config.df );
    }

    //CODES below are saved for my own organizing purpose - to find them more easily in future needs...
    //They are too complex for regular use case by "end user"

    //---------------------------------------------------------------------
    //Code for subpage: https://howlongtobeat.com/steam
    //Default rules of importing Steam games - e.g. including "VR" would sign to my custom HLTB category named "VR". Similarly for "MMO" and "Multiplayer".
    /*
	var startTime = Date.now()
	var limit = $('.steam_table > tbody:nth-child(2)').rows.length;
	for ( let i = 1; i <= limit; i++)
	{
		var refDiv1 = $('tr.spreadsheet:nth-child('+i+') > td:nth-child(1)').textContent; //title
		var refDiv2 = $('tr.spreadsheet:nth-child('+i+') > td:nth-child(2)').textContent; //time
		var refDiv3 = $('tr.spreadsheet:nth-child('+i+') > td:nth-child(3) > select:nth-child(1)'); //list picker
		//list_ playing / backlog / replay / custom / custom2 / custom3 / comp / retired
		var refDiv2value = parseInt(refDiv2.substring(refDiv2.length-4, refDiv2.length-2));
		if ( refDiv1.indexOf('VR') > -1 )
		{
			refDiv3.value = "list_custom2"
		}
		else if ( refDiv1.indexOf('Online') > -1 || refDiv1.indexOf('MMO') > -1 || refDiv1.indexOf('Multiplayer') > -1)
		{
			refDiv3.value = "list_custom2"
		}
		else if ( refDiv2 === "--" || ( refDiv2value < 5 && refDiv2.length < 6) )
		{
			refDiv3.value = "list_backlog";
		}
		else
		{
			refDiv3.value = "list_retired";
			//refDiv3.value = "list_custom";
		}
	}
	var EndTime = Date.now()
	var DurTime = EndTime-startTime;
	console.log("Completed! Duration: "+parseInt(1+DurTime/1000)+" seconds");
	*/

    //---------------------------------------------------------------------
    //Code for saving form (answers to each game about adding to lists) of Steam import...
    /*
	var startTime = Date.now()
	var limit = $('.steam_table > tbody:nth-child(2)').rows.length;
	for ( let i = 1; i <= limit; i++)
	{
		var one = $('tr.spreadsheet:nth-child('+i+') > td:nth-child(1)').textContent;
		var two = $('tr.spreadsheet:nth-child('+i+') > td:nth-child(3) > select:nth-child(1)').value;
		console.log(one+"|"+two+'\n')
	}
	var EndTime = Date.now()
	var DurTime = EndTime-startTime;
	console.log("Completed! Duration: "+parseInt(1+DurTime/1000)+" seconds");
	*/

    //---------------------------------------------------------------------
    //Code for including answers back to form of Steam import...

    //put var gamesList above
    /*
	var startTime = Date.now()
	var limit = $('.steam_table > tbody:nth-child(2)').rows.length;
	for ( let i = 0; i < gamesList.length; i++)
	{
		var one = $('tr.spreadsheet:nth-child('+i+') > td:nth-child(1)').textContent;
		var two = $('tr.spreadsheet:nth-child('+i+') > td:nth-child(3) > select:nth-child(1)').value;
		var str = gamesList[i].split('|');
		for ( let j = 1; j <= limit; j++)
		{
			var onej = $('tr.spreadsheet:nth-child('+j+') > td:nth-child(1)').textContent;
			if ( onej === str[0] )
			{
			$('tr.spreadsheet:nth-child('+j+') > td:nth-child(3) > select:nth-child(1)').value = str[1];
			}
		}
		//console.log(one+"|"+two+'\n')
	}
	var EndTime = Date.now()
	var DurTime = EndTime-startTime;
	console.log("Completed! Duration: "+parseInt(1+DurTime/1000)+" seconds");
	*/

    //---------------------------------------------------------------------
    //Code for gathering list of links for lists like "Played"
    /*
	var startTime = Date.now()
	var limit = $('.user_game_list').children.length;
	var href = '', realhref = '';
	for ( let i = 1; i < limit; i++)
	{
		var ajdi = $('.user_game_list').children[i].id;
		href = $('#'+ajdi+' > tr:nth-child(1) > td:nth-child(4) > a:nth-child(3)').attributes.href.value
		realhref += window.location.origin + '/' + href + '\n'
		if ( i % 15 === 0 ){
			console.log(realhref);
			realhref = ''
		}
	}
	var EndTime = Date.now()
	var DurTime = EndTime-startTime;
	console.log("Completed! Duration: "+parseInt(1+DurTime/1000)+" seconds");
	*/
})();