# Papa Ke Jamane Ke Gaane — GitHub Pages build

Playlist ID: `9495307201/papa-ke-jamane-ke-gaane`

This is a static HTML/CSS/JavaScript music UI inspired by the supplied screenshots and the reference site's radio-style layout. It uses the MP3 links you supplied; it does **not** upload or bundle the MP3 files.

## Deploy

1. Upload `index.html`, `styles.css`, `app.js`, and `songs.js` to your GitHub Pages folder.
2. Keep the files in the same directory.
3. Open the GitHub Pages URL.

## Playback

The player uses the normal browser `<audio>` element. This is deliberate: it avoids Web Audio/CORS processing that can cause cross-origin playback problems. Browsers still require a user gesture before starting audio in many cases.

If a particular MP3 fails, the player shows a **Playback unavailable** panel with Retry. Check that the R2 URL is public/reachable and returns an audio response.

## Important privacy note

The playlist ID/path in the code is only an organization/obfuscation mechanism. Because a browser must receive the MP3 URL to play it, a visitor can inspect the URL in browser developer tools/network logs. True access protection requires private storage plus signed URLs or an authenticated server/worker.

## Included tracks

81 tracks from the links supplied in the conversation.


## Updated behavior

- The website is designed as a one-screen UI with page-level scrolling disabled.
- Selecting a song does not automatically start playback.
- Playback starts only when the user presses Play.
- Existing playlist, favorites, recently played, search, shuffle, repeat, theme, fullscreen, volume, and external R2 audio behavior are preserved.
