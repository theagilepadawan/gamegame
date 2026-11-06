# Release verification — Cohesive New York artwork 1.8

Source and standalone browser checks passed for the scopes below. The uploaded earlier HTML matches the `156db81` visual reference after normalization; it guides the warm painted style and simpler props, not a rollback of the current game. Historical v1.7 results remain in `verification-v17.md`.

## Current change

Downtown and Midtown use opaque panoramas in `assets/scenery-v18/`, with streets, architecture and venue fronts sharing one calm camera. Five base paintings provide each city's main/venue views and an anonymous Downtown Endless tail; three authored join repairs share the same transform. Manifest files record source dimensions and provenance. Dry ground padding preserves the native painted architecture while keeping the lower scene covered during movement.

Six native `props-v18` sprites follow the earlier silhouettes, with smaller signs and crisp runtime lettering. Existing collection/collision/reward behavior, character sheets, audio and progression remain. Central Park keeps its original composition and lake animation. Narrow framing keeps the complete office reachable; very wide screens use a centered 8:3 stage cap, including actual fullscreen.

## Source checks

`COHESIVE_OUTPUT=review/v18-qa/final node tests/cohesive-scenery.mjs` passed against the editable source at `http://127.0.0.1:4181/?unlock=all`. `review/v18-qa/final/report.json` records desktop Pixi (1440×900, DPR1), mobile Pixi (844×390, DPR2) and forced Canvas (1440×900, DPR1).

- **Scenery and motion:** 96 layout cases, 24 full-composite opacity checks, six exact Central Park pixel baselines, 67 captures and 1,713 real motion samples across double jumps, Midtown timed triple jumps and jetpack flight. Assertions cover the shared venue/backdrop camera, stable vertical composition, reachable joins and anonymous Endless continuation.
- **Complete runs:** six actual chapters completed across the three profiles. Every full frontage appeared before the finish. Desktop first reveals were Kabin 40.4 s / LEI 62.0 s and JOJU 23.5 s / Omar's 31.8 s / Gussy 39.9 s / 505 51.3 s.
- **Office and props:** `office-host.mjs` passed desktop Pixi, mobile Pixi DPR2 and forced Canvas; `props.mjs` passed mobile Pixi DPR2. Reports/captures are under `review/office-host-v18/` and `review/props-v18/smoke/`.
- **Preservation:** all 40 original asset hashes, eight unchanged modules and the original simulation/audio prefix match their baselines.

A later small join-footer correction was checked separately, rather than representing the whole capture suite as rerun. Focused native-preservation and opacity checks found zero painted-pixel mismatches and no transparent ground pixels in the five base paintings. Three join captures were reviewed after the correction. Evidence is under `review/v18-scene-diagnosis/ground-extension-report.json` and `footer-check/`.

Responsive checks then covered a 900×900 square window (logical 540 wide) with the entire 505 entrance and host visible at 57.81 s; 96 normal-width camera cases retained their previous formula. A 3200×540 viewport centers a 1440×540 stage. Actual HTML fullscreen at 3840×648 retains a centered 1728×648 stage (logical width 1440), complete coverage and no opening venues. Evidence is `review/v18-qa/responsive/report.json`, its square/fullscreen captures, and `responsive-camera-comparison.json`. The simulation/audio preservation check was repeated after the fullscreen presentation fix.

## Standalone browser checks

The release suites in `review/v18-release/` passed against the self-contained HTML:

- **Modes/progression:** Story/Endless UI, fixed Story courses, preserved Endless seed, fund-history reveal, keyboard/controller next-chapter defaults, final unlock, retry and new-world behavior.
- **Chapter menu:** fresh-profile locks, keyboard navigation, touch swipes, reachable small-screen CTA, no scenery preview, controller navigation/start and no browser exceptions.
- **Water and gaps:** the original Park lake animates within its mask (27,742 changed rendered pixels) with stable banks and frozen pause/reduced motion. Gap tests cover full-depth voids, adjacent/joined support, physics and four seeded slopes, with desktop/mobile/Canvas captures.
- **Responsive framing:** the square office, centered 8:3 limit, no opening venues and actual fullscreen regression passed on the standalone.
- **Offline packaging:** all 40 baseline assets match; fonts, scripts, art and audio load without external requests, and Contrarian remains playable after switching offline.

Logs are `modes.log`, `menu.log`, `water.log`, `gaps.log`, `responsive.log` and `standalone.log`. These named suites and the source checks above describe the verified scope; this is not a claim that every historical test was rerun.

## Visual review

The QA agent inspected mobile/Canvas jump and flight apices and city seams: dry asphalt, fixed paintings, harbor water bounded by its shoreline and warm fronts integrated into the streets. The coordinating agent reviewed representative river, pavement, join, mobile triple-jump and complete 505/host views. The inspected joins have no severed architecture or water strips. This records reviewer observations; motion comfort and final art preference still need the user's review.

Current preview PNGs are `Opening-v18-cohesive.png`, `Midtown-v18-cohesive.png` and `Midtown-v18-office.png`. They were captured before the small footer-only correction; their capture metadata shows zero join panels, so that correction does not change their pixels. They preserve the reviewed normal-width composition through the later responsive framing fix.

## Local artifact identity

- HTML: **31,015,326 bytes**, **50 embedded assets**; SHA-256 `a9d82415522051b255015d50bfba54cf8f3df99f61706a0876bd94243a2c6447`.
- Playable ZIP: **22,671,664 bytes**; SHA-256 `b81af007893a8c9e3761a6670d8ad94bb2a08b80cfa87a3cddb1f01da0f6ef05`.
- Playable ZIP CRC and exact inner-HTML identity passed; proof is `review/v18-release/game-package.json`.
- Cutscene handoff ZIP CRC, every file-manifest entry and inner playable HTML passed validation. Rebuilding the packaged editable source produced byte-identical HTML. The handoff is below 100 MiB; its final size/hash and local validation proof are recorded in `review/v18-release/handoff-package.json` and `release/SHA256SUMS.txt`. Remote download verification remains separate and has not yet been claimed.

No cutscene videos or playback gates are added. The intro reference video and post-Midtown running-shoe production remain future work. These Chromium/emulated-device checks are not physical-device or cross-browser certification. Offline localhost testing is not direct `file://` certification where environment policy prevents local-file navigation.
