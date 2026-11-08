# Title idle extension — original face retained

Each 1536 × 1024 sheet has six 512 × 512 cells in a 3 × 2 grid.
image_gen used the exact original idle frame 6 from original-27.webp (Nicolai)
and original-29.webp (Trond) as its reference. These are arm-animation sources,
not replacement characters. The runtime composes only the near-arm region over
the exact original idle. Head, lower body, legs and selected chapter shoes stay
from the game's existing atlas. Body position and scale never change.

Registration into the original 512 cell: Nicolai scale .855, translation (37,41);
Trond scale .88, translation (28,29). See the seam mask in title-launch.js.
Poses progress from idle through release to a relaxed held thumbs-up; a short
interpolation smooths the small forearm movement. There is no lowering before
launch. The full gesture lasts 2000ms and the hand reaches its hold at 600ms.

The current-title original face and legs are pixel-compared in map-launch.mjs.
Masters remain untouched; runtime images use lossless WebP at native resolution.
