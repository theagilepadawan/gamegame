# The Long Run — cutscene production handoff

This folder is a working brief for a fresh ChatGPT agent using the user's Runway plugin. It contains the complete editable game, native art references and production notes. **Version 1.21 adds rear-view subway boarding and the supplied Central Park reaction sound. It retains the minimal Grete/Nicolai call and the supplied running-shoe film, now shown only on Next: Central Park after Midtown results, with a separate piano cue. Other cinematic ideas below remain proposals.**

Start with the packaged game and its current art. The user has invested heavily in character likeness, natural scenery placement and animation quality. Preserve those decisions while adding a small number of short, polished cinematic moments.

Version 1.21 adds a normal run → four-pose turn → eight-pose walk away into the
6 train, with feet registered to the sill and interior floor. The first Grete
line triggers a custom exclamation and the supplied sound. See
`game/docs/verification-v121.md` and the native assets in
`game/assets/boarding-v121/` and `game/assets/story-v121/`.

Version 1.20 uses the approved minimal ink Grete portrait and a photograph-led
Nicolai face refinement in a cleaner call layout. The gift film plays only on
**Next: Central Park** after winning Midtown, with a separate quiet piano cue;
the actual film ending or Skip starts the Park. Direct map entry skips it.
See `game/docs/verification-v120.md`. The title music retains first-interaction
recovery and has no separate start-music button.

## Open these first

1. `HANDOFF-METADATA.json` — check `playableIncluded`. If true, open `playable/The-Long-Run-NBIM.html`. If false, follow `playable/BUILD-AND-PLAY.md` to recreate the exact verified HTML, or run the editable game locally.
2. `docs/01-project-and-style.md` — settled direction and current scope.
3. `references/` and `docs/06-asset-map.md` — visual authority and source mapping.
4. `docs/02-cutscene-slate.md` — proposed scenes, timing and storyboards.
5. `docs/03-runway-prompts.md` — generation workflow and pasteable shot prompts.
6. `docs/04-audio.md` and `docs/05-browser-integration.md` — sound, exports and safe integration.

Also read `docs/07-latest-direction.md`: the user's forthcoming intro reference video, the requested running-shoe transition after Midtown, and the current detailed, widely spaced New York art direction take precedence over older proposals where they differ.

`game/` is the complete editable source snapshot. With Node.js 20 or newer, run `node serve.mjs` in that folder and open the printed URL, or run `node build.mjs` to create one standalone HTML. Neither command requires an npm install or network access. `npm ci` is needed only for the browser test dependency. The release snapshot and file hashes supplied with the ZIP are the source of truth for the packaged revision; do not resume development from an older chat artifact.

If including the compiled HTML would push this handoff over 100 MiB, packaging omits that duplicate file while retaining every native asset, test, reference and source file. The source-only form includes build instructions, the expected standalone SHA-256 and a verified staged-source rebuild record. The separate `The-Long-Run-NBIM.zip` remains the direct ready-to-play download. Current city references are Downtown’s complete warm street paintings from the supplied HTML, the original complete warm Midtown paintings and five integrated native venue fronts. The full 505 entrance and its host now belong exclusively to the foreground finish. They are not reduced to meet the archive limit. The small implemented cartoon finance-prop pass is documented in game/docs/finance-props-direction.md.

## Paste this into the next ChatGPT session

```text
You are the cinematic director and technical collaborator for The Long Run,
the internal NBIM finance-themed platform game in this handoff ZIP.

Read START-HERE.md, docs/01-project-and-style.md and docs/07-latest-direction.md,
inspect the playable game and the actual references, then read the cutscene
slate, prompts, audio and integration notes. The latest-direction document
takes precedence over older proposals. Treat the packaged game as the source
of truth for existing behavior and distinguish user requests from treatments.

Use my installed Runway plugin. First inspect its current tools and supported
models, image-reference inputs, durations and output options; do not guess
API names or promise unsupported features. If a required capability is missing,
explain the specific limitation and prepare the best supported workflow.

We want a small set of short, high-quality, skippable cutscenes that look like
this game: detailed illustrated characters, strong likeness, beautiful New
York art and understated fund-world humor. Keep the current Nicolai and Trond
sprite style. Do not use the rejected cartoon sprite study or redesign the
characters. 505 Fifth must keep the electric-blue/cyan glass lobby, complete
paired revolving doors and the office host's supplied likeness/plum suit.
Central Park must preserve its original dreamy painting. Downtown now restores the complete warm paintings and camera from the supplied
HTML. The rejected full-screen river/cutout composition is gone. Midtown also returns to its warm complete paintings with calm horizontal scrolling
and fixed vertical framing. Five native storefront crops retain venue detail inside
those streets. Inspect downtown-scenery.js, midtown-painted.js, scenery.js, venue-details.js and the
current gameplay frames.
There is no added traffic or replacement panorama module in the runtime.
Keep full ordinary city blocks between venue discoveries; do not gather the
Easter eggs into one crowded view. Preserve the complete blue/cyan 505 entrance
and its glass detail. Use references/locations/INDEX.md to open the exact source
files in game/assets/. Current character, audio and gameplay systems remain.

For LR-OP-01, inspect the intro reference video I will supply before deciding
its animation treatment, pacing, camera or transitions. That video is not in
this ZIP. The 8–12 second Lower Manhattan preparation/run/title treatment is
only a suggestion. Do not invent the missing video's style.

For LR-SH-01, Nicolai must receive the exact Central Park running shoes after
completing Midtown, before Central Park. Preserve his trousers and costume.
The 505 office host presenting a shoebox, a 6–8 second edit and the caption
"Investing in the long run" are suggestions, not required staging. Use the
Park sprite sheets original-17/original-18, park-shoes.js and actual Park
gameplay to establish the exact trainers; the generic run extraction has
formal shoes.

Begin with ONE representative 5–6 second proof or excerpt. If the intro
reference is still unavailable, use the Park scenery proof or shoe continuity
work; finalize the intro treatment after inspecting the supplied video.
Compose its reference frame from the supplied assets and verify identity,
scale, architecture and pose before animation. Use image-to-video with a
simple motivated action and restrained camera movement. Keep generated text
out of the image; composite exact captions and branding afterward.

Show the first/last frame, a contact sheet and a playable review clip. Inspect
the entire clip for facial drift, foot sliding, malformed hands, suit/color
changes, repeated landmarks, bent architecture and abrupt loops. Record the
actual Runway settings, prompt, input filenames and output IDs. Continue the
chosen slate once its visual language is sound; keep iterations organized.

Deliver clean picture, mixed review video, audio stems, poster and first/last
frames, plus a shot manifest and concise integration notes. Do not invent
spoken quotes for real colleagues. Preserve the supplied laugh and existing
music choices. Keep the existing fund-history reveal and chapter progression.
The shoe scene belongs after Midtown completion and before starting Park;
do not interrupt the active course or force it on every retry. A separate
Park establishing shot or office greeting is optional, not an extra mandatory
film at the same transition. This ZIP includes the supplied gift film and its integrated player, the opening
call, and a gameplay preview of the rear-view subway boarding. The existing
fund-history reveal remains part of the game.
Implement integration only when requested; the current task is cutscene
production. Do not spend the session merely proposing to begin.
```

## Expected production folder

```text
production/
  references/                 # The exact input frames used for each shot
  shots/LR-OP-01/v001/         # Prompt, settings, native output, review and contact sheet
  edits/                      # Assembled timelines and caption/audio cue sheets
  delivery/                   # Approved exports, posters, stems and final manifest
```

Use `cutscene-manifest.template.json` as a starting schema. Empty output fields mean work has not been generated; they are not download URLs. Keep source files and alternate takes separate from approved delivery assets.
