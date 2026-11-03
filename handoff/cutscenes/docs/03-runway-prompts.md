# Runway production workflow and prompts

The Runway plugin is intended to be used in the next session. This handoff does not assume its model names, tool schema, credit system, reference limit, supported resolutions, frame controls or audio capabilities. Inspect those capabilities before invoking a generation. Map the creative instructions below to the actual tool inputs.

Read `07-latest-direction.md` before using these prompts. The intro reference video is forthcoming and absent from this handoff. Its treatment must be decided after inspection. Receiving the exact Park trainers after Midtown is a requested beat; the 505 host staging and 6–8-second edit below are proposals. No prompts have been run and no cutscene player is implemented.

## Workflow

1. Select one shot and its character variant. Use the current runtime assets and screenshot/reference board, not a text description alone, to establish likeness and style.
2. Prepare a composed start frame. Keep a simple readable action, clear feet/ground contact and enough margin for the character's movement. Use a clean reference without HUD/UI. Preserve existing architecture rather than asking a model to invent it anew.
3. Inspect the still at full size and at likely mobile display size. Confirm face, costume, proportions, 505 glazing/lighting or Park composition before animating.
4. Generate one short shot with one primary action and one restrained camera move. If the plugin supports end-frame or additional reference controls, use them to enforce a stable ending; otherwise request a settled ending in the prompt and trim the best take.
5. Review every frame. Compare first/middle/last frames to the references. Reject face drift, disappearing hands, foot sliding, suit changes, doubled people and wobbly architecture. A slower take is preferable to motion that cannot be made physically credible.
6. Edit shots together, add exact typography/branding and mix existing audio separately. Save clean picture before text or audio is burned in. Record prompts, tool/model version, input references, seed if exposed, output ID, native dimensions/rate and any subsequent retiming/upscale.

The prompts below describe motion for image-to-video. **Attach the appropriate composed reference frame**. Replace bracketed fields before sending. Do not feed the entire sprite atlas to a video generator as if it were a single scene; use one extracted pose for the character reference and the atlas/contact sheet only if the tool has a separate identity-reference input.

## Shared visual instruction

Use this concise instruction alongside each shot when the selected tool supports such context:

```text
Preserve the supplied frame's detailed painted 2D game illustration and the
exact character identity, facial features, body proportions, costume colors
and architectural layout. The performance is relaxed and confident, with
natural weight and planted feet. Clothing moves subtly with the action.
Architecture remains rigid. Keep the image clean and coherent throughout.
End with a gentle ease-out into a stable pose suitable for a game transition.
```

Avoid adding a long list of unrelated styles or camera instructions. If the tool has no dedicated negative-prompt field, put only the most relevant constraints in ordinary language. A separate review checklist is more reliable than an enormous prompt.

## LR-OP-01 — draft prompt after reference-video review

The suggested overall intro is 8–12 seconds: Nicolai prepares to run in Lower Manhattan, sets off toward screen right, and the exact title resolves in post-production into the first course. The duration and staging are suggestions. First inspect the user's actual reference video, then replace the bracketed treatment and timing below with observed choices adapted to the game. Do not submit this draft with missing fields or assume a style for the absent video. A short proof may be an excerpt rather than the whole intro.

```text
Nicolai in the composed reference prepares to run on this Lower Manhattan
street, then sets off toward screen right with purposeful natural strides.
Use [animation treatment and camera movement chosen after inspecting the
user's reference video] for this [shot duration and beat within the edit].
His feet contact the pavement, his jacket hem responds subtly to each step,
and his face, head, proportions and costume remain consistent with the game.
One World Trade Center remains a single unchanged distant landmark. Preserve
the supplied street architecture. End with [transition framing chosen after
reference review], leaving the exact title and branding for post-production.
No generated lettering or additional people.
```

Use Nicolai's current sprite identity. If the video is not yet available, work on a Park scenery proof or the shoe references while the intro treatment remains pending. A later Trond variant needs his own identity reference; do not ask one face to transform into another.

## LR-MT-01 — start-frame motion prompt

```text
In this supplied restored original Midtown painting, preserve the golden-hour
skyline, warm glass offices and existing street composition. The runner crosses
a short stretch of pavement from left to right at an easy,
confident pace. A light breeze moves a few individual leaves and the jacket
hem. The camera makes one slow lateral tracking move and settles as the
runner continues toward the right edge. The glass and stone office facades
remain completely stable, with straight verticals and consistent glass reflections.
Preserve the supplied pavement and landmark silhouettes at their original scale.
Do not introduce the rejected layered-city panorama or alter the backdrop.
Preserve this exact character likeness, costume and painted game style.
Five seconds, one continuous shot, calm movement and a clean ending.
```

## LR-SH-01 — proposed shoe handoff and footwear shots

The required outcome is Nicolai receiving his exact Park trainers after completing Midtown, before Central Park. Establish shoe continuity from `game/assets/original-17.webp` and `original-18.webp`, checked against `game/scripts/park-shoes.js` and `references/gameplay/central-park-gameplay.png`. Use `original-27.webp`/`original-28.webp` for formal footwear only; the generic extracted run frame is not the trainer reference. His trousers and other clothing remain unchanged. The following two-shot office treatment is optional; a 6–8-second total edit is suggested, with individual shot lengths selected from the plugin's actual capabilities and trimmed deliberately.

Compose and inspect each input frame before generation. For the suggested handoff shot, show the host holding an open shoebox with the correct trainers already visible, so their design is established without invented opening mechanics.

```text
At the exact blue/cyan 505 Fifth entrance in the composed frame, the woman
in the plum suit calmly offers Nicolai the open shoebox. The visible pair
of trainers keeps the exact shape, navy knit, white midsoles and collars
from his supplied Central Park shoe reference. Nicolai accepts the box
with a small warm smile and natural hand contact. Preserve both faces,
body proportions, costumes, the complete paired revolving doors and fixed
architecture. One restrained action and a settled ending; no dialogue,
invented branding or generated lettering.
```

For the footwear shot, compose Nicolai already wearing those exact trainers with a credible lace-tightening pose. Use a clean edit from the handoff; do not ask the generator to transform footwear or trousers in place. Generate a separate test-step shot only if it improves clarity within the chosen edit.

```text
Nicolai is already wearing the exact Central Park trainers shown in the
composed reference. He gently tightens the laces with a small natural hand
movement, then releases them and settles. The shoes retain their exact
navy knit shape, white midsoles and white collars throughout. His brown
trousers, cuffs, legs, hands and body proportions remain consistent with
the game reference. Keep the shoe soles planted on the pavement, the camera
steady and the movement relaxed. No clothing transformation, new shoe
logos or generated lettering.
```

The final edit may finish on one light test step into a jog toward Central Park. The office host, shoebox staging, length and optional caption “Investing in the long run” remain proposals. Preserve the requested after-Midtown/before-Park placement regardless of treatment. Do not substitute a greeting-only clip for the shoe beat.

## LR-PK-01 — start-frame motion prompt

```text
Bring this exact Central Park painting gently to life. The lake has soft,
small ripples and a few separate golden leaves drift through the scene.
The referenced runner on the path takes a quiet breath, looks ahead and
takes one relaxed step toward screen right. The camera makes a very slight
slow push, then settles. Preserve Bow Bridge's exact shape, the lake shore,
tree masses and warm dreamy light from the supplied frame. The runner's
face, clothing, scale and foot contact remain consistent. Five seconds,
one continuous painted game-art shot with restrained movement.
```

For the scenery-only proof, omit the runner sentences. That is a useful test of preserving the Park painting before adding a character. If used after LR-SH-01, Nicolai already wears the exact Park trainers; compose them from the Park atlas. This scene is optional supporting material, not a replacement for receiving the shoes.

## LR-OF-01 — start-frame motion prompt

```text
At this exact 505 Fifth glass entrance, the woman in the plum tailored suit
and black top gives the approaching runner one small warm greeting. She
smiles naturally, raises one open hand in a relaxed motion, holds briefly,
then lowers it slowly to a comfortable resting position. Her long dark hair,
recognizable face, gold round belt buckle and body proportions remain
unchanged. The camera is almost locked, with only a subtle slow push.
Preserve the electric cobalt-blue lobby, cyan light strips and diagonal
reveals, both full revolving glass doors and their dark mullions. The
architecture stays rigid. Blue reflections remain behind the characters;
skin tones stay natural. Five seconds, one greeting, a settled final pose.
```

The “505 FIFTH” lettering is an exact overlay or protected source element in the final composite. Inspect it across every frame. Regenerate or composite around any altered letters rather than accepting near-correct text.

## LR-CT-01 — character plate prompt

```text
The referenced investor holds a stable medium-profile pose and gives one
small knowing smile, as if appreciating an unexpected change of perspective.
His head does not sway. His shoulders and clothing move only slightly with
natural breathing. Preserve his exact face, costume and painted game style.
A short continuous shot with a still beginning and end, no camera rotation.
```

Composite the orientation change using the game background as a separate layer. Do not ask the model to spin the face or invent the underside of the city. A live-engine version may replace this video entirely.

## LR-IP-01 — start-frame motion prompt

```text
The investor's compact jetpack is securely attached to his upper back with
visible fitted straps. A small light turns on, then gentle thrust lifts him
smoothly upward. He adjusts his posture slightly to balance, with natural
arm and leg movement. The camera follows with a restrained upward track.
The existing IPO Hype Machine stays recognizable in the background as its
indicator lights wake. Preserve the runner's exact face, clothing, tie and
jetpack attachment, and keep the illustrated game-art style. Four seconds,
one continuous controlled lift-off, ending stable before action begins.
```

Add the branching price trace as an editable graphic in post, based on the game's real `priceWaves` visual treatment. This avoids unstable invented graphs and keeps later timing editable.

## Review before selecting a take

Look at the face and both hands throughout, the contact point of every foot, moving clothing edges, any ties/straps, the office door mullions, landmark count, background seams and the last half-second. Confirm that a single wave is actually a single wave and its return is smooth. Compare the clip beside live gameplay; cinematic detail should not create a different-looking cast or city.
