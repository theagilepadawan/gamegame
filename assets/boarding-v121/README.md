# Nicolai boards the 6 train

Keep Nicolai’s short grey hair across the crown; he must not appear bald.
The outfit and body poses were approved.

The original gameplay sprites run normally to the subway sill. A 0.22-second
deceleration leads into four turning poses (0.36 seconds), followed by eight
rear-view walking poses: two slow strides into the carriage over 2.2 seconds.
His back faces the viewer. The path stays in the clear left half of the
doorway, avoiding the central pole. His feet rise 58 native train pixels along the
interior floor and perspective gradually reduces his scale to 86%. The original
brass stanchion occludes him inside. He remains visibly inside until results.

`nicolai-board-native.png` is the untouched generated transparent master,
1448 × 1086, in four columns and three rows of 362-pixel square cells.
`nicolai-board.webp` is a pixel-identical lossless encoding. No baked scenery,
floor or lighting layer is included. The runtime registers every planted foot
and normalizes head-to-foot height to prevent atlas drift. Registration,
source references and checksums are in `provenance.json`.

`scripts/finish-gates.js` owns the path, native crop registration and depth
ordering. Nicolai's Downtown and Midtown finishes use these poses. At 505, his path
passes through the left revolving-door bay; the original near glass leaf
occludes his shoulder as he enters the blue lobby. Trond, the Park entrance,
the title character and ordinary playable animations are retained.
An airborne finish lands on the actual apron first. Pause freezes the whole
sequence. Reduced motion keeps the existing short, stationary finish.

The reviewed source references are the existing playable Nicolai atlas and an
upright side-walk study. That side-walk study was superseded when the user
specified walking away from the viewer; it is not runtime art or a handoff asset.
