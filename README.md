# Camelot DJ

**A Chrome estension for Beatport**

Get it in the [Chrome Web Store](https://chrome.google.com/webstore/detail/camelot-dj/odinfabcmlogdpdkghggkkpdjlbeloeg).



Camelot DJ adds BPM and key (in Camelot notation) to track lists.
This applies to all Top 100 lists and your Hold Bin.

![Top 100](/screenshot/top100-1400x560.png?raw=true "Top 100 screenshot")



It also adds a selector to the page which lets you pick a key to mix with.

The track lists are then filtered to show keys which mix well with the selected key.

![Hold Bin](/screenshot/hold-bin-1280x800.png?raw=true "Hold Bin screenshot")

Oh, and it adds some convenient links to the top 100 lists for the bigger genres.



### Console version

Obviously a Chrome extension only works on Chrome, but ... if you want to see BPM/key on a Top 100 list, you can just cut/paste this into the console. And it works in Firefox, too!

```javascript
// Rewrite a Beatport Top 100 page -- add key/bpm column
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
```



### The code

Doing this in the console is a lot easier than doing it in an extension because of sandboxing.

We can't get to the window object, and Beatport uses a lot of AJAX, and the track data lives in a dynamically-loaded script tag. Injecting all the code to hijack XHR events gets really messy, so we just grab the script tag and evaluate it. Then we have a polling function which checks to see when the URL changes after an AJAX call, and then we reload the data.



### Contact

If you think I picked terrible genres, feel free to ping me on Reddit and tell me how awful I am.

If you think showing the matching major/minor keys is an affront to music theory, feel free to explain to me how I can be better at this mixing thing.

[u/raquel-eve](https://www.reddit.com/user/raquel-eve)
