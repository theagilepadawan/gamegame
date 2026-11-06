# Release verification — Detailed New York streets 1.9

## Final release verdict

PASS on the final 76,020,336-byte standalone HTML, SHA256 `0832fd48c71cba94287d0ffbe02f4c17653eb83d62d402fa2ef1eafbd6dbf24e`.

After the compact-only camera correction, the actual 900×900 viewport (logical W540) passed both complete chapters, all 216 geometry cases,66 opacity scans, native source/GPU checks, double/triple jumps, jetpack, district changes, retries and Contrarian recovery. The focused report is `review/v19-qa/post-timing-compact/report.json`; the preceding full five-profile artwork matrix remains separately recorded below.

The new visibility gate passed all 11 logical widths:540,600,640,680,720,760,800,864,960,1168 and 1440. Kabin's complete name sign and double door remain clear of foreground terrain for 2.75–4.35 s, including 2.90 s in the compact view. LEI's complete frontage remains clear for at least 3.40 s before victory. Every Midtown venue also passes, with the shortest complete-frontage interval 2.55 s. Six standard gameplay acceptance frames and a compact Kabin frame are under `review/v19-qa/visibility-final/`; full temporal measurements are in its `report.json`.

The final adjustment interpolates only compact Downtown's easing and maximum horizontal rate (up to 0.165) back to the existing 0.15 desktop behavior by W864. Standard desktop composition, Endless, all native artwork, venue world positions and gameplay remain unchanged.

Final standalone verification passed the 40 original asset hashes, all 99 embedded resources, native dimensions for all 28 city plates, no external requests/errors, and an offline Contrarian event after local HTTP loading. The game ZIP is 56,756,647 bytes, SHA256 `2272410246df4966491d13461a382826fa3437bae6d2e5e277793d825e8c8888`, with verified ZIP CRCs and the exact final HTML inside.

## Frozen-art release matrix

All five profiles passed against the embedded standalone HTML with SHA256 `fba48d9480a865238271c74a32367a76da0504412157db7697c567ecdcf9bd3f` (76,019,707 bytes). The subsequent compact-Downtown timing adjustment passed the additional final-build checks above; the artwork and standard desktop framing are identical.

| Profile | Browser viewport | DPR | Scope |
|---|---:|---:|---|
| Desktop |1440×900|1|Full chapters, venues, double/triple jump, jetpack, native textures, retries, district changes and Contrarian recovery|
| Mobile browser emulation |844×390|2|Same full-route coverage|
| Forced Canvas |1440×900|1|Same full-route coverage with WebGL unavailable|
|1080 detail|1920×1080|1|Decoded/cached/native GPU dimensions and exact source pixels|
|1080 detail at DPR2|1920×1080|2|Same checks against the actual 3840×2160 framebuffer|

The matrix includes 216 layout cases,66 full-image opacity scans (including the anonymous Endless loop through 1,000,000 units), six exact Central Park pixel hashes and 95 actual-gameplay screenshots. No page errors or failed resources occurred. At most 11 scenery panels were visible. Prepared bitmap, raw WebGL and Pixi caches each stayed at or below 12 entries through complete chapters; inactive bitmap/texture caches clear on district changes. Restart and real Contrarian entry/recovery passed.

## Native detail

All 28 main city images decode at 1024×1536. Their complete original rows remain in native-size prepared canvases; alignment adds top/ground padding without resizing the paintings. Repair images retain their own higher native dimensions. Across the five profiles,16,121,856 sampled source channels matched their cached equivalents exactly. Actual WebGL/Pixi texture dimensions match the native prepared images.

At the same display size, the main-painting sampling density improves 2.10× linearly in Midtown and 2.18× Downtown, or approximately 4.41–4.74× in pixel area. At 1920×1080 DPR1, each native source pixel spans 0.6619 physical pixels. At DPR2 it spans 1.3238 physical pixels, versus approximately 2.78–2.88 previously. This is a substantial native-detail restoration; the source art remains below native 4K display density.

The 505 entrance itself rises from 258×199 to 511×390 native pixels (3.88× area). Its slightly smaller displayed frontage produces approximately 2.1× the linear sampling density. Actual 1:1 screenshot crops show sharper lettering, glass mullions, ceiling lights and door hardware. See `review/v19-resolution/COMPARISON.md` and its two unresampled screenshot crops.

## Venue spacing and timing

Downtown venue centers are 1908.60 logical pixels apart, with 1765.96 pixels of ordinary street between their complete frontages. Midtown center gaps are 939.08–967.87 pixels, with 742.00–779.72 pixels of ordinary street between frontages. Downtown never shows both venues at once through the widest supported view. Midtown shows at most two partial venues; standard desktop never shows two complete frontages together. No venue starts on screen.

At standard W864, initial entries occur at 26.2 s/64.9 s in Downtown and 15.2 s/27.7 s/40.0 s/52.6 s in Midtown. At the widest W1440, the first Midtown venue arrives 8.2 s into the run. All complete horizontal frontages appear before actual victory, including the Downtown IPO pickup's chapter-clock advance.

A second visual gate was added after the initial screenshots exposed a terrain occlusion problem: a frontage can fit horizontally while an uphill foreground hides it. `tests/venue-visibility.mjs` now measures the complete named sign and entrance against 17 terrain samples every 0.05 s, across 11 widths from 540 to 1440. It requires a sustained 2 s clear recognition interval and captures all six actual-gameplay acceptance frames. The final compact-Downtown correction passes this gate, as recorded above.

## Preservation

All 40 baseline assets, eight unchanged behavior modules, the simulation/audio source segment, the v18 prop renderer and its six runtime sprites retain their baseline hashes. Central Park retains all six exact pixel checks. Existing office-host checks passed on desktop, mobile DPR2 and Canvas: stable body/feet, a single wrist greeting, pause and reduced motion. Responsive checks passed square office/LEI reachability, the centered 8:3 stage cap and actual fullscreen.

## Resource footprint and practical scope

The 57 loaded city images contain 89,612,206 native pixels and total 39,388,482 encoded bytes (37.56MiB). Their combined RGBA footprint is 358,448,824 bytes (341.84MiB) before prepared canvases, GPU textures and the game's other assets. The source Image objects remain loaded even though prepared/GPU caches are bounded; browser decode-cache management can vary. The final embedded HTML is 76.02MB before ZIP compression.

Managed Chromium blocks direct `file://` navigation with `ERR_BLOCKED_BY_ADMINISTRATOR` before the game loads. Direct local-file opening was therefore unavailable for certification; the complete embedded game was verified through local HTTP and then with the browser context offline.

The tests use headless Chromium and software WebGL in the cloud. MobileDPR2 is browser emulation; no physical phone or Safari memory/performance claim is made.

## Release previews

The following actual 1920×1080 gameplay captures use an opaque runner and the normal game HUD:

- `release/Opening-v19-detail.png` — complete One World Trade Center, NYSE, bull and dry connected street.
- `release/Midtown-v19-detail.png` — complete recognizable Midtown skyline and warm streetscape.
- `release/Midtown-v19-office.png` — full blue/cyan 505 glass, revolving doors, adjacent host and ordinary offices on both sides.

These standard desktop previews are unchanged by the compact-only timing correction.

## Additional release checks and artifact identity

Story/Endless progression, keyboard/controller defaults, chapter-menu touch navigation, props/rewards, Park water motion/pause, seeded terrain gaps and Canvas fallback checks passed. The final standalone test verifies all 28 native base-image dimensions, all 40 original asset hashes, embedded fonts/scripts/art/audio and the real Contrarian event with the browser context offline. It made no external resource requests and produced no browser exceptions. Direct file:// navigation was blocked by the managed browser’s administrator policy before loading, so this check used local HTTP followed by offline mode.

Final standalone: 76,020,336 bytes, 99 embedded assets, SHA-256 `0832fd48c71cba94287d0ffbe02f4c17653eb83d62d402fa2ef1eafbd6dbf24e`. Playable ZIP: 56,756,647 bytes, SHA-256 `2272410246df4966491d13461a382826fa3437bae6d2e5e277793d825e8c8888`. ZIP CRC and byte-identical inner HTML were verified. Current artifact hashes belong in `release/SHA256SUMS.txt`; remote download identity is checked separately after publication.

The handoff packager verifies a byte-identical staged-source rebuild and every archived file hash. If the full handoff exceeds 100 MiB, it retains all native artwork, source and references and omits only duplicate compiled HTML, with build instructions and the expected standalone hash. The separately delivered playable ZIP always contains the ready-to-play HTML. Packaging fixtures passed full/source-only acceptance, stale/tampered input rejection and atomic preservation of the previous archive on failure.

The v1.8 verification record is preserved byte for byte in `verification-v18.md`. Its results do not certify this release. All checks described here were run in the current cloud workspace on 6 November 2026.
