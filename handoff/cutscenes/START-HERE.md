# The Long Run — cutscene production handoff

This folder is a working brief for a fresh ChatGPT agent using the user's Runway plugin. It contains the game, editable source, art references and production notes. **The cutscenes below are proposals, not existing game features or approved final scripts.** No Runway generation has been performed for this handoff.

Start with the packaged game and its current art. The user has invested heavily in character likeness, natural scenery placement and animation quality. Preserve those decisions while adding a small number of short, polished cinematic moments.

## Open these first

1. `playable/The-Long-Run-NBIM.html` — the self-contained game. Serve locally if the browser blocks local files.
2. `docs/01-project-and-style.md` — settled direction and current scope.
3. `references/` and `docs/06-asset-map.md` — visual authority and source mapping.
4. `docs/02-cutscene-slate.md` — proposed scenes, timing and storyboards.
5. `docs/03-runway-prompts.md` — generation workflow and pasteable shot prompts.
6. `docs/04-audio.md` and `docs/05-browser-integration.md` — sound, exports and safe integration.

`game/` is the editable source snapshot. In that folder, run `npm start` and open the printed URL. `npm run build` creates one standalone HTML. `npm ci` is needed only for the browser test dependency. The release snapshot and file hashes supplied with the ZIP are the source of truth for the packaged revision; do not resume development from an older chat artifact.

## Paste this into the next ChatGPT session

```text
You are the cinematic director and technical collaborator for The Long Run,
the internal NBIM finance-themed platform game in this handoff ZIP.

Read START-HERE.md and docs/01-project-and-style.md, inspect the playable game
and the actual references, then read the cutscene slate, prompts, audio and
integration notes. Treat the packaged game as the source of truth. Distinguish
settled user decisions from the proposed shot slate.

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
Central Park must preserve the restored original dreamy painting.

Begin with ONE representative 5–6 second proof shot from the proposed slate.
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
