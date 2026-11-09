# Version 1.21 — Rear-view boarding and the Central Park reaction

## Behavior and assets

Nicolai keeps the normal running atlas until the subway doorway. A short
deceleration leads into four turning poses; eight dedicated rear-view poses
then carry him slowly into the carriage. He uses the clear left half of the doorway, avoiding the central pole.
His back faces the viewer, his feet
follow the interior floor, and scale reduces by 14% with depth. The native
brass pole passes in front of him. He finishes visibly inside the open door,
rather than continuing sideways past the train. Airborne arrivals first land
on the actual apron. Trond and the other chapter entrances retain their
existing behavior; reduced motion keeps the short stationary finish.

The native 1448 × 1086 transparent atlas and pixel-identical lossless WebP
are in `assets/boarding-v121/`. The hair correction keeps close-cropped grey hair across the crown.
All twelve crops have registered planted feet
and normalized height. No gameplay or title sprite was replaced. Union Square
lettering retains the previous five-native-pixel downward correction.

Grete's first Central Park line triggers one custom gold exclamation and the
supplied `3.mp3` sound through the existing effects mixer. The original upload
is retained exactly. Only 0.400 seconds of initial silence is removed from the
runtime copy to align its audible onset with the visual. Mute/volume, music
ducking, hidden-tab pause/resume, Skip/cancel and reduced motion are respected.
The dialogue and approved ink portraits remain unchanged.

## Verification

Source checks passed for `subway-boarding` and `briefing-alert`:

- Normal run, all four turn poses and all eight rear poses, slow travel into
  depth, continuous foot position, perspective and native handrail occlusion.
- Pause, airborne landing outside the doorway, and reduced-motion arrivals.
- Actual nonzero PCM output through the effects graph, one reaction per call,
  quick Continue, mute, cancellation and hidden-tab pause/resume without replay.
- Exclamation clearance at 844 × 390, 568 × 320 and 390 × 844, plus desktop.

Built-release validation is recorded in `review/v121/release-core-checks.log`
and `review/v121/release-checks.log`. The affected boarding, chapter completion,
mobile and offline checks were repeated after the final hair/path refinement.
The selected suites cover the same features, all six chapter/character exits,
568 × 320 touch / DPR2 and Canvas fallback, the complete opening call,
title music, the existing gift-film transition and standalone offline loading.
The source handoff is rebuilt during packaging and compared byte for byte.

## Artifacts

The standalone build is 65,047,583 bytes with 74 embedded assets.
SHA-256: `256115a4130a49fe3f8cac55949474dd4a25b56d4d498c57418b1b63a711e011`.
The forty baseline assets remain byte-identical; city composition and camera
functions are untouched. Archive sizes/hashes are in
`release/release-metadata.json` and `release/SHA256SUMS.txt`.

`release/Nicolai-v121-boarding.mp4` is a 4.4-second, 30 fps, 1280 × 720 capture of the actual
gameplay sequence, with no added camera motion. It is a silent visual preview;
the reaction sound is verified separately in the running game. The release
PNGs show the rear walk and the intro reaction. Public delivery is checked
against the immutable GitHub commit URLs, archive hashes and ZIP CRCs.

This remains the requested animation experiment for user review. Automated
tests establish behavior and asset integrity; they do not establish subjective
animation approval or likeness.
