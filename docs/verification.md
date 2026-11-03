# Release verification — Midtown backdrop restoration 1.7

Midtown restores the pre-rebuild reference `156db816f0a43420b87864f5c61fde7878344035`. The superseded v1.6 report is preserved in `verification-v16.md`.

## Current change

The original skyline, Bryant Park/NYPL and Fifth Avenue paintings use their original `.085` horizontal parallax, `H + 16` height, `y = -8` and 64-source-pixel overlap. The fast city rebuild, independent panorama, jump-driven backdrop projection and redesigned foundation are removed.

The four detailed venues use smaller, occasional street-side placements with constant horizontal travel and fixed pavement anchors. Gussy selects the native truck and curb pixels, excluding its miniature library vignette. All source art is unchanged. Complete 505 glazing, revolving doors and the host's restrained greeting remain. Downtown, Central Park, physics, runners, audio and progression are unchanged.

## Completed checks

Chromium software WebGL and Canvas checks ran against the final source, with the standalone loading check repeated after the last rendering change.

- **Restoration:** desktop, mobile DPR2 and Canvas passed. Each profile compared 24 backdrop pixel/layout pairs with an independent frozen copy of the old renderer: zero differences. Each also checked 12 unchanged Downtown/Park rendered checkpoints. Actual double-jump, timed triple-jump and jetpack frames retain the old horizontal parallax and fixed backdrop height.
- **Venue pacing:** desktop, mobile DPR2 and compact passed using actual chapter progression and visible native alpha. Artwork first enters at approximately 15.03, 26.53, 38.03 and 49.53 seconds. Named frontages never share the viewport; all are fully visible before the finish, including 505 and its host.
- **Office host:** desktop, mobile DPR2 and Canvas passed late arrival, architectural scale, grounded shoes, stable head/body, one wrist greeting, pause and reduced-motion checks.
- **Venues:** desktop, mobile DPR2 and Canvas passed complete frontages, tyre contact, full 505 glass and once-only greeting.
- **Scenery:** desktop, mobile and Canvas passed, including Opening WebGL. Native-art checks passed 11 Downtown crops, four venue sources and reachable painting joins at DPR2.
- **Final standalone:** all 40 original asset hashes match. Fonts, artwork, code and audio load without external requests; Contrarian remains playable offline. Build: 36,653,178 bytes, 59 embedded assets.
- **Visual review:** real chapter captures at 0/20/31/33/35/43/55/57.5 seconds cover the original skyline, all venues and 505/host. Omar's doors clear the foreground hill; Gussy no longer duplicates NYPL. Midtown reports zero water meshes. Original painted asphalt reflections are preserved.

Source suites run: `midtown-restoration`, `venue-pacing`, `office-host`, `venues`, `scenery`, `art-layers`. `standalone` ran on the final generated HTML. The complete `npm test` collection was not rerun: unchanged mode/menu/props/gap suites retain their earlier evidence. Historical `midtown-atmosphere` and `midtown-grounding` tests describe the rejected design and are replaced in the release runner.

## Artifact identity

- HTML SHA-256: `11aa260971e72c63e40978f59ee2ecee049593a365046779152604d2f6da29d8`.
- Playable ZIP: 26,923,755 bytes; SHA-256 `d2ac7d9db9a96593895cb2e9b1de45539eba67ec2ff3323ce5ee697cb89f117f`.
- Playable ZIP CRC passed; its HTML is byte-identical to the tested build.
- Handoff/source rebuild and remote download checks are recorded separately in the final delivery evidence and `release/SHA256SUMS.txt`.

Current previews: `release/Midtown-v17-restored.png` and `release/Midtown-v17-office.png`. Detailed local test reports are under `review/midtown-v17-restoration*`, `review/midtown-v17-pacing` and `review/midtown-v17-archaeology`.

These browser checks establish the restoration and rendering behavior; perceived motion comfort still requires the user's review. Physical-device and cross-browser checks were not performed. Administrator policy blocks `file://` navigation in this environment, so offline localhost testing is not direct local-file certification. No cutscene videos or playback gates are added.
