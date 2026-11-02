# Native scenery layers — 1.3

The scenery uses complete architectural and forest silhouettes over one continuous painted sky, water and ground plane per chapter. Buildings and landmarks never dissolve into an unrelated painting. `scripts/scenery.js` supplies the same layers to Canvas, direct WebGL and Pixi.

The chapter map heading is simply **NEW YORK**. Story chapters and Endless seed controls remain separate.

## Routes and venues

Opening Bell travels through distinct cast-iron Tribeca architecture, One World Trade Center, historic blocks, Kabin, Wall Street and the Charging Bull, Seaport warehouses, a complete Brooklyn Bridge, the East River frontage, LEI and the waterfront. The skyline contains Lower Manhattan architecture; the previous Empire State/Chrysler composition and second bridge are no longer used. WTC is framed between the HUD groups and retains its establishing pause. Kabin and LEI occupy separate course blocks, five panel intervals apart.

Midtown visits JOJU, a garden block, Omar's, Gussy's, the skyline and 505 Fifth Avenue. Each venue retains its complete architecture. The 505 artwork includes the paired glass doors, glazing, navy/gold address and lobby beneath a contemporary tower facade. Its once-only office greeting follows the full entrance entering view.

Central Park proceeds from Bow Bridge through the Ramble and Bethesda Terrace to a willow-lined shore. The shared atmosphere retains golden forest light, a continuous lake and a shaded path. The old coordinate-specific animated lake mesh is replaced by a restrained shimmer layer inside the new lake bounds, beneath the architecture. Reduced-motion settings disable it. Wind, leaves and gameplay effects remain.

Endless repeats only the two ordinary downtown waterfront sections after its first journey. WTC, Wall Street and Brooklyn Bridge never return in the repeating tail. Story clamps after the complete route; the camera reaches each route's end by the actual chapter finish distance.

## Native detail and composition

Architectural/forest sections are newly authored at **1024 × 1536 native pixels**; the complete wide Brooklyn Bridge is **2171 × 724**. They are encoded as WebP without resizing. This is not a 4K claim: the image tool's native output area is limited. Compared with the former 941/1024-pixel-high paintings, the new sections provide 50–63% more vertical source detail. Complete venue artwork replaces the former 132–275-pixel sign sources and the 45-pixel-high 505 crop.

Each section is copied at 1:1 into a 1024 × 1430 camera window. A small per-section vertical trim aligns its authored curb or shore, preserving native pixels. At a 900-CSS-pixel-high desktop viewport the effective vertical density is approximately 1.54–1.59 source pixels per CSS pixel; at a 390-pixel-high mobile viewport it is approximately 3.56–3.67. DPR2 checks inspect the real device-sized output; they do not imply 2× coverage at every possible viewport size.

One 1536 × 1024 atmosphere painting spans the viewport with a small horizontal overscan and gentle parallax. It never wraps a building, bridge, waterline or road tile back into view. Native transparent architecture moves above it. The complete bridge spans more than two foreground blocks as a single layer, including both masonry endpoints. Modest complete street trees overlap city-block edges through opaque foliage rather than fading masonry. Park silhouettes have authored natural tree/rock outlines.

Original source assets remain unchanged for provenance. Runtime references select the new scenery and omit superseded low-resolution venue decals from the standalone build. `assets/art-v2/native-manifest.json` records image dimensions, byte sizes and transparency; Park's generation provenance is recorded separately.

## Runtime contract

`LR_SCENERY.layout(id, distance, width, height, mode)` returns architectural `panels` plus the complete renderer `layers` (atmosphere, architecture and city trees). `source()` returns a native camera crop or a shared layer image. `inspect()` exposes native/effective dimensions, crop offsets, finite route coverage and zero architectural feathering.

The 18-entry Pixi pool supports narrow sections, restrained water glints and complete tree overlaps; textures use each layer's own dimensions. Prepared camera crops are created lazily, deduplicated by source image and crop offset, and reused. The game waits for referenced artwork to decode before enabling Start. Original runner atlases, physics, chapter progress, audio, history reveal, pickups, boss and leaderboards remain part of the game.
