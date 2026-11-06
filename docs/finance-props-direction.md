# Finance props — version 1.13 implementation

Version 1.14 note: the user requested alternatives to these designs. They remain
in the runtime temporarily while five city and five Park options are reviewed
in the separate asset-choices ZIP. Do not treat this existing style as the
approved direction for further replacement artwork.

The five small asset suggestions are implemented without changing terrain,
physical collision sizes, player timing or the accepted city paintings.
`assets/props-v113/atlas-native.png` is the transparent 1536×1024 source atlas;
its manifest records exact native crops and body registrations. Four lossless
sprites replace generic city obstacles. The four existing pickup sprites remain.

## Current behavior

| Object | Visual joke | Player action |
|---|---|---|
| Fine Print | Thick navy annual reports, cream pages, red bookmark and an oversized asterisk. | Jump the book stack. The bright upper edge marks the solid face; the asterisk is decoration. |
| Fee Drag | Teal investment case, brass clasps and a small trail of fee receipts. | Jump the case. The handle and loose receipts are non-solid details. |
| Red Tape | A navy binder tied up in a large bureaucratic red bow. | Slide below its broad, bright lower edge. The bow stays above the solid face. |
| Moving Guidance | A rising price-target chart, pencil and brass hoist. | Two late Midtown boards use the existing slow 3.8-second cycle; sliding is safe at every phase. The frame stays planted. |
| The Benchmark | Small brass Benchmark plaque on the original Park bench. | The original bench jump and paving footing are unchanged. |

The renderer maps each solid native body to the existing obstacle face, retaining
the engine's small forgiving collision insets. It reads the simulation's moving
`base` directly; there is no separate animation clock for collisions. Variant
selection depends on stable obstacle data, not screen position or per-frame
randomness. Typography remains live for legibility. Decorative paper is quiet,
with no particle burst, screen shake or new full-screen layer. Reduced motion
still stops ambient pickup motion; the infrequent physical hoist remains a
readable gameplay obstacle.

Park's wood/iron art, branches, trees and paving are unchanged apart from the
small plaque. The earlier proposal to add a floating “Beat the Benchmark” tag
and settling paper animations was not necessary for this modest pass and is
not part of the implementation.

## Verification

`tests/props.mjs` exercises the production jump/slide collisions, rewards and
spring behavior, visible opaque obstacle faces, stable variants and reduced
motion. It compares Park geometry with the plaque disabled. The independent
`tests/guidance-obstacles.mjs` runs 144 real collision-enabled slide traversals
across both runners, three seeds and twelve motion phases, plus standing probes
against raised/lowered boards. See the current release verification for the
executed results and actual gameplay captures.
