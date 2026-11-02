# v1.4 independent visual review

Result: no remaining release-blocking visual findings in the reviewed source captures.

## Reviewed scope

- Opening and Midtown start and 15-second frames: ordinary streets precede the venues. Kabin and LEI arrive later; the four Midtown venues have distinct appearances with intervening streets.
- All desktop opening joins 02–12 and Midtown joins 02–21: no new visible seams, abrupt architectural cutoffs, or HUD collisions found.
- 505 Fifth entrance: blue/cyan full-glass lobby, two distinct revolving doors, and dark `505 FIFTH` lettering remain readable.
- Office host on desktop, phone DPR2, and Canvas: long dark hair, plum pantsuit, warm smile, and feet planted on the pavement beside the right door. The host leaves both revolving entrances clear.
- Props before/after galleries and gameplay frames: hazard labels and direction signs are clearer, grounded, and do not crowd the runner or HUD. Phone jump/slide captures preserve clear obstacle silhouettes.
- Restored Park frames: inspected start and both joins. The supplied comparison report records zero changed pixels in all 14 cases against pre-1.3 reference `156db816f0a43420b87864f5c61fde7878344035`.
- Final bridge composition at 1440, 844, and 568 widths: suspension span, tower, and stone footings read over the river without an obvious cut edge or HUD collision.

## Resolved finding

An initial Midtown join-02 capture showed the office greeting at 00:05 without the office present. The pacing owner traced this to cached shop position metadata surviving an exact seek and changed greeting evaluation to derive the office position from the current run distance. Independently inspected the regenerated join-02 frame: the early greeting is absent. The refreshed late-office frame correctly shows the host and greeting at 00:57.

## Key evidence

- Early pacing: `review/venue-pacing/{desktop,mobile-dpr2}-opening-15-seconds-ordinary-streets.png` and `review/venue-pacing/{desktop,compact}-midtown-15-seconds-ordinary-streets.png`.
- Clean greeting regression proof: `review/venue-pacing/desktop-midtown-join-02.png`.
- Final late office: `review/venue-pacing/desktop-midtown-fifth-hero-center.png`.
- Host placement: `review/office-host-v14/{desktop,mobile-dpr2,canvas}-office.png`.
- Entrance detail: `review/office-v14/entrance-detail.png`.
- Props: `review/props-v14/{before,after}/gallery.png`, after gameplay frames, and `review/props-v14/smoke/phone-{jump,slide}-dpr2.png`.
- Park restoration: `review/park-restoration-v14/comparison.json` and `desktop-pixi-{start,join-1,join-2}-restored.png` in the same directory.
- Final bridge: `review/downtown/bridge-readable-{1440,844,568}.png`.

## Validation boundary

This was an independent visual inspection of existing source-render captures and their supplied comparison data. The reviewer did not launch additional browsers or independently rerun behavior, physics, or performance tests. Still images establish composition and legibility at the captured moments; they do not establish every animation frame or every gameplay state. The exact final standalone package validation was still running under the root agent when this record was written and remains the root agent's final release check.
