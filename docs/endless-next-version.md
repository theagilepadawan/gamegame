# Recommended next pass: Endless pacing and mastery (after v1.27)

## What the current game needs next

Constant acceleration gives each run a destination: eventually the player must
make a mistake. It cannot provide the whole difficulty curve. If we only widen
pits and shorten landings, the late game becomes a visibility test; if we add
more independent random hazards, it can become an unfair combination test.
The useful progression is recognition → execution → combinations → decisions
under pressure. The seed should determine the same challenges for everyone.

Version 1.27 aligns course pressure with the existing half-step pace marks and
adds raised landings, double-jump crossings, moving/crumbling stairs and an
optional grounded triple-jump dividend. It retains the faster, constant speed
increase requested in 1.26. These are implemented; the ideas below are proposals.

## 1. Compose encounters into short waves

Group sections into an approximately 20–30 second phrase: introduce a constraint,
combine it with one familiar move, run a short peak, then give a brief recovery.
For example: slide → rising double jump → moving landing → safe dividend trail.
Use a difficulty budget that accounts for speed, vertical change, visibility,
landing width and number of transitions. Spend more of that budget at each tier,
but do not maximize every dimension together. Keep the existing course visible
and fixed once generated; never tighten a landing while the player approaches it.

The first 20 seconds should contain one readable slide and one meaningful gap
sequence. The opening should respect players who have already completed Story,
while giving them a moment to recognize their seed. Later recovery should be
shorter and less frequent, but still visibly intentional.

## 2. Make mastery pay, without trapping missed attempts

Build on Compound Interest with occasional clearly marked risk/reward branches.
The lower route is a demanding but dependable crossing. The upper route chains
landings, a grand jump and an optional moving platform for better returns.
Reward completion of the whole route, not blind jumps toward an isolated coin.
A missed chain should cost the bonus before it costs the run. Keep all grants
and route options deterministic so leaderboard comparisons remain meaningful.

## 3. Give each input combination a clear visual language

Use consistent take-off markers, double-arc coin trails and identifiable landing
edges. A moving ledge should show its travel range and rhythm before the jump.
A crumbling ledge should advertise its material before it starts cracking.
At high speeds, prioritize the next landing and the next required action over
extra background effects. Keep the existing background and camera treatment.
A useful test: a new player can explain why they fell from one paused frame.

## 4. Turn occasional events into skill exams

Keep the IPO Hype Machine occasional. Add one new, short encounter that tests
the current tier's learned moves: for example, a "Liquidity Crunch" crossing
with narrowing temporary ledges and a clearly forecast final landing. Choose
from distinct encounter families, rather than making every IPO graph denser.
Allow a real recovery afterwards and resume the same street pace. Avoid stacking
an event exit, a new pace tier and an unseen mandatory double jump together.

## 5. Make failure teach the player something

Offer an optional short replay of the final few seconds with inputs and the
missed landing visible. Pair it with one accurate explanation, such as "Second
jump used too early" or "Jumped after the landing window closed." Provide a
practice retry of that exact section with the same seed and speed. Practice
runs should be separate from leaderboard submissions. This makes a difficult
run feel learnable and gives us useful evidence when a section is unfair.

## Release criteria

- No new section requires an unavailable air jump or an unprepared triple jump.
- Main-route witnesses use real inputs, with no damage, shield credit or forced
  movement. Bonus-route witnesses demonstrate the actual setup and landing.
- Test boundary pairs immediately before/after pace marks, multiple seeds,
  both characters, touch layouts and desktop layouts.
- Judge readability and input tolerance as well as mathematical reachability.
  Record near-edge failures separately from skillful but impossible sequences.
- Measure performance on representative mobile hardware before promising a
  frame-rate target. Keep generated objects and effects bounded.

Recommended order: encounter waves and visual language first; reward branches
second; failure replay/practice next; one additional skill-exam event last.
