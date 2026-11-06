# Release verification — v1.6 street restoration, version 1.11

The user's reference is **v1.6.0**, commit `a551054`. Downtown and Midtown now use that actual renderer and art composition. The v1.10 replacement panoramas, traffic and extra foundation module are absent from the runtime. Six lossless native crops retain the current venue fronts inside the original architecture. The full 505 glass entrance and its host retain their shared anchor.

## Exact-reference checks

`tests/v16-restoration.mjs` compares against an independent v1.6 source fixture. Across desktop, landscape phone and portrait profiles it checks 2,112 layouts, including chapter/endless distances, wide screens and vertical camera offsets. Every checked source pixel outside the six frontage rectangles is identical to v1.6; every frontage contains its current detail crop. The Downtown terrain, district background/terrain and Pixi background methods match pinned v1.6 source hashes. The frame composition and chapter camera/simulation loop also match pinned source hashes from that reference, for six exact function checks in total.

The detail-crop manifest records native dimensions, source bounds and SHA-256 hashes. These are source pixels, not upscaled substitutes. Painting into the v1.6 frontage happens once per cached source, not on every animation frame.

## Performance measurement

A sequential comparison used cloud Chromium, software WebGL, a 960×540 DPR1 viewport, 20 warm-up frames and 96 measured frames per city/version. Each timed frame called the real game loop and waited for GPU completion with `gl.finish()`. These are controlled frame-work measurements, not a claim of physical-device FPS.

| Measure | v1.10 | Restored build |
|---|---:|---:|
| Loaded city/scenery source images | 65 | 32 |
| Decoded source pixels, RGBA bytes | 408,782,984 | 167,404,856 |
| Downtown median / p95 frame work | 14.7 / 43.7 ms | 10.7 / 32.6 ms |
| Midtown median / p95 frame work | 10.6 / 28.5 ms | 9.4 / 23.5 ms |
| Standalone HTML | 81,676,440 bytes | 42,459,601 bytes |

The decoded-source figure excludes textures, prepared canvases, characters, audio and other browser memory. It measures a 59% reduction in this specific city-image set. No backdrop downsampling was used. Physical-phone and Safari performance still require testing on those devices.

## Focused gameplay changes

Central Park retains its original backdrop. Its decorative trees now form six spaced seating groves; canopies clear the obstacle silhouettes. Bench footings follow the actual terrain without adding collision surfaces.

Two later Midtown overheads use a 3.8-second vertical cycle, fixed guide rails and direction marks. Their visible face and collision box share one simulation position. `tests/guidance-obstacles.mjs` passes 144 collision-enabled slide traversals: both runners, three seeds, two hazards and twelve cycle phases. There is no shield, invincibility or collision bypass in those traversals. Additional standing probes hit the lowered board and clear the raised board, checking that collision follows the motion.

The current Endless generator passes its 36 family/progression groups × 64 seed diversity checks, 45,824 continuous-terrain samples, all pickup/platform families and bounded difficulty progression. Its independent 120 Hz physics search and replay pass 24 section witnesses, full-span slide clearance and event recovery. Its 12 Story physics snapshots remain unchanged.

The broader cartoon prop-art direction is a **proposal** in `finance-props-direction.md`. This release does not claim to replace all roadwork art. The moving-guidance trial uses the existing board with added guide rails.

## Browser and delivery checks

Story/Endless seed handling, chapter defaults, history reveal, keyboard/gamepad progression and retries pass. The first mode-test attempt timed out during a click; a fresh full run passed without changing production controls.

The chapter-map keyboard, controller and touch checks pass, including both miniatures, locked destinations and live reduced-motion changes. All three grounding profiles pass 33 captured states: desktop, landscape phone DPR2 and Canvas fallback, exercising actual double/triple jumps, jetpack, skyline, venue projection, opaque dry ground and office placement. Host greeting/pause, prop collisions and rewards, Park water/bank stability, full-depth gap pixels and gap physics also pass. The host test now reads readiness from the restored v1.6 `inspect()` API.

The final standalone passes offline switching between characters/courses and Contrarian entry/return. All 40 baseline assets remain byte-identical; fonts, art and audio load with no external requests, failed resources or browser exceptions. The final actual-gameplay captures in `release/*-v111-*.png` were reviewed at 1920×1080. The map comparison is an unchanged copy of the existing approved miniature capture.

Final HTML: 42,459,601 bytes, 74 embedded resources, SHA-256 `791fc345f68e2780b03eff385bac0d26246147c2c78d3b4237be6bc54630f6d3`. The playable ZIP is 31,303,436 bytes, SHA-256 `a0fb79a8acd044b2e13e66ac75480b6a8303c7d8aa9c842e3ece5c1ceed423a7`; its CRC and byte-identical inner HTML were verified. The source-handoff packager requires a byte-identical rebuild from the staged source and verifies every archive entry. Current artifact checksums are in `release/SHA256SUMS.txt`.

Earlier v1.10 results are preserved in `verification-v110.md`; they do not certify this restoration.
