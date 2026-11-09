# Latest user direction

## Current authority: version 1.25

Start the call with a short ring using both supplied recordings. GDL expands
into Grete Direct Line before the portraits connect. Answer connects early;
Skip bypasses the call. Keep the 06:00 clock, omit that time from Grete's spoken
text, and do not show a 07:00 rendezvous label. Nicolai's first line is now
“Hellandussen, that’s great! Sounds like an easy run, but I could really use my
joggers.” Highlight Hellandussen; hover/focus/touch explains “Norwegian dialect
for 'woah'”. Native recordings and mix provenance are in `game/assets/briefing-v125/`.
Music pauses for ringing and dialogue; existing portrait/reaction direction remains.

Story obstacle captions are unique across each chapter's routes and Contrarian
additions. Preserve the existing art and geometry. Endless has a slightly
faster speed ramp and recurring IPO Hype Machine encounters, with seeded
branch/timing/lane variation and a smooth return to the street. See
`game/docs/comms-and-endless-v125.md` and `game/docs/verification-v125.md`.

## Retained direction: version 1.24

The approved humour review is implemented, with twelve new native district
objects in `game/assets/obstacles-v124/`. See `game/docs/obstacles-v124.md`.
Do not restore the rejected red-tape/binder artwork or change the approved
warm city paintings, venue spacing, character sprites or camera motion.

The opening call is a private 06:00 New York line. Grete says “???” just had
a cancellation and can meet Nicolai in Central Park in an hour.
Nicolai's first reply is updated by version 1.25 above.
Grete: “Stop by 505. I’ll have a pair waiting for you.”
Nicolai: “Perfect. Let’s see if active management can beat a taxi.”
Use the existing approved portraits. The first Nicolai reply triggers the
exclamation and supplied cue; hold the surprised face through Grete's reply.
Only his final line uses the smile. Music is stopped for the entire call,
including visibility changes and repeated menu input; effects remain enabled
subject to the saved mute. Completion, Skip and cancellation release the hold.

## Retained direction: version 1.23

The title send-off is a smooth, single-arm thumbs-up from the approved idle.
Keep the original face, body position, outfit and selected shoes. The arm stays
up until the level starts at 2000ms; do not return it to the lowered pose.
Only the large title character performs this gesture. The map keeps its normal
idle. A fixed, warm spotlight clears around the character while the rest of
the menu dims; avoid moving camera/light effects. See
`game/docs/verification-v123.md` and `game/scripts/title-launch.js`.

The user challenged the finance meanings and quality of the obstacle jokes.
The complete list and recommendations are in
`game/docs/finance-humor-review-v123.md`. These proposals were subsequently approved and implemented in 1.24. Do not assume debt, capex, cash,
pay rises or interest-rate cuts are inherently bad. Preserve the approved
painted props and Park artwork when interpreting this brief.

## Retained direction: version 1.22

The opening call is a larger retro colour comms console, retaining the approved
Grete/Nicolai portraits and still silhouettes. The reaction now starts only when
the reader clicks into Nicolai’s first reply; the surprise is held through the first reply. Version 1.24 reserves the smile
for the final reply. The mark remains until the next click. Keep the supplied cue and its existing mute/volume lifecycle. Native
expression sources and runtime registration are in `game/assets/briefing-v122/`
and `game/scripts/story-briefing.js`.

Reuse the approved rear-view walking poses at Midtown’s 505 entrance. Nicolai
runs up, turns away and walks into the left revolving-door bay. The full blue
entrance and host remain at the far right. The near leaf establishes depth;
no changes to his hair, outfit or ordinary gameplay atlas. Subway lettering
and the Next: Central Park film trigger remain as approved.

Midtown and Park obstacles are spaced along the chosen route, with supported
ledge challenges and coin arcs above benches. Alternate-route props remain
visible as subdued scenery; their uncollectible coin trail fades at the fork.
Live finance labels replace generic construction wording while keeping the
restored painted barrier/market board and original Park bench/branch art.
See `game/docs/district-polish-v122.md` for exact gameplay scope.

## Retained direction: version 1.21

The user explicitly wants Nicolai to turn his back toward the viewer and walk
slowly INTO the subway, after his normal run to the door. The twelve-pose sheet
uses four turning poses and eight rear-view walking poses. A small perspective
change, grounded feet and the native brass pole establish depth. Keep this
short and calm; do not revert to walking sideways across the doorway. The user
approved the poses but specifically corrected the hair: retain very short grey
hair across the crown, without a bald patch.

The first Nicolai reply now triggers the gold vector exclamation and the
user's `3.mp3` cue, as corrected in version 1.22. The native upload is retained; only 0.400 seconds
of initial silence was removed in the runtime copy. The effect honors mute,
volume, hidden-tab pause and cancellation. No voice imitation was created.
The new walk-in remains an experiment for user review.

## Retained direction from version 1.20

The opening Nicolai/Grete conversation gives the journey a purpose: a walking
investment meeting in Central Park, via 505 to collect running shoes. It is a
minimal ink-and-flat-colour portrait dialogue inspired by the user's
communication-screen reference, with six user-advanced lines, Skip and local
mouth/blink animation. Grete uses the exact generated artwork the user called
perfect. Nicolai’s face is refined against the supplied photographs, keeping
the blue checked blazer and open collar. His latest likeness still awaits user
review. The approved title thumbs-up follows it. No imitation voices were created.

Downtown's Listing Bell pavilion is replaced by an angled, recessed 6-train
station portal. The rejected rectangular station block is not shipped. A tapered
approach, shallow foot/shadow descent, transparent outer silhouette and ground
foundation connect it to the original street. The train destination now reads
“Union Square,” centered inside the board and following its shallow perspective.
Midtown has no duplicate 505 in
its background; its full blue glass and host remain at the foreground finish.

Midtown arrival now opens results immediately. The supplied gift film plays
only after pressing “Next: Central Park,” then launches Park. Direct map
selection of Park never shows it. The video remains 1280 × 530, 30 fps,
121 frames, silent, accompanied by a separate original four-second piano cue,
“A change of pace.” The cue replaces gameplay music and honors saved audio
settings. The encoded top black band was
removed by cropping 190 pixels. Heads partly hidden by the source band were
not reconstructed. Untouched source and cropped runtime are both packaged in
`game/assets/cutscenes-v119/`; the piano lives in `cutscenes-v120/`.
Read `game/docs/verification-v120.md` and
`game/docs/story-briefing.md`. Browser audio autoplay policy still applies;
permitted autoplay starts without a suspended Web Audio graph. The user
rejected an extra music-start button; ordinary trusted menu input unlocks
blocked playback. Synthetic keyboard events cannot bypass browser policy.

## Retained version 1.18 direction

The large title character gives the launch thumbs-up; the map figure only runs
between chapters. The title face and body remain from the original sprite.
The user will provide a voice clip later. `longrun:launch-cue` is the hook; do
not fabricate a recording. All three chapters now end inside painted entrances.
Read `game/docs/finish-and-launch-v118.md` for the arrival sequence and sources.
Preserve these timings when integrating external cinematics and the shoe scene.

## Retained city direction (art continues from 1.13)

Downtown keeps the accepted v1.12 warm street restoration. Midtown now also
uses the original complete warm skyline, Bryant Park/library and Fifth Avenue
paintings, recovered from their lossless masters. A matching ordinary restaurant
block spaces the current Joju and Omar's fronts. Gussy's sits on the painted
curb; 505 keeps its complete electric-blue/cyan glass and host. The city has a
single slow horizontal camera and never rises with jumps or flight. Current
native venue detail remains; the rejected river/cutout composition is absent.

The small finance-prop pass is implemented: Fine Print, Fee Drag, Red Tape,
Moving Guidance and a Benchmark plaque on the original Park bench. Existing
collisions, the two slow moving boards, gameplay, runners, Endless, map and audio
remain. Use `game/docs/verification.md`, `game/docs/scenery.md` and
`game/docs/finance-props-direction.md` for exact scope. Test completion is not
user visual acceptance. Do not return to the incorrectly inferred `a551054`
version association.

## Historical direction


These requests supplement the earlier proposed slate. They describe future cutscene production, not features already implemented in the playable game.

## Intro reference video

The user wants the intro, tracked as **LR-OP-01**, to follow a video they will attach to the external production session. That video has not been supplied in this workspace. Inspect it before choosing animation treatment, pacing, camera language or transitions; do not invent its style. Preserve Nicolai's likeness, costume and the game's NBIM identity.

The suggested brief provided in chat is an 8–12-second Lower Manhattan opening: Nicolai prepares to run, sets off toward screen right, and the title THE LONG RUN resolves into the first course. This duration and staging are suggestions; the forthcoming reference video should guide the actual treatment. This supersedes the earlier six-second intro suggestion where they conflict.

## Running-shoe transition

The user explicitly wants Nicolai to receive the exact trainers used by his Central Park sprites **after completing the second course, Midtown, and before Central Park**. This beat is tracked as **LR-SH-01**. These are running shoes, not replacement trousers. Preserve the existing Park footwear artwork and its appearance in gameplay. The source sheets are `game/assets/original-17.webp` and `original-18.webp`; the runtime already selects them for Park, and the supplied gift film is now installed in version 1.19. The following longer staging is historical proposal only.

Suggested staging from the chat brief: outside 505's blue/cyan lobby, the office host presents a shoebox. Nicolai opens it, smiles, changes out of his formal shoes and tightens the trainers' laces. One light test step leads into his jog toward Central Park. Aim for 6–8 seconds with calm, deliberate motion. The office staging, length and optional caption “Investing in the long run” are proposals, not mandatory details specified by the user.

Keep this transition compatible with the existing next-chapter action, history reveal and unlock progression. Do not interrupt the still-active second course or add a compulsory film to every retry.

## Current New York art direction

The user wants the warmth and movement of their earlier supplied city backdrop, retaining current gameplay and detailed Easter eggs. A prior agent incorrectly associated the user's “1.6.0” label with repository commit `a551054`; that identity was not established, and its broad Downtown river/cutout composition was explicitly rejected.

Version 1.12 corrected Downtown using the actual earlier supplied HTML (SHA-256 `9fd060927fc13512f82b18c86e9edc8cf19de59357f5874169d9e8644b263488`). Complete warm street paintings carry the skyline, façades, lamps and pavement together. Original slow scrolling/intro hold are preserved. Only inappropriate skyline towers were locally corrected. Detailed Kabin and LEI fronts sit in separate later street paintings with original foreground lamps restored in front. There is no global Downtown river layer or detached building composition. Water is confined to the original painted waterfront views behind the promenade.

Version 1.13 extends the same complete-painting approach to Midtown. Park retains its original scenery. Keep the full blue/cyan 505 glass, revolving doors and host anchor. Current native venue files remain intact. Do not import an earlier gameplay build or regroup Easter eggs. Endless continues through anonymous street paintings without repeating WTC, the bridge or named fronts.

The chapter map now uses miniature Nicolai and Trond cropped from the approved playable atlases. They run briefly between course markers and then settle into a still pose; reduced motion uses a static change. This does not change the character art direction. Endless has a new seeded route director, continuous terrain and progressive combinations. These are gameplay changes, not newly commissioned cutscene beats.

Use `references/locations/INDEX.md` and `location-manifest.json` to open the exact native source files in `game/assets/`; large city artwork is stored once, without downsampling. Current runtime manifests and gameplay captures define final composition. The four pickups in `assets/props-v18/`, Central Park, existing runner sheets, audio and game systems remain. Version 1.15.1 restores the earlier striped barrier and copper market board from `assets/props-v18/`; the red-tape/fee-drag props are retired. Kabin retains its accepted placement, with its original Norwegian flag restored in the native frontage crop. Previous scenery versions are historical references, not current production authority. Test completion and user acceptance must be stated separately.


## Version 1.14: Story and asset review

Story is now a score-free chapter journey. Endless unlocks only after all three
chapters are complete and has varied seeded terrain, gaps and platform routes.
The five-second track-title card follows actual music. Route scenery remains
visible after an upper/lower choice, with the authored collision rules kept.

The user disliked the newest city obstacles and requested five choices including
the actual older designs, plus Park bench/branch alternatives. Those choices
are in the separate The-Long-Run-Asset-Choices.zip; none has been selected or
integrated. Do not treat the new concept atlases as approved runtime art.
The game's backdrop, venues and default obstacles remain the v1.13 source.

## Version 1.15: Endless and phone presentation

Use the current game source for the more pronounced seeded Endless hills,
broader gap combinations and corrected opening obstacle proportions. Phone play
is a fixed 7.14% closer; menu framing is unchanged. Short landscape menus reflow,
and the five-second Now playing card uses a small vector record illustration.
No new scenery, runner art or pending asset direction was selected in this pass.
The runtime performance API reports display-driven render FPS and fixed 120 Hz
physics. Do not treat cloud browser timings as measurements of a real phone.


## Version 1.16 menu polish

The chapter picker uses the illustrated vector Manhattan in
`game/assets/map-v116/manhattan.svg`. Treat it as a schematic journey map;
cinematic location art still comes from the approved gameplay backgrounds.
Both approved map miniatures now have a short preparation and soft arrival.
Trond's first unlock reveals him on results and refreshes his menu slot
immediately; his current gameplay identity and move set are unchanged.

## Version 1.17 menu launch and title music

Map miniatures are 12.5% larger. Browsing uses the existing run; confirming Play
raises a thumb for two seconds, then launches the chapter automatically. No
arm-lowering animation, dialogue or text is wanted. The native new keyframes
are in `game/assets/map-gestures-v117/`; gameplay runners remain unchanged.

The newly supplied title-screen recording is **Why talking to people is a
superpower x Mellow Lounge**, in `game/assets/audio/title-mellow-lounge.mp3`.
Keep its complete name. It loops gently at 0.72 relative gain, with the existing
music slider and mute preference. It must stop before chapter music starts.
