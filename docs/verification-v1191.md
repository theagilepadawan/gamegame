# Version 1.19.1 audio verification

Verified in Chromium on 2026-11-08. The final HTML is 62,555,905 bytes with
70 embedded assets; SHA-256:
`a6da46925b3bbc79dfdacfcb475ca4b353696829a41cfd878958d7ffb69a1bb4`.
Source passes: title-autoplay, title-music, story-polish and chapter-cinematics.
Standalone passes: title-first-touch, mobile-polish and standalone.

The v1.19 ordinary-touch path listened only to pointerdown. On a genuinely
unactivated Chromium mobile page, that event did not activate audible media:
the first touch left the title at time zero; the second succeeded. Playback now
runs synchronously on touchend/pointerup/click, including events consumed by the
chapter map. The sound toggle and explicit music action retain their own paths.

Media elements are connected to Web Audio only after its context is running.
Direct playback keeps the correct volume until then. Context state changes
update the controls; a suspended graph cannot advertise audible playback.
Resume also attempts the browser's `interrupted` state. Retries retain the
title playhead, and an explicit play action can restore saved mute/zero music
volume without ordinary menu touches overriding those settings.

The browser's audible-autoplay policy still applies. Where permitted, the title
starts without input; otherwise one real gesture is required. The new optional
**Play opening music** control makes that requirement visible.

## Verification

`title-first-touch` inspects a fresh page through CDP with `userGesture:false`:
ordinary Playwright evaluation, locator reads and screenshot setup can activate
audio and conceal this regression. Pre-gesture geometry and screenshots also
use raw CDP, and activation is asserted false immediately before input.
It covers a first touch on the background, chapter map, sound toggle and play
control; recovery from a suspended context; saved mute/zero music volume; and
the compact phone layout, desktop first click and automatic music on return
from a level. It samples actual nonzero audio after the mixer gains
and compressor, rather than relying only on the media element's advancing clock.

The startup, title-music, story-polish and cinema suites cover permitted/blocked
autoplay, exact title, gain, looping, chapter/Contrarian exclusivity, music during
the gift film and return to the title. Standalone checks cover offline media and
unchanged baseline assets. Desktop and 568×320 prompt layouts are inspected.

These are Chromium checks with simulated touch, not a physical iPhone or Safari
validation. WebKit installation was unavailable because the environment's
network policy blocked the browser download.

```sh
BROWSER_TESTS=title-first-touch,title-autoplay,title-music,story-polish,chapter-cinematics,mobile-polish,standalone npm test
```

All artwork, recordings, gameplay and story content are retained. The packaged
HTML and ZIP hashes are recorded in `release/release-metadata.json`; packaging
verifies ZIP contents and a byte-identical rebuild from the source handoff.
