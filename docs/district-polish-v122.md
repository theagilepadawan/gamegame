# Midtown / Central Park obstacle polish, 1.22

Both branches remain in the world after the fork. Previously the unchosen
coins stayed fully visible despite being excluded from collection, and several
upper/lower obstacles lined up into an apparent wall. Lower-route challenges
now arrive at 18.2, 22.35, 25.75 and 28.5 seconds; the upper challenges remain
at 20.45 and 24.2. Unchosen props ease to 45% opacity over 300 ms, while their
uncollectible coins fade out over the same interval. Active-route objects keep
full contrast. This does not remove platform or obstacle geometry.

The middle street has a jump / slide / overhead / jump rhythm, with authored
spacing of at least 1.35 seconds before small seeded offsets. The two existing
moving-guidance hoists retain their timing and full sliding clearance.

In the 38–47-second platform sequence, ground obstacles formerly sat directly
under low decks. The new challenges belong on the second and fifth platforms:
a low jump at 40.75 seconds and an overhead slide at 45.95. Platform identifiers
bind their base, drawing and collision state to their support, including a
crumbling platform. A collapsed support takes its prop with it and cannot leave
an invisible collision in mid-air. Park benches use that support for their
footing instead of reaching down to ground level.

Coins close to supported benches form a gentle jump arc and retain their
platform binding. Other platform trails remain at a collectible height above
the deck. The level’s original scenery, platform art, terrain and movement
physics are retained. Neither route requires a shield, magnet or triple jump.

Labels keep the good existing jokes (Debt, Red Tape, Hurdle Rate, Expectations,
Consensus, Margin Call, Moving Guidance, Bonus, Pay Rise). Generic district
work/delivery labels become short jokes tied to action: Entry Fee, Fee Drag,
Sunk Cost and Capex on jump barriers; Low Guidance, Overhang and Rate Ceiling
above the player. Park adds Benchmark, Sit & Hold, Parked Cash and Long View
bench plaques; Low Yield, Rate Cut, Trim Risk and Overhang hang on branches.
Endless’s weaker Q4/Forecast and Panel/On Air captions become Fine Print /
Revised Down and Committee / One Last Q. Existing route directions remain clear.

`tests/district-fairness.mjs` searches and replays real jump/release/slide inputs
at 120 Hz without collision immunity or triple jumps, across two terrain seeds,
both districts, both runners and both fork choices. It specifically collects a
raised ledge coin by contact. This is a finite set of reproducible witnesses,
not proof of every possible seed or player strategy. Presentation tests cover
alternate-route reward visibility and supported prop rendering. The current
verification report records which checks completed for the release.
