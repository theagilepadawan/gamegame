# Version 1.22 — Comms, arrivals and district fairness

The opening call now fills a larger retro colour console. Grete’s first line
never starts the alert automatically. Advancing into Nicolai’s first reply
plays the supplied cue once, switches through two local surprised expressions,
and holds the settled face and vector exclamation until the next advance.
The approved neutral hair, head outline and jacket remain fixed. Hidden-tab
pause, mute, cancellation and reduced motion retain their existing behavior.
The new native sheet is 1536 × 1024, with a verified pixel-identical lossless
WebP; runtime patches use only the new eye/brow and mouth areas.

Nicolai’s approved twelve-pose turn/rear-walk now also enters 505’s left
revolving-door bay. The near glass leaf crosses in front of him as he walks
into the blue lobby. The subway path, short grey hair, ordinary gameplay/title
sprites, full 505 frontage and far-right host remain. The gift film still
belongs exclusively to Midtown results → Next: Central Park.

Midtown and Park have horizontally staggered route hazards, a clearer middle
jump/slide rhythm and two supported platform challenges instead of ground
obstacles directly under low decks. Reward trails arc over supported benches.
Unchosen-route coins fade at the fork rather than advertising uncollectible
rewards; their props remain as subdued scenery. Platform movement/collapse
carries bound props and coins with it. Short finance jokes replace generic
construction captions, using the retained painted prop artwork. Details are in
[district-polish-v122.md](district-polish-v122.md).

## Completed checks

The final standalone passed these thirteen suites:
`briefing-alert`, `story-briefing`, `subway-boarding`, `finish-gates`,
`finish-mobile`, `chapter-cinematics`, `props`, `district-presentation`,
`story-route-physics`, `guidance-obstacles`, `city-regressions`, `modes`,
and `standalone`. The complete log is in `verification/v122-release-checks.log`.

- Click-only cue timing; actual nonzero PCM through the effects mixer; visual
  hold after the sound ends; two distinct facial frames with unchanged hair
  and jacket pixels; next-click removal; hidden-tab pause, mute and cancellation.
- All six dialogue beats and controls fit 1280 × 720, 844 × 390,
  568 × 320 and 390 × 844. Reduced motion uses a still reaction.
- Run → four turning poses → eight rear-walk poses at both subway and 505;
  monotonically advancing position, registered feet, perspective and native
  foreground occlusion. Pause, airborne landing and reduced-motion arrivals.
- All three real chapter completions with both runners; six results/progression
  paths; 568 × 320 touch / DPR2 and Canvas fallback. The supplied film’s actual
  ending, Skip, muted/hidden playback, direct-Park exclusion and decoder failure.
- Active-route rewards remain fully visible; unchosen rewards fade once;
  drawing state is restored; original Park geometry outside small plaques;
  actual jump/slide collisions and rewards. 32 route-collision probes and
  144 moving-guidance slide traversals, plus Park tree clearance.
- 2,376 fixed-camera Midtown layout checks, native painting/venue hashes,
  opaque seams, spaced Easter eggs and 505 present only at the finish.
- Forty baseline assets remain byte-identical. The standalone loads fonts,
  scripts, native art and audio without external requests and remains playable
  offline across courses, characters and Contrarian.

`tests/district-fairness.mjs` additionally found and replayed 48 safe control
sequences through actual 120 Hz physics: six sections × two districts × two
runners × two terrain seeds. Each fork choice survives; the ledge reward is
collected by contact without a magnet, shield or triple jump. The exact
controls are committed in `tests/fixtures/district-controls-v122.json` and
replayed by the default test suite. Two explicit collapse checks confirm the
prop and coins follow their deck and leave no invisible collision. Set
`DISTRICT_SEARCH=1` to regenerate the bounded input search.

The unchanged Endless generator also passed its 42 × 64-seed diversity audit,
45,824 terrain samples and 1,600 actual-model spacing sections (1,449 gaps).
Only its weaker obstacle captions changed in this release.

## Build and delivery

The tested HTML is 66,953,272 bytes with 75 embedded assets.
SHA-256: `54480c26068b9b69b4a43ebbdba0bd114ee3422082adfb1aa4bdc46dd219219f`.
The standalone is built from the same source shipped in the handoff. Packaging
verifies ZIP CRCs, exact inner HTML and a byte-identical staged-source rebuild.
Current archive sizes/hashes are in `release/release-metadata.json` and
`release/SHA256SUMS.txt`; public downloads are checked against the final immutable
commit separately before delivery.

`release/Nicolai-v122-office-entry.mp4` is a silent 119-frame, 30 fps,
1280 × 720 capture of the actual 505 finish, lasting 3.967 seconds. Current
PNGs show the new console, rear entrances and district layouts. Native source
art is retained; no city or character assets were reduced for packaging.

These checks establish the exercised behavior, not every possible seed or
subjective art approval. Browser tests use cloud Chromium/software WebGL;
phone layouts are emulated, not physical-device/Safari performance certification.
