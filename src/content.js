chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === 'complete') {
            clearInterval(readyStateCheckInterval);

            // ----------------------------------------------------------
            // This part of the script triggers when page is done loading
            console.log('Hello. This message was sent from src/content.js');
            // ----------------------------------------------------------
        }
    }, 10);
});

// prettier-ignore
beatportKeyToRekordboxKey = {
    'C maj':  'C',                    'C min':  'Cm',
    'C♯ maj': 'Db',  'D♭ maj': 'Db',  'C♯ min': 'Dbm', 'D♭ min': 'Dbm',
    'D maj':  'D',                    'D min':  'Dm',
    'D♯ maj': 'Eb',  'E♭ maj': 'Eb',  'D♯ min': 'Ebm', 'E♭ min': 'Ebm',
    'E maj':  'E',                    'E min':  'Em',
    'F maj':  'F',                    'F min':  'Fm',
    'F♯ maj': 'F#',  'G♭ maj': 'F#',  'F♯ min': 'F#m', 'G♭ min': 'F#m',
    'G maj':  'G',                    'G min':  'Gm',
    'G♯ maj': 'Ab',  'A♭ maj': 'Ab',  'G♯ min': 'Abm', 'A♭ min': 'Abm',
    'A maj':  'A',                    'A min':  'Am',
    'A♯ maj': 'Bb',  'B♭ maj': 'Bb',  'A♯ min': 'Bbm', 'B♭ min': 'Bbm',
    'B maj':  'B',                    'B min':  'Bm'
}

// prettier-ignore
keyToCamelot = {
    'Abm':  '1A',   'B':   '1B',
    'Ebm':  '2A',   'F#':  '2B',
    'Bbm':  '3A',   'Db':  '3B',
    'Fm':   '4A',   'Ab':  '4B',
    'Cm':   '5A',   'Eb':  '5B',
    'Gm':   '6A',   'Bb':  '6B',
    'Dm':   '7A',   'F':   '7B',
    'Am':   '8A',   'C':   '8B',
    'Em':   '9A',   'G':   '9B',
    'Bm':  '10A',   'D':  '10B',
    'F#m': '11A',   'A':  '11B',
    'Dbm': '12A',   'E':  '12B'
}

// logging
const myLog = msg => {
    console.log('CamelotDJ:', msg);
};

// build the key selector
const keySelectDiv = document.createElement('div');
keySelectDiv.className = 'key-select';
for (const keyLetter of ['A', 'B']) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'key-row';
    for (let keyNum = 1; keyNum <= 12; keyNum += 1) {
        const colDiv = document.createElement('div');
        colDiv.className = 'key-col';
        colDiv.textContent = keyNum + keyLetter;
        colDiv.dataset.keyNum = keyNum;
        colDiv.dataset.minor = keyLetter === 'A';
        rowDiv.appendChild(colDiv);
    }
    keySelectDiv.appendChild(rowDiv);
}

// array of key button elements
const keyBtn = Array.from(document.getElementsByClassName('key-col'));

// convert key dataset to string
const keyStr = datasetObj => datasetObj.keyNum + (datasetObj.minor ? 'A' : 'B');

const selectKey = datasetObj => {
	// figure out all the keys we need to show
	const keyNum = datasetObj.keyNum;
	const minor  = datasetObj.minor;
    const showKeys = [
        { keyNum, minor }, // 8A
        { keyNum, minor: !minor }, // 8A ->  8B -- flipped major/minor
        { keyNum: ((keyNum + 10) % 12) + 1, minor }, // 8A ->  7A -- key -1
        { keyNum: (keyNum % 12) + 1, minor }, // 8A ->  9A -- key +1
        { keyNum: ((keyNum + 8) % 12) + 1, minor: !minor }, // 8A ->  5B -- key -3, flipped major/minor
        { keyNum: ((keyNum + 2) % 12) + 1, minor: !minor } // 8A -> 11B -- key +3, flipped major/minor
    ].map(k => keyStr(k));

    // apply the correct classes to the buttons
    for (const btn of keyBtn) {
        const btnKeyStr = keyStr(btn.dataset);
        btn.className = 'key-col';
        if (showKeys.includes(btnKeyStr)) {
            if (btnKeyStr === showKeys[0]) {
                btn.className.add('selected');
            } else {
                btn.className.add('included');
            }
        }
    }

    // put the selection in storage
    chrome.storage.local.set({ keyNum, minor });

    return showKeys;
};

const update = showKeys => {
    // Rewrite the Beatport Hold Bin (or top 40/100, or any track list) to have BPM / Key instead of Label
    const labels = Array.from(
        document.getElementsByClassName('buk-track-labels')
    );
    const header = labels.shift();
    const trackList = Array.from(document.querySelectorAll('li.track'));
    header.innerHTML = '<div>BPM</div><div>KEY</div>';

    labels.forEach((p, i) => {
        const track = window.Playables.tracks[i];
        const camelot = keyToCamelot[beatportKeyToRekordboxKey[track.key]];
        p.innerHTML = `<div>${track.bpm}</div><div>${camelot}</div>`;
        if (showKeys.indexOf(camelot) == -1) {
            trackList[i].style.display = 'none';
        }
    });

    // Top 10s
    const tracks = Object.fromEntries(
        window.Playables.tracks.map(t => [t.id, t])
    );

    const topLabels = Array.from(
        document.getElementsByClassName('top-ten-track-label')
    );
    topLabels.forEach((el, i) => {
        const id = el.parentNode.parentNode.dataset.ecId;
        const track = tracks[id];
        el.style.color = '#fff';
        el.innerHTML = `<div style="display: inline-block; width: 3rem;">${track.bpm}</div><div style="display: inline-block; width: 3rem; text-align: right;">${keyToCamelot[beatportKeyToRekordboxKey[track.key]]}</div>`;
    });
};

const main = () => {
	document.getElementsByClassName('header-bg-wrap')[0].appendChild(keySelectDiv);

	const keyNum = localStorage.getItem('keyNum');
    const minor = localStorage.getItem('minor');

	// chrome.storage.local.get(['keyNum', 'minor'], store => {
	//     if (typeof store.keyNum === 'number' && typeof store.minor === 'boolean') {
	//         selectKey(store);
	//     }
	// });

    if (typeof keyNum === 'number' && typeof minor === 'boolean') {
        update(selectKey(btn.dataset));
    }
};

// window object is sandboxed, so we manually eval the Beatport track data script
document.addEventListener('DOMContentLoaded', e => {
    const dataScript = document.getElementById('data-objects');
    if (dataScript) {
        eval(dataScript.text);
        if (window.Playables && window.Playables.tracks) {
            myLog('track eval OK!');
            main();
        } else {
            myLog('Beatport track data not found.');
        }
    }
});

const clickHandler = e => {
    if (this.classList.contains('key-col')) {
        if (this.classList.contains('selected')) {
            // we clicked the selected key, so unselect everything
            for (const btn of keyBtn) {
                btn.className = 'key-col';
            }
            update(null);
        } else {
            // select the key and update the page
            update(selectKey(btn.dataset));
        }
    }
};

document.addEventListener('click', clickHandler);
