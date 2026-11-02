# Continuous terrain and genuine gaps

`LR_GAPS` in `scripts/engine.js` supplies shared opening bounds for collision, terrain drawing and grounded effects. Visible gaps are subtracted from the terrain paths; the fill, curb strokes, joints and surface details never cross an opening.

The solid banks retain their actual slope. Narrow vertical cut faces remain on the solid side of each lip. The cavity's top follows a bank-to-bank line, rather than the removed terrain profile: a crest inside a long gap must not leave an opaque hill or a high black wall. The dark shaft continues below the viewport and obscures the painted street behind it.

The existing eight-unit foot-overhang tolerance remains at the outer banks. Overlapping or touching holes are merged before applying that tolerance, preventing an invisible foothold at their shared edge. A real intervening island remains solid. Ground shadows, vents and litter are suppressed over the opening; airborne platforms remain independent.

`tests/gaps.mjs` exercises seeded uphill/downhill/crest/valley jumps, merged/separated openings, pixel occlusion over a bright backing, long removed hills and the Pixi/Canvas rendering paths.
