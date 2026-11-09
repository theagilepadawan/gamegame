# District obstacles — version 1.24

The user approved the full finance-humour review, new high-detail obstacle art,
varied sizes and more occasional moving hazards. This replaces the earlier
barrier/market-board pair and Park obstacle art. Scenery paintings, scrolling,
city/venue placement, player sprites, controls and progression are retained.

## Art and typography

Three transparent 1536×1024 native image-generation atlases contain twelve
painted objects. The PNG masters and lossless WebP runtime copies are in
`assets/obstacles-v124/`. Their decoded RGBA pixels are identical, including
transparent RGB; the manifest records encoded SHA-256 hashes, native source
rectangles, physical faces, plaque panels and hanging-eye anchors. There is no
AI enlargement or reduced-resolution runtime substitute.

| District | Ground obstacles | Overhead obstacles |
|---|---|---|
| Downtown | Leather ledger stack; bronze bull valuation pedestal | Copper candlestick board; mahogany exchange clock |
| Midtown | Wheeled invoice trolley; budget/blueprint plan chest | Art Deco forecast lift; boardroom agenda clock |
| Central Park | Timber/iron Benchmark bench; bench with heavy leather market bag | Autumn bough; ivy planter |

Native body proportions determine width/height together. The same dimensions
feed collisions and drawing. Some ledge props are compact; valuation and long
forecast boards are wider. Loose receipts, handles, foliage and hanging eyes
are forgiving decoration. The curved Park bough has a larger horizontal inset.
Low props follow the sampled pavement slope. Frames stay planted, cables meet
the painted rings, and the bough joins a rooted trunk. Supported obstacles and
coins follow their moving/collapsing platform and become inactive with it.

The illustration leaves real blank plaques. Labels remain live, with warm ivory
or dark ink, automatic balanced line breaks and no horizontal squeezing. The
long valuation and committee phrases use two lines; the small bench plaques
use one. The renderer only reads simulation data, restores its canvas state,
and performs no per-frame image/canvas allocation or independent animation.

## Copy

The approved changes in `finance-humor-review-v123.md` are now applied. Hazards
target excessive costs, crowded positions, poor incentives and short-termism,
not useful tools such as capex, cash, patient holding or normal pay rises.
Hurdle Rate and Benchmark remain physical puns. “Sit & Hold” moves to a harmless
set-back seat in the Park finish approach, outside the last obstacle sequence.
Positive pickups and sincere location/route/finish signs keep their vocabulary.

`LR_HAZARDS.lines` contains the exact short follow-up for each current label.
A collision uses the relevant punchline. A successful clear may show it in the
existing ticker, at most once per nine seconds and never during flight or
Contrarian. Endless avoids its previous three captions where the theme allows;
its label choice does not consume the terrain/layout/reward random streams.

## Motion

| Story district | Moving overheads | Periods (seconds) | Travel (world pixels) |
|---|---:|---|---|
| Downtown | 3 | 4.8, 3.6, 4.1 | 32–40 |
| Midtown | 6 | 4.6, 3.6, 3.9, 4.1, 3.2, 2.8 | 34–42 |
| Central Park | 5 | 5.2, 4.4, 4.7, 3.7, 3.3 | 20–32 |

One Midtown and one Park mover belong to the upper route. Players on the lower
route see five and four respectively. The optional late jetpack corridor can
remove ordinary challenges as before. Benches and carts stay grounded.

Motion uses the 120Hz game clock, with sine or eased lift motion and deterministic
world-position/seed phases. The board's lower edge stays at least 96 pixels
above the minimum sampled floor. Slide clearance is preserved at every phase;
raised boards can also permit a standing pass. Pause freezes physical motion.

Endless adds movers only after the opening approach, at least 5.8 planned
seconds apart. A separate seeded prop stream varies periods between 2.6 and
5.2 seconds and travel between 28 and 42 pixels. Dense terrain still turns an
unsuitable overhead into a jump. Event/terrain random streams are independent.
Contrarian uses the same native proportions without adding moving obstacles.

See `verification-v124.md` and the checked-in control witnesses for the tested
scope. Successful route witnesses establish solvability for their stated
seeds/sections; they are not a claim that every possible generated seed was
exhaustively played.
