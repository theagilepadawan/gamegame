# Latest user direction

## Current authority: version 1.11

The user rejected v1.10's lag, traffic direction and reinterpreted city layers. The current build restores the **actual v1.6.0 Downtown and Midtown renderer, composition, parallax, camera and curbs**, with only six native venue-detail patches inside the original architecture. Added traffic and replacement panoramas are removed. Full 505 blue glass and the office host remain. Central Park keeps its original painting, with deliberate seating groves and grounded bench footings. Two late Midtown overheads gently rise and fall; current Endless generation and chapter-map miniatures remain.

Use `game/docs/verification.md`, `game/scripts/scenery.js`, `game/scripts/venue-details.js` and the current native location index. The broader cartoon finance-prop pass is a separate proposal in `game/docs/finance-props-direction.md`; it has not been implemented as new finished art. Earlier directions below explain history and do not override this restoration.

## Historical direction


These requests supplement the earlier proposed slate. They describe future cutscene production, not features already implemented in the playable game.

## Intro reference video

The user wants the intro, tracked as **LR-OP-01**, to follow a video they will attach to the external production session. That video has not been supplied in this workspace. Inspect it before choosing animation treatment, pacing, camera language or transitions; do not invent its style. Preserve Nicolai's likeness, costume and the game's NBIM identity.

The suggested brief provided in chat is an 8–12-second Lower Manhattan opening: Nicolai prepares to run, sets off toward screen right, and the title THE LONG RUN resolves into the first course. This duration and staging are suggestions; the forthcoming reference video should guide the actual treatment. This supersedes the earlier six-second intro suggestion where they conflict.

## Running-shoe transition

The user explicitly wants Nicolai to receive the exact trainers used by his Central Park sprites **after completing the second course, Midtown, and before Central Park**. This beat is tracked as **LR-SH-01**. These are running shoes, not replacement trousers. Preserve the existing Park footwear artwork and its appearance in gameplay. The source sheets are `game/assets/original-17.webp` and `original-18.webp`; the runtime already selects them for Park, but no shoe-receiving cinematic exists.

Suggested staging from the chat brief: outside 505's blue/cyan lobby, the office host presents a shoebox. Nicolai opens it, smiles, changes out of his formal shoes and tightens the trainers' laces. One light test step leads into his jog toward Central Park. Aim for 6–8 seconds with calm, deliberate motion. The office staging, length and optional caption “Investing in the long run” are proposals, not mandatory details specified by the user.

Keep this transition compatible with the existing next-chapter action, history reveal and unlock progression. Do not interrupt the still-active second course or add a compulsory film to every retry.

## Current New York art direction

The user identifies the latest visual reference as **version 1.6.0**, archived at `a551054`. They want its authentic city movement, cars, curb quality and open Midtown atmosphere combined with the current native detail and well-spaced venue discoveries. Keep the current game code, mechanics, progression and characters; do not import the old build wholesale.

The user subsequently rejected v1.8's low backdrop resolution and its crowded venue placement, while asking to keep the continuous streets and other improvements. Version 1.9 replaces those 724-pixel-tall sheets with native portrait-detail city tiles under `assets/scenery-v19/`. The 28 base paintings contain 1024×1536 native pixels each, retained through the renderer, with 29 authored seam repairs. This restores finer architectural and venue detail; it is not a claim that enlarged pixels create detail or that every screen is natively covered at 4K.

Version 1.10 combines these directions. Midtown's opening restores the native v1.6 glass frontage, library, dry atmosphere and one Empire State / Chrysler panorama, then joins the retained detailed venue streets. Its opening has more depth and open skyline; it is not a complete rollback. Downtown retains its detailed current paintings. Both city courses begin scrolling with the runner immediately and include sparse traffic on a real road strip above the native stone foundation. Jumping does not shift the city background vertically. The street material is clipped to playable ground, leaving gaps open.

Full ordinary blocks separate Kabin and LEI in Downtown and JOJU, Omar's, Uncle Gussy's and 505 in Midtown. Keep their real course spacing when choosing cinematic establishing views; do not crowd them together for convenience. The retained venue frontages stay within their painted streets, while Midtown's opening vista has its own distant landmark layer. Preserve dry streets, the bounded Downtown harbor, complete blue/cyan 505 glass and the office host's pavement anchor. The anonymous Endless continuation must not repeat named landmarks or Easter eggs.

The chapter map now uses miniature Nicolai and Trond cropped from the approved playable atlases. They run briefly between course markers and then settle into a still pose; reduced motion uses a static change. This does not change the character art direction. Endless has a new seeded route director, continuous terrain and progressive combinations. These are gameplay changes, not newly commissioned cutscene beats.

Use `references/locations/INDEX.md` and `location-manifest.json` to open the exact native source files in `game/assets/`; large city artwork is stored once, without downsampling. Current runtime manifests and gameplay captures define final composition. `assets/props-v18/`, Central Park, existing runner sheets, audio and game systems remain. Previous scenery versions are historical references, not current production authority. Test completion and user acceptance must be stated separately.
