# Version 1.19.2 audio verification

The standalone HTML is 62,553,715 bytes with 70 embedded assets; SHA-256:
`eefe30771373a1bf64d10165c34d127e1642762157fc66b00a38c1ca754d5a88`.
Standalone passes on 2026-11-08: title-autoplay, title-first-touch, title-music
and standalone. Desktop and compact-phone title screens were inspected.

The separate music-start button and its styling are removed at the user's
request. The existing sound toggle, five-second Now playing card, automatic
title playback attempt and recovery on ordinary menu input remain.

The proposed simulated keypress was checked on a fresh Chromium page after
loading, with strict audible-autoplay policy. A dispatched KeyboardEvent has
`isTrusted === false`, leaves user activation false, and leaves playback blocked.
A real keypress starts the same recording. Shipping a simulated event would
therefore not satisfy automatic audible playback; no such event was added to
the game. Browsers that permit autoplay still start the music without input.

Verification uses raw CDP without user activation before the first gesture.
The title-first-touch suite checks real output samples, normal menu touches,
the existing sound toggle, suspended-context recovery, saved mute and zero
volume, desktop first click, and automatic title music after leaving a level.
The title-music suite covers gain, title text, chapter/Contrarian exclusivity
and returning to the menu. Standalone checks cover offline embedded media and
unchanged baseline assets. Browser tests use Chromium and simulated touch.

```sh
BROWSER_TESTS=title-autoplay,title-first-touch,title-music,standalone npm test
```

No artwork, recordings, gameplay or story content changed. Release hashes are
in `release/release-metadata.json`. Both archives are verified, and the source
handoff must rebuild the exact packaged HTML.
