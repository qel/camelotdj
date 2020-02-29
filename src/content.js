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

const HOLD_BIN_URL = 'https://www.beatport.com/hold-bin/tracks?per-page=150';

const POLLING_INTERVAL = 100;

// logging
const myLog = (...args) => console.log.apply(console, ['CamelotDJ:'].concat(args));

// convert key dataset to string -- note that the dataset stringifies everything
const keyStr = datasetObj => datasetObj.keyNum + (datasetObj.minor.toString() === 'true' ? 'A' : 'B');

// build the key selector
const keySelectButtons = [];
const mainContainer = document.createElement('div');
const keySelectContainer = document.createElement('div');
const keySelectLabel = document.createElement('a');
const keySelectGrid = document.createElement('div');
mainContainer.className = 'camelotdj-main';
keySelectContainer.className = 'inner-container';
keySelectLabel.className = 'key-label';
keySelectGrid.className = 'key-grid';
keySelectLabel.innerHTML = 'Camelot<strong>DJ</strong>';
keySelectLabel.href = HOLD_BIN_URL;
keySelectContainer.appendChild(keySelectLabel);
keySelectContainer.appendChild(keySelectGrid);
for (const minor of [true, false]) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'key-row';
    for (let keyNum = 1; keyNum <= 12; keyNum += 1) {
        const colDiv = document.createElement('div');
        colDiv.className = 'key-col';
        colDiv.textContent = keyStr({ keyNum, minor });
        colDiv.dataset.keyNum = keyNum;
        colDiv.dataset.minor = minor;
        keySelectButtons.push(colDiv);
        rowDiv.appendChild(colDiv);
    }
    keySelectGrid.appendChild(rowDiv);
}
mainContainer.appendChild(keySelectContainer);

// build row of links
const genreLinks = {};
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
    genreLinks[gNum] = a;
    linkRow.appendChild(a);
}
linkContainer.appendChild(linkLabel);
linkContainer.appendChild(linkRow);
mainContainer.appendChild(linkContainer);

// Selects a key basted on {keyNum, minor} object and stores matching keys in window.matchingKeys
const selectKey = datasetObj => {
    myLog('selectKey()', datasetObj);

    // reset all buttons to only the default class
    for (const btn of keySelectButtons) {
        btn.className = 'key-col';
    }

    if (datasetObj) {
        window.selectedKey = keyStr(datasetObj);
        const keyNum = parseInt(datasetObj.keyNum);
        const minor = datasetObj.minor.toString() === 'true';

        // put the selection in storage
        window.localStorage.setItem('camelotdj.keyNum', keyNum);
        window.localStorage.setItem('camelotdj.minor', minor);

        // prettier-ignore
        window.matchingKeys = [
            { keyNum, minor: !minor },                          // 8A ->  8B -- flipped major/minor
            { keyNum: ((keyNum + 10) % 12) + 1, minor },        // 8A ->  7A -- key -1
            { keyNum: (keyNum % 12) + 1, minor },               // 8A ->  9A -- key +1
            { keyNum: ((keyNum + 8) % 12) + 1, minor: !minor }, // 8A ->  5B -- key -3, flipped major/minor
            { keyNum: ((keyNum + 2) % 12) + 1, minor: !minor }  // 8A -> 11B -- key +3, flipped major/minor
        ].map(k => keyStr(k));

        // apply the correct classes to the buttons
        for (const btn of keySelectButtons) {
            const btnKeyStr = keyStr(btn.dataset);
            if (btnKeyStr === window.selectedKey) {
                btn.classList.add('selected');
            } else if (window.matchingKeys.includes(btnKeyStr)) {
                btn.classList.add('included');
            }
        }
    } else {
        window.selectedKey = null;

        // clear stored key
        window.localStorage.removeItem('camelotdj.keyNum');
        window.localStorage.removeItem('camelotdj.minor');
    }
};

const update = () => {
    // ['', 'cart', 'cart', 'BaSe64sTuFf==']
    // ['', 'hold-bin']
    // ['', 'genre', 'techno', '6', 'top-100']
    const splitPath = window.location.pathname.split('/');

    if (splitPath[1] === 'cart') {
        myLog("update() hiding while we're on the cart page...");
        keySelectContainer.style.display = 'none';
        return;
    } else {
        keySelectContainer.style.display = '';
    }

    if (splitPath[1] === 'genre' && splitPath[4] === 'top-100') {
        for (gNum of Object.keys(genreLinks)) {
            if (gNum == splitPath[3]) {
                genreLinks[gNum].className = 'selected';
            } else {
                genreLinks[gNum].className = '';
            }
        }
    }

    // Rewrite the Beatport Hold Bin (or top 40/100, or any track list) to have BPM / Key instead of Label
    const labels = Array.from(document.getElementsByClassName('buk-track-labels'));
    const header = labels.shift();
    const trackList = Array.from(document.querySelectorAll('li.track'));
    header.innerHTML = '<div>BPM</div><div>KEY</div>';

    if (window.selectedKey) {
        const showKeys = [window.selectedKey].concat(window.matchingKeys);
        myLog('update() filtering', showKeys);

        // Top 100s
        labels.forEach((p, i) => {
            const track = window.Playables.tracks[i];
            // This breaks in the main cart page !!!
            const camelot = keyToCamelot[beatportKeyToRekordboxKey[track.key]];
            p.innerHTML = `<div>${track.bpm}</div><div>${camelot}</div>`;
            if (showKeys && showKeys.indexOf(camelot) == -1) {
                trackList[i].style.display = 'none';
            } else {
                trackList[i].style.display = '';
            }
        });

        // Top 10s
        const tracks = Object.fromEntries(window.Playables.tracks.map(t => [t.id, t]));

        const topLabels = Array.from(document.getElementsByClassName('top-ten-track-label'));
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
    } else {
        // No selected key, so display everything
        labels.forEach((p, i) => {
            trackList[i].style.display = '';
        });
    }
};

// Beatport attaches track data to window.Playables.tracks, but the window object is sandboxed.
// Beatport uses a lot of AJAX, so we can't just load the data script on DOMContentLoaded.
// Seeing the XHR calls come in requires the tabs permission and a lot of fancy script injection.
// And we don't want to be re-parsing the data script on an interval just to see when it changed.
// So we just poll the current URL, and when it changes we parse the data script.
// We also flag the script element after we parse it so we know if the new one hasn't loaded yet.
const checkTrackData = () => {
    // did navigation happen?
    if (window.dataPathname !== window.location.pathname) {
        // do we have a data script?
        if ((window.dataScript = document.getElementById('data-objects'))) {
            // has the new datascript finished loading and replaced the last one we parsed?
            if (typeof window.dataScript.dataset.parsed === 'undefined') {
                eval(window.dataScript.text);
                // eval worked and we have the track data on the window object?
                if (window.Playables && window.Playables.tracks) {
                    window.dataScript.dataset.parsed = 'parsed';
                    myLog('Track eval OK! --', window.Playables.tracks.length, 'tracks loaded.');
                    const keyNum = window.localStorage.getItem('camelotdj.keyNum');
                    const minor = window.localStorage.getItem('camelotdj.minor');
                    if (keyNum && minor) {
                        selectKey({ keyNum, minor });
                    } else {
                        selectKey(null);
                    }
                    update();
                }
            }
        }
    }
};

// This fires when our extension initializes the first time -- so we attach our UI to the DOM here
const loadHandler = e => {
    myLog('DOMContentLoaded fired.');
    document.getElementsByClassName('header-bg-wrap')[0].appendChild(mainContainer);

    // Start polling
    setInterval(checkTrackData, POLLING_INTERVAL);
};
document.addEventListener('DOMContentLoaded', loadHandler);

const clickHandler = e => {
    const { classList, dataset } = e.target;
    if (classList.contains('key-col')) {
        if (classList.contains('selected')) {
            myLog('clickHandler() un-selected', dataset);
            selectKey(null);
        } else {
            myLog('clickHandler() selected', dataset);
            selectKey(dataset);
        }
        update();
    }
};
document.addEventListener('click', clickHandler);
