# The Long Run — NBIM Arcade

[Download the playable game](release/The-Long-Run-NBIM.zip?raw=1).

This version starts exclusively from the supplied **The-Long-Run-New-York-NBIM-Arcade (1).html**. The source hash is recorded in `BASELINE.json`. All 40 original art, audio, font and identity source assets are preserved byte for byte; the runtime uses new scenery and venue art where described below.

## Detailed New York streets — 1.9

- **Native detail:** Downtown and Midtown use 28 native 1024×1536 street paintings and 29 authored seam repairs under `assets/scenery-v19/`, replacing the 724-pixel-tall city sheets. Native pixels survive the prepared canvases and texture upload. At matched framing, source sampling is about 2.10× higher in Midtown and 2.18× higher Downtown; fine masonry, windows and venue fronts have substantially more original detail.
- **Separated local discoveries:** full stretches of ordinary city architecture separate Kabin, LEI, JOJU, Omar's, Uncle Gussy's and 505. Downtown has 12 base paintings and Midtown 16. Venue fronts remain part of a continuous opaque street, with complete blue/cyan 505 glass and its host. The longer painted route shares one horizontal camera, with no jump-driven vertical shift or independent venue islands.
- **Warmth and continuity:** the previous release's warm palette, dry streets, bounded Downtown harbor, polished `props-v18` pickups and smaller signs remain. Native landmark detail and scene joins are checked at gameplay size; Lower Manhattan and Midtown keep their own landmark identities.
- **Central Park and gameplay:** the original Park scenery, current runners, animations, audio, progression and game mechanics are retained. Endless cycles through six anonymous ordinary-street paintings, without replaying named landmarks or Easter eggs.

The earlier HTML remains a visual guide, not a replacement codebase. The user rejected v1.8's loss of detail and clustered venues while asking to retain its other improvements. The current change addresses those two issues. Actual validation is recorded in `docs/verification.md`; v1.8's historical results are preserved separately and do not certify v1.9.

The current Nicolai and Trond sprite sheets are unchanged. The rejected cartoon runner study and alternate Park artwork are not part of gameplay.

[Cutscene production handoff](release/The-Long-Run-Cutscene-Handoff.zip?raw=1) contains the complete editable game, native references, audio, a proposed shot slate, Runway prompts and browser integration notes. Start with `START-HERE.md` inside the ZIP. Its location index links to exact native files in the editable game's asset tree. If duplicating the compiled HTML would exceed 100 MiB, the handoff includes verified build instructions and the expected HTML hash instead; every native asset is retained. The separate playable ZIP remains ready to open. Cutscenes are a separate production task; this release does not add video interruptions.

## Story and Endless

- **Story and Endless:** Daily Challenge and the separate Contrarian practice option are removed. The existing Contrarian pickup/event remains in gameplay.
- **Chapter journey:** a scrollable world map, touch dragging, mouse wheel, arrows and keyboard navigation, with clear progress and locked chapters.
- **Progression:** wins in Opening Bell and Midtown default to Next chapter, including after the fund-history reveal and when using a controller. The Central Park finale defaults to Main menu. Losing a chapter defaults to Retry chapter.
- **Story courses:** fixed chapter terrain; seed and New world controls belong to Endless. Switching modes preserves the chosen Endless seed.
- **Landmark continuity:** Story follows a finite route without mirroring or repeating its landmarks. Endless continues through six anonymous ordinary-street paintings without returning to WTC, Brooklyn Bridge or named venues.

The NBIM branding, music, both runners and their animations, unlocks, fund-history reveal, pickups, jetpack, boss, local leaderboards and environmental effects remain from the supplied build. Leaderboards remain local unless a remote service is explicitly configured.

## Play the download

Unzip `The-Long-Run-NBIM.zip` and open `The-Long-Run-NBIM.html` in a current browser. The HTML includes all game code, fonts, music and art. For an intranet or website, host that HTML as a normal static file. No build step or external CDN is needed to play it.

## Work on the source

Requires Node.js 20 or newer. The build and local server have no dependencies.

```sh
npm start
```

Open the URL printed by the server. `index.html`, `game.css`, `scripts/` and `assets/` are the editable source. `scripts/engine.js` contains the original bundled game and Pixi runtime, formatted for maintenance. `scripts/scenery.js` and `scripts/midtown-scenery.js` compose the native city tiles and shared venue camera; `scripts/park-scenery.js` preserves the original Park composition; `scripts/chapter-menu.js` controls the chapter map.

```sh
npm run build
```

The self-contained release is written to `release/The-Long-Run-NBIM.html`. New image/audio files under `assets/` are embedded automatically when referenced by a literal relative path in the source.

After validating that build, `python tools/package-game.py` creates the playable ZIP with a short README, verifies its CRC and embedded HTML, and updates `release/SHA256SUMS.txt`. ZIP timestamps and file modes are fixed for reproducible packaging. After generating the matching cutscene handoff and current previews, run `python tools/package-game.py --checksums-only` to refresh their checksums. It excludes older preview versions and a handoff whose version or playable HTML does not match.

## Browser checks

```sh
npm ci
npx playwright install chromium
npm test
```

The browser tests cover mode/progression, map, artwork, scenery, venue placement, gaps and offline packaging. `tests/cohesive-scenery.mjs` checks the current panorama, shared-camera venue and anonymous Endless-tail contracts. The release verification records which suites actually ran. Earlier restoration/layered-city tests remain historical and are superseded where they describe artwork no longer used. It uses `/usr/bin/chromium` when present, otherwise Playwright's installed Chromium. `CHROMIUM_PATH` can select another executable. `PLAYWRIGHT_MODULE` can point at an existing Playwright module. `TEST_URL` can select an already hosted standalone build.

Progress and local scores use the browser's local storage. The original `?unlock=all` URL option remains available for demonstrations; ordinary play retains chapter and runner unlocks.
