# Version 1.18 verification

Verified in Chromium with Playwright, including the self-contained release.

| Area | Evidence |
| --- | --- |
| Title send-off | `map-launch`: both runners, actual arm changes, pixel-identical original faces/legs/shoes, unchanged map, two-second timing, repeated input, cancellation, reduced motion and compact touch |
| Map and controls | `map-avatars`, `menu`: native stride frames, route movement, stable idle, locked choices, keyboard, controller, touch and accessible Play placement |
| Chapter arrival | `finish-gates`: actual last-second completion for three chapters × two runners, far-right entrances, airborne landing outside the lintel, foreground occlusion, interior floor plane, pause/resume, persistent completion and default Next chapter |
| Finish safeguards | Opening Bell still requires all boss waves; reduced motion skips the run-in; Endless has no chapter gate |
| Compact rendering | `finish-mobile`: all exits at 568 × 320 touch/DPR2, visible right-side doorways, 505 host at the far right, ground contact, Pixi compositor and Canvas fallback |
| Office host | `office-host`: original portrait, grounded placement, fixed head/feet, one gentle wrist greeting, pause and reduced motion in desktop, touch and Canvas renderers |
| Existing systems | `title-music`, `story-polish`, `runner-unlock`, `story-route-physics`, `mobile-polish`: music/mute/autoplay, Story without scores, Endless unlock, Trond reveal/save, 32 route-physics probes, touch framing and controls |
| Standalone | `standalone`: all 40 baseline hashes unchanged, embedded fonts/art/audio/scripts, no external resource requests, offline chapter/runner switching and Contrarian playback |

The arrival, compact-rendering, office-host and standalone suites were run
again against the final far-right/505 layout. The title animation and existing
system checks cover the unchanged code from the broader release run.

Inspected release captures:

- `release/Nicolai-v118-title-sendoff.png`
- `release/Opening-v118-entrance.png`
- `release/Midtown-v118-entrance.png`
- `release/Park-v118-entrance.png`
- `release/Midtown-v118-mobile-entrance.png`

The small rise into 505 follows the angled lobby floor. The runner's feet and
contact shadow move together; the host remains grounded on the pavement.
All three destinations keep their arrival on the far right of the viewport.
The structures scroll with the course on approach and remain still during
the short finishing run. Background art and normal camera movement are retained.

To reproduce the relevant checks:

```sh
BROWSER_TESTS=map-avatars,map-launch,finish-gates,finish-mobile,office-host,menu,title-music,story-polish,runner-unlock,story-route-physics,mobile-polish,standalone npm test
```

Packaging uses `tools/package-game.py` and
`tools/package-cutscene-handoff.py`. The latter retains the native entrance and
gesture masters and verifies that its source rebuilds the identical standalone
HTML. Archive CRCs, sizes and SHA-256 values are recorded in
`release/release-metadata.json` and `release/SHA256SUMS.txt`.

These are browser/emulation and source-integrity checks, not a claim of measured
frame rates on physical phones. The user's forthcoming voice clip is not yet
included; the launch event is documented for its later integration.
