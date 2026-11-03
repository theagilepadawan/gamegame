# Scenery composition — 1.6

Downtown and Midtown use complete architectural silhouettes over one continuous painted atmosphere and ground plane. Central Park uses the exact approved original paintings and camera, restored from `156db816f0a43420b87864f5c61fde7878344035`.

## City routes

Opening Bell establishes One World Trade Center before ordinary Tribeca streets lead to Kabin, Wall Street and Charging Bull, Seaport, the complete Brooklyn Bridge, East River and LEI. The Lower Manhattan skyline excludes Empire State and Chrysler. Midtown combines warm glass offices, a lower library frontage, masonry commercial streets, construction and gardens before JOJU, Omar's, Gussy's and 505 Fifth. Anonymous blocks separate the venues; named venues and major landmarks appear once.

Source artwork and route position are separate. `LR_SCENERY.layout().blocks` exposes each route slot's source index and world position. The venue modules use this mapping rather than multiplying an image index by a tile width. [Venue pacing](venue-pacing.md) documents actual arrival-time checks and route spacing.

505 follows the supplied photograph's cobalt-blue lobby, cyan edge lighting, dark address lettering and full revolving glass doors. Its office host shares the entrance's source-space anchor and camera transform. See [office artwork](office-art-v14.md) and [host integration](office-host-v14.md).

Midtown's Empire State and Chrysler buildings now belong to one wide native panorama with its own horizontal parallax. Foreground slots 3–5 remain in the logical route but their narrow panels and boundary trees are omitted from rendering, opening the view around the complete landmark silhouettes. The old portrait skyline is no longer selected. Lower library and masonry buildings break up the repeated tall office blocks; two garden stretches remain. The same 23 logical route slots, horizontal camera and named frontages preserve venue spacing.

The continuous backdrop has dry matte asphalt instead of the reflective road used in v1.5. Under the playable curb, a native stone foundation texture follows terrain world coordinates and receives a depth shade. Both surfaces read as solid land during high jumps. `LR_SCENERY.projection()` computes a shared street offset from the run's floor and jump camera; city architecture, street trees, venue bounds and the office host consume that same offset in Canvas and Pixi. The distant atmosphere remains a separate layer. This changes vertical presentation, not jump physics or horizontal reveal timing.

The city camera follows a finite Story route. Endless continues through ordinary blocks without repeating its named venues or major landmarks. The chapter map heading remains NEW YORK.

## Central Park

`scripts/park-scenery.js` restores the original Bow Bridge painting (`original-33.webp`), Ramble (`scenery/park-1.webp`) and Bethesda (`scenery/park-2.webp`). All three are 1672×941. The original 64-source-pixel extension overlap, .085 camera rate, composition, foreground trees/benches, wind, leaves and masked Pixi lake are retained. No replacement Park painting or synthetic shimmer layer is used. The original lake stays on its original panel; pause and reduced motion freeze the animation.

A separate paired-render check compares the approved commit with the restoration at matched viewport, camera and time. Before the shared pickup/sign polish, all 14 desktop/mobile/Canvas/animated full-stage pairs were pixel-identical. The comparison also supports background-only capture so subsequent gameplay-object improvements do not obscure scenery verification.

## Source detail and renderers

City architectural sources are native 1024×1536; the complete Brooklyn Bridge is 2171×724. No enlargement is presented as newly authored detail. City panels copy native pixels into 1024×1430 camera windows. Individual vertical trims align the painted street level: 505 uses crop top 128, glass offices 130, café and library 0, and the lower masonry street 170. The construction image uses crop 0 and a uniform world scale of 1130/1325 so its complete crane and native pavement fit naturally; its logical route slot is unchanged. `slotX`/`slotWidth` describe route coverage while `x`/`width` describe the rendered architecture.

A shared 1536×1024 atmosphere painting spans each city viewport with overscan and gentle parallax. Midtown's separate landmark panorama is also native 1536×1024 and retains its aspect ratio. The dry stone foundation is native 1254×1254, repeated at 320 game pixels per tile without modifying its source pixels. The full bridge remains a single wide layer. Complete foreground street trees overlap architectural boundaries without dissolving masonry. Ordinary architecture can recur; recognisable landmarks and venue frontages do not loop in Story.

`LR_SCENERY.layout()` returns city `panels` and renderer `layers`; its optional view argument supplies the street projection. Logical vista panels are excluded from `layers`, which includes the single landmark panorama instead. Park delegates to its original painting layout without `authoredLayers`. `source()` supplies native city crops or the original Park paintings. Canvas and Pixi consume the city geometry; Opening Bell's direct WebGL path uses the same Downtown layout. Prepared crops are cached by source and crop offset. The Pixi pool retains the original Park texture/scale behavior and its water mask.

All 40 original source asset files remain unchanged. Superseded Park v1.3 artwork and small venue decals remain historical repository material; they are not selected by the runtime. The cutscene handoff omits the rejected Park paintings. Existing runners, physics, chapter progression, audio and history reveal retain their behavior; separate pickup and sign drawing changes are described in [gameplay props](gameplay-props-v14.md).
