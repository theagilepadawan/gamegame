# Release verification — Living city and varied Endless 1.10

The reference is the user's identified **v1.6.0**, recovered from commit `a551054`. The current v1.9 game remains the implementation baseline. Midtown restores the original open skyline, glass frontage and library in its opening stretch; later venue streets retain their complete current native paintings and anchors. Downtown retains its current detailed artwork with immediate horizontal movement, grounded traffic and restored stone terrain.

## Gameplay and preservation

- The new Endless director produces 64 distinct geometries from 64 seeds in each of 36 route-family/progression groups. The former director produced one normalized geometry per family across the same seed sample.
- All 12 route families, seven pickup kinds and 11 obstacle/platform/spring types occur in automatic runs. Tests cover 45,824 continuous terrain samples, deterministic seeds across viewport/reward/spawn-clock changes, escalating combinations and the bounded speed curve.
- Independent 120 Hz physics testing found and replayed 24 collision-free traversal sequences, without shield absorption or a required triple jump. Seven full-span overhead clearances and jetpack/Contrarian recoveries pass.
- Forty original assets, seven unaffected modules, nine pinned physics/audio source ranges and 12 procedural Story snapshots remain unchanged. Story/Endless progression, retries, character unlocks, keyboard/controller chapter defaults and seed handling pass.

## Scenery, gaps and venues

Desktop, compact, mobile DPR2 and Canvas fallback profiles pass 216 scene layouts, 66 opacity scans, all six original Park pixel signatures, native bitmap/GPU checks, complete chapter traversal, double/triple jumps, jetpack, Contrarian recovery and bounded caches. The restored native vista pixels and real GPU uploads are verified separately from the current opaque street paintings. Portrait plates remain 1024×1536; the unique landmark source is 1536×1024 and the stone material is 1254×1254.

The current camera has immediate horizontal movement and a gentler opening on ultra-wide views. At logical width 1440, Kabin first appears at 15.9 seconds and JOJU at 9.5 seconds. Current venue anchors stay attached to their full street paintings. Downtown never shows both venues together, and standard Midtown views never contain two complete venues at once.

The visibility test passes 11 logical widths from 540 to 1440. Complete recognizable Kabin signage/doors remain clear for at least 3.15 seconds, LEI at least 3.35 seconds, and every Midtown frontage at least 3.35 seconds. The final 505 entrance keeps its blue/cyan glass, revolving doors and office host.

Full-depth gaps pass actual support/collision, jump/landing, void-pixel and Canvas fallback checks on real seeded uphill, downhill, crest and valley terrain. Stone changes no gap pixels; Park rendering is unchanged by the material module. Traffic tests cover 896 standard layouts and 160 production-depth layouts. Narrow streets use one correctly scaled lane; wheel contact and shadow remain on the road while car bodies naturally overlap the pavement behind them.

## Chapter map

The two map strips contain native, unchanged crops of the approved idle and six running poses. Desktop/mobile tests pass character identity, route travel, reverse facing, stable idle, live reduced-motion changes, mode return and locked-character/chapter behavior. The existing keyboard, controller and touch menu checks pass. Playable character atlases are unchanged.

## Build and delivery

Final HTML: 81,676,440 bytes with 107 embedded resources, SHA-256 `8ed306517a2eae45874f45b7b93201ba8610412f3e9949863bfd63f4fed41379`. The final standalone passed all baseline/native-asset checks, both map characters and course switching offline, and Contrarian entry/return offline, with no external requests, missing resources or browser exceptions.

The playable ZIP is 61,020,797 bytes, SHA-256 `34c41755750e9c714b58037687fefec88f31e8891dd4b098bd5c2b6d0acbaf47`; CRCs and byte-identical inner HTML passed. The source handoff packager verifies complete source manifests and a byte-identical rebuild. Current artifact hashes are in `release/SHA256SUMS.txt`.

Actual gameplay previews are `release/Opening-v110-detail.png`, `release/Midtown-v110-detail.png` and `release/Midtown-v110-office.png` at 1920×1080. `release/Map-v110-characters.png` compares both real chapter-map characters from DPR2 browser captures. All were visually reviewed with the final framing.

These checks use cloud Chromium and software WebGL. Mobile profiles are browser emulation; physical-phone/Safari performance is not certified. The managed browser blocks direct `file://` navigation, so offline verification uses local HTTP loading followed by a fully offline browser context. Native high-resolution city assets retain their existing substantial decoded-memory footprint; CPU/GPU prepared-image caches stay bounded.

Historical v1.9 results are preserved in `verification-v19.md` and do not certify this release.
