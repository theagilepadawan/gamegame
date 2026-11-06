# Current scenery composition — version 1.13

Downtown remains the accepted v1.12 complete warm street composition, using
`scripts/downtown-scenery.js`. Its source authority is the actual uploaded HTML,
SHA-256 `9fd060927fc13512f82b18c86e9edc8cf19de59357f5874169d9e8644b263488`.
All Downtown artwork, positions, overlap, intro easing, scrolling and venue
patches remain unchanged. There is no global river or detached architecture.

Midtown uses `scripts/midtown-painted.js`. The original golden skyline,
Bryant Park/library and Fifth Avenue complete paintings were recovered from
lossless 1672×941 PNG masters. Their lossless WebP encodings are in
`assets/midtown-v113/`, with provenance hashes. The only newly painted scene
is an ordinary restaurant street between the skyline and Bryant Park. It
provides space for Joju and Omar's without changing the old landmark paintings.
Gussy's keeps the native truck pixels, clipped to its silhouette on the curb.
505 retains the complete current blue/cyan lobby crop in a glass-office bay.
The host uses a fixed pavement anchor and an architectural adult scale.

There is one horizontal camera plane at approximately .14 of world travel,
a short opening hold/ease, and no vertical camera coupling, independent skyline,
zoom or moving full-screen atmosphere. Wide viewports receive a longer opening
hold to avoid early Easter eggs. Narrow portrait viewports receive slightly
more horizontal travel so the office appears before the chapter ends. These
are screen-size adjustments, not changes in speed during the run. Every
painting stays at y=-8 through jumps, slopes, flight, pause and retries.

Midtown source composites are 2090×1176, prepared once per source/venue variant.
This recovers lossless master fidelity and retains sharper native venue pixels;
it is not a claim of newly generated higher-resolution detail in the original
background paintings. Canvas and Pixi use the same layout and cached composites.
The original 64-source-pixel seam overlap remains narrow. Endless repeats only
ordinary later scenes without repeating the unique skyline or named fronts.

`scripts/scenery.js` routes the three district composers. The current stone
street foundation and curbs remain. `scripts/park-scenery.js` preserves the
original Park paintings and its existing bounded water behavior. Sprite sheets,
audio, terrain generation and the player's physical camera are unchanged.
