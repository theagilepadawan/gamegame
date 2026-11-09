# Title idle extension — original face retained

Each 1536 × 1024 sheet has six 512 × 512 cells in a 3 × 2 grid.
image_gen used the exact original idle frame 6 from original-27.webp (Nicolai)
and original-29.webp (Trond) as its reference. These are arm-animation sources,
not replacement characters. The runtime composes only the near-arm region over
the exact original idle. Head, lower body, legs and selected chapter shoes stay
from the game's existing atlas. Body position and scale never change.

Registration into the original 512 cell: Nicolai scale .855, translation (37,41);
Trond scale .88, translation (28,29). The native masters are unchanged in 1.23.
The runtime uses the exact original idle followed by source cells 2, 3, 4, 5;
the unnecessary downstroke in cells 0/1 is skipped. Registered palm positions
guide a local arm warp before adjacent poses blend in premultiplied alpha.
The curved cloth seam is feathered and backed by the original solid jacket,
preventing transparent cuts. The full character is drawn only once per frame.

Forty-five small 122×112 arm crops are cached during menu idle (about 2.35 MiB
of pixel data per selected atlas), rather than full-sized character frames.
The original face and lower body remain pixel-identical throughout. The lift
runs from 100 to 840ms; there is no lowering before the 2000ms automatic launch.
The fixed, soft title spotlight dims the surrounding HTML menu too, without
blocking input or moving the camera. It disappears on cancellation or launch.

The original idle/body and every intermediate jacket are pixel-compared in
title-compositing.mjs; map-launch.mjs tests light registration and launch lifecycle.
Masters remain untouched; runtime images use lossless WebP at native resolution.
