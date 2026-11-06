# Latest user direction

These requests supplement the earlier proposed slate. They describe future cutscene production, not features already implemented in the playable game.

## Intro reference video

The user wants the intro, tracked as **LR-OP-01**, to follow a video they will attach to the external production session. That video has not been supplied in this workspace. Inspect it before choosing animation treatment, pacing, camera language or transitions; do not invent its style. Preserve Nicolai's likeness, costume and the game's NBIM identity.

The suggested brief provided in chat is an 8–12-second Lower Manhattan opening: Nicolai prepares to run, sets off toward screen right, and the title THE LONG RUN resolves into the first course. This duration and staging are suggestions; the forthcoming reference video should guide the actual treatment. This supersedes the earlier six-second intro suggestion where they conflict.

## Running-shoe transition

The user explicitly wants Nicolai to receive the exact trainers used by his Central Park sprites **after completing the second course, Midtown, and before Central Park**. This beat is tracked as **LR-SH-01**. These are running shoes, not replacement trousers. Preserve the existing Park footwear artwork and its appearance in gameplay. The source sheets are `game/assets/original-17.webp` and `original-18.webp`; the runtime already selects them for Park, but no shoe-receiving cinematic exists.

Suggested staging from the chat brief: outside 505's blue/cyan lobby, the office host presents a shoebox. Nicolai opens it, smiles, changes out of his formal shoes and tightens the trainers' laces. One light test step leads into his jog toward Central Park. Aim for 6–8 seconds with calm, deliberate motion. The office staging, length and optional caption “Investing in the long run” are proposals, not mandatory details specified by the user.

Keep this transition compatible with the existing next-chapter action, history reveal and unlock progression. Do not interrupt the still-active second course or add a compulsory film to every retry.

## Current New York art direction

The newest supplied earlier HTML is a **visual reference**, with normalized content matching `156db81`. The user likes its cohesive warm painted world and simpler props, and wants better scenery without Downtown's exposed ocean sheet or Midtown's wet streets and venue islands. Keep the current game code, mechanics, progression and characters; do not import the old build wholesale.

The user subsequently rejected v1.8's low backdrop resolution and its crowded venue placement, while asking to keep the continuous streets and other improvements. Version 1.9 replaces those 724-pixel-tall sheets with native portrait-detail city tiles under `assets/scenery-v19/`. The 28 base paintings contain 1024×1536 native pixels each, retained through the renderer, with 29 authored seam repairs. This restores finer architectural and venue detail; it is not a claim that enlarged pixels create detail or that every screen is natively covered at 4K.

Full ordinary blocks separate Kabin and LEI in Downtown and JOJU, Omar's, Uncle Gussy's and 505 in Midtown. Keep their real course spacing when choosing cinematic establishing views; do not crowd them together for convenience. Architecture, pavement and venues still share one horizontal scenery plane. Preserve dry streets, the bounded Downtown harbor, complete blue/cyan 505 glass and the office host's pavement anchor. The anonymous Endless continuation must not repeat named landmarks or Easter eggs.

Use `references/locations/INDEX.md` and `location-manifest.json` to open the exact native source files in `game/assets/`; large city artwork is stored once, without downsampling. Current runtime manifests and gameplay captures define final composition. `assets/props-v18/`, Central Park, existing runner sheets, audio and game systems remain. Previous scenery versions are historical references, not current production authority. Test completion and user acceptance must be stated separately.
