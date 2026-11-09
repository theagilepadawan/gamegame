# Version 1.20.1 verification

The only runtime change moves the Union Square destination lettering five
pixels down in the station artwork's native coordinate space (y=419 → 424).
Typeface, font size, perspective and horizontal placement are retained.

The built standalone was rendered and visually checked at 1280 × 720 and
568 × 320 touch / DPR 2. The label remains inside the painted display, and
both browser sessions completed without JavaScript errors. No new tests or
unrelated gameplay changes were introduced for this small alignment patch.

Standalone: 64,284,454 bytes, 72 embedded assets. SHA-256:
`819d7f220d0f42b0d1d3f5addd3fa8318b057b35b5b6558ca48efb142dbf6c5c`.

The previous release's behavioral coverage is recorded in
[version 1.20](verification-v120.md). The playable ZIP contains the rebuilt
HTML; the refreshed source handoff must reproduce it byte for byte. Archive
checksums are recorded in `release/release-metadata.json`.
