# Version 1.19 verification

The working source and self-contained release were exercised in
Chromium/Playwright on 2026-11-08. The final HTML is 62,552,131 bytes with
70 embedded assets; SHA-256:
`b3630b39607c2cc033ecf7150e471a4a8e197021e677398ca387e857c65d35ef`.

Final standalone passes: story-briefing, title-autoplay, chapter-cinematics,
finish-mobile, runner-unlock, mobile-polish and standalone. Source passes also
include map-launch, title-music, story-polish, finish-gates, office-host and
city-regressions. The cinema suite additionally covers a cancelled play promise
resolving during a newer screening. Offline checks decode the cropped MP4,
show the briefing and exercise actual Contrarian gameplay with zero requests.

## Changes and source evidence

- `story-briefing`: six player-advanced dialogue beats; native colour portraits;
  pixel-identical hair/shoulders during mouth/blink changes; keyboard isolation,
  Skip/Escape, cancellation, hidden-tab pause and reduced motion. Actual Play →
  call → existing two-second title thumbs-up → Opening Bell. Desktop, 568×320,
  844×390 and 390×844 layouts inspected. Trond's launch remains unchanged.
- `title-autoplay`: genuinely unactivated page inspected using CDP
  `userGesture:false` (ordinary Playwright evaluation grants a gesture).
  Permitted media autoplay starts without input; strict policy produces TAP /
  Start music. First tap starts rather than mutes; graph upgrade preserves the
  playhead and avoids double attenuation. `title-music` retains saved mute,
  volumes, exact title, looping, Contrarian exclusivity and home return.
- `chapter-cinematics`: the actual 1280×530, 30 fps, 121-frame gift film completes
  before results; correct Next chapter focus and Central Park continuation;
  quiet Midtown music, hidden-tab video/audio pause/resume, Skip/Escape,
  cancellation, failure recovery, compact viewport and Story-only eligibility.
- `finish-gates`: real completion events for both runners in all three chapters;
  airborne landings, monotonic approach, correct interior foot plane, foreground
  occlusion, pause/resume, boss requirement and progression. `finish-mobile`
  checks 568×320 / DPR2, Pixi and Canvas, far-right placement and clear controls.
- `office-host`: no background 505/host; sole host at the foreground finish,
  grounded shoes, fixed head/body, local once-only wrist greeting and reduced
  motion, in desktop/touch/Pixi/Canvas configurations.
- `city-regressions`: 2,376 fixed-camera layouts, opaque seams, late/spaced
  remaining venues, original lossless city paintings and unchanged curb/physics.
  Renderer hashes now explicitly account for the already-approved v1.18 exit
  layering, this release's film transition and covered-canvas render suspension.
- `map-launch` and `story-polish`: approved title faces/legs/shoes and normal
  map remain; two-second gesture, cancellation, Story without scores, chapter
  progression/Endless gate and the five-second Now playing card retained.

## Art and video review

The first rectangular station draft was rejected. The shipped revised portal
uses an asymmetric canopy and railing, tapered stone apron, local transparent
surround and a shallow descent into the recessed train. The existing stone
material continues beneath it and blends into the street at the approach.
The right edge continues offscreen. No global alpha fade or camera zoom is used.
A 166-frame, 30 fps deterministic gameplay capture covers the street approach
and boarding (`release/Opening-v119-subway-preview.mp4`). This is a visual
animation review, not a live FPS benchmark. The runner's shadow follows the
same registered path as the shoes; controls and
the chapter-progress strip clear the automated entrance.

Midtown background removal deletes only the separate fifth venue overlay.
The warm underlying Fifth Avenue painting, camera rate and other venues remain.
The full 505 finish, cyan lighting, glass/revolving doors and host are retained.

The supplied film's upper 190 pixels were an encoded black band. It is cropped
from 1280×720 to 1280×530, H.264 CRF17 / faststart, without losing any frames.
Its original band already obscured the upper figures; no missing picture was
invented. The unmodified master and SHA-256 provenance accompany the source.
The film is silent; no voices have been cloned or synthesised.

Browser autoplay policy remains a real limit: a fresh profile may require a
first tap. Performance captures use cloud Chromium and are not a physical-phone
FPS benchmark. Native imagery is preserved; no artificial resolution claim.

## Reproduction

```sh
npm ci
npm run build
BROWSER_TESTS=story-briefing,map-launch,title-music,title-autoplay,chapter-cinematics,finish-gates,finish-mobile,office-host,city-regressions,runner-unlock,mobile-polish,standalone npm test
```

`tools/package-game.py` verifies the playable ZIP. The cutscene handoff includes
all linked stylesheets and native movie masters; its exact staged source must
rebuild the byte-identical HTML. The standalone embeds all runtime media and is
also exercised offline. All 40 baseline source assets retain their hashes.
