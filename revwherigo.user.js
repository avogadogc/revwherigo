// ==UserScript==
// @name            revwhereigo
// @author          https://github.com/avogadogc
// @description     Solve Reverse Whereigo caches by one click!
// @version         1.0
// @include         http://www.geocaching.com/geocache/*
// @include         https://www.geocaching.com/geocache/*
// @require         https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant           GM.xmlHttpRequest
// @connect         gc.de
// ==/UserScript==

function revwhereigo_crack() {
    // Read from isting or the personal note, the latter is usefull when hidden/obscured/etc.
    var userText = $('.UserSuppliedContent').text() + $('.PersonalCacheNote').text()

    var allCodes = userText.match(/^[0-9]{6}$/gm)
    if (allCodes === null || allCodes.length < 3) {
        window.alert('Cannot find 3 codes in listing or note. Found: ' + allCodes)
        return false
    }
    if (allCodes.length > 3) {
        console.log('Too many codes found: ' + allCodes)
        allCodes = allCodes.slice(0, 3)
    }
    var codes = allCodes.join('+')

    // $ curl 'https://gc.de/async.php' --data 'decoded=104143 577896 165623&key=&encoded=&method=reversewherigo&decode=&encode=1'
    // {"decoded":"104143 577896 165623","key":"","encoded":"N 49\u00b0 45.674 E 013\u00b0 51.280","method":"reversewherigo","replace_encoded":0,"message":""}
    GM.xmlHttpRequest({
        method: 'POST',
        url: 'https://gc.de/async.php',
        data: 'method=reversewherigo&decoded=' + codes + '&encode=1',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        onload: function(response) {
            var data = JSON.parse(response.responseText)
            if (data.message != '') {
                console.log('Failed to decode the codes: ' + codes + '. "' + data.message + '"')
            } else {
                console.log("Fetched solution " + data.encoded)
                revwhereigo_update_note(data.encoded)
            }
        }
    });

    return false
}

function revwhereigo_update_note(solution) {
    var coordsBar = $('#uxLatLon')
    coordsBar.click()
    console.log('opened')

    setTimeout(function(){
        var newCoords = $('#newCoordinates')
        newCoords.val(solution)
        console.log('pasted')
        $('#coordinateParse button').click()
        console.log('submitted')
        setTimeout(function(){
            let accept = $('#coordinateParseVerify .btn-cc-accept')
            accept.click()
            console.log('accepted')
        }, 500)
    }, 200);

}

(function() {
    'use strict';

    var typeIndicator = $('.cacheImage')[0].getAttribute('title')
    if (typeIndicator != 'Wherigo Cache') return;

    var button = document.createElement('a')
    button.classList.add('btn', 'btn-primary')
    button.style.fontSize = '2em'
    button.style.borderColor = button.style.backgroundColor = '#12508c'
    button.style.marginBottom = '1rem'
    button.appendChild(document.createTextNode("↬ Unreverse Whereigo ↬"))
    button.onclick = revwhereigo_crack
    var table = $('#ctl00_ContentBody_CacheInformationTable')[0]
    table.parentElement.insertBefore(button, table)
}());

