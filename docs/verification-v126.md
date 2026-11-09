# Version 1.26 verification

## Scope

Subtle depth fade on Nicolai's existing subway/505 walk-in. Constant Endless
acceleration and four new seeded challenge families, including physically
mandatory slide passages. [Implementation](endless-v126.md).

## Model checks

- Constant +180 world pixels/second for each additional minute, checked through
  3,600 seconds; exact inverse distance clock. No easing or late-run cap.
- 36 collision-free input witnesses through the real engine: all 18 section
  families at starting pace and 240 seconds. No shield hits, invincibility or
  required grand jump. Witnesses are saved in
  `tests/fixtures/endless-controls-v126.json` and replayed against current code.
- 96 slide traversals across both runners, 16 seeds and three speeds; all clear
  the entire terrain-following passage. The matching 96 standing approaches
  and 96 double-jump attempts hit the visible ceiling.
- 54 × 64 course-diversity samples, all 18 families reachable through normal
  scheduling, viewport/reward/frame-clock independence, 45,824 terrain samples.
- 1,600 real-model sections: 1,338 gaps across four width bands, 1,219 distinct
  normalized widths. The first minute of all 128 sampled seeds retains at least
  three gaps and a broad crossing. Minimum opening terrain range exceeds 111px.
- 12 unchanged Story physics/course snapshots; 384 Story courses retain unique
  captions and geometry; 1,008 moving-overhead traversals remain collision-free.
- 128 damage-free IPO fights and landings retain their score, position and pace
  on street return. Ordinary jetpack and Contrarian recovery also pass.

These are sampled controls and invariants, not exhaustive proof of all seeds.
Constant acceleration intentionally narrows the visible reaction window later
in Endless; it is not silently capped to preserve the earlier speed envelope.

## Browser checks

The compiled game passes 32 complete challenge traversals: both characters,
desktop and compact touch/mobile, four new families, starting and late pace.
Captures show actual successful slides with collisions enabled. No damage,
forced grand jump or browser error occurs.

Subway/505 checks verify normal running, four turn poses and eight rear walk
poses, grounded depth/perspective, foreground occlusion, pause and airborne
arrivals. Opacity remains 1 at the doorway, decreases monotonically inside,
and reaches only .76. Canvas alpha is restored after each draw. Reduced motion
retains the short idle transition. All three finish structures also pass at
568×320 touch/DPR2, including the Canvas fallback.

The compiled IPO browser traversal still collects the scheduled pickup, renders
its forecast/price branches and returns to the same street on desktop/compact.
Standalone loading verifies all 40 original asset hashes, embedded native art,
fonts, map characters, audio and playable Contrarian/course switching offline.

## Delivery

The HTML retains all 77 embedded assets at their previous production resolution.
The playable ZIP contains that exact HTML. The source handoff preserves native
assets and rebuilds byte-for-byte to the release HTML; its duplicate compiled
HTML can be omitted to meet the 100 MiB transport ceiling. Release metadata and
SHA256SUMS record current sizes and hashes. Gameplay references use lossless
encoding with decoded-pixel equality checks.
