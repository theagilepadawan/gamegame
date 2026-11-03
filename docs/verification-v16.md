# Release verification — Midtown immersion 1.6

All **nine affected browser suites passed** against the exact self-contained release HTML: `midtown-atmosphere`, `midtown-grounding`, `scenery`, `art-layers`, `venues`, `venue-pacing`, `office-host`, `water` and `standalone`. Playwright 1.56.1 used Chromium with desktop, mobile DPR2 and Canvas fallback views. Tests targeted `http://127.0.0.1:4181/release/The-Long-Run-NBIM.html`; `PACING_CAPTURE=0` retained every pacing assertion without repeating its gallery.

The tested HTML is **40,427,626 bytes**, with **66 embedded assets**. The motion suite fetched and hashed the served HTML independently of the browser inspector:

```
7da5731cecf44389ef97c32b1974429a24a5eb78dc291dda175c5132dd0f9ff2
```

## Corrected defects and evidence

- The previous fixed backdrop exposed a reflective road during jumps, while the blue terrain foundation also resembled water. Midtown now uses dry matte asphalt and a world-anchored stone foundation. Nearby architecture, trees, venue bounds and the office host share the street's vertical camera projection. The full-viewport distant atmosphere prevents a sky gap.
- The new motion suite runs the production `Ku` loop through actual double jumps, timed ground-chain triple jumps and jetpack rise/coast. All three renderer/viewport profiles passed. Its 33 captures include slope ascent/apex/landing, office movement, grand jumps, flight and a centered landmark view. Rendered lower-scene pixels remain opaque; sampled terrain material is neutral stone rather than the former blue fill. Actual Pixi tile positions and the host's feet match the projected architecture.
- Empire State and Chrysler occupy one native 1536×1024 panorama, replacing the narrow portrait skyline and foreground blocks at slots 3–5. Both complete crowns are inside the readable viewport and clear of foreground architecture/trees at the main reveal. The panorama retains its native aspect ratio and does not repeat in the Endless continuation.
- Library and masonry frontages break up the tall office repeats. Twenty-two rendered native crops/landmark sources passed dimension, source-pixel and alpha-silhouette checks. Scene coverage, reachable joins, moving joins and Canvas/Pixi rendering also passed.
- All 84 default camera/venue geometry samples and desktop/mobile full-frontage and runner-crossing timelines match the approved v1.4 fixture. Actual native-pixel reveal checks on desktop, mobile and compact landscape also pass: JOJU first appears at 19.10 / 17.53 seconds on desktop / mobile, and the four venues remain separated. The blue 505 entrance and relaxed host greeting pass grounding, pause and reduced-motion checks.
- Twelve Downtown/Park scenery comparisons remain pixel-identical to the approved fixture. A separate source probe found all 24 Park/Opening terrain pairs unchanged across flat, uphill, downhill and wave-shaped ground. The Park lake still animates inside its mask (27,742 changed pixels), with the bank stable and pause/reduced motion frozen. All 40 original asset hashes are unchanged.
- Scripts, fonts, art and audio load without external requests. The Contrarian event remains playable after switching the loaded standalone page offline. Jump physics and chapter progression were not edited.

Exact logs and reports are in `docs/verification/standalone-run-v16.json`, `midtown-grounding-final-v16.json`, `midtown-atmosphere-final-v16.json`, `venue-pacing-final-v16.json`, `office-host-final-v16.json`, `water-final-v16.json` and `terrain-preservation-v16.json`.

## Visual review and scope

The coordinating agent inspected final standalone landmark and jump views, including mobile. An independent reviewer examined the actual motion captures; its findings are in `midtown-visual-review-v16.md`. Dry ground, complete landmark silhouettes, the library/masonry variety and 505's cobalt/cyan entrance remain readable in the inspected frames. Native dimensions and generation provenance accompany the assets; no raster enlargement is presented as new detail.

The earlier v1.5 and v1.4 results remain historical records in `verification-v15.md` and `verification-v14.md`. Their static scenery checks did not establish that the former Midtown road looked convincing during jumps. Version 1.6 adds the real-motion and material regression above. The nine suites stated here were rerun; this is not a claim that all fourteen available suites ran for this release.

## Packaging and limits

Release packaging CRC-checks both ZIPs, verifies their playable HTML against the tested hash, verifies the handoff's file manifest and rebuilds its editable source to byte-identical HTML. Remote downloads are checked before delivery. `release/SHA256SUMS.txt` records artifact hashes.

The refreshed cutscene handoff includes current dry-city/landmark references and real gameplay captures. Retired reflective-road references are omitted from its production assets. Intro and post-Midtown running-shoe directions remain future production work; no new video cutscenes are implemented.

These are Chromium checks with emulated mobile sizes, not physical-device or cross-browser certification. Offline play was tested over localhost. Administrator policy blocks `file://` browser navigation in this environment, so direct local-file opening is not certified here.
