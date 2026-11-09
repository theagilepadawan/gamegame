# Version 1.23 — Title spotlight and finance-humour review

## Scope

- Both title runners keep their exact original idle, face, outfit, trousers
  and shoes. Only a small near-arm region changes. Generated source artwork
  and original gameplay atlases remain byte-for-byte unchanged.
- The 100–840ms arm lift uses registered palm positions and 45 cached crops.
  Premultiplied blending, a curved cloth feather and a solid original jacket
  backing replace the old partially transparent polygon and double drawing.
  The hand remains raised until the chapter starts at 2000ms.
- A stationary soft spotlight leaves the hero clear, dims the surrounding
  canvas and HTML menu, and adds a subtle warm pool underfoot. There is no
  camera movement. The overlay follows actual canvas transforms and pixel
  dimensions and cannot intercept input. It fades in/out on the same clock.
- Existing cancellation, reduced-motion, character/course selection and
  opening-call sequencing are retained. The map has no thumbs-up gesture.
- All 35 active obstacle captions were inventoried. Proposed replacements,
  rationale, art ideas, signs, pickups and the five Endless ticker families
  are in [the editorial review](finance-humor-review-v123.md). Current game
  captions are unchanged; the list is for the user's selection.

## Verification

Passed against the built self-contained HTML with system Chromium and
Playwright 1.56.1:

```sh
BROWSER_TESTS=map-launch,title-compositing,story-briefing,title-first-touch,city-regressions,standalone npm test
```

- **map-launch:** both runners, unchanged map registration, pixel-identical
  face/legs, actual light coverage, non-blocking overlay, two-second launch,
  repeated input, Escape, changed runner/course/mode, dialogs, hidden tabs,
  Endless, live/system reduced motion and the 568×320 touch layout. The light
  clears on cancel and before gameplay, and follows mobile canvas coordinates.
- **title-compositing:** all 45 poses per runner at native resolution. Zero
  changed pixels outside the arm patch, zero jacket alpha holes, exact first
  idle and a visible final arm gesture. Tests ran in a DPR-2 browser context.
  [Measured results](verification/v123-title-compositing.json).
- **story-briefing:** the real Play → opening conversation → title gesture →
  chapter sequence, plus reply/blink controls, visibility, skip/cancel,
  keyboard handling, once-only completion and compact/reduced-motion layouts.
- **title-first-touch:** actual audio output after background, sound-button
  and map gestures; saved mute/zero volume and music on return to the menu.
- **city-regressions:** 2,376 fixed-camera layouts, opaque painted joins,
  spaced venue reveals, 505 only at the finish, and pinned native paintings,
  curb and physics renderer baselines.
- **standalone:** all 40 original asset hashes, embedded current art/audio,
  no external requests, character/course switching and offline Contrarian.

The [release log](verification/v123-release-checks.log) records the successful
run. Native gesture sheets and engine/caption source are unchanged. The
[caption inventory](verification/v123-caption-inventory.json) records the
current active labels reviewed in the editorial proposal.

Cold crop generation measured median 7.2ms for Nicolai and 6.8ms for Trond in
this shared headless environment; the slowest cold setup was 73.7ms. This work
is cached in menu idle slices. Subsequent cached pose draws measured 0.1ms at
the 95th percentile for both. These numbers cover the arm compositor only,
not total game FPS or a guarantee for physical mobile hardware.

The inspection recordings use real game rendering and its actual two-second
launch sequence, sampled at 30fps. They are previews, not FPS benchmarks.

## Delivery

The playable ZIP contains the current self-contained HTML. The separate agent
handoff retains complete editable source and native assets; its verified build
reproduces that HTML byte for byte. It omits the duplicate compiled HTML when
needed to remain below the existing 100 MiB archive limit. No city or character
art was resized or recompressed for this release. Archive hashes and integrity
results are in `release/release-metadata.json` and `release/SHA256SUMS.txt`.
