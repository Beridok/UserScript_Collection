// ==UserScript==
// @name         HLTB Shortcut for Steam Store
// @namespace    http://tampermonkey.net/
// @version      0.2.1
// @description  Games' title becomes right-clickable on Steam Store - it will lead to HLTB search with game's title query.
// @author       Beridok
// @match        https://store.steampowered.com/app/*
// @grant        none
// ==/UserScript==

/* globals $ */
var checkInterval = 100;

function waitFor(querySelector, callback) {
    var interval = setInterval(function() {
        if ( document.querySelector(querySelector) !== null ) {
            clearInterval(interval);
            callback();
        }
    }, checkInterval); //def was 200...
}

(function() {
    'use strict';
    var div = document.querySelector('.apphub_AppName');
    var gameName = div.textContent;
    var hltbURL = "https://howlongtobeat.com/?&q="+gameName;

    //Need to wait till element is visible...
    waitFor('.apphub_OtherSiteInfo', function() {
        //New button's HTML code...
        var hltbButtonHTML = '<a target="_blank" rel="noopener" class="btnv6_blue_hoverfade btn_medium" href="'+hltbURL+'"><span data-tooltip-text="Search in HowLongToBeat.com"><img class="ico16" src="https://howlongtobeat.com/img/hltb_brand.png"></span></a>';
        var communityHubButton = document.querySelector("#tabletGrid > div.page_content_ctn > div.page_title_area.game_title_area.page_content > div.apphub_HomeHeaderContent > div > div.apphub_OtherSiteInfo > a:nth-child(1)");
        communityHubButton.style.marginLeft = "4px"; //Small visual upgrade to separate buttons from each other
        communityHubButton.insertAdjacentHTML("beforebegin", hltbButtonHTML);
    });
})();