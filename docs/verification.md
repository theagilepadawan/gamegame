# Release verification — warm Downtown restoration, version 1.12

Downtown alone is corrected. The prior release treated repository commit `a551054` as the user's visual reference without establishing that identity. Its cutout architecture sat over a broad river painting, reproducing the appearance the user rejected.

The actual earlier supplied `The-Long-Run-NBIM.html` has SHA-256 `9fd060927fc13512f82b18c86e9edc8cf19de59357f5874169d9e8644b263488`. Its extracted scenery source is the independent fixture in `tests/fixtures/uploaded-painted-scenery.js`. This is the basis for the restored complete Downtown paintings and movement; no unsupported equivalence with a version label is required.

Downtown keeps the supplied five-painting composition, native 1536×1024 sources, logical 1120-pixel panels, 64-source-pixel overlap, original intro hold/ease and chapter/Endless travel rates. There is no global water atmosphere or detached Downtown architecture in the active asset set. Water exists only where it was painted behind the promenade in the waterfront views. A localized image edit removes the misplaced Midtown skyscraper crowns while retaining One WTC and the original warm street composition. Its provenance is in `assets/downtown-v112/provenance.json`.

The six current storefront source files remain byte-identical. Kabin and LEI are registered in separate later paintings; their entrances are more than one normal game viewport apart. Foreground lampposts/bollards are restored from the same native painting over the shop fronts. Endless repeats anonymous street art without repeating the named fronts or WTC/bridge. Current Midtown/Park, gameplay, audio, sprites, props, Endless generation and map miniatures are preserved.

## Checks

- `downtown-reference`: 264 layout/camera comparisons against the actual uploaded source across desktop, landscape and portrait profiles; native street pixels outside the two shop rectangles match the reference; opaque strip coverage; late and separate shop viewing windows; no old global river asset loaded.
- `city-regressions`: 1,056 unchanged Midtown layouts across screen sizes, modes, distances and vertical offsets; source pixels outside its four native frontage patches match the pinned repository snapshot. Six engine/renderer/camera function hashes remain unchanged. All six venue source hashes remain unchanged.
- `downtown-rendering`: actual gameplay frames through the full course, double jumps and jetpack, desktop, phone DPR2 and forced Canvas, both runners. Captures are evidence for visual review rather than a claim of subjective acceptance.
- The built standalone passed Story/Endless seed handling, chapter defaults, history reveal, controller/keyboard progression, retries and unlocks. Offline switching of runner/course and Contrarian entry/return passed with no external resource requests, failed loads or browser exceptions. All 40 baseline assets are byte-identical. Command: `BROWSER_TESTS=modes,downtown-reference,city-regressions,standalone npm test`. The 18-frame-state motion suite ran separately against editable source; no engine code differs between the two builds.

Cloud Chromium software-WebGL measurements are not a physical-phone or Safari performance guarantee. Native source files are preserved; no fake upscaling is used. Current artifact hashes and exact package sizes are in `release/SHA256SUMS.txt` and `release/release-metadata.json` when packaged.

## Performance and artifact verification

The active scenery image set drops from 32 sources / 167,404,856 decoded RGBA bytes to 28 / 142,243,272 bytes. This excludes GPU textures, prepared canvases and non-scenery memory. The native source images were not downsampled.

Software-WebGL timing was variable. An initial 96-frame run measured v1.11 median/p95 14.3/45.5 ms and v1.12 14.4/93.6 ms. A reversed-order run with 100 warm-up frames and 240 measured frames gave v1.12 11.2/26.9 ms and v1.11 19.7/50.2 ms. These results support checking for obvious regressions but do not establish stable hardware FPS or a guaranteed speedup. Both measurements are retained in `docs/verification/v112-performance*.json`.

The game ZIP is checked for CRC and a byte-identical embedded HTML. The current source handoff is rebuilt independently and compared byte for byte with the standalone. Public download verification is performed against the immutable release commit before delivery.
