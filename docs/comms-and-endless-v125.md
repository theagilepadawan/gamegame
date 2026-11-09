# Version 1.25 — Grete Direct Line and changing markets

## Opening call

Nicolai's Opening Bell launch now starts with a 4.4-second incoming call.
G, D and L appear in sequence and expand into **Grete Direct Line**. The two
supplied recordings are mixed into one 4.2-second effects cue, with a short
fade at both ends. Answer connects early; Skip bypasses the call. Music stays
paused throughout ringing and dialogue, and the existing title send-off follows.

The clock remains 06:00. Grete no longer says the time and the console has no
07:00 rendezvous label. The four exchanges are:

1. Grete: “Nicolai, ??? just had a cancellation. They can meet you in Central Park in one hour.”
2. Nicolai: “Hellandussen, that’s great! Sounds like an easy run, but I could really use my joggers.”
3. Grete: “Stop by 505. I’ll have a pair waiting for you.”
4. Nicolai: “Perfect. Let’s see if active management can beat a taxi.”

Hellandussen has warm highlighting, a dotted underline and a small question
mark. Hover, keyboard focus or touch reveals **Norwegian dialect for 'woah'**.
The first reply retains the surprised face, exclamation and supplied alert;
the final reply uses the smile. The approved portraits are unchanged.

The ring, connection clock and reaction pause on a hidden tab. Answer, Skip,
Escape and cancellation stop the correct cue and release the temporary music
hold. Saved mute and effects gain remain authoritative. Reduced motion keeps
the GDL identity still and fully expanded. Native recordings, hashes and the
exact mix filter are in `assets/briefing-v125/manifest.json`.

## Unique Story captions

Story obstacles reserve their captions across both route branches and the
Contrarian section. Repeats receive authored alternatives after their artwork,
size and collision geometry are established. For example, Park's later
SHORT-TERMISM becomes PANIC SELL: “A thirty-year horizon. Until this morning.”
Scenic sign wording also varies. Existing district paintings, prop art,
positions, supports and movement remain intact.

## Endless and leaderboard runs

The starting speed remains 340 world pixels per second. The acceleration time
constant changes from 150 to 125 seconds, giving roughly 4–5% more speed in
the first three minutes while retaining the 700px/s ceiling. Generated spacing
uses the matching integrated distance curve, including full-span slide checks.

The director occasionally offers an **IPO HYPE MACHINE** jetpack after about
76–102 seconds of course progress, then schedules later offers 92–138 seconds
apart, with section boundaries and separation from other events. Ordinary
jetpacks and Contrarian events remain. The IPO offer has a clear ground approach
and can be bypassed by jumping over it.

Taking it suspends street travel for a short three-wave flight encounter. Each
encounter has its own seeded price tree: changing branch counts, split points,
4–8 knots per branch, warning periods, travel speeds and safe-lane heights.
Later encounters can have more branches and slightly tighter timing. Forecasts
remain readable, and every attack preserves its advertised passage. Fresh run
seeds produce different encounters; a chosen seed remains reproducible.

The existing boss renderer, jetpack controls, collision detection and score
awards are reused. Clearing the three waves awards 950 points in total. The
runner lands back at the same course position; the boss time is excluded from
the street acceleration clock, avoiding a sudden speed jump on return. Window
resizing preserves the already displayed forecast. Story boss/progression and
saved leaderboard entries are retained.

Implementation: `scripts/endless-generator.js`, `scripts/endless-ipo.js`,
`scripts/endless.js`, plus the engine's pickup, rendering and HUD integration.
