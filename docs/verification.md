# Release verification — Story and Endless polish, version 1.14

This release keeps the accepted v1.13 city and Park art/cameras unchanged.
All new asset directions are confined to asset-options/ and the separate
review download. A is the actual previous artwork in both comparison sets.
The current game art is deliberately not replaced pending the user's choice.

## Changes and regression coverage

Story has no competitive HUD, grades, tally, record writes, points popups or
score submission. Internal pickup mechanics remain intact. The local board
has one tab, Endless; old Story saves are retained without being displayed.
Endless is guarded at selection and run start and requires all three completed
chapters, including with the old chapter-demo query. Fresh, partial, malformed
and completed saves are exercised. Normal story wins, default next-chapter
focus, the history reveal, both controller and keyboard progression, retries,
seed preservation and persistent final unlock are checked through the real UI.

An unchosen Story route is retained as visible scenery behind the chosen path.
Its previous non-interaction rules remain: it cannot catch a jump or hit the
runner on the other route. Thirty-two actual physics probes cover both routes,
runners and districts, paired with browser checks that no entities disappear
when the upper route is chosen. A caught camera/landing regression was fixed
by separating route visibility from collision eligibility.

The now-playing label lasts five seconds for an audible run/results page or
track change. Browser checks cover expiry, actual audio playback, chapter
changes, exclusive Contrarian playback/return, mute and results. The user supplied the display titles: Midtown “Good Company Never Dies”,
Central Park “Diversified Ballad”, Contrarian “Good ol’ Company”. They are
configurable in scripts/now-playing.js. The widget owns no audio playback.

## Endless

Version 3 of the director retains a deterministic, aperiodic spatial terrain
field and independent geometry/reward/event random streams. Larger terrain
amplitudes add more pronounced hills and valleys without periodic resets.
Fourteen section families include uneven landing banks and broad platform
crossings over long chasms. Ground hurdles no longer overlap low platform
sequences. Optional upper routes have standing headroom. Speed still caps at
700 world units/second and later runs increase combination complexity and gap
width rather than remove all recovery time.

Executed model checks:

- Same seed produces identical course geometry/rewards across viewport sizes,
  collection decisions and different frame/spawn clocks. Different seeds differ.
- 42 family/time cases × 64 seeds have parameterized layouts. All families,
  powerups, event types and platform types occur through normal scheduling.
- 45,824 terrain samples cover 128 seeds, distant coordinates, continuity and
  derivative bounds. Terrain does not reset to a fixed course packet.
- 1,600 real-model sections across 32 seeds: no ground hurdle hidden under a
  low platform, readable obstacle approach distances, at most 34 entities per
  generated section. 968 gaps include 859 distinct widths to 0.1 ms precision;
  four width bands contain 216 / 482 / 205 / 65 openings. Largest holes have
  physical stepping platforms, not a required temporary powerup.
- 28 section traversals (14 families at early and later speeds) use searched
  actual inputs through 120 Hz engine physics, with no damage, shield credit,
  invulnerability or required triple jump. Another eight varied-seed traversals
  test compact screens and both runners, including ten-minute difficulty.
  No-input counterexamples fall into the tested holes.
- Twelve original Story snapshots retain identical authored movement states.

Reports: docs/verification/v114-endless-*.json. Commands:
node tests/endless-generation.mjs; node tests/endless-spacing.mjs;
node tests/endless-fairness.mjs; node tests/endless-traversal.mjs;
node tests/story-route-physics.mjs.

## Presentation and release

The existing city reference checks, seams/coverage, venue grounding, office
host, gap rendering, original runner atlases, props, 144 moving-board slide
traversals, Park lake, map controls and offline standalone checks remain part
of release validation. Midtown's real double/triple jumps and jetpack frames
passed on desktop, phone DPR2 and Canvas after the route regression fix.
The final standalone is rebuilt from the exact editable source; packaging
verifies ZIP CRC, embedded HTML and the cutscene handoff's source rebuild.
release/SHA256SUMS.txt records the delivered files. The art chooser is tested
on desktop and mobile with working selections and no horizontal overflow.

These sampled checks do not prove every possible endless seed is solvable,
and cloud software rendering is not a guarantee of performance on all devices.
