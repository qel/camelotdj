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
    95: ['140-deep-dubstep-grime',          '140 / Deep Dubstep / Grime',           '140'],
    89: ['afro-house',                      'Afro House',                           'afro•hs'],
    85: ['bass-club',                       'Bass / Club',                          'bass•club'],
    91: ['bass-house',                      'Bass House',                           'bass•hs'],
    9:  ['breaks-breakbeat-uk-bass',        'Breaks / Breakbeat / UK Bass',         'breaks'],
    39: ['dance-electro-pop',               'Dance / Electro Pop',                  'elec•pop'],
    12: ['deep-house',                      'Deep House',                           'deep•hs'],
    16: ['dj-tools',                        'DJ Tools',                             'dj•tools'],
    1:  ['drum-bass',                       'Drum &amp; Bass',                      'd•&•b'],
    18: ['dubstep',                         'Dubstep',                              'dubstep'],
    94: ['electro-classic-detroit-modern',  'Electro (Classic / Detroit / Modern)', 'electro'],
    3:  ['electronica',                     'Electronica',                          "elec'nica"],
    81: ['funky-house',                     'Funky House',                          'funky•hs'],
    8:  ['hard-dance-hardcore',             'Hard Dance / Hardcore',                'hardcore'],
    2:  ['hard-techno',                     'Hard Techno',                          'hd•tech'],
    5:  ['house',                           'House',                                'house'],
    37: ['indie-dance',                     'Indie Dance',                          'ind•dnc'],
    97: ['jackin-house',                    'Jackin House',                         'jakin•hs'],
    96: ['mainstage',                       'Mainstage',                            'main•stg'],
    90: ['melodic-house-techno',            'Melodic House &amp; Techno',           'mel•h+t'],
    14: ['minimal-deep-tech',               'Minimal / Deep Tech',                  'minimal'],
    50: ['nu-disco-disco',                  'Nu Disco / Disco',                     'nu•disco'],
    93: ['organic-house-downtempo',         'Organic House / Downtempo',            'orgnic•dt'],
    15: ['progressive-house',               'Progressive House',                    'prog•hs'],
    13: ['psy-trance',                      'Psy-Trance',                           'psy•tra'],
    11: ['tech-house',                      'Tech House',                           'tech•hs'],
    6:  ['techno-peak-time-driving',        'Techno (Peak Time / Driving)',         'techno'],
    92: ['techno-raw-deep-hypnotic',        'Techno (Raw / Deep / Hypnotic)',       'raw•tech'],
    7:  ['trance',                          'Trance',                               'trance'],
    38: ['trap-wave',                       'Trap / Wave',                          'trap'],
    86: ['uk-garage-bassline',              'UK Garage / Bassline',                 'uk•garag']
};

const defaultGenres = [14, 92, 95, 6, 90, 3, 94, 9, 37, 11, 5, 12]

const HOLD_BIN_URL = 'https://www.beatport.com/hold-bin/tracks?per-page=150';

const POLLING_INTERVAL = 100; // checking for URL changes and XHR responses that update lists



// logging
const myLog = (...args) => console.log.apply(console, ['CamelotDJ:'].concat(args));

// convert key dataset to string -- note that the dataset stringifies everything
const keyStr = datasetObj => datasetObj.keyNum + (datasetObj.minor.toString() === 'true' ? 'A' : 'B');



// UI: build the key selector
const mainContainer = document.createElement('div');
mainContainer.className = 'camelotdj-main';

const keySelectContainer = document.createElement('div');
keySelectContainer.className = 'inner-container';
mainContainer.appendChild(keySelectContainer);

const keySelectLabel = document.createElement('a');
keySelectLabel.className = 'key-label';
keySelectLabel.innerHTML = 'Camelot<strong>DJ</strong>';
keySelectLabel.href = HOLD_BIN_URL;
keySelectContainer.appendChild(keySelectLabel);

const keySelectButtons = [];  // we maniulate these below in selectKey()
const keySelectGrid = document.createElement('div');
keySelectGrid.className = 'key-grid';
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
keySelectContainer.appendChild(keySelectGrid);

// UI: build row of links
let myLinkGenres = window.localStorage.getItem('camelotdj.genres');
if (myLinkGenres === null) {
    myLinkGenres = defaultGenres
}

const genreLinks = {};
const linkContainer = document.createElement('div');
const linkLabel = document.createElement('div');
const linkRow = document.createElement('div');
linkContainer.className = 'inner-container';
linkLabel.className = 'link-label';
linkRow.className = 'link-row';
linkLabel.innerHTML = 'top<strong>100</strong>s';
for (const gNum of myLinkGenres) {
    const gName = linkGenres[gNum][2]
    const a = document.createElement('a');
    a.href = `https://www.beatport.com/genre/${gName}/${gNum}/top-100`;
    a.textContent = gName;
    genreLinks[gNum] = a;
    linkRow.appendChild(a);
}
linkContainer.appendChild(linkLabel);
linkContainer.appendChild(linkRow);
mainContainer.appendChild(linkContainer);

// UI: build link genre selector
const genreSelectContainer = document.createElement('div');
genreSelectContainer.className = 'inner-container';
// TODO: implement custom genres



// match URL

// split path example:
//
// ['', 'cart', 'cart', 'BaSe64sTuFf==']
// ['', 'hold-bin']
// ['', 'genre', 'techno', '6', 'top-100']

const pathMathches = wildcardPath => {
    const splitPath = window.location.pathname.split('/');
    const splitWild = wildcardPath.split('/');
    if (splitPath.length < splitWild.length) return false;
    for (const seg in splitWild) {
        if (splitWild[seg] !== '*' && splitWild[seg] !== splitPath[seg]) return false;
    }
    return true;
}

const getGenreNumberSeg = () => {
    const splitPath = window.location.pathname.split('/');
    if (splitPath.length < 4 || splitPath[1] !== 'genre') return null;
    return splitPath[3];
}

const urlIsTop100     = () => pathMathches('/genre/*/*/top-100');
const urlIsMainCart   = () => pathMathches('/cart/cart');
const urlIsCustomCart = () => pathMathches('/cart/*') && !urlIsMainCart();
const urlIsHoldBin    = () => pathMathches('/hold-bin');
const urlIsSearchPage = () => pathMathches('/search/tracks');



// global track data object
let tracks = {};

// parse JSON track data in page scripts
const parseScriptTracks = (scriptElement, assignedVarName, ...nestedVarNames) => {
    const scriptText = scriptElement.text;
    const objStart = scriptText.indexOf('{', scriptText.indexOf(assignedVarName) + assignedVarName.length);
    const objEnd = scriptText.indexOf('};', objStart) + 1;
    let varData = JSON.parse(scriptText.slice(objStart, objEnd));
    nestedVarNames.forEach(v => {
        varData = varData[v];
    })
    myLog(varData.length, assignedVarName, 'tracks found.');
    varData.forEach(track => {
        if (!(track.id in tracks)) {
            if (track.bpm && track.key) {
                tracks[track.id] = {
                    key: track.key,
                    bpm: track.bpm,
                    camelot: beatportKeyToCamelotKey[track.key]
                };
            }
            myLog(track.id, 'name:', track.name, 'mix:', track.mix, 'bpm:', track.bpm, 'key:', track.key);
        }
    });
    scriptElement.dataset.parsed = 'parsed'; // flag it so we don't keep reloading the same data
}



// global key selection vars
let selectedKey  = null;
let matchingKeys = [];

// Selects a key basted on {keyNum, minor} object and stores matching keys in matchingKeys
const selectKey = datasetObj => {
    myLog('selectKey()', datasetObj);

    // reset all buttons to only the default class
    for (const btn of keySelectButtons) {
        btn.className = 'key-col';
    }

    if (datasetObj) {
        selectedKey = keyStr(datasetObj);
        const keyNum = parseInt(datasetObj.keyNum);
        const minor = datasetObj.minor.toString() === 'true';

        // put the selection in storage
        window.localStorage.setItem('camelotdj.keyNum', keyNum);
        window.localStorage.setItem('camelotdj.minor', minor);

        // prettier-ignore
        matchingKeys = [selectedKey].concat([
            { add:  0, flip: true  }, // 8A ->  8B -- same key, flipped major/minor
            { add: 11, flip: false }, // 8A ->  7A -- key -1
            { add:  1, flip: false }, // 8A ->  9A -- key +1
            { add:  9, flip: true  }, // 8A ->  5B -- key -3, flipped major/minor
            { add:  3, flip: true  }  // 8A -> 11B -- key +3, flipped major/minor
        ].map(x => keyStr({ keyNum: (keyNum + x.add - 1) % 12 + 1, minor: x.flip ? !minor : minor })));

        // apply the correct classes to the buttons
        for (const btn of keySelectButtons) {
            const btnKeyStr = keyStr(btn.dataset);
            if (btnKeyStr === selectedKey) {
                btn.classList.add('selected');
            } else if (matchingKeys.includes(btnKeyStr)) {
                btn.classList.add('included');
            }
        }
    } else {
        selectedKey = null;

        // clear stored key
        window.localStorage.removeItem('camelotdj.keyNum');
        window.localStorage.removeItem('camelotdj.minor');
    }
};



const update = () => {
    if (urlIsTop100())      myLog('URL is a Top 100 page.');
    if (urlIsMainCart())    myLog('URL is the Main Cart.');
    if (urlIsCustomCart())  myLog('URL is a custom cart.');
    if (urlIsHoldBin())     myLog('URL is the Hold Bin.');
    if (urlIsSearchPage())  myLog('URL is a search result track list.');

    // Set/clear selection class on the top-100 genre link bar
    for (gNum of Object.keys(genreLinks)) {
        if (urlIsTop100() && getGenreNumberSeg() === gNum) {
            genreLinks[gNum].className = 'selected';
        } else {
            genreLinks[gNum].className = '';
        }
    }

    // We only filter stuff when we're on a top-100 / hold-bin / custom cart
    const keySelectorActive = (urlIsTop100() || urlIsHoldBin() || urlIsCustomCart() || urlIsSearchPage());
    const filtering = keySelectorActive && selectedKey;

    if (keySelectorActive) {
        keySelectContainer.style.display = '';
        if (filtering) {
            myLog('filtering', matchingKeys);
        }
    } else {
        // hide the key selector thingy if we're not filtering
        keySelectContainer.style.display = 'none';
    }

    // track list headers
    Array.from(document.querySelectorAll('.bucket-track-header-col.buk-track-labels')).forEach(labelColumnHeader => {
        labelColumnHeader.innerHTML = '<div>BPM</div><div>KEY</div>';
    });

    // Top 100s, carts and hold-bin
    document.querySelectorAll('ul.bucket-items').forEach(trackList => {
        // This is goofy because the hold-bin rows aren't as nested as the Top 100 rows.
        Array.from(trackList.getElementsByClassName('track')).forEach(trackRow => {
            const trackLabel = trackRow.getElementsByClassName('buk-track-labels')[0];
            if (trackLabel) {
                const trackId = trackRow.dataset.ecId || trackRow.getElementsByClassName('track-play')[0].dataset.id;

                if (tracks[trackId]) {
                    const { bpm, camelot } = tracks[trackId];
    
                    if (filtering && matchingKeys.indexOf(camelot) == -1) {
                        // hide rows that are filtered out
                        trackRow.style.display = 'none';
                    } else {
                        trackRow.style.display = '';
                        trackLabel.innerHTML = `<div>${bpm}</div><div>${camelot}</div>`;
                    }
                } else {
                    trackLabel.style.whiteSpace = 'noWrap';
                    trackLabel.style.color = '#8c8c8c';
                    trackLabel.innerText = 'no track data';
                }
            }
        });

        // tag that we've labelled the list so that we can see when it gets reloaded
        trackList.dataset.labeled = 'labeled';
    });

    // Top 10s
    Array.from(document.getElementsByClassName('top-ten-track-label')).forEach(topTenLabel => {
        const topTenRow        = topTenLabel.parentNode.parentNode;
        const trackId          = topTenRow.dataset.ecId;
        const { bpm, camelot } = tracks[trackId];
        topTenLabel.innerHTML  = `<div>${bpm}</div><div>${camelot}</div>`;
    });
};



const checkForUpdate = () => {
    Array.from(document.getElementsByClassName('bucket-items')).forEach(trackListElement => {
        if (!trackListElement.dataset.labeled && trackListElement.firstElementChild.classList.contains('track')) {
            myLog('New track list found.');
            const trackScript = document.getElementById('data-objects');
            if (trackScript) {
                if (!trackScript.dataset.parsed) {
                    parseScriptTracks(trackScript, 'window.Playables', 'tracks')
                }
                const nES = trackScript.nextElementSibling;
                const cartScript = nES !== null && nES.id === '' && nES.text.indexOf('window.localCart') !== -1 && nES;
                if (cartScript && !cartScript.dataset.parsed) {
                    parseScriptTracks(cartScript, 'window.localCart', 'items');
                }
                update(trackListElement);
            } else {
                myLog('Waiting for track data script.');
            }
        }
    });
};

const loadHandler = e => {
    // add UI go page
    document.getElementsByClassName('header-bg-wrap')[0].appendChild(mainContainer);

    // load key selection from local storage
    const keyNum = window.localStorage.getItem('camelotdj.keyNum');
    const minor = window.localStorage.getItem('camelotdj.minor');
    if (keyNum && minor) {
        selectKey({ keyNum, minor });
    }

    // always polling for unlabeled track lists
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
