# Minimal opening-call portraits

Both native atlases are 1536 × 1024, with three 512 × 512 cells per row:
listening, speaking, blink. Runtime WebPs preserve every RGBA pixel and native
dimension. They are lossless encodings, not enlarged or retouched exports.

Grete uses row 0 of `portraits.webp`, the exact ink-and-colour artwork the user
called perfect. Its source is retained as `portraits-native.png`. Her brown
bob, glasses, lavender jacket and scarf follow the supplied photographs.

Nicolai uses row 1 of `nicolai-portraits.webp`. Its independent native source is
`nicolai-portraits-native.png`. The frontal and outdoor reference photographs
guided his receding salt-and-pepper hair, hooded eyes, broad nose, shorter chin
and restrained mouth. The blue checked blazer and open collar remain the
approved outfit design. This latest likeness awaits user review. The spare
rows are retained as generated source, but never displayed at runtime.

The renderer uses each listening cell as a fixed complete base. It overlays
only feathered mouth and eye regions for expressions, keeping the hairline,
head outline, outfit and shoulders still. Nicolai is not mirrored. Registration
coordinates and file hashes are in `provenance.json`. No gameplay, title-screen
or map sprites are replaced by these call portraits.

The call pauses when hidden; reduced motion holds the listening portraits.
Speech expressions settle while the player reads. No voice or phoneme-level
lip sync has been synthesized.
