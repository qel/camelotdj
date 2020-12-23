// prettier-ignore
const beatportKeyToCamelotKey = {
    'G♯ min':  '1A',    'A♭ min':  '1A',    'B maj':   '1B',
    'D♯ min':  '2A',    'E♭ min':  '2A',    'F♯ maj':  '2B',    'G♭ maj':  '2B',
    'A♯ min':  '3A',    'B♭ min':  '3A',    'C♯ maj':  '3B',    'D♭ maj':  '3B',
    'F min':   '4A',                        'G♯ maj':  '4B',    'A♭ maj':  '4B',
    'C min':   '5A',                        'D♯ maj':  '5B',    'E♭ maj':  '5B',
    'G min':   '6A',                        'A♯ maj':  '6B',    'B♭ maj':  '6B',
    'D min':   '7A',                        'F maj':   '7B',
    'A min':   '8A',                        'C maj':   '8B',
    'E min':   '9A',                        'G maj':   '9B',
    'B min':  '10A',                        'D maj':  '10B',
    'F♯ min': '11A',    'G♭ min': '11A',    'A maj':  '11B',
    'C♯ min': '12A',    'D♭ min': '12A',    'E maj':  '12B'
};

// prettier-ignore
const linkGenres = {
    'minimal':      14,
    'techno':       6,
    'tech-house':   11,
    'house':        5,
    'deep-house':   12,
    'organic':      93,
    'melodic':      90,
    'trance':       7,
    'indie-dance':  37
};

const HOLD_BIN_URL = 'https://www.beatport.com/hold-bin/tracks?per-page=150';

const POLLING_INTERVAL = 100;

// logging
const myLog = (...args) => console.log.apply(console, ['CamelotDJ:'].concat(args));

// match URL

// split path example:
//
// ['', 'cart', 'cart', 'BaSe64sTuFf==']
// ['', 'hold-bin']
// ['', 'genre', 'techno', '6', 'top-100']

const urlIsTop100 = () => {
    const splitPath = window.location.pathname.split('/');
    return splitPath.length >= 5 && splitPath[4] === 'top-100';
}

const getGenreNum = () => window.location.pathname.split('/')[3];

const urlIsMainCart = () => {
    const splitPath = window.location.pathname.split('/');
    return splitPath.length >= 3 && splitPath[1] === 'cart' && splitPath[2] === 'cart';
}

const urlIsHoldBin = () => {
    const splitPath = window.location.pathname.split('/');
    return splitPath.length >= 2 && splitPath[1] === 'hold-bin';
}



// convert key dataset to string -- note that the dataset stringifies everything
const keyStr = datasetObj => datasetObj.keyNum + (datasetObj.minor.toString() === 'true' ? 'A' : 'B');

// parse JSON track data in page scripts
const parseScriptTracks = (scriptElement, searchText, propName) => {
    if (scriptElement === null) return [];

    const varPos = scriptElement.text.indexOf(searchText);
    if (varPos === -1) return [];

    const eqlPos = scriptElement.text.indexOf('=', varPos);
    const objStr = scriptElement.text
        .slice(eqlPos + 1)
        .split('window.')[0]  // cut off the next window variable
        .trim()
        .slice(0, -1); // remove trailing semicolon
    
    return JSON.parse(objStr)[propName];
}

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
            { add:  0, flip: true  }, // 8A ->  8B -- same key, flipped major/minor
            { add: 11, flip: false }, // 8A ->  7A -- key -1
            { add:  1, flip: false }, // 8A ->  9A -- key +1
            { add:  9, flip: true  }, // 8A ->  5B -- key -3, flipped major/minor
            { add:  3, flip: true  }  // 8A -> 11B -- key +3, flipped major/minor
        ].map(x => keyStr({ keyNum: (keyNum + x.add - 1) % 12 + 1, minor: x.flip ? !minor : minor }));

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
    // Hide the key selector thingy if we're not on a top-100 or the hold-bin
    if (urlIsTop100() || urlIsHoldBin()) {
        keySelectContainer.style.display = '';
    } else {
        keySelectContainer.style.display = 'none';
    }

    // Set/clear selection class on the top-100 genre link bar
    for (gNum of Object.keys(genreLinks)) {
        if (urlIsTop100() && getGenreNum() === gNum) {
            genreLinks[gNum].className = 'selected';
        } else {
            genreLinks[gNum].className = '';
        }
    }

    // We only filter stuff when we're on a top-100 or the hold-bin and we have a key selected
    let showKeys = null;
    if (window.selectedKey && (urlIsTop100() || urlIsHoldBin())) {
        showKeys = [window.selectedKey].concat(window.matchingKeys);
        myLog('update() filtering', showKeys);
    }

    // Top 100s and hold-bin
    Array.from(document.querySelectorAll('.bucket-track-header-col.buk-track-labels')).forEach(labelColumnHeader => {
        labelColumnHeader.innerHTML = '<div>BPM</div><div>KEY</div>';
    });
    // This is goofy because the hold-bin rows aren't as nested as the Top 100 rows.
    Array.from(document.getElementsByClassName('bucket-item track')).forEach(trackRow => {
        const trackLabel = trackRow.getElementsByClassName('buk-track-labels')[0];
        const trackPlay  = trackRow.getElementsByClassName('track-play')[0];
        const trackId    = trackPlay && trackPlay.dataset && trackPlay.dataset.id;

        if (trackLabel && trackId && tracks[trackId]) {
            const { key, bpm } = tracks[trackId];
            const camelot = beatportKeyToCamelotKey[key];

            if (showKeys && showKeys.indexOf(camelot) == -1) {
                trackRow.style.display = 'none';
            } else {
                trackRow.style.display = '';
                trackLabel.innerHTML = `<div>${bpm}</div><div>${camelot}</div>`;
            }
        }
    });

    // Top 10s
    Array.from(document.getElementsByClassName('top-ten-track-label')).forEach(topTenLabel => {
        const rowElement   = topTenLabel.parentNode.parentNode;
        const trackId      = rowElement.dataset.ecId;
        const { key, bpm } = tracks[trackId];
        topTenLabel.innerHTML = `<div>${bpm}</div><div>${beatportKeyToCamelotKey[key]}</div>`;
    });

    // tag that we've labelled the list so that we can see when it gets reloaded
    document.querySelectorAll('ul.bucket-items').forEach(trackList => {
        trackList.dataset.labeled = 'labeled';
    });
};

let trackDataPath = '';
let tracks = {};

// Beatport attaches track data to window.Playables.tracks, but the window object is sandboxed.
// Beatport uses a lot of AJAX, so we can't just load the data script on DOMContentLoaded.
// Seeing the XHR calls come in requires the tabs permission and a lot of fancy script injection.
// And we don't want to be re-parsing the data script on an interval just to see when it changed.
// So we just poll the current URL, and when it changes we parse the data script.
// We also flag the script element after we parse it so we know if the new one hasn't loaded yet.
const loadTrackData = () => {
    const script = document.getElementById('data-objects');
    if (script === null) return;

    // has the new datascript finished loading and replaced the last one we parsed?
    if (typeof script.dataset.parsed === 'undefined') {
        const playableTracks = parseScriptTracks(script, 'window.Playables', 'tracks');

        trackDataPath = window.location.pathname;
        tracks = Object.fromEntries(playableTracks.map(t => [t.id, t]));

        script.dataset.parsed = 'parsed'; // flag it so we don't keep reloading the same data
        myLog(playableTracks.length, 'playable tracks found.');

        const cartTracks = parseScriptTracks(script.nextElementSibling, 'window.localCart', 'items');
        cartTracks.forEach(t => {
            if (!(t.id in tracks)) {
                tracks[t.id] = t;
            }
        })
        myLog(cartTracks.length, 'cart tracks found.');

        const keyNum = window.localStorage.getItem('camelotdj.keyNum');
        const minor = window.localStorage.getItem('camelotdj.minor');
        if (keyNum && minor) {
            selectKey({ keyNum, minor });
        } else {
            selectKey(null);
        }
        myLog('loadTrackData update');

        update();
    }
};

const checkForUpdate = () => {
    if (trackDataPath !== window.location.pathname) {
        // we're not intercepting XHR calls, so we just manually poll the URL to see if we need to update
        myLog('New URL. Loading track data.');
        loadTrackData();
    } else {
        // track lists will repopulate after a second, so we need to check for that
        document.querySelectorAll('ul.bucket-items').forEach(trackList => {
            if (typeof trackList.dataset.labeled === 'undefined') {
                myLog('label check update');

                update();
            }
        });
    }
}

// This fires when our extension initializes the first time -- so we attach our UI to the DOM here
const loadHandler = e => {
    myLog('DOMContentLoaded fired.');
    document.getElementsByClassName('header-bg-wrap')[0].appendChild(mainContainer);

    // Start polling
    updateInterval = setInterval(checkForUpdate, POLLING_INTERVAL);
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
