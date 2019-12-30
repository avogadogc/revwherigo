// ==UserScript==
// @name     revwhereigo
// @version  0.1
// @include  http://www.geocaching.com/*
// @include  https://www.geocaching.com/*
// @grant    none
// ==/UserScript==

function revwhereigo_crack() {
    var userText = $('.UserSuppliedContent').text()
    var codes = userText.match(/^[0-9]{6}$/gm).join(' ')

    // $ curl 'https://gc.de/async.php' --data 'decoded=104143 577896 165623&key=&encoded=&method=reversewherigo&decode=&encode=1'
    // {"decoded":"104143 577896 165623","key":"","encoded":"N 49\u00b0 45.674 E 013\u00b0 51.280","method":"reversewherigo","replace_encoded":0,"message":""}
    $.post(
        'https://gc.de/async.php',
        {method: 'reversewherigo', decoded: codes, encode: 1},
        function(data, status) {
            console.log('FLARE')
            if (data.message != '') {
                var msg = 'revwhereigo: Failed to decode the codes: ' + codes + '. "' + data.message + '"'
                console.log(msg)
            } else {
                console.log("revwhereigo: Updating cache note with " + data.encoded)
                revwhereigo_update_note(data.encoded)
            }
        }
    );
    return false
}

function revwhereigo_update_note(solution) {
    var rendered = $('#viewCacheNote')
    if (rendered.is(':visible')) {
        rendered.click()
    } else {
        console.log('revwhereigo: Note already open')
    }

    var textarea = $('#cacheNoteText')
    if (textarea.is(':visible')) {
        textarea = textarea[0]
        var line = "CRACKED:" + solution
        if (textarea.value.includes(line)) {
            // TODO do not open and save when not needed
            console.log('revwhereigo: Solution already present in note')
        } else {
            console.log('revwhereigo: Appending solution')
            textarea.value += ("\n" + line)
        }
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
