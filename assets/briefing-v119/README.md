# Opening call portraits

Native artwork: `portraits-native.png`, 1536 × 1024. The runtime
`portraits.webp` is a lossless encoding of that artwork at identical dimensions.
The grid contains 512 × 512 cells: Grete on the top row, Nicolai below;
listening, speaking, and blinking across each row.

Grete follows the supplied photographs: shoulder-length brown bob, glasses,
lavender jacket, and patterned scarf. Nicolai follows the approved blue
checked jacket and open-collar shirt. These portraits belong only to the
opening call. The title character, playable sprites, office host and map
characters are not replaced.

The renderer always uses the listening portrait as the complete base. Only a
small feathered mouth region from column 2 and/or eyelid region from column 3
are overlaid. It does not crossfade entire generated faces. The head outline,
hair, body, and shoulders therefore remain pixel-identical through speech and
blinks. Registration coordinates are in `provenance.json` and
`scripts/story-briefing.js`. Nicolai's complete portrait is mirrored at display
time to face Grete; no texture is resampled or rewritten for that.

Faces pause while the tab is hidden. Reduced motion holds the listening
portraits. Speech gestures settle while the reader holds a line. There is no
synthesized speech or lip-sync claim. Any future real recording should drive
the expression timing, with captions retained.
