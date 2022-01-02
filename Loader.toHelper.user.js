// ==UserScript==
// @name         LOADER.TO Helper
// @namespace    fapkamaster@gmail.com
// @version      0.3.3
// @description  Automatic click, when loading is done - to download videos from Youtube...
// @author       Beridok
// @match        https://loader.to/api/button/?url=https://www.youtube.com/watch?v=*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
console.info && console.info('%c »%s« %c version: %s',
                             'background:#000000; color:#7ebe45', GM_info.script.name,
                             'background:#3c424d; color:#ffffff', GM_info.script.version+' ');
    //Turns YT link into...
    //https://www.youtube.com/watch?v=gYY7QxGR5mo
    //f can be resolution of video or audio format
    //https://loader.to/api/button/?url=https://www.youtube.com/watch?v=gYY7QxGR5mo&f=1080

    //Code from https://stackoverflow.com/a/29754070
    function waitForElementToDisplay(selector, callback, checkFrequencyInMs, timeoutInMs) {
        var startTimeInMs = Date.now();
        (function loopSearch() {
            if (document.querySelector(selector) != null) {
                callback();
                return;
            }
            else {
                setTimeout(function () {
                    if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs)
                    {
                        return;
                    }
                    loopSearch();
                }, checkFrequencyInMs);
            }
        })();
    }

    function progressLoop(){
        setTimeout(() => {
            onClick(); //Function appearing on website...
        }, 1000);
        setInterval(() => {
            //Allow download after progress bar changed it's content - it's finished...
            var prog = document.querySelector('#percentageText').textContent.trim();
            if ( prog === "Download Now!" )
            {
                document.querySelector('#downloadButton').click();
                setTimeout(() => { window.close(); }, 5000);
            }
        }, 7500);

        //When website is stuck at 0% for longer time, reload it.
        setTimeout(() => {
            if ( document.querySelector('#percentageText').textContent.trim() === "0% done" ) {
                window.location.reload();
            }
        }, 900*1000);
    }

    waitForElementToDisplay("#buttonTitle", progressLoop, 1000, 900*1000);

})();