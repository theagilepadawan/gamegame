# The Long Run — NBIM Arcade

[Download the playable game](release/The-Long-Run-NBIM.zip?raw=1).

This version starts exclusively from the supplied **The-Long-Run-New-York-NBIM-Arcade (1).html**. The source hash is recorded in `BASELINE.json`. All 40 original art, audio, font and identity source assets are preserved byte for byte; the runtime uses new scenery and venue art where described below.

## Version 1.12 — restore the warm Downtown streets

Downtown uses the complete painted streets from the earlier supplied HTML,
with its original scrolling, opening hold and pavement. The rejected global
river and detached building composition are removed. One World Trade Center
remains; the misplaced Midtown towers were corrected locally. Kabin and LEI
retain their current native detail in separate later street façades, with the
original lampposts and foreground silhouettes in front of them.

Midtown, Central Park, runners, gameplay, Endless generation and chapter-map
miniatures retain their current behavior. This is a Downtown-only correction.

[Verification](docs/verification.md) identifies the actual uploaded reference
and the checks performed. The previous association between the user's version
label and repository commit `a551054` was an inference, not evidence that it was
their requested visual reference. That composition was rejected for Downtown.

The current Nicolai and Trond sprite sheets are unchanged. The rejected cartoon runner study and alternate Park artwork are not part of gameplay.

[Cutscene production handoff](release/The-Long-Run-Cutscene-Handoff.zip?raw=1) contains the complete editable game, native references, audio, a proposed shot slate, Runway prompts and browser integration notes. Start with `START-HERE.md` inside the ZIP. Its location index links to exact native files in the editable game's asset tree. If duplicating the compiled HTML would exceed 100 MiB, the handoff includes verified build instructions and the expected HTML hash instead; every native asset is retained. The separate playable ZIP remains ready to open. Cutscenes are a separate production task; this release does not add video interruptions.

## Story and Endless

- **Story and Endless:** Daily Challenge and the separate Contrarian practice option are removed. The existing Contrarian pickup/event remains in gameplay.
- **Chapter journey:** a scrollable world map, touch dragging, mouse wheel, arrows and keyboard navigation, with clear progress, locked chapters and a miniature of the selected playable runner.
- **Progression:** wins in Opening Bell and Midtown default to Next chapter, including after the fund-history reveal and when using a controller. The Central Park finale defaults to Main menu. Losing a chapter defaults to Retry chapter.
- **Story courses:** fixed chapter terrain; seed and New world controls belong to Endless. Switching modes preserves the chosen Endless seed.
- **Landmark continuity:** Story follows a finite route without mirroring or repeating its landmarks. Endless continues through the original anonymous street tail without returning to WTC, Brooklyn Bridge or named venues; the current gameplay generator varies independently of that scenery loop.

The NBIM branding, music, both runners and their animations, unlocks, fund-history reveal, pickups, jetpack, boss, local leaderboards and environmental effects remain from the supplied build. Leaderboards remain local unless a remote service is explicitly configured.

## Play the download

Unzip `The-Long-Run-NBIM.zip` and open `The-Long-Run-NBIM.html` in a current browser. The HTML includes all game code, fonts, music and art. For an intranet or website, host that HTML as a normal static file. No build step or external CDN is needed to play it.

## Work on the source

Requires Node.js 20 or newer. The build and local server have no dependencies.

```sh
npm start
```

Open the URL printed by the server. `index.html`, `game.css`, `scripts/` and `assets/` are the editable source. `scripts/engine.js` contains the bundled game and Pixi runtime, formatted for maintenance. `scripts/downtown-scenery.js` restores the supplied complete street paintings; `scripts/scenery.js` retains Midtown and delegates Downtown/Park; `scripts/venue-details.js` patches only six storefront areas once, at native source resolution. `scripts/park-scenery.js` preserves the original Park backdrop, `scripts/chapter-menu.js` controls the chapter map, and `scripts/endless-generator.js` owns seeded Endless generation. Retired panorama/traffic modules remain in the repository for history but are absent from the runtime and its asset dependency list.

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

The current browser suite checks modes, map navigation, the actual uploaded Downtown layout and native non-venue pixels, unchanged Midtown composition, actual jump/flight camera projection, the office host, props, Park water, physical gaps and offline packaging. `tests/guidance-obstacles.mjs` checks collision-enabled traversal of the two moving hazards across both runners and all movement phases. Earlier composition/traffic tests remain historical where they describe modules no longer loaded. The release verification records which checks actually ran. Browser tests use `/usr/bin/chromium`; `CHROMIUM_PATH`, `PLAYWRIGHT_MODULE` and `TEST_URL` can select another installation or hosted build for the existing suites.

The Endless generation and independent collision-enabled fairness checks run directly in Node:

```sh
node tests/endless-generation.mjs
node tests/endless-fairness.mjs
```

Progress and local scores use the browser's local storage. The original `?unlock=all` URL option remains available for demonstrations; ordinary play retains chapter and runner unlocks.
