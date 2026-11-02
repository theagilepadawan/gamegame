# The Long Run — NBIM Arcade

[Download the playable game](release/The-Long-Run-NBIM.zip?raw=1).

This version starts exclusively from the supplied **The-Long-Run-New-York-NBIM-Arcade (1).html**. The source hash is recorded in `BASELINE.json`. All 40 original art, audio, font and identity source assets are preserved byte for byte; the runtime uses new scenery and venue art where described below.

## Scenery, venues and gameplay art — 1.4

- **Venue pacing:** ordinary streets establish each chapter before its Easter eggs appear. Kabin and LEI, and the four Midtown frontages, are separated using the actual scenery camera and complete frontage bounds.
- **505 Fifth:** the office entrance follows the supplied reference: cobalt-blue lobby, cyan perimeter lighting, dark lettering and two full revolving glass doors. A new office host uses the existing painted character style.
- **Central Park restored:** the original Bow Bridge painting, Ramble and Bethesda extensions, camera, foreground scenery and lake animation are restored from the approved pre-1.3 version.
- **Game objects:** native painted pickups, market-risk obstacles and clearer directional signs add material detail while preserving collision and collection behavior.
- **City continuity:** Lower Manhattan keeps One World Trade Center, the complete Brooklyn Bridge, Wall Street and Charging Bull. The chapter map reads NEW YORK without a redundant world number.

The current Nicolai and Trond sprite sheets are unchanged. The rejected cartoon runner study and alternate Park artwork are not part of gameplay.

[Cutscene production handoff](release/The-Long-Run-Cutscene-Handoff.zip?raw=1) contains the current game, native references, audio, a proposed shot slate, Runway prompts and browser integration notes. Start with `START-HERE.md` inside the ZIP. Cutscenes are a separate production task; this release does not add video interruptions.

## Story and Endless

- **Story and Endless:** Daily Challenge and the separate Contrarian practice option are removed. The existing Contrarian pickup/event remains in gameplay.
- **Chapter journey:** a scrollable world map, touch dragging, mouse wheel, arrows and keyboard navigation, with clear progress and locked chapters.
- **Progression:** wins in Opening Bell and Midtown default to Next chapter, including after the fund-history reveal and when using a controller. The Central Park finale defaults to Main menu. Losing a chapter defaults to Retry chapter.
- **Story courses:** fixed chapter terrain; seed and New world controls belong to Endless. Switching modes preserves the chosen Endless seed.
- **Landmark continuity:** Story follows a finite route without mirroring or repeating its landmarks. Endless continues through ordinary waterfront sections without returning to WTC or Brooklyn Bridge.

The NBIM branding, music, both runners and their animations, unlocks, fund-history reveal, pickups, jetpack, boss, local leaderboards and environmental effects remain from the supplied build. Leaderboards remain local unless a remote service is explicitly configured.

## Play the download

Unzip `The-Long-Run-NBIM.zip` and open `The-Long-Run-NBIM.html` in a current browser. The HTML includes all game code, fonts, music and art. For an intranet or website, host that HTML as a normal static file. No build step or external CDN is needed to play it.

## Work on the source

Requires Node.js 20 or newer. The build and local server have no dependencies.

```sh
npm start
```

Open the URL printed by the server. `index.html`, `game.css`, `scripts/` and `assets/` are the editable source. `scripts/engine.js` contains the original bundled game and Pixi runtime, formatted for maintenance. `scripts/scenery.js` controls the city background sequence; `scripts/park-scenery.js` preserves the approved Park composition; `scripts/chapter-menu.js` controls the chapter map.

```sh
npm run build
```

The self-contained release is written to `release/The-Long-Run-NBIM.html`. New image/audio files under `assets/` are embedded automatically when referenced by a literal relative path in the source.

## Browser checks

```sh
npm ci
npx playwright install chromium
npm test
```

The test runner builds the exact standalone HTML, starts a temporary server, and runs mode/progression, map, native-alpha art, scenery joins, landmark framing, full-venue placement, gap physics/rendering and offline packaging checks. It uses `/usr/bin/chromium` when present, otherwise Playwright's installed Chromium. `CHROMIUM_PATH` can select another executable. `PLAYWRIGHT_MODULE` can point at an existing Playwright module. `TEST_URL` can select an already hosted standalone build.

Progress and local scores use the browser's local storage. The original `?unlock=all` URL option remains available for demonstrations; ordinary play retains chapter and runner unlocks.
