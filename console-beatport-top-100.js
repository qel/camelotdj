// Rewrite a Beatport Top 100 page -- add key/bpm column -- works in Chrome / Firefox

// prettier-ignore
beatportKeyToCamelotKey = {
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
document.head.insertAdjacentHTML('beforeend', [
        '<style>',
        '.buk-track-labels div { display: inline-block; width: 3em; }',
        '.buk-track-labels div:last-child { text-align: right; }',
        'li .buk-track-labels div { color: #fff; font: 700 1.077em/1.25 SourceSans; }',
        '</style>'
    ].join('\n'));
if ((labelColumnHeader = document.querySelector('.bucket-track-header-col.buk-track-labels'))) {
    labelColumnHeader.innerHTML = '<div>BPM</div><div>KEY</div>';
    Array.from(document.querySelectorAll('li .buk-track-labels')).forEach((label, i) => {
        if ((info = window.Playables && window.Playables.tracks && window.Playables.tracks[i])) {
            label.innerHTML = `<div>${info.bpm}</div><div>${beatportKeyToCamelotKey[info.key]}</div>`;
        }
    });
}
