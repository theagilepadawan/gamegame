# Project and visual direction

## What the game is

**The Long Run — NBIM Arcade** is a browser platform game for fund colleagues. It mixes New York scenery with investing ideas: a bull run, a challenging sell-off, research and conviction pickups, a protective capital reserve, an upside-down Contrarian event, jetpack flights and the IPO Hype Machine. The humor should reward people who understand investing without turning every object into a caption.

The current source begins exclusively with the user-supplied branded `The-Long-Run-New-York-NBIM-Arcade (1).html`, identified in `game/BASELINE.json`. Earlier game sources and the separate peeking-Nicolai widget are not alternate foundations for this project.

Story progresses **Opening Bell → Midtown → Central Park**. Endless has seeded courses. Daily Challenge and a separate Contrarian mode were removed. Contrarian is an in-level pickup/event. The world picker has one New York world and no redundant “World #1” heading. Results default to the next chapter after a win, and Main menu after the finale. Trond is unlocked by completing Central Park; `?unlock=all` is a development/demo option.

Opening Bell already ends with a bespoke fund-history reveal: the course becomes the fund's 1998–2025 chart. Keep that sequence and its factual presentation. A generated film must not substitute invented financial data or crowd out this payoff.

## Settled user decisions

| Area | Direction to preserve |
|---|---|
| Nicolai | Use the original live-game sprites and their illustrated, detailed style. The later cartoon sprite experiment was rejected. Keep his recognizable face, short receding hair, blue jacket, light blue shirt and brown trousers as shown in the current atlas. |
| Trond | Use the existing current-style sprites. His likeness may be refined later from 3–5 new reference photos; those references are still pending at this handoff. Keep his distinct belly slide, rolling recovery and rapid airborne spins. |
| Animation | Smooth, confident, clean and relaxed. Earlier widget iterations failed because of bobblehead movement, excessive waving, body drift, tiny arms and mismatched sleeve colors. These are useful quality lessons, not a request to reuse the widget design. |
| Downtown | Warm opaque Lower Manhattan panoramas with streets beneath the course, not an ocean sheet. Keep its own WTC/bridge/financial-district identity; no Midtown landmarks, severed bridges or repeated landmarks. |
| Midtown | Warm opaque city panoramas and dry streets, with venue fronts integrated into the same painting/camera. Keep recognizable Midtown landmarks, natural spacing and the complete blue/cyan 505 glass entrance. |
| Venues | Kabin, LEI and the Midtown venues belong inside their street paintings, separated by full stretches of ordinary city blocks. The user rejected v1.8's clustered placement. Do not render them as separate drifting islands, repeat them in Endless, or turn a scene into a venue montage. |
| 505 Fifth | Complete recognizable glass entrance. Electric cobalt/ultramarine lobby, cyan perimeter lighting and diagonal reveals, dark “505 FIFTH” letters, two full-height revolving glass doors, dark mullions and reflections. Warm gold lobby lighting is an obsolete interpretation. |
| Office host | The supplied woman, portrayed in the current game style: warm broad smile, long dark side-parted hair, plum tailored pantsuit, black top and gold round belt buckle. She stands naturally at the office entrance. No name or job title was supplied; do not invent one. |
| Central Park | Restore and preserve the approved original Bow Bridge painting plus the Ramble and Bethesda extensions. The six-panel replacement was rejected. Keep the dreamy light, lake, trees and composition. |
| Asset quality | Detailed native source art; crisp, readable signs; believable feet/tyres on pavement; convincing scale and material. Raster enlargement does not create new detail. |
| Music | Contrarian uses the supplied Pixel Adventure track exclusively during the event; ordinary level music must not overlap it. |

The packaged v1.11 restores the exact v1.6 Downtown and Midtown art composition, layer movement and curbs after the user rejected v1.10's reinterpretation and added traffic. The six current venue fronts remain as native crops registered inside the v1.6 buildings. 505 keeps its full blue glass and host. Central Park retains its approved backdrop, with more deliberate tree groups and bench footings. Two later Midtown overheads move slowly on guide rails. Current Endless generation and map miniatures remain. Use the location index and current captures; the v1.9/v1.10 panorama and traffic modules are historical. A broader cartoon finance-prop pass is proposed separately in game/docs/finance-props-direction.md.

## Rendering style

Detailed 2D painted game art with readable silhouettes, realistic human proportions softened by illustrative brushwork, clear facial likeness and strong material cues. Characters can be expressive without becoming rubber-limbed caricatures. Keep clothing silhouettes and colors stable across frames. Avoid live-action footage, glossy plastic 3D characters, emoji props and heavy comic outlines.

The camera should feel composed rather than restless: one slow push or short tracking movement per shot, settled starts and ends, and action that can be understood immediately. Architectural verticals stay straight. Foreground and background move at believable relative depths. Quiet environmental motion—leaves, water, clothing—supports the main action.

## Brand colors and type

These values come from the active theme in `game/game.css`:

| Token | Value | Use |
|---|---|---|
| Midnight | `#001538` | Main field and dark type |
| Off-white | `#f5f2eb` | Main light text |
| Polar | `#c3e9ee` | Quiet supporting tone |
| Sea | `#4ec2e2` | Cyan accent |
| Sand | `#f4cea4` | Warm accent |
| Electric blue | `#0026ff` | Strong brand accent |

The UI uses the packaged Norges Bank font with browser fallbacks. Compose titles and logos as exact vector/HTML/editor overlays after video generation. Image-to-video models should not regenerate the NBIM mark, office lettering, financial numbers or UI. Leave readable text out of picture generation wherever practical.

## Humor and character

Recommended tone: a composed investor facing a ridiculous market, then a small knowing reaction. Examples of optional editorial captions: “A different perspective.”, “Hype is temporary.”, “The horizon is long.” and “Let it compound.” These are proposed captions, not quotations attributed to Nicolai or colleagues.

The user mentioned SpaceX/IPO humor and possible mini-bosses as ideas. The implemented adversary is the **IPO Hype Machine**, firing branching price paths. Do not imply a real IPO date, official endorsement, actual holding, or breaking fund news. The cutscene can use a playful generic roadshow/rocket motif already present in the game.
