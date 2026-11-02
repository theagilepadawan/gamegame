# Release verification — Midtown atmosphere 1.5

All **six affected browser suites passed** against the exact self-contained release HTML using Playwright 1.56.1 and Chromium 154: `midtown-atmosphere`, `scenery`, `venues`, `venue-pacing`, `office-host` and `standalone`. They ran sequentially with `TEST_URL=http://127.0.0.1:4181/release/The-Long-Run-NBIM.html`; `PACING_CAPTURE=0` kept the complete pacing assertions while avoiding a redundant gallery. The new Midtown suite captured 20 current desktop/mobile frames.

The tested HTML is **38,842,804 bytes**, with **63 embedded assets**. SHA-256:

```
19a5e509fd5bc2679553c891955427e62d17b81706f806b3d67a3015e94d98f1
```

## Changes and preserved behavior

- Four new native paintings restore Midtown's warm office district: a layered skyline, glass offices, a limestone café and an attached construction crane. Garden panels occur twice instead of seven times. Smaller trees between ordinary blocks reveal more architecture; trees beside named venues retain their approved scale.
- All **84 sampled camera/venue/host projections** match v1.4 exactly. Desktop and mobile full-frontage and runner-crossing timelines also match exactly. JOJU, Omar's, Gussy's and 505 keep route slots 8, 12, 16 and 20, with three ordinary blocks between each pair.
- The real chapter simulation confirms the same native-pixel and frontage reveal times, no simultaneous named frontages, and complete entrances before victory on desktop, mobile DPR2 and compact landscape. JOJU's first native pixel appears at 19.10 seconds on desktop and 17.53 seconds on mobile.
- Twelve deterministic Downtown and Central Park scenery renders remain pixel-identical to v1.4. All **40 original source asset hashes** remain unchanged. Venue artwork, host artwork, venue/host code, Park implementation and game engine match their v1.4 file hashes.
- Native artwork and prepared camera crops match their source pixels. The construction asset keeps its complete crane using uniform display scale within an unchanged route slot. No raster enlargement is presented as newly authored detail.
- Finite Story routes, landmark-free Endless continuation, atmosphere coverage and Canvas/direct WebGL/Pixi scenery rendering pass. Full venue geometry, 505 glass entrance, grounding, greeting timing, pause and reduced motion also pass.
- Fonts, code, art and audio load without external requests. The Contrarian event remains playable after taking the loaded standalone page offline.

Reports and the captured console log are in `docs/verification/standalone-run-v15.json`, `midtown-atmosphere-final-v15.json`, `venue-pacing-final-v15.json` and `office-host-final-v15.json`. The layout fixture records the approved reference commit `a45b2399415a6c818212aaca7c9a3a4e09268bed`.

## Visual review

An independent agent reviewed desktop route frames, all four venue frontages and mobile views, finding no blocking seams, clipping, grounding or readability issue. The coordinating agent inspected the final standalone opening, construction and mobile 505/host frames. The warm city depth is restored while 505 retains its cobalt/cyan lighting. See `midtown-visual-review-v15.md` for the visual criteria and capture list.

The full twelve-suite v1.4 result and earlier exact Park restoration evidence remain historical records in `verification-v14.md` and `docs/verification/`. Those unrelated suites were not all rerun for this scenery-only release; v1.5 validation is the six-suite scope stated above.

## Packaging and limits

The release process CRC-checks the game ZIP and compares its HTML to the tested file. The cutscene handoff includes the same playable HTML, editable source, current native references, audio and future production instructions. Rebuilding its packaged source must produce byte-identical HTML. Its file manifest records individual hashes, and `release/SHA256SUMS.txt` records release checksums. Remote downloads are checked separately before delivery.

No new cutscene videos or player integration are included. The handoff distinguishes the user's requested shoe transition after Midtown from suggested staging and the still-pending intro reference video.

These checks use Chromium with emulated mobile sizes, not physical-device or cross-browser certification. Offline gameplay was tested through localhost. The managed browser blocks `file://` navigation by administrator policy, so direct local-file opening is not certified here.
