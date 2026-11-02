# Release verification — world polish 1.2

All seven release suites passed against the self-contained HTML using Playwright 1.56.1 and Chromium 154.0.8037.57. The suites in `npm test` cover the following:

- Story/Endless menus and four leaderboard categories; no Daily or separate Contrarian entry.
- Stable Story terrain and isolation from the saved Endless seed.
- Retry, chapter unlocks, Trond unlock, fund-history reveal, and Next chapter defaults through keyboard and gamepad input.
- Fresh-profile chapter locks, keyboard navigation, actual touch swiping, D-pad/analogue navigation and layouts down to 568×320. The player marker follows selection, locked nodes keep their anchor during feedback, and chapter browsing does not expose later scenery.
- 1,452 scenery camera/mode/viewport cases, covering finite Story routes and the Endless continuation without returning to the original landmark painting.
- One World Trade Center framing at the start and eight seconds into a run, at 1440, 844 and 568 pixels wide, including menu idle and retry. Full Story panorama coverage, camera continuity through Contrarian/boss waits, and a bridge-free repeating Endless tail.
- Kabin/LEI composition confined to their architectural bays. Midtown facade mounts, the 505 entrance perspective, Gussy's curb contact and the once-only 505 greeting, on desktop, mobile layouts and Canvas.
- Actual jump/landing physics on four seeded slopes, merged touching holes, solid intervening islands, and pixel checks for complete shafts without residual road, curb or internal hills. Wide crest/valley openings and airborne shadows are included in visual review.
- Actual Pixi, direct WebGL and forced Canvas scene captures on desktop and mobile viewport sizes, with no JavaScript or failed asset requests.
- All 40 original asset hashes unchanged; standalone fonts and assets load without external requests; Contrarian starts and ends offline.
- ZIP CRC validation and byte-for-byte comparison of its HTML with the tested release.

Manual visual review checked the restored skyline, full bridge landing, Seaport storefronts, Midtown venue scale and contact, the smallest map layout, and complete gaps. An independent review followed a double jump through takeoff, flight and landing. The final Endless Battery variant was checked at both incoming and outgoing joins, including a later repeat, for severed buildings, transparent overlaps, unsupported bridge fragments and waterline jumps.

Tested HTML SHA-256:

```
9fd060927fc13512f82b18c86e9edc8cf19de59357f5874169d9e8644b263488
```

The reusable checks are in `tests/`; checksums for the HTML and playable ZIP are in `release/SHA256SUMS.txt`. Browser tests emulate mobile viewports and controller input; these results are Chromium checks, not a claim of physical-device or cross-browser certification.
