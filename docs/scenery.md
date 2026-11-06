# Current scenery composition — version 1.12

Downtown uses `scripts/downtown-scenery.js`, delegated by `LR_SCENERY`. Complete opaque native paintings carry the sky, buildings, lamps, pavement and bounded waterfront in one composition. The reference is the supplied HTML identified in verification.md, not an inferred repository version. `assets/downtown-v112/lower-manhattan.webp` preserves the old hero composition with corrected skyline geography; the four original approach/extensions and the anonymous Endless tail retain their native files.

The original camera layout is retained. The two current Downtown frontage crops are painted once inside ground-floor bays, then original foreground lamp/bollard silhouettes are restored over them. Native canvases/textures are cached. After the first journey, the two-source Endless tail omits both named fronts. The separate full-screen Downtown river image and alpha building layers are no longer referenced or loaded.

Midtown's existing architecture, layout, projection, full 505 glass entrance and office-host anchor are unchanged. `scripts/park-scenery.js` preserves the original Park art and water behavior. The current engine, terrain, sprites, audio, props, map and Endless gameplay generator are unchanged in this correction.

Canvas, direct WebGL and Pixi use the same Downtown painting layout. Texture preparation occurs once per source/venue variant, not on every frame. Every Downtown source is 1536×1024; logical display size is independent of native texture size. This reproduces the original framing rather than enlarging portrait buildings over a river layer.
