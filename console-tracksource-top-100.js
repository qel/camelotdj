// Traxsource.com Top 100 pages -- add key/bpm column

// This script is pretty silly.
// It fetches all 100 pages for each track to populate the BPM/key data.

// prettier-ignore
traxsourceKeyToCamelotKey = {
    'G#min':  '1A',  'Bmaj':   '1B',
    'D#min':  '2A',  'F#maj':  '2B',
    'A#min':  '3A',  'C#maj':  '3B',
    'Fmin':   '4A',  'G#maj':  '4B',
    'Cmin':   '5A',  'D#maj':  '5B',
    'Gmin':   '6A',  'A#maj':  '6B',
    'Dmin':   '7A',  'Fmaj':   '7B',
    'Amin':   '8A',  'Cmaj':   '8B',
    'Emin':   '9A',  'Gmaj':   '9B',
    'Bmin':  '10A',  'Dmaj':  '10B',
    'F#min': '11A',  'Amaj':  '11B',
    'C#min': '12A',  'Emaj':  '12B'
};
// prettier-ignore
document.head.insertAdjacentHTML('beforeend', [
        '<style>',
        '.trk-row .label div { display: inline-block; width: 3em; }',
        '.trk-row .label div:last-child { text-align: right; }',
        '.trk-row.play-trk .trk-cell.label div { color: #f6f6f6; font-size: 11pt; }',
        '</style>'
    ].join('\n'));
if ((labelColumnHeader = document.querySelector('.trk-row.hdr .label'))) {
    labelColumnHeader.innerHTML = '<div>BPM</div><div>KEY</div>';
    Array.from(document.getElementsByClassName('trk-row play-trk')).forEach(trackRow => {
        const titleLink = trackRow.querySelector('.title a');
        const label = trackRow.getElementsByClassName('label')[0];
        if (titleLink && label) {
            fetch(titleLink.href)
                .then(r => r.text())
                .then(txt => {
                    const det = txt.split('<td class="det">');
                    if (det.length > 6) {
                        const key = det[5].split('<')[0];
                        const bpm = det[6].split('<')[0];
                        label.innerHTML = `<div>${bpm}</div><div>${traxsourceKeyToCamelotKey[key]}</div>`;
                    }
                });
        }
    });
}
