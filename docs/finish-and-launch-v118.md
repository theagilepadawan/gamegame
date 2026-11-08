# Version 1.18: a personal send-off and a proper destination

The title character raises a relaxed thumbs-up on **Play**, holds it, and the
chapter starts after two seconds. Browsing the map only runs the small figure
between destinations. The original title head, lower body, shoes, scale and
placement remain intact. Six registered arm poses extend the existing idle;
there is no lowering gesture before departure. Both runners are supported.

`longrun:launch-cue` is dispatched at confirmation with `{runner, duration:2000}`.
This is the insertion point for the user's forthcoming voice clip. No voice
recording has been fabricated or added. Escape, a different course/runner/mode,
a dialog or a hidden tab cancels the launch. Repeated Play does not queue runs.
Reduced motion starts the chapter directly. Retries and Next chapter retain
their immediate behavior; the send-off belongs to the title screen.

## Research and design decisions

Primary sources inspected on 8 November 2026:

1. [SuperTux's walking end sequence](https://github.com/SuperTux/supertux/blob/2b722c8840dd772f90a2582f63ab353322e501f5/src/object/endsequence_walk.cpp)
   supplies controlled rightward movement and a finite completion timer.
   Its [base sequence](https://github.com/SuperTux/supertux/blob/2b722c8840dd772f90a2582f63ab353322e501f5/src/object/endsequence.cpp)
   separates starting, running and completion. This supports making arrival a
   small, explicit state of the game. Our implementation is original: it uses
   the existing runner atlas and frozen course, follows any outstanding jump
   to the ground, then carries the runner behind the entrance's near pier.
   No SuperTux code or artwork is copied.
2. [PixiJS Container source](https://github.com/pixijs/pixijs/blob/dev/src/scene/container/Container.ts)
   describes assigning a container to a render layer's position in the scene.
   The same ordering principle gives the entrance its depth: painted interior,
   runner, then the foreground doorway. The game already uploads its Canvas drawing
   to Pixi, so this needs two image draws and uses the existing renderer and
   Canvas fallback. A 3D engine would add a separate lighting, projection and
   asset pipeline without improving this side-on entrance.
3. [W3C, Understanding Animation from Interactions](https://github.com/w3c/wcag/blob/d1e063920a1574d7fb67823d9343e12bb6cf6829/understanding/21/animation-from-interactions.html)
   explicitly discusses dizziness from nonessential motion and parallax, and
   respecting the operating system's reduced-motion preference. This matters
   particularly given the user's earlier motion-sickness feedback. Entrances
   have no camera zoom, shake or extra background movement. Reduced motion
   skips the decorative run-in and shows the result after a short pause.

Direct Nintendo and landmark-site access was blocked by this environment's
network policy. No claim is made to have inspected their current pages.
Architectural treatment below is original art direction informed by the
approved in-game paintings, rather than a surveyed reproduction of a building.

## The three entrances

| Chapter | Structure | Visual signature | Inscription |
| --- | --- | --- | --- |
| Opening Bell | A stock-exchange bell pavilion | Fluted limestone, a sculpted bull, bronze bell, a deep warm lobby | The Listing Bell · A Longer Horizon |
| Midtown | The 505 FIFTH office entrance | Full cobalt glass, cyan diagonal lighting, both revolving doors, an angled side return and the existing woman beside the entrance | 505 FIFTH |
| Central Park | A Bethesda-inspired sandstone arcade | Carved foliage, autumn ivy, bronze lanterns, coffered ceiling | The Long View · Returns, with a View |

Each new transparent master is 1536 × 1024. Runtime WebPs are lossless at the
same resolution. Source masters and registration notes travel in the handoff.
The classical entrance inscriptions are drawn separately. The 505 lettering
belongs to its faithful glass-fronted artwork. The architecture has complete sides and roof, a shallow threshold,
and a visible interior. Its baseline meets the existing flat chapter apron. Every structure now arrives
at the far right, leaving a clear approach for the runner. 505 retains its full
frontage and uses a small interior floor rise to match its angled perspective;
the woman stands on the pavement at the far right and greets the arriving runner.
The existing backgrounds, street camera and Easter-egg positions are retained.

## Integration details

The ending begins at the actual course completion condition. Opening Bell still
requires all three IPO boss waves; an active jetpack must still finish first.
Crossing in mid-jump now starts the arrival immediately. A small ballistic
landing carries that jump into the run-in, so waiting to land cannot scroll
the destination away. Chapter results, progression, unlocks and the default
Next chapter action remain in the existing results handler.

Arrival keeps approximately the course's running pace, normally taking two to
three seconds; a high jump can extend it to allow landing on the approach. Gameplay input no longer advances the completed model.
Pause freezes the sequence. The character physically passes behind the near
pier before the results appear. Endless has no chapter entrance.

See `scripts/title-launch.js`, `scripts/finish-gates.js`, their small hooks in
`scripts/engine.js`, and the production notes beside the asset files.
