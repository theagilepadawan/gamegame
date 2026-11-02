# Authored New York scenery

The three original approved paintings are unchanged. Runtime scenery uses each once at the beginning of its Story chapter, then continues through the new neighbourhood paintings:

- Opening Bell: Lower Manhattan → East River/Brooklyn Heights → South Street Seaport → Battery waterfront.
- Central Park: Bow Bridge → the Ramble lakeshore → Bethesda Terrace.
- Midtown: original skyline → Bryant Park/library → Fifth Avenue office towers.

`scripts/scenery.js` owns the shared layout for Canvas, Pixi and the Opening Bell WebGL renderer. The end-of-chapter history reveal uses the same layout. Panels never mirror. Story clamps at the end of its authored route; Endless continues through the three generic Opening Bell neighbourhood plates and never reuses the original landmark plate.

Each new painting retains its native 1536×1024 or 1672×941 dimensions. A 64-source-pixel left-edge alpha feather is prepared once on image load and drawn over the preceding plate. Only visible panels render each frame. WebGL uploads separate textures with a maximum-size guard, avoiding oversized panorama textures. Park's existing water mesh applies to its original lake painting; the existing wind, leaves and foreground environmental effects continue across the whole chapter.

The Ramble painting continues the original pavilion, lamp, shaded shoreline and blue sky before opening into the sunlit lake. The shared edge was matched in the artwork so the narrow overlap does not need to hide a lighting jump or duplicate architecture.

The original Kabin/LEI venues are aligned to the new East River/Seaport strip. Midtown's original venue art is retained at authored anchors, with small seeded frontage variation and the 505 Fifth Avenue greeting.

For verification, `LR_SCENERY.inspect(id, distance, width, height, mode)` returns current panel IDs, source indices, offsets, load state and finite-scroll details. `mode` is `chapter` or `endless`. No scenery debug controls are shown in the game.

The seven runtime extension paintings are in `assets/scenery/`; their literal paths are embedded by the standalone build.
