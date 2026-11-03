# Midtown motion and visual review — v1.6

**Pass for the inspected final standalone frames.** The grounding suite completed with exit code 0 on desktop Pixi/WebGL, mobile landscape at DPR2, and the Canvas fallback. It tested the 40,427,626-byte HTML containing 66 unique embedded assets, SHA-256 `7da5731cecf44389ef97c32b1974429a24a5eb78dc291dda175c5132dd0f9ff2`.

The v1.5 comparison captured actual double jumps at 9, 29 and 54 seconds. Its painted curb stayed fixed as the playable street moved, exposing glossy pavement over a broad blue foundation. The Midtown water-mesh count was zero: the water impression came from the painted surface, material and mismatched camera registration. Those before frames remain under `review/midtown-v16-qa/before/`.

The final test uses the production `Ku` frame loop after deterministic route seeks, with real jump inputs, camera easing and rendering. Its **33 captures** cover a centered landmark vista, an early-slope double jump and landing, a timed three-jump chain and landing, an office-crest double jump and landing, and jetpack rise/coast in all three configurations. Invulnerability permits repeatable traversal; it does not substitute a synthetic jump trajectory or camera movement.

Visual findings:

- **Ground continuity:** the exposed surface reads as matte asphalt and dry masonry. The stone foundation remains attached to the playable curb through jump apex, slopes and landing. No reflective water band or uncovered sky strip appears in the reviewed frames.
- **Landmark hierarchy:** Empire State and Chrysler have complete recognizable crowns within a broad skyline view. Foreground offices no longer hide their main reveal. Brick streets, the library frontage and low-rise details provide contrast with the taller glass blocks.
- **Office continuity:** 505 retains its cobalt/cyan glass and revolving doors. The host shares the entrance's projection; the foreground crest naturally occludes her until it clears, with no detached feet or duplicated camera shift.
- **Readability:** the runner, jump effects and route choices remain legible in the desktop, mobile and Canvas captures. The complete construction crane remains grounded and readable during the grand jump.

Automated checks supplement this visual judgment: actual Pixi node positions, all projected venue quads and the visible host anchor match the shared camera transform; landmark crown samples are not occluded by foreground architecture at the main vista. All **141,515 sampled lower-scene pixels** and **1,598 sampled foundation pixels** were opaque. Foundation samples have a warm rather than blue-dominant material balance. Captured near-scene lift reaches **46.60 game pixels** during the grand jump.

Final evidence is `review/midtown-v16-qa/after/report.json` and its capture files. Representative frames inspected include desktop and mobile landmark vistas, double/grand-jump apices, the office crest/landing and jetpack coast; Canvas landmark and office-landing frames were also inspected. The command and full output are in `/tmp/nbim-v16-grounding-final.log`.

This review covers Chromium rendering at emulated desktop/mobile sizes and selected production motion sequences. It is not physical-device, cross-browser or frame-rate certification. The coordinating release checks cover venue pacing, unaffected worlds, native artwork and standalone loading separately.
