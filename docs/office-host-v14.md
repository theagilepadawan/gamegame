# Office host at 505 Fifth

The office host uses the two reference photographs supplied in this phase. The
likeness priorities are her broad warm smile, cheek shape, arched eyebrows, long
side-parted dark hair, and the plum suit over a black top with a round gold belt
buckle. She has no invented name or dialogue. She is a background character,
not a new playable runner.

The art follows the detailed painted style of the live Nicolai/Trond sprites.
The rejected cartoon runner experiment was not used. Both live runners remain
unchanged.

## Source and export

- Final native source: `/workspace/generated_images/exec-d6fba899-76fc-43ae-86e9-cdc4f41b5e25.png`
- Native dimensions: **1024 × 1536**, RGBA. This is generated detail, not an upscaled export.
- Final source SHA-256: `d66b584df14014bc364f0c3f8a013c0ef95204950771b61c34810415ef48b95e`
- Runtime asset: `assets/office-host-v14/host.webp`, same native dimensions,
  WebP quality 94, alpha retained.
- Runtime SHA-256: `9466c39d8afd8a0a8a31dd9e440f08be59463331dfc1ef39cc769bd1b4d48ef8`

The initial image generation used the two user photographs directly. A second
image-generation edit retained the likeness and outfit, refined the painted
finish using the live Nicolai atlas as the style reference, and specified a
clean transparent cutout. Inspection composited the result against a neutral
background to verify the cutout; the RGB gradient outside the figure has zero
alpha and is not a visible halo in the game. The native alpha-128 silhouette
bounds are approximately `[220, 16, 829, 1517]`.

Keep the source PNG when making video or larger editorial compositions. Do not
scale up the runtime screenshot as a substitute for the native art. The source
pose is a calm standing welcome with one raised palm and the other hand near
the trouser pocket, with both shoes fully present.

The cutscene handoff includes this final PNG at `references/office-host/host-native-source.png`.

## Architectural placement

`scripts/midtown-storefronts.js` owns the office anchor, exposed through
`LR_SHOPS.inspect(...).items.find(item => item.key === 'fifth').host`.

- Version 1.13 native painting feet anchor: **[657, 711]** in the 1672×941 Fifth Avenue source.
- Character height in painting coordinates: **70 px**, half the full 505 entrance height.
- No vertical crop or jump-camera offset is applied.
- At a 540 px game height, the host is approximately **41.4 px** tall and her
  feet are at **412.1 px**, on the painted pavement beside the right door.

Her placement uses the same scenery camera as the office. Both revolving doors
and the 505 transom remain readable. The foreground hill can briefly obscure
the lower entrance and shoes; the host stays on the office pavement instead of
floating with the runner's changing floor. The late course exposes her full
figure as the foreground drops away.

## Runtime and motion

`scripts/office-host.js` exports `LR_OFFICE_HOST`. Both Canvas and Pixi use the
same pose and office projection. The module is loaded after Midtown metadata,
and its image participates in the engine's normal readiness checks.

The greeting is a single eased **2.4 second** wrist gesture. The head, torso and
feet use identical fixed pixels throughout; there is no head wobble, whole-body
rocking, endless waving, or independent sleeve color. The small wrist rotation
uses pixels from the same native pose. The greeting waits for the foreground
crest to clear the pavement. Pausing stops the run clock; reduced motion holds
the original still pose. Each new run can greet once.

Pixi uploads a small 512 × 800 canvas only when the wrist angle changes. The
full native source remains available for high-resolution use. The host is
hidden on the main menu and in all other districts.

## Verification

Run `node tests/office-host.mjs` against the source server, or set `TEST_URL` to
the standalone HTML. The test advances a real Midtown chapter, verifies a
fully visible planted figure before the finish, checks architectural scale,
and exercises desktop Pixi, DPR2 phone landscape and Canvas fallback. Pixel
hash comparisons verify that the head/body and shoes do not move when the
wrist moves, the gesture settles, and reduced motion holds the original pose.
Current release evidence is written to `review/v113-qa/office/`.
