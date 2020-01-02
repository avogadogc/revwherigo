// ==UserScript==
// @name            revwhereigo
// @author          https://github.com/avogadogc
// @description     Solve Reverse Whereigo caches by one click!
// @version         0.3
// @include         http://www.geocaching.com/geocache/*
// @include         https://www.geocaching.com/geocache/*
// @require         https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @grant           GM.xmlHttpRequest
// @connect         gc.de
// ==/UserScript==

function revwhereigo_crack() {
    var userText = $('.UserSuppliedContent').text()
    var allCodes = userText.match(/^[0-9]{6}$/gm)
    if (allCodes.length != 3) {
        console.log('revwhereigo: Too few or too many codes found ' + allCodes)
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
                console.log('revwhereigo: Failed to decode the codes: ' + codes + '. "' + data.message + '"')
            } else {
                console.log("revwhereigo: Fetched solution " + data.encoded)
                revwhereigo_update_note(data.encoded)
            }
        }
    });

    return false
}

function revwhereigo_update_note(solution) {
    var line = "CRACKED:" + solution
    var rendered = $('span#viewCacheNote')
    if (rendered.is(':visible')) {

        if (rendered.text().includes(line)) {
            console.log('revwhereigo: Solution already present in note')
            return
        }

        rendered.click()
    } else {
        console.log('revwhereigo: Note already open')
    }

    var textarea = $('#cacheNoteText')
    if (textarea.is(':visible')) {
        textarea = textarea[0]
        console.log('revwhereigo: Appending solution')
        textarea.value += ("\n" + line)
    } else {
        console.log('revwhereigo: Area not open')
    }
    console.log('revwhereigo: Saving')
    $('#editCacheNote button:contains("Save")').click()
}

(function() {
    'use strict';

    var typeIndicator = $('.cacheImage')[0].getAttribute('title')
    if (typeIndicator != 'Wherigo Cache') return;

    var button = document.createElement('a')
    button.appendChild(document.createTextNode("Crack!"))
    button.setAttribute('href', '#')
    button.onclick = revwhereigo_crack
    $('h2')[0].appendChild(button)
}());
