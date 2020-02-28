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

// prettier-ignore
const linkGenres = {
    'techno':      6,
    'tech-house':  11,
    'house':       5,
    'deep-house':  12,
    'bass-house':  91,
    'melodic-h-t': 90,
    'trance':      7,
    'indie-dance': 37
};

// logging
const myLog = (...args) =>
    console.log.apply(console, ['CamelotDJ:'].concat(args));

// build the key selector
const keySelectButtons = [];
const mainContainer = document.createElement('div');
const keySelectContainer = document.createElement('div');
const keySelectLabel = document.createElement('div');
const keySelectGrid = document.createElement('div');
mainContainer.className = 'camelotdj-main';
keySelectContainer.className = 'inner-container';
keySelectLabel.className = 'key-label';
keySelectGrid.className = 'key-grid';
keySelectLabel.innerHTML = 'Camelot<strong>DJ</strong>';
keySelectContainer.appendChild(keySelectLabel);
keySelectContainer.appendChild(keySelectGrid);
for (const keyLetter of ['A', 'B']) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'key-row';
    for (let keyNum = 1; keyNum <= 12; keyNum += 1) {
        const colDiv = document.createElement('div');
        colDiv.className = 'key-col';
        colDiv.textContent = keyNum + keyLetter;
        colDiv.dataset.keyNum = keyNum;
        colDiv.dataset.minor = keyLetter === 'A';
        keySelectButtons.push(colDiv);
        rowDiv.appendChild(colDiv);
    }
    keySelectGrid.appendChild(rowDiv);
}
mainContainer.appendChild(keySelectContainer);

// build row of links
const linkContainer = document.createElement('div');
const linkLabel = document.createElement('div');
const linkRow = document.createElement('div');
linkContainer.className = 'inner-container';
linkLabel.className = 'link-label';
linkRow.className = 'link-row';
linkLabel.innerHTML = 'top<strong>100</strong>s';
for (const [gName, gNum] of Object.entries(linkGenres)) {
    const a = document.createElement('a');
    a.href = `https://www.beatport.com/genre/${gName}/${gNum}/top-100`;
    a.textContent = gName;
    linkRow.appendChild(a);
}
linkContainer.appendChild(linkLabel);
linkContainer.appendChild(linkRow);
mainContainer.appendChild(linkContainer);

// convert key dataset to string -- note that the dataset stringifies everything
const keyStr = datasetObj =>
    datasetObj.keyNum + (datasetObj.minor.toString() === 'true' ? 'A' : 'B');

const selectKey = datasetObj => {
    myLog('selectKey()', keyStr(datasetObj));

    // figure out all the keys we need to show
    const keyNum = parseInt(datasetObj.keyNum);
    const minor = datasetObj.minor.toString() === 'true';
    // prettier-ignore
    const showKeys = [
        { keyNum, minor }, 									// 8A
        { keyNum, minor: !minor },							// 8A ->  8B -- flipped major/minor
        { keyNum: ((keyNum + 10) % 12) + 1, minor }, 		// 8A ->  7A -- key -1
        { keyNum: (keyNum % 12) + 1, minor }, 				// 8A ->  9A -- key +1
        { keyNum: ((keyNum + 8) % 12) + 1, minor: !minor }, // 8A ->  5B -- key -3, flipped major/minor
        { keyNum: ((keyNum + 2) % 12) + 1, minor: !minor } 	// 8A -> 11B -- key +3, flipped major/minor
    ].map(k => keyStr(k));

    // apply the correct classes to the buttons
    for (const btn of keySelectButtons) {
        const btnKeyStr = keyStr(btn.dataset);
        btn.className = 'key-col'; // reset all buttons to only the default class
        if (showKeys.includes(btnKeyStr)) {
            if (btnKeyStr === showKeys[0]) {
                btn.classList.add('selected');
            } else {
                btn.classList.add('included');
            }
        }
    }

    // put the selection in storage
    chrome.storage.local.set({ keyNum, minor });

    return showKeys;
};

const update = showKeys => {
    myLog('update() filtering', showKeys);

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
        if (showKeys && showKeys.indexOf(camelot) == -1) {
            trackList[i].style.display = 'none';
        } else {
            trackList[i].style.display = '';
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
        el.innerHTML = `<div style="display: inline-block; width: 3rem;">${
            track.bpm
        }</div><div style="display: inline-block; width: 3rem; text-align: right;">${
            keyToCamelot[beatportKeyToRekordboxKey[track.key]]
        }</div>`;
    });
};

// This fires when our extension initializes the first time -- so we attach our UI to the DOM here
document.addEventListener('DOMContentLoaded', e => {
    myLog('DOMContentLoaded fired.');
    document
        .getElementsByClassName('header-bg-wrap')[0]
        .appendChild(mainContainer);
});

const POLLING_INTERVAL = 100;
const MAX_WAIT_TIME = 15000;
window.loadWaitTime = 0;

// The window object is sandboxed, so we manually eval the Beatport track data script each time a page loads.
// The webNavigation API only works in the background script, so we have to use messaging to trigger the reload.
const navigationHandler = (request, sender, sendResponse) => {
	if (!request.retry) {
		myLog('Nagivated to', request.navigatedTo);
	}
	const dataScript = document.getElementById('data-objects');
    if (dataScript) {
        if (dataScript.dataset.loaded) {
            // already loaded this data ... wait for the XHR request and try again
			window.loadWaitTime += POLLING_INTERVAL;
			request.retry = 'retry';
            setTimeout(() => navigationHandler(request), POLLING_INTERVAL);
            return;
        }
        eval(dataScript.text);
        if (window.Playables && window.Playables.tracks) {
            dataScript.dataset.loaded = 'loaded';
            myLog(
                'Track eval OK! --',
                window.Playables.tracks.length,
                'tracks loaded after',
                window.loadWaitTime,
                'ms.'
            );
            window.loadWaitTime = 0;
        } else {
            myLog('Beatport track data not found.');
        }
    }
    chrome.storage.local.get(['keyNum', 'minor'], store => {
        if (
            typeof store.keyNum === 'number' &&
            typeof store.minor === 'boolean'
        ) {
            myLog('retrieved selected key from storage:', store);

            update(selectKey(store));
            chrome.extension.sendMessage({ key: keyStr(store) });
        }
    });
};
chrome.runtime.onMessage.addListener(navigationHandler);

// Beatport uses a lot of AJAX, so we poll the current URL to look for psuedo-navigation.
// This is a whole lot less complicated than trying to see when a new XHR request loads!
const checkLocation = oldUrl => {
    const newUrl = window.location.href;
    if (oldUrl !== newUrl) {
        navigationHandler({ navigatedTo: newUrl });
    }
    setTimeout(checkLocation, POLLING_INTERVAL, newUrl);
};
checkLocation(window.location.href);

const clickHandler = e => {
    const clickedClassList = e.target.classList;

    if (clickedClassList.contains('key-col')) {
        const clickedBtnDataset = e.target.dataset;

        myLog('clickHandler()', clickedBtnDataset);

        if (clickedClassList.contains('selected')) {
            myLog('clickHandler() -- unselected');

            // we clicked the selected key, so unselect everything
            for (const btn of keySelectButtons) {
                btn.className = 'key-col';
            }
            update(null);
            chrome.extension.sendMessage({ key: '' });
        } else {
            // select the key and update the page
            update(selectKey(clickedBtnDataset));
            chrome.extension.sendMessage({ key: keyStr(clickedBtnDataset) });
        }
    }
};

document.addEventListener('click', clickHandler);
