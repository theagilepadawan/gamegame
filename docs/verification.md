# Release verification — scenery and venue detail 1.3

`npm test` completed successfully against the exact self-contained release HTML using Playwright 1.56.1 and Chromium 154.0.8037.57. All nine suites passed: modes, menu, scenery, art-layers, downtown, venues, water, gaps and standalone.

The tested HTML is **37,477,360 bytes**, with **58 embedded assets**. Its SHA-256 is:

```
a50e3aca9876d1512a6c918b21b0a4962f43668144eca182a7fe59c81f5e8df5
```

## Functional and rendering checks

- Story/Endless selection, stable Story terrain, saved Endless seeds, history reveal, chapter/runner unlocks, retries and keyboard/controller result defaults.
- Chapter-map locks, marker movement, touch swiping, keyboard and controller controls, layouts down to 568×320, and removal of the redundant world number.
- Finite Story coverage, landmark-free Endless continuation, One World Trade Center framing after menu idle/retry and eight seconds into a run, and camera continuity through Contrarian/boss waits.
- Native pixels, camera crops and exposed side edges for all 23 architectural route panels; every reachable join, moving sequences, desktop/mobile layouts and DPR2 captures.
- Separate venue blocks, complete storefronts and 505 glazing, vehicle tyre contact, entrance visibility before victory and the once-only 505 greeting.
- Actual rendered lake pixels change in normal motion in both Pixi and Canvas, while the bank stays stable. Pause freezes the effect; reduced motion remains quiet.
- Complete gap rendering and collision, touching/separate openings, long removed hills/valleys, and real jump/landing physics on four seeded slopes.
- Pixi, direct WebGL and Canvas fallback captures without JavaScript exceptions or failed asset requests.
- All 40 original source asset hashes unchanged. The standalone fonts, artwork, code and audio load without external requests; Contrarian remains playable offline.

## Visual review

An independent reviewer and the coordinating agent inspected the actual rendered scenes, including background-only views where terrain would otherwise hide a join. The final review covered:

- Lower Manhattan landmarks, a clearly readable single Brooklyn Bridge, its complete masonry approaches and its natural emergence behind the Seaport foreground.
- Kabin and LEI in distinct stretches of the route, with complete frontages and natural building/foliage outlines.
- Midtown venue spacing, full 505 glass doors and sign, the contemporary office base, and removal of the obsolete lamp overlay across its entrance.
- Repaired city edges, continuous sky/water/street planes, and warm Central Park scenery.
- Bridge visibility at desktop and narrow widths, plus later Endless views without repeated landmark fragments.

The 25 new runtime art files total 11,854,670 bytes. Architecture/forest layers are natively 1024×1536, atmosphere layers 1536×1024, and the single bridge 2171×724. Camera trims and atlas placement do not add source detail. Original runner artwork remains the current style; the separate cartoon sprite experiment was not integrated.

## Packaging and limits

The playable ZIP is CRC-validated and contains the tested HTML byte for byte. Checksums are in `release/SHA256SUMS.txt`. The reusable browser checks live in `tests/`.

Mobile viewports and controller input were emulated. These results are Chromium checks, not physical-device or cross-browser certification. Offline gameplay was tested through localhost. This managed browser blocks `file://` navigation by administrator policy, so direct local-file opening is not certified by this environment.
