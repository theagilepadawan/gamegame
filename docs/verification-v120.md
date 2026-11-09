# Version 1.20 verification

Standalone HTML: 64,284,454 bytes, 72 embedded assets. SHA-256:
`849a90b0543b49a906d7a7fa0483f82f923cfc0b8d720235805bef21045603ae`.

## Portraits and opening call

The call now has a solid navy background, two ink-and-colour portraits and
one dialogue area. The approved Grete atlas is retained exactly. Nicolai uses
a separate face refinement based on the supplied frontal and outdoor photos,
keeping the blue checked blazer and open collar. His latest likeness awaits
user review. Title, map and playable sprites are unchanged.

Both source atlases remain at 1536 × 1024. Decoded RGBA equality was verified
between each native PNG and its lossless runtime WebP. Both characters' speech
and blinks use registered local patches over stationary listening portraits.
Browser pixel checks confirm fixed hair and shoulders, changed expressions,
and no whole-portrait motion. Listening, speaking and blinking captures were
visually inspected at their actual display size.

All six dialogue beats, keyboard isolation, Escape/Skip, once-only completion,
cancellation, hidden-tab pause and reduced motion were checked. Desktop,
844 × 390, 568 × 320 and 390 × 844 layouts fit all dialogue and actions. The
actual Play → call → existing title thumbs-up → Opening Bell flow passes.

## Gift-film timing and music

Winning Midtown opens results and records progression immediately. Only
pressing Next: Central Park opens the gift film. Direct map selection of Park
bypasses it. Actual video ending, Skip or media failure starts Park once.

The existing 1280 × 530, 121-frame cropped movie is unchanged. The new original
four-second piano miniature, “A change of pace,” replaces other music during
the film, follows saved volume/mute, and pauses when hidden. Browser tests
check real nonzero audio output, exclusive ownership, video/audio pause,
actual ending, direct-Park exclusion, Skip, mute, cancellation, deferred play
promises and decoder failure. Park selects its own music after the film.
No synthesized voices were added. The cue's score, production attribution
and reproducible renderer accompany its source asset.

## Train and retained gameplay

The latest requested destination is “Union Square.” The lettering follows the
painted board's slight perspective, is vertically centered by glyph bounds,
and is measured to fit inside the screws without distorting its proportions.
The station painting, grounded approach and occlusion are unchanged.

All three chapter completions were checked with both runners, including
airborne arrival, landing outside the doorway, foreground occlusion,
pause/resume, progression, the required Downtown boss and Endless exclusion.
Compact touch checks cover 568 × 320 at DPR 2 with Pixi and Canvas fallback.

Title-track playback, title text, mute/volume, chapter/Contrarian exclusivity
and returning to the menu pass. Browser autoplay restrictions still apply;
no synthetic keypress or extra music-start button is introduced.

## Release checks and delivery

The source checks covered the opening call, gift transition and finish gates.
The built release passed `story-briefing`, `chapter-cinematics`, `finish-gates`,
`finish-mobile`, `title-music` and `standalone`. After the final Union Square
lettering change, the affected finish and offline checks were repeated:

```sh
TEST_URL=http://127.0.0.1:4181/release/The-Long-Run-NBIM.html \
  BROWSER_TESTS=finish-gates,finish-mobile,standalone node tests/browser.mjs
```

Testing uses cloud Chromium and emulated mobile viewports, not physical phones.
Offline checks preserve all 40 baseline asset hashes, load the film and piano
from embedded data, and require zero external requests. Current captures are
in `review/v120/`; selected screenshots are retained in `release/`.

The playable ZIP contains the exact tested HTML. The handoff retains native
art, audio, provenance, source and tests, and its staged source must rebuild
the byte-identical HTML. Archive CRCs and release hashes are checked during
packaging. The final delivery additionally checks downloaded public ZIPs
against those local hashes. See `release/release-metadata.json`.
