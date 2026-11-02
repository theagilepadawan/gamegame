# Delivery and eventual integration

This is an implementation brief for the later integration phase. **No new video cutscene player is implemented by this handoff.** The existing fund-history reveal is already part of the game.

## Delivery contract

| Item | Recommended starting target |
|---|---|
| Picture master | 16:9, 1920×1080 if genuinely generated/exported at that detail; retain native original output and metadata. Larger masters are optional, not mandatory. |
| Browser delivery | H.264 MP4, 1280×720 or 1920×1080 after testing, `yuv420p`, fast-start metadata; use an actual supported encoder profile. |
| Frame rate | 30 fps editorial target; record native generation rate and deliberate conversion. Avoid accidental frame blending on faces. |
| Audio | Separate 48 kHz stems plus a mixed review MP4; a clean picture version lets the game manage sound. |
| Poster / stills | Exact first and last frame plus a representative poster as PNG or high-quality WebP. |
| Mobile framing | Keep essential faces/actions in the central safe region. Use `object-fit: contain` with brand-colored letterboxing instead of cutting off people or doors. |
| Initial size budget | Aim for roughly 2–5 MB for a 5–6 s browser clip, then assess visible quality. Do not compress detailed foliage into blocks merely to meet an arbitrary number. |
| Metadata | ID, variant, revision, duration, dimensions, fps, codec, audio, SHA-256, reference inputs, prompt, model/tool version and approved status. |

An alpha video is not required for full-screen chapter scenes. Do not assume a generation tool supplies reliable alpha. If the Contrarian concept uses layered composition, keep character/background as separate source assets and consider rendering it with the existing game engine instead.

## Where the current code works

The game uses ordinary browser scripts, Canvas and a bundled Pixi renderer. It is not a React app. Search for the function names below; line numbers can move as the current polish lands.

| Source / symbol | Existing responsibility | Integration implication |
|---|---|---|
| `scripts/engine.js` — `Ko(mode, options)` | Creates a run, starts chapter music, clears transient state and shows gameplay. | A chapter-intro gate should complete before starting simulation, or deliberately hold a newly created run in a separate paused cutscene state. Do not call `Ko` twice. |
| `scripts/engine.js` — `Ku(timestamp)` | Animation loop; fixed simulation steps run only while `b === 'playing'`. | A full-screen film must stop simulation, not merely cover the canvas. Clear the fixed-step accumulator before resuming. |
| `scripts/engine.js` — `De()` | Clears keyboard/touch/controller-held input sets and releases the runner. | Clear input on entry and exit so Skip does not become a jump or slide. |
| `scripts/engine.js` — `sr()` / `CQ()` | Existing pause/resume UI and audio behavior. | These show/hide the ordinary pause screen. Reuse their behavior thoughtfully; a cinematic should not leave the pause dialog behind it or resume unexpectedly. |
| `scripts/engine.js` — `qQ()` | Results, score persistence, chapter unlocks and primary action. | Preserve completion bookkeeping and default Next chapter/Main menu focus. |
| `scripts/arcade.js` | Watches results and invokes `LongRunReveal` for the Opening Bell history payoff, then tally/leaderboard. | Extend this sequence explicitly if required. A second independent observer can race the existing reveal or tally. |
| `scripts/history-reveal.js` — `LongRunReveal.play(data, onDone)` | Existing approx. 10.35 s fund-history animation with Skip and result continuation. | Keep it. Do not add another mandatory victory film immediately before it. The callback controls when results become interactive. |
| `scripts/chapter-progression.js` — `LR_CH` | Unlock order and per-chapter music. | First-play policies should not change chapter availability or force a film every retry. |
| `scripts/runner-unlocks.js` — `LR_RUN` | Trond unlock after Central Park and reveal card. | Do not show Trond in a first-play intro before his unlock. Use selected-runner variants only when available. |
| `scripts/engine.js` — `beginContrarian()`, `beginFlight()`, event handling | Existing pickup transitions, music and boss state. | Do not interrupt a live jump or consume playable attack timing under a film. Add a deliberate gate only if that optional scene is chosen. |
| `scripts/engine.js` — `window.longRun` | Read-only inspection of state, course, character, renderer and snapshot. | Useful for tests and deciding what to show; it is not an existing public pause/start cutscene API. |

## Suggested player behavior

Use one small coordinator module with explicit states such as idle/loading/playing/completing and one completion callback. A proposed API could be `LR_CUTSCENES.play(id, context, onDone)`, but that API does not exist yet. The coordinator should own the overlay, controls, current clip and exit path. Normal completion, Skip, decode failure and a rejected playback promise all converge on the same idempotent cleanup routine.

At entry, save the return target and audio ownership, clear held inputs, pause simulation, prevent background controls from receiving focus, and present a visible Skip or Continue control. Keep music/SFX volume and mute consistent with the game. Use `playsinline` and catch playback rejection. If the page becomes hidden, pause the film and require a deliberate resume when appropriate; do not let the game run invisibly behind it.

At exit, pause and detach the video source when no longer needed, clear pending event handlers/timers, restore accessibility/focus and audio exactly once, reset the simulation accumulator, and invoke the correct next action. If the user returns to Main menu during loading, a late `canplay` event must not start the abandoned film. A generation/token guard is appropriate for this race.

Default replay policy: show chapter scenes once per profile or provide a replay option; skip them automatically on rapid retries. Keep this preference separate from progress/unlock keys. Never auto-start a surprise full-screen movie on an ordinary mid-run Easter egg.

Reduced-motion preference should use the poster and a short opacity transition or direct Continue, particularly for Contrarian rotation. Keyboard, touch and controller users need an obvious, focusable Skip. Caption any future dialogue. Maintain visible controls at small landscape sizes and display notches.

## Build and offline constraints

`game/build.mjs` inlines scripts, CSS and literal `assets/...` paths into one self-contained HTML. It currently knows image, font and audio MIME types. **New MP4/WebM cutscene assets need deliberate video MIME support in the build map**; the tiny original WebM codec probe is covered by the original asset manifest and is not a general video pipeline.

The current standalone game makes no external asset requests. Decide deliberately whether cutscene delivery preserves that single-file contract or offers a separate hosted-media edition. Embedding video grows the HTML (base64 adds roughly one third before transport compression), decode memory and startup work. Lazy-attach the chosen clip to the video element and avoid decoding every film at boot. An optional hosted edition should preserve the playable fallback when media is unavailable.

Never replace `scripts/engine.js`'s bundled renderer merely to add a video overlay. Keep the existing gameplay source, source-asset hashes, input behavior and offline checks intact.

## Acceptance checks when integration is requested

- A chapter intro plays once, skips immediately, and starts exactly one run. Retrying does not re-show it unless requested.
- Time, distance, pickups, collisions, boss timers and score remain frozen during the film. After exit there is no catch-up step or unintended jump.
- Finish/Skip/error all restore the correct music at most once; Contrarian music never overlaps ordinary music. Mute and volume changes work.
- The history reveal, results tally, leaderboard, chapter unlocks, Trond unlock and Next chapter/Main menu defaults still work.
- Missing video, failed decode, offline loading, playback rejection and leaving the page during load all lead to a usable game state.
- Desktop keyboard, touch landscape, controller navigation, reduced motion, pause/resume and orientation changes are exercised. Real Safari/iOS testing is separate from Chromium emulation.
- The exact packaged standalone release is tested, not just the development page. `npm test` remains the baseline regression run; add meaningful cutscene lifecycle tests.
