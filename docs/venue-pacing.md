# Venue pacing — 1.6

The city routes now distinguish source artwork from its position in the world. `LR_SCENERY.layout().blocks` lists the authored sequence, while each visible panel retains its `sourceIndex` for image lookup and `segment` for its world position. Venue metadata finds its world block rather than assuming that image index equals route position.

Opening Bell retains the WTC establishing frame and camera easing. Two complete anonymous city blocks now precede Kabin. Wall Street, Seaport, the single complete Brooklyn Bridge and the East River still separate Kabin and LEI. An additional ordinary Seaport block after LEI lets its frontage pass the runner before the chapter finishes. The fourteen-block route repeats only its final anonymous city/waterfront blocks in Endless.

Midtown opens on glass offices and lower library/masonry streets before the wide Empire State/Chrysler panorama, with two garden breaks later in the route. The panorama appears once in place of the foreground art in logical slots 3–5; those slots still count toward route length. JOJU, Omar's, Gussy's and 505 retain source indices 0, 2, 3 and 5 and route positions 8, 12, 16 and 20 in a twenty-three-block route. Three complete ordinary blocks separate every pair. The v1.4 logical block widths, horizontal camera hold, venue crops and frontage geometry remain the basis of reveal timing.

Version 1.6 adds a shared vertical street projection for jumps: scenery, venue bounds and the office host move together, while the terrain foundation is drawn in world coordinates. This does not move a venue to an earlier route slot or change the chapter's distance. The construction building still uses a uniform display scale inside its existing slot to preserve its complete crane and pavement contact.

The 505 source art and doorway crop were updated separately against the supplied office photograph. Its metadata uses the exact crop and full entrance bounds specified in `office-art-v14.md`. The office host anchor follows the same source-space and camera transform as the entrance.

## Verification

Run `node tests/venue-pacing.mjs` against the development server or set `TEST_URL` to the standalone build. The suite starts real chapters and advances the production simulation at 120 Hz. It records the first rendered native venue pixel, first visible frontage pixel, full-frontage arrival and when the venue center crosses the actual runner X position. Native visibility is sampled at 30 Hz after applying subsequent scenery occlusion and the run's terrain line. A route slot becoming visible alone does not satisfy the reveal assertion.

Desktop (1440×900), mobile at DPR2 (844×390) and compact landscape (568×320) are checked. The suite requires at least fifteen seconds without any venue artwork, no two named frontages on screen together, at least three complete intervening blocks, an ordinary-only screen interval, and every complete frontage and runner-center crossing before the actual victory frame. No duration is inferred only from a guessed movement speed or a source image index.

`review/venue-pacing/report.json` contains measured times and distances. `review/venue-pacing/index.html` and `contact-sheet.png` show the actual starts, fifteen-second ordinary streets, first native pixels, full frontages, runner-center crossings and every desktop architectural join. Existing venue, downtown and scenery suites cover native entrance geometry, greeting timing, WTC/HUD placement, bridge readability, renderer parity and landmark-free Endless continuation.

## Historical reveal reference — v1.4/v1.5

These retained v1.4/v1.5 measurements are the reference for v1.6's unchanged horizontal route, not a claim that the v1.6 release checks have already passed. Current release results belong in `verification.md`. Seconds are from the actual chapter start; each cell is desktop / mobile at DPR2. First pixel refers to native venue architecture visible after tree and terrain occlusion. The first recognizable frontage is measured separately.

| Venue | First native pixel | First frontage pixel | Center at runner |
| --- | ---: | ---: | ---: |
| Kabin | 21.70 / 18.97 | 25.87 / 20.87 | 35.40 / 37.93 |
| LEI | 53.13 / 53.07 | 53.67 / 53.67 | 64.43 / 68.17 |
| JOJU | 19.10 / 17.53 | 19.67 / 18.13 | 24.87 / 25.47 |
| Omar's | 30.03 / 28.87 | 30.63 / 29.50 | 35.80 / 36.80 |
| Gussy's | 41.03 / 40.30 | 41.47 / 40.77 | 46.83 / 48.23 |
| 505 Fifth Avenue | 51.87 / 51.53 | 52.50 / 52.23 | 57.63 / 59.47 |

In that reference, Midtown frontage reveals were 10.83–11.03 seconds apart on desktop and 11.27–11.47 seconds apart on mobile. The shortest interval with no named frontage visible was 3.30 seconds on desktop and 1.30 seconds on mobile. Complete entrances reached the viewport before the runner-center crossing and victory; compact landscape passed the same reveal, separation and completion assertions.

The complete Brooklyn Bridge retains its native scale and original vertical position. Its center is half a block earlier within the waterfront, giving both towers and the span a clear terrain interval without raising the masonry footings out of the river. The downtown suite checks this at all three viewport sizes.

For a validation-only rerun, `PACING_CAPTURE=0 node tests/venue-pacing.mjs` preserves all timing and pixel assertions, writes the measurement report, and leaves the existing visual gallery intact. Its review contact sheet uses a temporary local HTTP server because this environment blocks browser navigation to local `file:` pages.
