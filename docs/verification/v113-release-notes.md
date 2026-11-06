# Release verification — warm Midtown and finance props, version 1.13

Midtown now uses complete warm paintings rather than separate architecture,
skyline and atmosphere layers. Its original golden skyline, Bryant Park/library
and Fifth Avenue scenes were recovered from lossless 1672×941 PNG masters.
A matching ordinary restaurant street is the only new background painting.
Current native Joju, Omar's, Gussy's and complete blue/cyan 505 fronts are
integrated into those streets. The office host keeps her original native art.
Downtown's accepted v1.12 restoration is unchanged.

The city has one slow horizontal camera, an opening hold/ease and a fixed y=-8.
Double jumps, the grand jump, slopes and jetpacks never lift or scale the
painted background. A longer opening hold on wide displays prevents early
venue reveals; narrow portrait displays receive enough horizontal travel to
reach the office before completion. This restores the original warm composition
and calm movement, with an added ordinary block for venue spacing. It is not
an assertion of pixel-identical timing to an inferred repository version.

The supplied earlier HTML identified in v1.12 has SHA-256
`9fd060927fc13512f82b18c86e9edc8cf19de59357f5874169d9e8644b263488`.
Repository commit `a551054` was incorrectly associated with that reference in
an earlier pass. Its separate city layers are not the current visual authority.

The cached 2090×1176 Midtown composites preserve more native venue detail.
Lossless encodings recover fidelity from the original background masters;
this is not newly invented high-resolution detail in those old paintings.
All six current venue source files and all forty baseline assets remain
byte-identical. Park paintings, runner atlases, audio, curbs, physics, Endless
variation and the chapter map retain their existing behavior.

## Finance assets

Fine Print, Fee Drag, Red Tape and Moving Guidance use a new transparent native
1536×1024 atlas, with lossless crops at least 675 pixels wide. Handles, the bow,
asterisk and suspension eyes are registered separately from the solid body.
The body aligns to the existing obstacle face; the engine retains its forgiving
collision insets. The two late Midtown hoists use their existing 3.8-second
physical cycle and the same simulation position for collision and rendering.
A small Benchmark plaque is added to the original Park bench. No other Park
bench, branch, tree or paving pixels are changed by this prop pass.

The office greeting now uses the same body clipping path for its still and
waving poses. This prevents tiny shoe-edge changes at its smaller background
scale; the same original source pixels and restrained wrist animation remain.

## Executed checks

The full default browser suite passed against the built standalone HTML:

- 2,376 Midtown layout/camera comparisons across chapter/Endless, distances and
  viewport sizes; 79,992 opaque-coverage samples across seams; pinned lossless
  originals, six native venue hashes and unchanged engine camera/curb functions.
- Real chapter reveal times on desktop and wide phone: Joju around 13 seconds,
  Omar's 24.5, Gussy's 42.5 and 505 at 55. The full office entrance is visible
  around 57.8 seconds. Portrait also shows all four before the 60-second finish.
- 33 actual Midtown frames: desktop, phone DPR2 and forced Canvas, with double
  jumps, timed grand jumps, landing and jetpack rise/coast. Background and
  storefront y positions remain fixed while the player's camera moves.
- 264 Downtown comparisons against the actual supplied reference and 18 actual
  gameplay frames across desktop, phone DPR2 and Canvas, both runners, real
  double jumps and jetpack. Its non-venue street pixels and camera stay intact.
- Office greeting on all three renderer/layout profiles: full grounded figure,
  stable head/body/shoes, once-only wrist gesture, pause and reduced motion.
- New prop readiness, all four solid faces, stable variant selection, actual
  jump/slide collision outcomes, unchanged rewards and springs, original Park
  geometry with the plaque disabled, reduced-motion pickup behavior.
- 144 collision-enabled moving-board slide traversals across both runners,
  three seeds and twelve phases; standing probes hit lowered boards and clear
  fully raised boards. Park groves keep obstacle silhouettes unobscured.
- Story/Endless controls, fixed Story seed, history reveal, keyboard/controller
  next-chapter defaults, retries/unlocks, map miniatures and native runner frames.
- Park water animates only in its approved lake, with stable banks and frozen
  pause/reduced motion. Real joined-gap physics and full-depth gap rendering pass.
- Standalone fonts, scripts, audio, native scenery and added props load with no
  external requests. Offline course/runner switching and Contrarian entry/return
  pass. No browser exceptions or failed assets were reported.

Command: `TEST_URL=http://127.0.0.1:4181/release/The-Long-Run-NBIM.html npm test`.
The tested standalone is 48,789,803 bytes, SHA-256
`577ffc8b70e4a0dce1db8aea91cff9f7ff218552ea446035301bc0afd0b6abf3`.
Representative actual game captures are retained under `release/`. Captures
and automated checks are evidence for visual review, not user acceptance.

## Performance and packaging

The active scenery images drop from 28 / 142,243,272 decoded RGBA bytes in
v1.12 to 19 / 85,627,976 bytes. This measures source images only; it excludes
prepared canvases, GPU textures, sprites and other memory. More source detail
in the lossless backgrounds increases the compressed standalone file size.

Two sequential software-WebGL comparisons used 100 warm-up frames and 240
measured actual game frames per version at 960×540 DPR1, with synchronous GPU
completion and the same 960×540 raster. In the first order, v1.12 median/p95 was
14.4/39.5 ms; v1.13 was 11.4/37.5 ms. In reversed order, v1.13 was 9.7/31.7 ms;
v1.12 was 13.6/50.1 ms. Both comparisons favor the simpler warm composition,
but cloud timing does not establish guaranteed hardware FPS. Raw results are
in `docs/verification/v113-performance*.json`. No other browser test was running
during those measurements.

The game packaging verifies ZIP CRC and identical HTML. The source handoff
is independently rebuilt and compared byte for byte with the tested standalone.
Public ZIP downloads are verified against the immutable release commit before
delivery. Emulated phone layouts do not replace physical-device or Safari
testing. Exact deliverable sizes and hashes are in
`release/release-metadata.json` and `release/SHA256SUMS.txt`.
