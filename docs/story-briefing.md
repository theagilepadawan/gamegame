# Opening call: a change of plan

The Opening Bell title-screen start opens a brief colour conversation between
Grete and Nicolai. Grete has moved the investment meeting to a walk in Central
Park. Nicolai starts Downtown in office shoes, so she directs him to 505 Fifth
Avenue to collect a pair of running shoes. This gives the later supplied gift
film and the Central Park outfit a narrative connection.

## Dialogue

1. **Grete:** Nicolai, change of plan. We’re taking the investment meeting to Central Park.
2. **Nicolai:** What’s wrong with the meeting room?
3. **Grete:** Nothing. But the long view is easier to find without forty-seven slides.
4. **Nicolai:** I’m downtown. In office shoes.
5. **Grete:** Stop at 505. Your running shoes are waiting. Then head north—we’ll walk and talk.
6. **Nicolai:** Fine. I’m counting this as active management.

The reader advances the six short lines. Continue, Right arrow, or the focused
button's normal Enter/Space activation advances. Skip call and Escape go
straight to the existing title-screen thumbs-up. The final “Let’s go” does the
same. The title character then launches the actual course; the map keeps its
approved behavior. No voice has been generated.

## Files and integration

- `scripts/story-briefing.js`: native dialog, dialogue, expression rendering,
  focus, cancellation, and visibility lifecycle.
- `styles/story-briefing.css`: responsive colour communications panel.
- `assets/briefing-v119/`: native and lossless runtime portrait atlas and its
  registration/provenance notes.
- `tests/story-briefing.mjs`: dialogue, local animation, input, lifecycle and
  responsive layout checks.

`LR_BRIEFING.launch({character, onComplete})` returns true when it opens or is
already active. It returns false outside the title screen, when another dialog
is open, for non-Nicolai characters, or while the character reveal is active.
`onComplete` runs once after Skip or the final line. `cancel()` closes without
calling it. `inspect()` reports active beat, speaker, expression frames, clock,
readiness and completion reason.

The engine calls this only for Story / Opening Bell / Nicolai, then call
the existing title-gesture launch from `onComplete`. Main-menu and new-run
operations cancel a pending briefing. Pagehide and selection changes also
cancel without starting a run. A hidden tab holds both reading and expression
clocks, then resumes the same line; reduced motion suppresses expression and
signal animation. The native dialog keeps the underlying map and Play button
inert while the call is open.

The artwork is a new colour interpretation of two-person game communications,
with navy, teal and warm gold; no borrowed game interface, logo or sound. The
approved playable and title-screen characters are unchanged. Portraits use a
stationary listening base with registered local mouth and eye overlays, rather
than whole-face transformations.

## Verified in this change

`TEST_URL=http://127.0.0.1:4181/ node tests/story-briefing.mjs` passed against
the integrated source on 2026-11-08. It checks all six lines, once-only
completion, mouth/blink changes with pixel-identical hair and shoulders,
hidden-tab pause/resume, keyboard isolation from the map, Escape and Skip,
pagehide/cancel, reduced motion, and the real Play → call → two-second title
thumbs-up → Opening Bell flow. Every dialogue beat and action fits desktop,
844 × 390, 568 × 320 and 390 × 844 viewports. The captures in
`review/v119/briefing/` were visually inspected.
