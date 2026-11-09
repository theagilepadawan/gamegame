# Version 1.24 verification

## Scope

Approved finance-copy changes, twelve newly generated native district props,
varied physical sizes, grounded supports and live plaque text; more moving
overheads in Story and seeded, spaced movement in Endless. A four-exchange
06:00 briefing pauses music, introduces the undisclosed 07:00 Park meeting,
arranges joggers at 505, holds surprise, then ends with a smile.

City paintings, camera behavior, venue placements, gameplay sprites, player
controls, chapter order, title gesture/spotlight, music recordings and finish
entrances retain their existing designs. See `obstacles-v124.md` for exact scope.

## Art and model checks

- Three native 1536×1024 transparent atlases; all twelve source/body/plaque/eye
  registrations checked against the shipped manifest. Original generated PNGs
  and lossless runtime WebPs decode to identical RGBA pixels. Encoded checksums
  are verified. No enlargement or reduction of native production art.
- Real jump/slide collisions, pickup rewards and spring launch still work.
  All twelve render paths preserve native body proportions, their input
  obstacle data, canvas transform and route opacity. Text uses live letters
  with no horizontal compression. Reduced-motion pickups remain still.
- 1,008 real collision-enabled slide traversals: both runners, three seeds,
  all moving obstacles and twelve cycle phases in each district. Standing
  probes distinguish raised and lowered boards. Story has 3 Downtown, 6
  Midtown and 5 Park movers, including the optional upper routes.
- Endless motion sampling found 46 movers using 43 distinct periods, within
  the 2.6–5.2-second range. Motion is simulation-bound and never lowers a
  board below its safe clearance.
- 16 collision-free Downtown witnesses through the opening, bull run,
  recovery and sell-off, for both runners and seeds 42/91827, without damage,
  power-ups or required triple jumps.
- 48 recorded/replayed Midtown/Park section witnesses, both runners and both
  routes, seeds 42 and 91827. Ledge coins are collected by contact. No shield,
  magnet, invincibility, damage allowance or required triple jump. Supported
  objects stop colliding with a collapsed platform.
- 28 recorded/replayed Endless challenge witnesses across all fourteen
  section families at 0 and 240 seconds; full-span slope/slide checks and
  optional jetpack/Contrarian launch and recovery.
- 1,600 real-model generated sections: 1,453 gaps, four crossing-width bands,
  1,349 distinct normalized widths and no overlapping low platform/hurdle.
  All 128 tested opening seeds have >100px terrain range in the first 30
  seconds, at least three gaps and at least one broad crossing in the first
  minute. The deterministic generator's 42×64-seed diversity cases and
  45,824 continuous terrain samples also pass.
- 32 real route-selection collision probes confirm that unused route props
  remain drawable while collisions apply only to the chosen route.

Successful control witnesses establish solvability for the stated samples,
not exhaustive playtesting of every possible generated seed. The 1.24 Story
snapshot intentionally replaces the older full-object hash fixture for the
approved prop sizes, labels, metadata and motion; historical fixtures remain.

## Browser and delivery checks

The actual compiled HTML passed the selected browser checks for Story/Endless
progression, native props, motion, the four-exchange briefing, the alert, chapter
cinematics, title music/autoplay, city preservation and route presentation.

The call is tested at desktop, 844×390, 568×320 and 390×844. All dialogue/actions
fit. The first reply triggers one supplied 1.620-second alert and holds the
surprised face; his final reply uses the smile. Hair/jacket pixels stay fixed.
Music elements are paused on the first and last lines; the effects graph has
measurable audio. Mute, quick advance, hidden-tab pause/resume, Skip, Escape,
cancellation, pagehide, reduced motion and actual call → title gesture →
chapter transitions pass. Cancellation releases the temporary music hold.

The city check passes 2,376 fixed-camera layouts, opaque backdrop seams,
late/spaced venue visibility, native painting hashes, the existing curb and
505 appearing only at the finish. The supplied shoe film still plays only on
Midtown's Next: Central Park, with its exclusive quiet piano cue.

The offline test's art-count assertion was updated from six prop images to
four pickups plus three district atlases. Runtime resource checks remain.
The rerun passes with external requests disabled: all forty baseline asset
hashes remain intact; embedded fonts, scripts, native city paintings, venues,
map runners and audio load; course/character switching, Contrarian, film,
portraits and finish boarding remain usable offline.

The delivered 1.24 standalone HTML is 73,658,525 bytes with 76 embedded assets.
The 10.5-second, 1280×720 motion preview captures real collision-enabled
traversals in all three districts. It is silent and encoded at 30 fps; that is
the preview's frame rate, not a device performance benchmark.

Packaging requires ZIP CRC checks, byte-identical playable HTML and a fresh
build from the handoff's staged source matching that HTML's SHA-256. Every
handoff entry has an individual checksum. Native PNG masters and runtime art
are retained; reference screenshots use lossless WebP, checked for identical
decoded pixels and dimensions. The editable handoff omits the duplicate
compiled HTML to fit the archive cap and includes exact rebuild instructions.
Two optional older animation recordings are linked with hashes; their native
keyframes and implementation, and the actual in-game film, remain included.
See `release/release-metadata.json` and `release/SHA256SUMS.txt` for the verified
archive identity and sizes.
