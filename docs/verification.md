# Release verification — Manhattan map and runner reveal, version 1.16

## Chapter map and movement

The new stationary SVG illustration supplies recognisable New York landmarks
and rounded, warm map scenery. It retains the existing three destination
coordinates and accessible chapter controls. The drawn harbour, two rivers,
Liberty Island, Brooklyn shore and south-to-north district order give the map
geographical context. This is a schematic journey, not a street-level map.

Both approved runner strips are unchanged. Travel now has an 80 ms preparation,
a distance-dependent run capped at 1,250 ms, and a 150 ms arrival. Native stride
frames follow travelled distance. A small lean, foot lift and one settling pose
make the movement softer; idle has no repeated motion. Quick retargeting starts
from the current point. Reduced motion settles immediately and suppresses the
arrival ring. Keyboard, arrows, touch scrolling and chapter locks are retained.

## Trond unlock

The unlock wrote the saved flag without repainting the hidden picker, and the
Main menu path did not refresh the runner caption. Unlock now refreshes the
picker immediately; returning home refreshes the selected runner and caption.
Trond fades out of his silhouette in a brief warm result card, followed by a
single highlight of his new menu slot. The NEW badge is steady until selection.
Reduced motion shows the reveal directly. Selecting Trond still uses the normal
picker and save path; unlocking him does not silently switch runners.

## Checks for this release

Browser checks cover both map runners at every destination, actual run frames
and route travel, facing direction, stable idle, live reduced-motion changes,
compact touch layout, locked previews, keyboard and swipe navigation. The unlock
regression uses the real final-chapter results and menu handlers on desktop and
568 × 320 touch: immediate label update, reveal, Main menu, selection, reload,
play as Trond, and no repeated first-unlock card on replay. Standalone checks
verify the embedded SVG, approved map strips, fonts, audio and offline play.
The existing 40 baseline assets remain byte-identical.

Gameplay terrain, course scenery, Kabin placement/detail, obstacle artwork,
physics, music recordings, progression requirements and Story/Endless rules
are retained from 1.15.1. The mobile layout and music-widget checks are rerun.

## Retained 1.15.1 verification

The evidence below belongs to the previous release, whose gameplay changes
are retained here.

Patch 1.15.1 restores the earlier striped barrier and copper market-board art
(option A), with current hitboxes, widths, slope alignment and hoist mechanics.
Kabin's native crop now includes its original Norwegian flag;
its entrance stays at the same horizontal position and pavement height. On
high-density screens, that one cached composite retains up to twice the pixel
resolution in each dimension. Other city/Park paintings and venue placement
are unchanged. The main track title is Downtown Good Company; audio and its
original composer credit are unchanged.

Patch verification passed on the standalone HTML: restored prop rendering and
actual jump/slide collisions, rewards and reduced motion; Story/music behavior
including the renamed title; 264 Downtown reference camera/layout comparisons;
and offline standalone checks with all 40 baseline assets unchanged. DPR2 visual
review confirmed the original flag, the 3072×2048 cached Kabin composite, and
its unchanged storefront position. No browser errors were recorded.

The following Endless and mobile evidence was recorded for version 1.15.0;
those gameplay, menu and camera changes are retained in this patch.

## Endless opening and difficulty

Director version 4 replaces the very long terrain fade with individually
seeded, irregularly spaced hill/valley knots. The first 650 world units are
level; subsequent crests are full amplitude. Analytic slopes join continuously
and are bounded at 0.375. Sampling does not generate an unbounded knot cache.

The opening hurdle artwork was squeezed into speed-dependent widths as small
as 41 pixels. Low hurdles now use 98–116-pixel bodies and high boards 146–166,
with the actual collision width following the visible body. Low bodies follow
the bank angle; their collision height follows the same slope at the runner.
A high board over
a steep span becomes a jump hurdle to retain slide clearance.

Gap encounters stay in circulation among the fourteen families. Uneven banks,
short/held jumps, longer double jumps and stepping-platform chasms appear early.
The gap and island families each include a broader crossing at a seeded index.
Uphill gaps retain a landing allowance. Speed, combination count and wide-gap
frequency increase with distance; ordinary landings and recovery remain.

Model checks include:

- Deterministic courses across viewport widths, reward collection and frame/
  spawn clocks; different seeds produce different courses.
- 42 family/time combinations × 64 seeds, with all families, event types,
  powerups and platform types reached through normal scheduling.
- 45,824 continuous height/derivative samples across 128 seeds.
- 1,600 actual-model sections: no mandatory hurdle hidden beneath a low roof,
  readable hurdle separation and at most 35 entities per generated section.
  The 1,449 gaps occupy four width bands (244 / 430 / 600 / 175) with 1,337
  distinct normalized widths. The longest crossings have real platforms.
- The opening 30 seconds of all 128 sampled seeds vary in height by at least
  111.9 world units. With normal jetpack/event scheduling, the first minute
  includes at least three gaps and one broad crossing in every sampled seed;
  a single long chasm can include several separate platform jumps.
- Actual 120 Hz input searches cover all fourteen families at opening and
  later speeds, plus eight compact-screen cases with both runners and
  ten-minute difficulty. They require no damage credit, invulnerability or
  triple jump. No-input counterexamples confirm the gaps need player action.
  These witnesses cover tested cases, not a mathematical proof of every seed.

## Mobile and music

The Story menu reflows at short landscape heights. On the shortest screens,
the title occupies one line, Play remains at least 40 pixels tall, and the
bottom margin is at least 16 pixels in the three tested phone layouts. Decorative
footer/loading copy is omitted where it competed with navigation. Map scrolling,
chapter locks, selection miniatures, both modes and next-chapter flow remain.

Touch gameplay uses a fixed 504-unit logical height instead of 540: a 7.14%
close-up. Home framing returns to 540. Portrait play still pauses for rotation,
and the close-up is disabled if it would leave less than 540 world units across.
Endless terrain-camera look-ahead previews the next 0.9 seconds of a descent so
approaching obstacles do not slip below the closer viewport. Independent jump
headroom prevents the look-ahead from cutting off a double or super jump. Story
camera rules and the stationary painted background framing are unchanged.
Physics/collision coordinates are not scaled or changed. Backgrounds retain
their existing camera behavior; there is no animated zoom on jumps.

The five-second music card has a custom inline vector record/sleeve, a clear
Now playing label and larger title text. It stays above the touch controls and
below the top HUD. During Contrarian music it moves above the touch controls,
clear of the event badge and inverted course. Track changes reset the short display; muted or paused audio
hides it. Reduced motion disables record rotation and entrance/progress motion.
The widget never owns audio playback. Confirmed titles remain Good Company
Never Dies, Diversified Ballad and Good ol’ Company.

Touch layout checks cover 568×320, 844×390 at DPR2 and 1280×549, all three chapter
buttons, page-to-game zoom and return, music/HUD/control bounds and prop widths.
The screenshots were reviewed at their rendered sizes. Another 3,872 downhill/
jump camera targets per viewport retain at least 77.9 units below the incoming
bank and 101 units of standing-sprite headroom in the sampled cases.

## Frame-rate setup

The game draws on requestAnimationFrame, so its ceiling follows the display
rather than a hard-coded 60 FPS cap. Simulation runs at fixed 1/120-second steps
with interpolated drawing. The catch-up delta is capped at 50 ms. Rendering uses
Pixi/WebGL with the existing Canvas fallback. Resolution starts at min(device DPR,
2.25); sustained slow frames reduce the cap in 0.25 steps down to 1. Particle
quality is also reduced on touch devices. The existing resolution controller
only steps down during a session; it does not automatically raise the cap again.

`longRun.performance` reports a bounded rolling 120-frame sample: measured FPS,
frame-interval p95, JS/render-submission CPU p95, physics Hz, effective pixel
ratio/cap, logical viewport, renderer and zoom. CPU submission time excludes
asynchronous GPU completion. This is deliberately a developer API, not another
in-game overlay. Cloud Chromium uses software rendering, so its FPS must not be
reported as a measurement of a physical iPhone/Android GPU or a 60 FPS guarantee.

## Regression and delivery

Checks were completed in batches as the mobile camera and music card were refined.
The original city draw functions remain pinned; the frame-loop pin records the
intentional v1.15 Endless look-ahead and FPS instrumentation. Story physics is
protected by its separate twelve saved reference snapshots.

The built standalone is exercised through the browser suite: progression,
score-free Story, persistent Endless unlock, five-second audible-track behavior,
exclusive Contrarian audio, inactive-route physics/visibility, menu controls,
city motion/grounding, 505/host details, hazards/pickups, gaps, miniatures and
offline-after-load behavior. Original source assets remain byte-identical.

The game archive must contain the exact tested HTML. The cutscene handoff must
rebuild that same HTML from its editable source. Packaging validates both;
public download SHA-256/CRC checks follow publication of the immutable commit.
