# 505 Fifth entrance correction

The user supplied the office entrance photograph during the v1.4 pass. Its defining features are the saturated cobalt lobby, cyan perimeter and diagonal lights, dark raised `505 FIFTH` letters on the glazed transom, and paired revolving glass doors. These replace the prior warm gold lobby and navy signboard. The surrounding illustrated tower base, trees and street lamps retain the established game treatment; the photograph only establishes the entrance.

The final runtime image is `assets/art-v2/midtown-fifth.webp`: native 1024 × 1536 RGBA, encoded at WebP quality 95 without raster resizing. This is 1.57 megapixels of generated source detail, not an upscaled or claimed 4K asset. `assets/art-v2/native-manifest.json` records its current hash and size.

Two image-generation passes were used. The first edited the existing complete tower-base illustration with the supplied office photograph as the architecture reference, explicitly excluding the separate character photographs. The second corrected the expanded ground floor toward the existing pavement alignment while preserving both complete revolving doors. Original generated sources are retained in the execution workspace:

- `/workspace/generated_images/exec-390f3035-47f4-4caf-8575-6bd1a9eda010.png`
- `/workspace/generated_images/exec-2c3023a6-67fb-460a-9e29-f1555fa8c5d9.png` (final)

The cutscene handoff includes the final native PNG as `references/locations/midtown-505-native-source.png`. Its city-art manifest is filtered to the files actually packaged there.

## Integration geometry

The composition retains its original native width and horizontal placement. The recognisable entrance is at native rectangle `[256, 870, 512, 386]`. The ground-floor glazing is somewhat taller than the previous invented entrance, so its camera crop begins at native y = 128 rather than 78. This keeps the door threshold at the established scene ground line instead of pushing it below the pavement. No image stretching is used.

- Threshold: native y ≈ 1255.
- Left revolving doorway: `[300, 1038, 179, 216]`.
- Right revolving doorway: `[542, 1038, 175, 216]`.
- Office host's suggested foot anchor: `[782, 1265]`, beside the right door on the pavement.
- Suggested host native body height: 180–200 pixels, keeping the adult figure proportional to the 216-pixel door.

The venue pacing owner updates the camera crop and entrance metadata; the office host uses the same scenery transform and anchor. The art task does not change progression, collisions, runners or camera speed.

## Visual checks

`review/office-v14/` contains the native entrance detail and rendered game captures at desktop and DPR2 phone-landscape viewports, plus the measured scene metadata. Verify these again after host integration and the final standalone build. The illustrated upper facade is contextual art, not a measured architectural reconstruction of the full tower.
