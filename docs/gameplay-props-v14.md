# Gameplay props, version 14

The six native painted sprites live in `assets/props-v14`. Their source is the 1536 × 1024 transparent image-generation atlas at `art/props-v14/generated-atlas-native.png`; individual sprites are cropped directly from its native pixels and stored as lossless WebP. `assets/props-v14/manifest.json` records exact crops, dimensions and blank label areas. No upscaling is used.

`scripts/prop-art.js` draws brass dividend coins, amber opportunity diamonds, a teal research lens, a conviction bull, market-risk cabinets and suspended market panels. Crisp canvas lettering carries the existing hazard names. New enamel route signs retain the route names, add directional arrows, and use restrained secondary copy: “Let it compound” and “Growth takes work.” Their small foundry plate reads NBIM. The bounce pad is a compact spring mechanism with an upward indicator.

The five engine hooks are confined to `Po.pickup`, `Po.obstacle`, `Po.spring`, `wo.obstacle` and `wo.sign`. Item meanings, reward values, physics, collision bounds, player art and terrain are unchanged. The painted cabinet/panel fills the existing hazard footprint. Park bench and branch rendering is deliberately preserved; shared pickup and wayfinding improvements also appear in Park. Diversification, jetpack and Contrarian retain their existing art.

The script loads before `engine.js`. `LR_PROPS.images` participates in the game's existing preload checks; `LR_PROPS.ready` reports successful decoding. Existing vector drawings remain available if an individual painted image is unavailable.

`node tests/props.mjs` checks decoded native assets, actual collection rewards, low-hazard jumping, overhead sliding, spring launch, unchanged Park obstacle pixels, normal animation and reduced-motion stillness. It records DPR2 phone gameplay frames and a report under `review/props-v14/smoke`. Controlled before/after galleries and full gameplay views are under `review/props-v14/before` and `review/props-v14/after`; the gallery isolates prop changes while the full views also include concurrent scenery updates.
