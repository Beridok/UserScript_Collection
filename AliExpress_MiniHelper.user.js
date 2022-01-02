// ==UserScript==
// @name         AliExpress mini Helper & Content Loader
// @namespace    http://tampermonkey.net/
// @version      0.1.3
// @description  Just scrolling down the page to retrieve more content instantly.
// @author       Beridok
// @match        https://www.aliexpress.com/item/*
// @match        https://pl.aliexpress.com/item/*
// @icon         https://www.google.com/s2/favicons?domain=aliexpress.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var delay = 1500;
    document.querySelector('.tab-content').scrollIntoView();
    setTimeout(() => { document.querySelector('#product-description').scrollIntoView(); }, delay );
    setTimeout(() => { document.querySelector('.product-main').scrollIntoView(); }, 2*delay);
})();