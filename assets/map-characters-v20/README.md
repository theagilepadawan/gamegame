# Chapter-map runners

Native crops from the existing approved playable atlases, with no repainting, upscaling, or changes to gameplay artwork.

- Nicolai: `assets/original-27.webp`
- Trond: `assets/original-29.webp`
- Each WebP strip has 7 cells of 384 × 420 native pixels (2688 × 420 total).
- Cell 0: composed idle (source frame 6). Cells 1–6: original run cycle (source frames 0–5).
- All cells share the same source crop: x=64, y=44, width=384, height=420 within a 512 × 512 source cell; the source foot registration at y=460 is preserved.
- Lossless WebP keeps transparent edges and details intact. The map shows the strips at roughly 6–12× downsampling depending on viewport.
- CSS uses a static idle frame by default. JavaScript selects run frames only during the brief trip along the chapter route. Reduced motion stays static.

The playable sprite sheets remain unchanged.
