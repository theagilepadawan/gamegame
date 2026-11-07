# The Long Run — NBIM Arcade

[Download the playable game](release/The-Long-Run-NBIM.zip?raw=1).

This version starts exclusively from the supplied **The-Long-Run-New-York-NBIM-Arcade (1).html**. The source hash is recorded in `BASELINE.json`. All 40 original art, audio, font and identity source assets are preserved byte for byte; the runtime uses new scenery and venue art where described below.

## Version 1.17 — Ready to run

Both map figures are 12.5% larger. Browsing keeps the familiar run between
destinations. Confirming **Play** gives a small thumbs-up, held for two seconds,
then starts the chapter automatically. There is no lowering animation. The
gesture uses new registered frames matching each approved runner; reduced
motion starts directly. Escape or a changed selection cancels the launch.

The title screen plays the supplied **Why talking to people is a superpower x
Mellow Lounge**, with a gentle fade-in and slightly softer volume. Its full
name appears in the five-second Now playing card. The recording loops, respects
mute and music volume, and stops when chapter music begins. Browsers that block
audible autoplay begin it on the first menu interaction.

## Version 1.16 — A little Manhattan and Trond's reveal

The chapter map now uses a crisp illustrated Manhattan, with Liberty Island,
One World Trade Center, Wall Street and the Brooklyn Bridge in Downtown;
Empire State, Chrysler and Grand Central in Midtown; and Central Park's lake,
Bow Bridge and Belvedere Castle. It is a schematic journey map, drawn as SVG
so the landmarks stay sharp on high-density screens.

Both map runners prepare briefly, follow the route with strides tied to distance,
and settle gently at their destination. Idle stays still. Reduced motion skips
the trip. Trond's first unlock immediately replaces the question marks, shows a
short warm reveal on results, and introduces his slot on the main menu. Selecting
him persists across reloads. Gameplay art, scenery and physics are retained.

## Version 1.15.1 — Kabin detail and classic obstacles

Kabin retains its accepted entrance placement and now includes the original
Norwegian flag and storefront detail. A cached Retina composite preserves the
native storefront pixels instead of reducing them before display. The warm
striped barriers and copper market boards return, with the current slope
alignment, readable Endless widths and moving hoist retained. The main 16-bit
track is displayed as **Downtown Good Company**; the recording and composer
credit are unchanged.

## Version 1.15 — Endless variety and mobile polish

The first Endless hills now arrive after a short safe lead, with irregular seeded
crests and valleys instead of a long fade into barely visible slopes. Gap-heavy
encounters stay in circulation. Single- and double-jump spans, uneven landing
banks and broad stepping-platform chasms appear earlier; wider gaps become more
common with distance. Opening obstacle widths now preserve the artwork's readable
proportions instead of shrinking with the starting speed.

Short landscape screens get a reflowed Story heading, a roomier chapter/Play layout
and larger touch targets. Phone gameplay has a fixed 7.14% closer view, with no
jump-driven zoom; the home view and minimum approach space remain intact.

The five-second music card has a custom vector record/sleeve, a clear “Now playing”
label, larger song text and a restrained fade. Actual playback still controls it.
`longRun.performance` exposes measured rolling FPS, frame/CPU p95, renderer,
resolution and zoom. Drawing follows requestAnimationFrame; physics uses fixed
120 Hz steps. The existing pixel-ratio cap adapts from 2.25 toward 1 under sustained
slow frames. These settings are not a guarantee of 60 FPS on every device.

The accepted city/Park artwork, Easter eggs and pending asset choices remain.
See [release verification](docs/verification.md) for test evidence and limitations.

## Version 1.14 — Story, Endless and asset choices

Story now focuses on the three chapters: no score HUD, result grades, high-score
records or leaderboard entry. Finish Opening Bell, Midtown and Central Park to
unlock Endless; existing completed profiles retain access. The next chapter
remains the default after a win. Old saved Story scores are left untouched.

Endless uses a stronger continuous terrain profile and fourteen seeded section
families. Unequal landing banks, continuously varied gap widths, stepping islands
and wide chasms replace the short uniform gaps. Broad platforms span the longer
chasms. Roofs are spaced farther apart, with mandatory ground hurdles placed
after them instead of beneath low platforms. Speed and combinations increase
with distance while recovery space remains. The seed still reproduces a route
independently of screen size, collection decisions and frame timing.

Choosing an upper Story route no longer deletes the scenery underneath it.
The unchosen branch remains visible behind the active route while preserving
the previous collision and reward rules. Downtown, Midtown and Park paintings,
venue detail, warm lighting, camera motion, runners and default obstacle art
are unchanged from version 1.13.

A minimal now-playing card appears for five seconds on each run/results page
and soundtrack change. It follows actual playback, including exclusive
Contrarian music, and hides when muted or paused. Track titles are editable in
`scripts/now-playing.js`: Midtown is “Good Company Never Dies”, Central Park is
“Diversified Ballad”, and Contrarian is “Good ol’ Company”, as supplied by the user.

[Review five city and five park art directions](release/The-Long-Run-Asset-Choices.zip?raw=1).
Unzip and open `index.html`: A is the actual old art, B–E are new proposals.
Each appears in detail and at gameplay size. The selector only copies choices
for discussion; none of the alternatives replaces runtime art yet. The Park
proposals cover benches and branches only. The separate `asset-options/`
folder contains the native concept atlases, lossless crops and review page.

[Cutscene production handoff](release/The-Long-Run-Cutscene-Handoff.zip?raw=1)
contains the current editable game, native references, audio, proposed shot
slate, Runway prompts and integration notes. Start with `START-HERE.md` inside.
The source rebuild is verified against the playable download. If including
both source and compiled HTML exceeds 100 MiB, the duplicate HTML is omitted
with exact rebuild instructions; the ready-to-play ZIP remains separate.
Unselected asset proposals are provided in the separate art review ZIP.

## Story and Endless

- **Story and Endless:** Daily Challenge and the separate Contrarian practice option are removed. The existing Contrarian pickup/event remains in gameplay.
- **Chapter journey:** a scrollable world map, touch dragging, mouse wheel, arrows and keyboard navigation, with clear progress, locked chapters and a miniature of the selected playable runner.
- **Progression:** wins in Opening Bell and Midtown default to Next chapter, including after the fund-history reveal and when using a controller. The Central Park finale defaults to Main menu. Losing a chapter defaults to Retry chapter.
- **Story courses:** fixed chapter terrain; seed and New world controls belong to Endless. Switching modes preserves the chosen Endless seed.
- **Landmark continuity:** Story follows a finite route without mirroring or repeating its landmarks. Endless continues through the original anonymous street tail without returning to WTC, Brooklyn Bridge or named venues; the current gameplay generator varies independently of that scenery loop.

The NBIM branding, music, both runners and their animations, unlocks, fund-history reveal, pickups, jetpack, boss, Endless leaderboard and environmental effects remain from the supplied build. Leaderboards remain local unless a remote service is explicitly configured.

## Play the download

Unzip `The-Long-Run-NBIM.zip` and open `The-Long-Run-NBIM.html` in a current browser. The HTML includes all game code, fonts, music and art. For an intranet or website, host that HTML as a normal static file. No build step or external CDN is needed to play it.

## Work on the source

Requires Node.js 20 or newer. The build and local server have no dependencies.

```sh
npm start
```

Open the URL printed by the server. `index.html`, `game.css`, `scripts/` and `assets/` are the editable source. `scripts/engine.js` contains the bundled game and Pixi runtime, formatted for maintenance. `scripts/downtown-scenery.js` restores the supplied complete street paintings; `scripts/midtown-painted.js` restores the warm Midtown paintings; `scripts/scenery.js` delegates all three districts; `scripts/venue-details.js` patches only six storefront areas once, at native source resolution. `scripts/park-scenery.js` preserves the original Park backdrop, `scripts/chapter-menu.js` controls the chapter map, and `scripts/endless-generator.js` owns seeded Endless generation. Retired panorama/traffic modules remain in the repository for history but are absent from the runtime and its asset dependency list.

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

The current browser suite checks modes, map navigation, the actual uploaded Downtown layout and native non-venue pixels, warm Midtown composition, fixed backdrop positions during real jumps/flight, the office host, props, Park water, physical gaps and offline packaging. `tests/guidance-obstacles.mjs` checks collision-enabled traversal of the two moving hazards across both runners and all movement phases. Earlier composition/traffic tests remain historical where they describe modules no longer loaded. The release verification records which checks actually ran. Browser tests use `/usr/bin/chromium`; `CHROMIUM_PATH`, `PLAYWRIGHT_MODULE` and `TEST_URL` can select another installation or hosted build for the existing suites.

The Endless generation and independent collision-enabled fairness checks run directly in Node:

```sh
node tests/endless-generation.mjs
node tests/endless-fairness.mjs
```

Progress and local scores use the browser's local storage. The original `?unlock=all` URL option remains available for demonstrations; ordinary play retains chapter and runner unlocks.
