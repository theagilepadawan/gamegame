# The Long Run — NBIM Arcade

[Download the playable game](release/The-Long-Run-NBIM.zip?raw=1).

This version starts exclusively from the supplied **The-Long-Run-New-York-NBIM-Arcade (1).html**. The source hash is recorded in `BASELINE.json`. All 40 original art, audio, font and identity source assets are preserved byte for byte; the runtime uses new scenery and venue art where described below.

## Living New York streets and varied Endless — 1.10

- **The earlier Midtown atmosphere returns:** native v1.6 glass-canyon, library, dry-city atmosphere and unique-landmark artwork replace the opening stretch corresponding to v1.9 segments 0–3. From segment 4 onward, the detailed v1.9 street and its separated venue discoveries remain. This combines the earlier opening composition with the current complete blue/cyan 505 entrance, office host and other venue fronts.
- **A city that moves with the run:** Downtown and Midtown begin scrolling horizontally immediately, with a gentle increase in travel. Near-road taxis and sedans add activity behind the playable terrain. The approved v1.6 stone material returns at its native 1254×1254 resolution, clipped to the solid ground so gaps stay open. Architecture has no jump-driven vertical shift.
- **Detail and placement retained:** the v1.9 native 1024×1536 paintings and authored joins remain for Downtown and the later Midtown street, including the spacing between Kabin, LEI, JOJU, Omar's, Uncle Gussy's and 505. Venue fronts retain their native pixels and belong to their surrounding buildings. Central Park, the approved runner sheets, warm props, branding and audio remain unchanged.
- **Playable characters on the map:** a miniature Nicolai or Trond follows the chapter path using native crops of the approved sprites. Chapter changes use a brief run of about half a second, then a stable idle pose. Reduced motion places the character directly at the destination.
- **A more varied Endless course:** 12 parameterized route families combine seeded terrain, jump/slide sequences, optional upper routes, moving and crumbling platforms, springs and rewards. Longer combinations, wider gaps and shorter recovery gradually raise the challenge within a readable speed ceiling. Jetpack and Contrarian pickups return with cooldowns and safe recovery sections; replaying a seed preserves the course.

[Version 1.10 design and validation notes](docs/living-city-endless-v110.md) describe the exact scope, completed Endless checks and three proposed future challenges. The earlier HTML remains a visual reference; this is not a full rollback. Release-wide verification belongs in `docs/verification.md`; historical results only apply to the versions they identify.

The current Nicolai and Trond sprite sheets are unchanged. The rejected cartoon runner study and alternate Park artwork are not part of gameplay.

[Cutscene production handoff](release/The-Long-Run-Cutscene-Handoff.zip?raw=1) contains the complete editable game, native references, audio, a proposed shot slate, Runway prompts and browser integration notes. Start with `START-HERE.md` inside the ZIP. Its location index links to exact native files in the editable game's asset tree. If duplicating the compiled HTML would exceed 100 MiB, the handoff includes verified build instructions and the expected HTML hash instead; every native asset is retained. The separate playable ZIP remains ready to open. Cutscenes are a separate production task; this release does not add video interruptions.

## Story and Endless

- **Story and Endless:** Daily Challenge and the separate Contrarian practice option are removed. The existing Contrarian pickup/event remains in gameplay.
- **Chapter journey:** a scrollable world map, touch dragging, mouse wheel, arrows and keyboard navigation, with clear progress, locked chapters and a miniature of the selected playable runner.
- **Progression:** wins in Opening Bell and Midtown default to Next chapter, including after the fund-history reveal and when using a controller. The Central Park finale defaults to Main menu. Losing a chapter defaults to Retry chapter.
- **Story courses:** fixed chapter terrain; seed and New world controls belong to Endless. Switching modes preserves the chosen Endless seed.
- **Landmark continuity:** Story follows a finite route without mirroring or repeating its landmarks. Endless continues through six anonymous ordinary-street paintings without returning to WTC, Brooklyn Bridge or named venues; gameplay layouts vary independently of that scenery loop.

The NBIM branding, music, both runners and their animations, unlocks, fund-history reveal, pickups, jetpack, boss, local leaderboards and environmental effects remain from the supplied build. Leaderboards remain local unless a remote service is explicitly configured.

## Play the download

Unzip `The-Long-Run-NBIM.zip` and open `The-Long-Run-NBIM.html` in a current browser. The HTML includes all game code, fonts, music and art. For an intranet or website, host that HTML as a normal static file. No build step or external CDN is needed to play it.

## Work on the source

Requires Node.js 20 or newer. The build and local server have no dependencies.

```sh
npm start
```

Open the URL printed by the server. `index.html`, `game.css`, `scripts/` and `assets/` are the editable source. `scripts/engine.js` contains the original bundled game and Pixi runtime, formatted for maintenance. `scripts/scenery.js` and `scripts/midtown-scenery.js` compose the native city tiles and shared venue camera; `scripts/city-vistas.js` restores the earlier Midtown opening; `scripts/street-life.js` and `scripts/street-foundation.js` supply traffic and the stone ground material. `scripts/park-scenery.js` preserves the original Park composition, `scripts/chapter-menu.js` controls the chapter map, and `scripts/endless-generator.js` owns seeded Endless generation.

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

The browser tests cover mode/progression, map, artwork, scenery, venue placement, gaps and offline packaging. `tests/cohesive-scenery.mjs` checks the current panorama, shared-camera venue and anonymous Endless-tail contracts. `tests/map-avatars.mjs` and `tests/street-life.mjs` cover the added map characters and traffic. The release verification records which suites actually ran. Earlier restoration/layered-city tests remain historical and are superseded where they describe artwork no longer used. Browser tests use `/usr/bin/chromium` when present, otherwise Playwright's installed Chromium. `CHROMIUM_PATH` can select another executable. `PLAYWRIGHT_MODULE` can point at an existing Playwright module. `TEST_URL` can select an already hosted standalone build.

The Endless generation and independent collision-enabled fairness checks run directly in Node:

```sh
node tests/endless-generation.mjs
node tests/endless-fairness.mjs
```

Progress and local scores use the browser's local storage. The original `?unlock=all` URL option remains available for demonstrations; ordinary play retains chapter and runner unlocks.
