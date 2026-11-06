# Finance props — separate art direction proposal

The street restoration is the immediate correction. This is the proposed next
asset pass, kept separate so an experimental prop style cannot replace the
approved city paintings again. Current pickups, character atlases and scenery
stay intact. The two moving-guidance boards are a small gameplay trial using
the existing board art, not a claim that this art pass is finished.

## What is wrong with the current obstacles

The construction barriers and overhead boards repeat the same rectangular
silhouette. Fine textures and small labels do most of the work, so they read
as dull road furniture at running speed. Generic “ROAD WORKS” text has little
connection to the people playing. A finance gag should be understandable from
the object and its movement before the player reads anything.

## Five replacements to prototype

| Object | Visual joke | Action and readable silhouette |
|---|---|---|
| **Fine Print** | An absurdly thick annual report, tiny footnotes spilling out as an accordion. An enormous asterisk bookmarks the useful page. | Jump a compact stack. Squashed book corners, cream pages, navy cover and a red bookmark make a solid, obvious obstacle. A few loose pages settle after passing. |
| **Red Tape** | A neat portfolio is tied into an oversized bureaucratic bow. The ribbon stretches across the route. | Slide under a broad red ribbon with a heavy, readable lower edge. The knot sits above the collision area; there are no invisible string hazards. |
| **Moving Guidance** | An analyst’s price target is literally being revised upward and downward on a little brass hoist. A pencil is clipped to the board. | Occasional slow vertical movement, fixed end stops and arrows visible on approach. Slide remains safe throughout the cycle. Avoid random direction changes at contact. |
| **Fee Drag** | A small, handsome investment case drags a comically enormous chain of receipts. The fees are visibly heavier than the case. | Jump the case. Receipts trail behind as clearly non-solid decoration, with restrained follow-through rather than noisy particles. |
| **The Benchmark** | A beautiful Central Park bench carries a small index plaque. Passing it lights a modest “BEAT THE BENCHMARK” tag. | Keep the familiar bench jump and the Park’s warm wood/iron language. The joke belongs to the place; the bench sits on a proper paving pad beside a deliberate grove. |

“Moving Guidance” is the best first prototype: it combines fund humour and a
useful gameplay cue. Fine Print should establish the low-obstacle art style.
Avoid a screen full of slogans; one quiet gag per object is enough.

## Finish and implementation

- Start from chunky cartoon shapes with a consistent dark navy contour, warm
  cream highlights, brass/gold accents and controlled mint/cobalt details.
  Red is a strong exception for Red Tape. Preserve a common light direction.
- Give each object its own silhouette. A report is visibly a book, a portfolio
  is a case, and a ribbon is fabric. Do not reskin every hazard as another sign.
- Author transparent masters at least four times their maximum displayed
  size. Keep clean alpha, tight frame registration and native source files;
  simply enlarging an existing bitmap adds no detail.
- Review at actual gameplay size as well as enlarged. A character approaching
  at full speed must be able to distinguish jump, slide and moving clearance.
- Animate one restrained action: paper settling, ribbon tension or a hoist
  cycle. Cache static art; use a small registered atlas for animated frames.
  Do not introduce another renderer, full-screen layer or per-frame allocation.
- Preserve collision boundaries while evaluating the art. For moving hazards,
  derive both collision and rendering from the same simulation-time position.
  Keep motion infrequent, previewable and safe to slide through at every phase.

Acceptance requires a side-by-side in the real Midtown and Park lighting,
desktop and phone captures, pause/retry behaviour, collision checks and a frame
cost measurement. The full collection should follow only after the first two
objects look convincing in the game.
