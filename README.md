# Camelot DJ

**A Chrome estension for Beatport**



Camelot DJ adds BPM and key (in Camelot notation) to track lists.
This applies to all Top 100 lists and your Hold Bin.

![Top 100](/screenshot/hold-bin-1280x800.png?raw=true "Top 100 screenshot")



It also adds a selector to the page which lets you pick a key to mix with.

The track lists are then filtered to show keys which mix well with the selected key.

![Hold Bin](/screenshot/hold-bin-1280x800.png?raw=true "Hold Bin screenshot")

Oh, and it adds some convenient links to the top 100 lists for the bigger genres.



### The code

This is all a bit complicated because Beatport uses a lot of AJAX, and the track data (with the BPM and key) lives in a dynamically-loaded script tag. Injecting all the code to hijack XHR events gets really messy, so we just grab the script tag and evaluate it. Then we have a polling function which checks to see when the URL changes after an AJAX call, and then we reload the data.



### Contact

If you think I picked terrible genres, feel free to ping me on Reddit and tell me how awful I am.

If you think showing the matching major/minor keys is an affront to music theory, feel free to explain to me how I can be better at this mixing thing.

[u/raquel-eve](https://www.reddit.com/user/raquel-eve)
