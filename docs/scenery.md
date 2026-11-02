# Authored New York scenery

The three original approved paintings are unchanged. Runtime scenery uses each once in its Story chapter, together with authored neighbourhood paintings:

- Opening Bell: Tribeca approach → original Lower Manhattan → complete bridge landing/East River → South Street Seaport → Battery waterfront.
- Central Park: Bow Bridge → the Ramble lakeshore → Bethesda Terrace.
- Midtown: original skyline → Bryant Park/library → Fifth Avenue office towers.

`scripts/scenery.js` owns the shared layout for Canvas, Pixi and the Opening Bell WebGL renderer. The end-of-chapter history reveal uses the same layout. Panels never mirror. Story clamps at the end of its authored route. Opening frames One WTC in the clear space between the logo and HUD: 35% of the viewport normally, 24% on the smallest screens. An establishing hold eases into travel, with extra time for the narrower HUD layout. Its Story rate covers the panorama by the normal finish distance. Home always uses the fixed Opening view, regardless of the selected chapter.

Endless continues through Seaport and Battery after its initial journey. It excludes the approach, original skyline and bridge continuation from repeat cycles: a bridge continuation without its original span would create a disconnected bridge at the loop boundary.

Endless uses a separate Battery right-edge treatment that opens onto Seaport's river frontage. Story retains the existing Battery painting. The variant keeps the repeating boundary clear of severed or translucent office towers.

Each new painting retains its native 1536×1024 or 1672×941 dimensions. A 64-source-pixel left-edge alpha feather is prepared once on image load and drawn over the preceding plate. Only visible panels render each frame. WebGL uploads separate textures with a maximum-size guard, avoiding oversized panorama textures. Park's existing water mesh applies to its original lake painting; the existing wind, leaves and foreground environmental effects continue across the whole chapter.

The Ramble painting continues the original pavilion, lamp, shaded shoreline and blue sky before opening into the sunlit lake. The shared edge was matched in the artwork so the narrow overlap does not need to hide a lighting jump or duplicate architecture.

Kabin and LEI are composed into actual Seaport ground-floor bays, retaining brick surrounds, thresholds and foreground foliage. Their images participate in the Start readiness gate, and the decorated canvas has its own texture identity. There is no second storefront overlay at street level.

Midtown uses fixed painting-space mounts: JOJU/Omar's signs and awnings fit existing storefronts, 505's plaque follows the entrance transom, and Gussy's has tyre contact at the far curb. Small bounded textures keep these details consistent across Pixi and Canvas. The 505 Fifth Avenue greeting remains reachable before the chapter ends and fires once.

The legacy procedural train and vehicles render only if the painted downtown backdrop is unavailable. They no longer float across the painted city. Street lights use actual panorama panel coordinates; the existing wind, paper and steam effects remain.

For verification, `LR_SCENERY.inspect(id, distance, width, height, mode)` returns current panel IDs, source indices, offsets, load state and finite-scroll details. `mode` is `chapter` or `endless`. No scenery debug controls are shown in the game.

The eight runtime extension paintings and the Endless Battery variant are in `assets/scenery/`; their literal paths are embedded by the standalone build. The superseded `opening-1.webp` is retained as source history and is not referenced by the current runtime.
