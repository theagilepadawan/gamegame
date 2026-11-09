# Version 1.25 verification

## Scope

GDL ringing/connection animation, a mix of the two supplied recordings,
Hellandussen translation, corrected clock/dialogue wording and unique Story
prop captions. A modestly faster Endless ramp and recurring seeded IPO Hype
Machine encounters. [Implementation and dialogue](comms-and-endless-v125.md).

## Model checks

- 384 Story course configurations (three districts, two runners, 32 seeds,
  ambient jetpacks on/off): unique obstacle captions, including both routes
  and Contrarian additions. Disabling only the caption pass produces identical
  geometry, movement metadata and rewards.
- 16 real collision-free Downtown control witnesses; 48 Midtown/Park witnesses
  with reachable ledge coins; 1,008 moving-overhead slide traversals. No damage,
  invincibility or required triple jump is used by these route witnesses.
- 28 fresh control witnesses for all fourteen Endless section families at
  0 and 240 seconds under the new speed curve, saved in
  `tests/fixtures/endless-controls-v125.json` and replayed through the engine.
  Twelve existing Story snapshots, slope clearance, and ordinary jetpack and
  Contrarian recovery also pass.
- 42 × 64 generation diversity cases and 45,824 terrain samples; repeatability
  remains independent of viewport, collection choices and frame timing.
- 1,600 generated sections contain 1,448 gaps with 1,316 distinct normalized
  widths across four crossing bands. All 128 opening seeds have >111px terrain
  range, at least three gaps and a broad crossing in the first minute.
- 128 complete, damage-free IPO fights and landings: two runners, compact and
  desktop widths, first/fifth encounters, sixteen seeds each. Inputs react only
  to visible forecasts using normal thrust/release. Street position and Story
  progress are preserved, return speed matches the paused course, and the
  score receives exactly three 150-point awards plus the 500-point defeat award.
- 128 distinct attack trees, multiple branch counts, more than 250 safe-lane
  heights and 100 warning durations. Scheduler sampling produces 69 recurring
  IPO offers with independent seeds. Resizing keeps the machine visible and
  preserves the forecast/arrival timing; shared junctions are reframed once.

These tests establish the stated samples and invariants, not exhaustive proof
of every generated seed or a device frame-rate benchmark.

## Browser checks

The call tests exercise actual Play → ringing → conversation → title gesture
→ gameplay. The supplied mix produces measurable audio in the effects graph
while music elements are paused. Natural/early connection, hidden-tab resume,
mute, Skip, Escape, cancellation, pagehide and reduced motion are covered.
The original surprise sound and held expressions retain their prior checks.

The translation is checked by hover, focus, Enter and touch. It does not advance
the dialogue; Escape dismisses it before skipping the call. Ringing, the longer
first reply and its tooltip fit desktop, 844×390, 568×320 and 390×844 viewports.

The Endless browser check collects a normally scheduled IPO pickup, renders
its warnings and active price branches, and returns to the street on desktop
and compact mobile. It exercises the real event handler, boss HUD, thrust
labels and landing. Collected pickups are excluded from rendering immediately,
including during the suspended street encounter.

The release checks additionally cover modes/unlocks, native prop registration,
title music, chapter film flow and standalone resource loading. The offline
check blocks external resources and verifies the forty original asset hashes,
current art, music, portraits, film and embedded GDL cue.

## Delivery

The compiled HTML has 77 embedded assets. Production artwork is retained at
its previous native resolution; the exact byte count is in the release metadata.

The ten-second GDL preview uses 300 actual browser frames, with the supplied
mix and reaction cue aligned to their runtime triggers at the game's default
effects gain. Its 30 fps encoding is a review format, not an FPS benchmark.

The ready-to-play ZIP must contain the exact compiled HTML and pass CRC checks.
The editable handoff is rebuilt from its staged source and compared byte for
byte with that HTML. Native artwork and both original ring recordings are
retained; still references use lossless encoding with decoded-pixel checks.
The duplicate compiled HTML may be omitted from the source handoff to stay
under 100 MiB, with exact rebuild instructions provided. Archive hashes and
sizes are recorded in `release/release-metadata.json` and `release/SHA256SUMS.txt`.
