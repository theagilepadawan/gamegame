# Living city and varied Endless — v1.10.0

This version combines the movement and atmosphere of the supplied v1.6 reference with the detailed venue streets introduced in v1.9. It also replaces Endless's fixed section patterns with seeded compositions. The branded game remains the source baseline; this is not a full rollback to the reference HTML.

## City composition and movement

`scripts/city-vistas.js` restores the approved v1.6 Midtown glass canyon, library frontage, dry atmosphere and unique-landmark panorama from reference commit `a551054`. This change primarily covers the opening stretch corresponding to v1.9 source segments 0–3. The retained street begins at segment 4, preserving the later high-resolution venue blocks and their existing joins. A street tree covers the transition into that retained architecture.

JOJU, Omar's, Uncle Gussy's and the complete blue/cyan 505 entrance with its host remain in their later, separated locations. Downtown retains its v1.9 native paintings and the spacing between Kabin and LEI. Native artwork pixels are retained through prepared canvases and textures; a larger render buffer is not presented as newly authored detail. The new opening uses native reference assets, while Downtown and later Midtown continue using the v1.9 1024×1536 paintings and authored seam repairs.

The shared city camera now responds horizontally as soon as the runner moves. Its opening travel gradually increases from half the configured parallax rate to the full rate while preserving the later venue timing. Jumps do not shift the architecture vertically. The Midtown opening contains deliberate depth between its atmosphere, landmarks and near facades; the retained venue fronts continue to move with their own surrounding street.

`scripts/street-life.js` adds taxis and sedans in two near-road lanes. Their wheels and contact shadows are constrained to the road strip, and the playable terrain is drawn in front of them. Decorative traffic uses a separate deterministic visual seed and does not consume gameplay randomness. Reduced motion removes autonomous vehicle travel and wheel rotation while retaining the camera-relative street placement.

`scripts/street-foundation.js` restores the approved v1.6 stone ground material at its native 1254×1254 resolution. The material is registered in world space and clipped to the engine's solid terrain banks, so it does not paint over Endless gaps. It applies to Downtown and Midtown only.

Central Park's original composition is unchanged. Current runner animation sheets, the office host, warm `props-v18` assets, branding and audio are retained.

## Chapter map

The selected playable Nicolai or Trond now appears as a miniature on the chapter path. `assets/map-characters-v20/` contains native crops from the approved character sprites: one idle frame and six running frames per runner. The gameplay sheets themselves are unchanged.

Changing chapters moves the miniature along the path in roughly half a second, facing its direction of travel and settling into a stable idle pose. The movement duration is distance-dependent and capped at 620 ms. Reduced motion jumps directly to the destination with no looping animation. Previewing a locked runner does not replace the playable runner on the map, and the decorative sprite cannot intercept navigation input.

## Endless generation

`scripts/endless-generator.js` owns procedural Endless terrain, route composition and event scheduling. Story bypasses the director and keeps its existing courses. `scripts/endless.js` continues to handle Endless presentation, streak rewards, close calls, music and controls.

Twelve route families combine market rhythm, rooftops, springs, liquidity gaps, moving platforms, crumbling platforms, express trains, mixed jump/slide signals, upper reward paths, breathing room, ladders and volatility runs. Within a family, seeded parameters vary obstacle order, counts, positions, widths, platform heights and motion, route length and reward placement. The last four families are excluded from ordinary selection; recovery sections occur at varied intervals. Platforms offer optional reward paths above survivable ground routes.

Terrain combines three seeded scales of continuous variation rather than resetting to the same height every 4,800 units. Heights can be queried at any distance without maintaining a growing terrain history. The opening starts flat and blends into the varied slopes.

Separate random streams control layout, rewards and events. Planning is based on world distance, so the same seed produces the same course across viewport sizes, spawn-frame timing and ordinary pickup collection. Choosing a special event still invokes the existing event transition and recovery behavior; those deliberate gameplay branches are not represented as ordinary reward collection.

Difficulty rises gradually: action sequences grow from three toward six moves, gaps widen modestly, moving-platform amplitude and frequency increase, and recovery intervals tighten. Speed approaches a ceiling of 700 world units per second. The ceiling leaves room to read upcoming moves on compact screens instead of relying on indefinitely increasing speed. Overhead bars are checked across the full terrain span, uphill gaps are shortened, and representative survival routes require no third-chain jump or shield absorption.

Research, conviction and diversification remain available alongside dividend and opportunity rewards. Jetpack and Contrarian offers use independent seeded cooldowns with separation between events. Their sections provide a safe ground route when the pickup is skipped and recovery space when the event is taken. Contrarian can recur in a long Endless run. The existing Story IPO boss is not injected into Endless by this change.

## Completed Endless validation

These are completed checks of the implementation, not a claim that the final packaged release has passed every browser or offline check. Release-wide evidence and artifact identity belong in `verification.md`.

- `node tests/endless-generation.mjs` passed 36 route-family/progression cases, each across 64 seeds. Every case produced 64 distinct layouts. It also verified deterministic replay across viewport sizes, reward collection and spawn-clock changes; automatic occurrence of all 12 families, seven pickup kinds and 11 obstacle/platform/spring types; bounded history; and increasing difficulty within the speed ceiling.
- The same suite checked 45,824 terrain samples across 128 seeds for determinism, continuity and slope bounds. The largest sampled absolute slope was approximately 0.076. Unlike the old terrain, 1,264 of 1,280 sampled former reset boundaries did not return to the fixed ground height.
- `node tests/endless-fairness.mjs` independently exercised the actual engine with collisions enabled. All 24 representative traversals passed: every family at early and late progression, with varied seeds, without collisions, absorbed shield hits or a mandatory third-chain jump, including buffered jumps. Full-span slide clearance and actual jetpack/Contrarian launch and recovery checks also passed.
- The independent suite compared Story generation and stepping against baseline commit `37b73ab36a04531f6e5221c0168ab5c30c9a828e` for both characters, three seeds and two logical viewport widths. Its report records the tested engine, presentation and generator source hashes.

Detailed reports are written to `review/v20-endless/generation-report.json` and `review/v20-endless/fairness/report.json`. These samples provide evidence for diversity and reachability; they are not an exhaustive proof for every possible seed or player input.

## Proposed next challenges

These are suggestions, not features included in v1.10.0:

1. **Optional IPO encounters:** after roughly two or three minutes, offer a clearly marked entry into a short price-graph miniboss arena. Reuse the existing graph-dodging controls, then return to a safe stretch of Endless terrain.
2. **Upper-route conviction challenges:** mark a temporary high route with a visible reward multiplier. The player chooses the more demanding sequence while the ground route stays available; missed entry does not force a dangerous recovery.
3. **Announced market shocks:** use a short warning before a brief themed sequence, such as a sell-off descent or a bull-run climb. Vary the pattern and rewards while preserving readable jump/slide spacing and a recovery section afterward.
