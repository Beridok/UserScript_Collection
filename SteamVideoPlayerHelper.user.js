// ==UserScript==
// @name         Steam VideoPlayer Helper
// @author       fapka
// @namespace    fapkamaster@gmail.com
// @version      0.2.2
// @description  Changing default playback options (speed and subtitles)
// @run-at       document-end
// @match        https://store.steampowered.com/video/watch/*
// @icon         https://www.google.com/s2/favicons?domain=steampowered.com
// @grant        none
// ==/UserScript==

console.info && console.info('%c »%s« %c version: %s',
        'background:#000000; color:#7ebe45', GM_info.script.name,
        'background:#3c424d; color:#ffffff', GM_info.script.version);

var desiredLanguage = "English"; //Case sensitive!
var desiredSpeed = 4; //0 = 50%, 1=90%, 2=100%, 3=110%, 4=120%, 5=150%, 6=200%

/* globals $J */

function changePlaybackSettings(){
    //Attempt at starting video without need to click on screen (failed at time of writing code)...
    //document.querySelector('.play_button').click(); //Does not work because of DASH Player shennanigans...
    //$J('#videoplayer').click(); //Neither this works...

    //Change the speed playback of the video...
    document.querySelector('#representation_select_playbackRate')[desiredSpeed].selected = true;
    $J('#representation_select_playbackRate').trigger("change");

    //when subtitles are visible...
    if ( document.getElementsByClassName('customize_captions')[0].style.display === "" )
    {
        //Changed language of subtitles...
        setTimeout(() => {
            var languageIndex = $J("#representation_select_captions > option:contains('"+desiredLanguage+"')").index();
            document.querySelector('#representation_select_captions').children[languageIndex].selected = true;
            $J('#representation_select_captions').trigger('change');
        }, 2400);
    }
}

(function() {
    "use strict";
    //loops this function till player is fully loaded, then change settings...
    var timer = setInterval(myFunction, 1000);
    function myFunction() {
        if ( document.querySelector('.loading_wrapper').style.display === "" ) {
            clearInterval(timer);
            changePlaybackSettings();
            return;
        }
    }
})();