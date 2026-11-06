# Cohesive New York artwork — v1.8

The user supplied an earlier game HTML as the visual reference: warm, cohesive painted scenery and the simpler original prop language. Its normalized content matches `156db81`. This is art direction for the current game, not an instruction to replace the codebase or restore old gameplay behavior.

Downtown and Midtown now use opaque panoramic paintings in `assets/scenery-v18/`. Buildings, street surfaces and venue fronts occupy a common painted plane and use the same camera. The five base paintings provide Downtown landmarks, its venue street and an anonymous ordinary-street Endless continuation, plus Midtown's skyline and venue street. Any join repairs and source dimensions belong in the current asset manifest; these should not be confused with older separate city-block assets. Padding below the painted ground is renderer handling, not added native architectural detail.

The intended composition removes the broad ocean sheet beneath Downtown's course and the wet street/venue-island effect in Midtown. Lower Manhattan and Midtown retain distinct landmarks. Kabin and LEI are integrated into Downtown; JOJU, Omar's, Uncle Gussy's and the complete blue/cyan 505 entrance are integrated into Midtown. The retained office host shares the entrance's coordinates. A separate anonymous tail prevents named landmarks and venue Easter eggs from recurring in Endless.

Narrow desktop views start slightly farther into the painting when needed to reach the final entrance without accelerating the scenery. Windows wider than 8:3 center the game within that aspect ratio, preserving full backdrop coverage and gradual venue reveals. Ordinary desktop and mobile landscape layouts retain their existing framing.

`assets/props-v18/` provides six native painted game-object sprites based on the old silhouettes: a gold coin, faceted diamond, research magnifying glass, brass bull face, striped construction barrier and candlestick market board. The native atlas, extraction bounds and provenance accompany them. Signs return to restrained proportions with live text. This is a rendering change; existing collection, reward and collision logic remains authoritative.

Central Park's original art/camera, the Nicolai/Trond sprite sheets, audio, progression and current mechanics remain. Source asset presence is not evidence that it is still rendered: all 40 original files are preserved for provenance, while old scenery/prop variants are excluded from active production references.

Validation is tracked in `verification.md`; no test result or user approval should be inferred from this design note. The current regression contract is `tests/cohesive-scenery.mjs`, alongside applicable gameplay and prop checks.
