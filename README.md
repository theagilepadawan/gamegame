# The Long Run — NBIM Arcade

[Download the playable game](release/The-Long-Run-NBIM.zip?raw=1).

This version starts exclusively from the supplied **The-Long-Run-New-York-NBIM-Arcade (1).html**. The source hash is recorded in `BASELINE.json`. All 40 original art, audio, font and identity assets are preserved byte for byte.

## World polish — 1.2

- **One World Trade Center:** the original skyline painting is framed between the HUD elements, with an establishing pause and smooth camera departure. Idling in the menu no longer scrolls the landmark out of view before a run.
- **Brooklyn Bridge:** the extended painting carries the deck, cables and landing into a stone abutment and waterfront approach. The bridge appears once; Endless continues through the neighbourhoods beyond it.
- **Downtown and Midtown venues:** Kabin and LEI occupy ground-floor bays in the Seaport painting. JOJU/Omar's signs and awnings follow existing storefronts, 505 follows its glass entrance, and Gussy's is parked at the curb. Positions and scale follow the architecture, without random storefront placement.
- **Clean scenery layers:** the obsolete procedural vehicles and unsupported train no longer draw over the painted downtown scene. Wind, paper, lights and steam remain active.
- **Chapter map:** an illustrated island, winding path, chapter nodes and player marker replace the screenshot cards. The menu keeps its downtown background while browsing, so later chapter scenery stays undisclosed until play.
- **Endless gaps:** terrain, curb strokes and surface details stop at the banks. Deep shafts replace flat patches, with consistent edges on slopes and no invisible foothold between touching gaps.

## Story and Endless

- **Story and Endless:** Daily Challenge and the separate Contrarian practice option are removed. The existing Contrarian pickup/event remains in gameplay.
- **Chapter journey:** a scrollable world map, touch dragging, mouse wheel, arrows and keyboard navigation, with clear progress and locked chapters.
- **Progression:** wins in Opening Bell and Midtown default to Next chapter, including after the fund-history reveal and when using a controller. The Central Park finale defaults to Main menu. Losing a chapter defaults to Retry chapter.
- **Story courses:** fixed chapter terrain; seed and New world controls belong to Endless. Switching modes preserves the chosen Endless seed.
- **Longer scenery:** eight painted extensions preserve the three original paintings. Opening Bell approaches Lower Manhattan from Tribeca, crosses the East River scene, and continues through South Street Seaport and Battery waterfront; Midtown adds Bryant Park and Fifth Avenue office towers; Central Park continues through the Ramble and Bethesda Terrace.
- **Landmark continuity:** Story moves through a finite sequence of paintings without mirroring or repeating its landmark plate. Endless continues through the extension paintings and never loops back to the original skyline.

The NBIM branding, music, both runners and their animations, unlocks, fund-history reveal, pickups, jetpack, boss, local leaderboards and environmental effects remain from the supplied build. Leaderboards remain local unless a remote service is explicitly configured.

## Play the download

Unzip `The-Long-Run-NBIM.zip` and open `The-Long-Run-NBIM.html` in a current browser. The HTML includes all game code, fonts, music and art. For an intranet or website, host that HTML as a normal static file. No build step or external CDN is needed to play it.

## Work on the source

Requires Node.js 20 or newer. The build and local server have no dependencies.

```sh
npm start
```

Open the URL printed by the server. `index.html`, `game.css`, `scripts/` and `assets/` are the editable source. `scripts/engine.js` contains the original bundled game and Pixi runtime, formatted for maintenance. `scripts/scenery.js` controls the continuous background sequence; `scripts/chapter-menu.js` controls the chapter map.

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

The test runner builds the exact standalone HTML, starts a temporary server, and runs mode/progression, map, scenery, landmark framing, venue placement, gap physics/rendering and offline packaging checks. It uses `/usr/bin/chromium` when present, otherwise Playwright's installed Chromium. `CHROMIUM_PATH` can select another executable. `PLAYWRIGHT_MODULE` can point at an existing Playwright module. `TEST_URL` can select an already hosted standalone build.

Progress and local scores use the browser's local storage. The original `?unlock=all` URL option remains available for demonstrations; ordinary play retains chapter and runner unlocks.
