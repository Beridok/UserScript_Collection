// ==UserScript==
// @name         CDA AutoQuality Switch [outdated]
// @namespace    http://tampermonkey.net/
// @version      0.2.2
// @description  Automatycznie zmienia jakość filmu na CDA - na 720p, jeżeli dostępne.
// @author       Beridok
// @match        https://www.cda.pl/video/*
// @grant        none
// ==/UserScript==

console.info && console.info('%c «%s» %c—— %c %s ',
        'background:#000000; color:#7ebe45', GM_info.script.name,
        'background:#000000; color:dimlight',
        'background:#3c424d; color:#ffffff', GM_info.script.version);

/* globals $ */

(function() {
    'use strict';
    //Config
    //var quality = "720p";
    var quality = "1080p";

    //Przyciski jakości - już nie istnieją pod filmem, dlatego skrypt jest przestarzały...
    var div480 = $('#player > div.brdPlayerWrapper.pb-normal-size > div:nth-child(3) > div.areaquality > div > a:nth-child(3)');
    var div720 = $('#player > div.brdPlayerWrapper.pb-normal-size > div:nth-child(3) > div.areaquality > div > a:nth-child(4)');
    var div1080 = $('#player > div.brdPlayerWrapper.pb-normal-size > div:nth-child(3) > div.areaquality > div > a:nth-child(5)');
    var div2Check;
    if ( quality === "480p" ) { div2Check = div480; }
    else if ( quality === "720p" ) { div2Check = div720; }
    else if ( quality === "1080p" ) { div2Check = div1080; }
    function checkQuality(qual){
        console.log("Checking...");
        if ( div2Check.text() === qual )
        {
			//video is already in desired quality
            if ( div2Check.attr('class') === "quality-btn quality-btn-active" )
            {
                console.log("Quality is already "+quality+"."); //do nothing
            }
			//Otherwise change to desired quality
            else {
                console.log("Changing quality to "+quality+".");
                window.location.search = "?wersja="+quality;
            }
        }
        else {
			//No available video quality - change to lower existing...
            console.log("Film nie ma dostępnej jakości "+quality+".");
            if ( quality === "1080p" ) { div2Check = div720; }
            else if ( quality === "720p" ) { div2Check = div480; }
            checkQuality(quality);
        }
    }
    checkQuality(quality);
})();