# Midtown backdrop restoration — v1.7

The user rejected v1.6's motion and asked for the backdrop from before the water/layered-city redesign, retaining only the higher-quality venue assets and natural placement. This release restores that composition. It does not introduce new generated scenery.

The reference is commit `156db816f0a43420b87864f5c61fde7878344035`; its Midtown backdrop matches `9207baa`. The retained source files are `assets/original-34.webp` (golden-hour skyline), `assets/scenery/midtown-1.webp` (Bryant Park/NYPL) and `assets/scenery/midtown-2.webp` (Fifth Avenue). `scripts/midtown-scenery.js` preserves their original dimensions, overlap and camera. Chapter travel is clamped; the original landmark painting does not repeat in the Endless tail.

The current four transparent venue paintings are kept at their native 1024×1536 resolution. Gussy is rendered through a native-pixel silhouette mask retaining the truck and original curb while omitting its library vignette, avoiding a second NYPL over the old painting. The source image itself is unchanged. Their smaller street-side placements use constant horizontal travel, long intervals and fixed pavement anchors. They do not move vertically with jumps. 505 keeps the complete illuminated glass entrance, cyan reveals, lettering and revolving doors. The office host stands beside the entrance and keeps the existing restrained wrist greeting.

The v1.5/v1.6 atmosphere, separate panorama, lower-library/masonry replacements, repeated office blocks and stone-foundation treatment are retired from runtime and production references. Downtown and Central Park remain as they were before this restoration. The Nicolai/Trond sprite sheets, physics, chapter progression and audio are unchanged.

Validation is tracked in `verification.md`. Layout equivalence alone does not establish visual quality or comfort; current gameplay captures, jump/flight checks and venue inspection are required. This document records the implementation direction and is not a statement of user approval.
