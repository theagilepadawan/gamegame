# Version 1.27 verification

## Scope

Pace-aligned Endless difficulty levels and four new seeded gap families.
Raised islands, double-jump landings, moving/crumbling stairs and an optional
grounded triple-jump bonus route use the existing character physics and art.
[Implementation](endless-v127.md) · [Next-version recommendations](endless-next-version.md).

## Model checks

- Ten pace boundaries through 6×: correct tier immediately before and after,
  increasing course pressure, one promotion announcement, and constant
  acceleration. IPO arena time does not advance street levels.
- 44 collision-free main-route witnesses cover all 22 families at starting
  pace and 240 seconds. No damage, shield credit, invincibility or forced
  grand jump. Saved controls replay against the current production engine in
  `tests/fixtures/endless-controls-v127.json`.
- 128 complete upper-route traversals across both runners, 540/960 model widths,
  160/240 seconds, 16 seeds and ±30ms take-off variation. Each earns the actual
  grounded 1→2→3 jump chain, touches the bonus shelf and finishes on solid ground
  without damage. Missing the chain leaves a separately verified lower route.
- 1,920 normally scheduled sections respect the new families' minimum tiers.
- 66 × 64 diversity samples, all 22 families reachable, viewport/reward/frame
  clock independence, and 45,824 terrain samples.
- 1,600 generated sections contain 1,216 physical pits with 1,153 distinct
  normalized widths. All 128 opening seeds contain at least four required
  crossings and two broad crossings; a multi-island pit counts each required
  transfer. Minimum opening terrain range is over 111px.
- The retained slide families pass 96 full slide traversals. Matching standing
  and double-jump attempts hit the visible ceiling in all 96 cases each.
- 128 damage-free IPO fights/landings, 69 recurring offers and 128 distinct
  attack trees preserve street position, score and pace on return. Ordinary
  jetpack and Contrarian recovery pass. Twelve Story snapshots are unchanged.

These checks sample real inputs and seeds; they are not an exhaustive proof
of every generated run. Increasing speed intentionally narrows late-run visual
reaction time. The proposed next pass addresses encounter pacing and readability
without silently capping the constant acceleration requested by the user.

## Browser checks

The new difficulty suite covers 32 complete skill crossings, four actual
triple-jump bonus routes and eight pace-level transitions. Both characters run
with collisions enabled on 1280×720 desktop and 568×320 touch/mobile layouts.
Both source and compiled builds pass with zero damage or browser errors. Captures show the
native jump animations, higher landings and level announcements.

The compiled build also passes 32 full traversals of the retained slide/jump
families, with both runners on desktop and touch/mobile at early and late pace.
The IPO browser check collects a normally scheduled offer, renders its seeded
price tree and returns to the street with working thrust controls and boss HUD
on desktop and compact layouts.

Standalone checks verify all 40 baseline asset hashes and that the release
loads fonts, scripts, native scenery, map runners and audio without external
requests. Course/character switching and Contrarian remain playable offline.

## Delivery

All 77 embedded production assets retain their previous native bytes and
resolution. The playable ZIP contains the self-contained HTML. The editable
handoff includes all native artwork, source, tests and design notes; its staged
source must reproduce the release HTML byte for byte before packaging succeeds.
One redundant obstacle contact-sheet screenshot is omitted from the handoff to
leave transport headroom; the same native props and district gameplay references
remain included. Reference screenshots use lossless encoding with decoded-pixel
equality checks. Release metadata and SHA256SUMS record exact sizes and hashes.
