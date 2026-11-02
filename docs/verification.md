# Release verification — scenery, venues and props 1.4

All **12 browser suites passed** against the exact self-contained release HTML using Playwright 1.56.1 and Chromium 154: modes, menu, scenery, art-layers, downtown, venues, venue-pacing, office-host, props, water, gaps, standalone. Command: `PACING_CAPTURE=0 npm test`. The pacing assertions still ran in full; that flag avoids repeating the already-reviewed source gallery.

The tested HTML is **38,195,724 bytes**, with **60 embedded assets**. SHA-256:

```
f977a0b6b2645f56f0ee89d198cab4c6077daea46b0af77e57e5df44441201c8
```

## Coverage and findings

- Story/Endless, saved seeds, chapter locks/map, touch and controller navigation, history reveal, runner unlock, retries and default Next chapter/Main menu actions.
- Nineteen native city camera crops, alpha silhouettes, every reachable scenery join, moving-camera frames, complete chapter coverage, and desktop/mobile DPR2 captures. Canvas, direct WebGL and Pixi paths all passed.
- Actual chapter simulation at 120 Hz checked first visible venue pixels, full frontages and runner crossings. Kabin begins at 21.70 seconds on desktop and 18.97 seconds on mobile; JOJU at 19.10 and 17.53 seconds. Three ordinary blocks separate each Midtown venue, with no simultaneous named frontages. All entrances reach the runner before victory.
- One World Trade Center remains framed after idle/retry and eight seconds into a run. The complete Brooklyn Bridge remains readable across three viewport widths with its river footing preserved. Named landmarks do not repeat in the Endless continuation.
- 505 retains its blue/cyan lobby, full glass entrance and paired revolving doors. Its greeting uses the current run distance so a retry cannot inherit late-course visibility. The office host's feet and head remain fixed during one short wrist greeting; pause/reduced motion and Canvas/Pixi parity passed.
- Painted pickups, market-risk hazards and clearer signs preserve collision, jump/slide clearance, collection rewards, buffs and spring behavior. Original Park obstacle pixels remain unchanged.
- Original Park water changes inside the lake mask (27,742 measured pixels), with the bank unchanged; pause and reduced motion freeze it. Complete terrain gaps, joined/separate openings and real jump/landing behavior pass on four seeded slopes.
- All 40 original source asset hashes remain unchanged. Scripts, fonts, artwork and audio load without external requests; Contrarian remains playable offline.

## Park restoration and visual review

Before the separate shared pickup/sign polish, all **14 full-stage Park frame pairs were pixel-identical** to approved commit `156db816f0a43420b87864f5c61fde7878344035`, including desktop, mobile DPR2, Canvas, joins, finish and moving water/leaves. An additional background-only comparison remains pixel-identical with the new gameplay objects present. The original five Park art/ambience source files are unchanged.

The retained reports are under `docs/verification/`: `park-restore-paired-frames.json`, `park-original-assets.json` and `park-background-check.json`. This is an exact scenery restoration; shared pickup/sign artwork is an intentional separate improvement.

An independent agent reviewed source-rendered joins, the delayed venues, all three bridge widths, props and the office host without remaining blockers. Its scope and evidence are in `visual-review-v14.md`. The coordinating agent also inspected the final standalone Park and Midtown captures. Native art dimensions and source provenance are documented beside each feature; no raster enlargement is claimed as new detail.

## Packaging and limits

The game ZIP is CRC-validated and contains the tested HTML byte for byte. The cutscene handoff contains that same playable HTML, current editable source, native references, audio, proposed shot plans, prompts and integration notes. Its own file manifest records hashes. No new cutscene videos are implemented or generated.

These are Chromium checks with emulated mobile sizes and controller input, not physical-device or cross-browser certification. Offline gameplay was tested through localhost. The managed browser blocks `file://` navigation by administrator policy, so direct local-file opening is not certified here. Downloaded ZIP integrity is verified separately before delivery; checksums are in `release/SHA256SUMS.txt`.
