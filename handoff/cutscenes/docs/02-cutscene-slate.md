# Cutscene requests and proposed treatments

Read `07-latest-direction.md` first. The intro and receiving the exact Park trainers after Midtown are user requests. The staging, lengths and remaining scenes below are proposals, not approved final scripts or implemented features. Produce one proof before a large batch. Use an **LR-OP-01** excerpt only after inspecting the forthcoming intro reference video; while it is unavailable, **LR-PK-01** provides a scenery proof and **LR-SH-01** can establish footwear continuity.

Prioritize the requested intro and running-shoe beat. A Midtown arrival remains a proposed chapter transition. Park scenery and the office greeting can support the shoe edit or serve as optional extras; do not stack mandatory films at the same transition. Keep films rare; the game should spend most of its time responding to the player.

| ID | Working title | Length | Intended placement | Priority |
|---|---|---:|---|---|
| LR-OP-01 | The long run begins | Suggested 8–12 s; reference pending | First Story start, before simulation begins | Requested intro; treatment pending reference |
| LR-MT-01 | A higher perspective | Suggested 5 s | User chooses Next: Midtown | Proposed chapter transition |
| LR-SH-01 | Ready for the Park | Suggested 6–8 s | After Midtown completion, before Central Park starts | Requested shoe beat; staging proposed |
| LR-PK-01 | Room to think | Suggested 5 s | Optional Park establishing material after the shoe beat, or scenery proof | Optional supporting scene |
| LR-OF-01 | Good company at 505 | 5 s | Optional end-of-Midtown/replay extra, after office has been encountered | Optional |
| LR-CT-01 | The other way up | 1.2–2 s | Optional one-time Contrarian transition, only with a safe simulation gate | Optional; live rendering may be better |
| LR-IP-01 | The roadshow | 4 s | Optional first IPO introduction before boss telegraphs begin | Optional |

All timing below uses seconds. A 30 fps editorial timeline is a suggested delivery convention; retain the native generation frame rate in the source record and convert deliberately.

## LR-OP-01 — The long run begins

**User direction:** follow the intro reference video the user will supply. It is not attached in this handoff. Inspect it before settling animation treatment, pacing, camera language or transitions.

**Suggested treatment:** an 8–12-second Lower Manhattan opening in which Nicolai prepares to run, sets off toward screen right, and the title **THE LONG RUN** resolves into the first course. One World Trade Center can anchor the street view. Preparation might be a small cuff adjustment and composed glance. These actions and duration are suggestions; the reference video should determine the final shot structure and timing.

Keep likeness, costume, planted feet and coherent architecture throughout. Composite the exact title and any branding afterward. Optional caption: **“Built for the long run.”** Make a Nicolai variant first. If selected-runner continuity is later implemented, create a separate Trond variant from his atlas rather than morphing one character into another.

## LR-MT-01 — A higher perspective

**Story beat:** the journey moves from the waterfront into Midtown's glass, stone and vertical ambition.

| Time | Picture and action | Camera and cut |
|---|---|---|
| 0.0–1.2 | The current high-detail golden-hour Midtown street establishes its skyline and dry pavement, preserving native facade detail and the actual spacing between landmarks and venues. | Begin settled on a coherent composition using the current artwork. |
| 1.2–3.7 | The runner crosses a short stretch left to right; a small gust lifts a few leaves. | One smooth tracking move; building geometry remains fixed. |
| 3.7–5.0 | Runner exits toward the chapter's route; the camera settles on the ordinary streetscape. | Match the gameplay travel direction; retain breathing room. |

Optional caption: **“Room for growth.”** Do not feature JOJU, Omar's, Gussy or 505 here: these are discoveries later in the chapter, not a venue montage.

## LR-SH-01 — Ready for the Park

**Required beat and placement:** Nicolai receives the exact running shoes worn by his Central Park sprites after completing Midtown and before Central Park begins. His trousers, jacket, shirt, likeness and proportions stay consistent. Compare formal footwear in `game/assets/original-27.webp`/`original-28.webp` with the trainers in `original-17.webp`/`original-18.webp` before composing the shot. Check `game/scripts/park-shoes.js` and `references/gameplay/central-park-gameplay.png` for the actual Park silhouette and colors; the generic extracted run frame uses formal footwear and is not the trainer reference.

**Suggested treatment, 6–8 seconds:** outside 505's blue/cyan lobby, the office host presents a shoebox. Nicolai opens it with a small smile. A clean edit shows him wearing the exact trainers and tightening their laces; one light test step leads into his jog toward the Park. The office location, host participation, shoebox, duration and optional caption **“Investing in the long run”** are proposals. They are not additional requirements from the user.

Use separate composed frames for the handoff and the footwear close-up if needed; retain matching shoes, clothing and setting across the cut. Do not rely on a model to morph formal shoes into trainers during a running stride. Use the actual Park shoes as the visual authority; do not invent a shoe brand or redesign them.

For later integration, completion bookkeeping and the Next: Central Park action remain authoritative. Show this only after Midtown has finished, then start Park exactly once through the existing flow. Skip must reach the same Park state with its existing shoes. Do not attach the film to the live 505 encounter, change unlocks, or force replay on every retry. The runtime already selects the Park footwear; no shoe-gift cinematic is implemented yet. The requested character is Nicolai; selected-runner handling on later Trond replays needs an explicit policy rather than silently changing the request.

## LR-PK-01 — Room to think

**Optional supporting beat:** the city gives way to a quieter long view without losing momentum. This can be a proof shot or support the end of LR-SH-01; it does not replace the requested shoe beat or require a second mandatory film before Park.

| Time | Picture and action | Camera and cut |
|---|---|---|
| 0.0–1.5 | The original Bow Bridge/lake composition in golden Park light. | Gentle push of only a few percent; preserve the painting. |
| 1.5–3.5 | A few leaves drift; the lake moves softly. The runner at the path edge takes a breath and looks ahead. | Minimal character movement, stable head and shoulders. |
| 3.5–5.0 | One relaxed step toward screen right. | Settle to an image that can dissolve into the chapter opening. |

Optional caption: **“Let it compound.”** Preserve bridge shape, lake shore and tree masses. Do not regenerate a different park. Nicolai wears the Park running-shoe variant in this chapter; use `original-17`/`original-18` and actual Park gameplay for footwear continuity. For reduced motion, the poster plus a short opacity dissolve is enough.

## LR-OF-01 — Good company at 505

**Story beat:** a warm human moment inside a striking, unmistakable office setting.

| Time | Picture and action | Camera and cut |
|---|---|---|
| 0.0–1.0 | Frame the full blue/cyan glass entrance, both revolving doors and the host standing beside the entry. | Locked camera or an extremely slight push. |
| 1.0–3.4 | Host meets the approaching runner's gaze and gives one small, relaxed greeting with an open hand. | Preserve her broad smile, face, plum suit and body proportions. |
| 3.4–5.0 | Hand returns smoothly to a comfortable position; both characters share a brief smile. | End settled. No repeated wave loop. |

No spoken dialogue is required. Do not invent her name. Keep the lobby's vivid blue/cyan lighting behind her and a subtle motivated rim on clothing; retain natural skin color. Reflections may move slightly; doors and signage must not deform. Use only after the office's in-game reveal, or as an optional replay scene. If the host participates in LR-SH-01, her greeting can be part of that edit instead of a separate film.

## LR-CT-01 — The other way up

**Story beat:** an investor welcomes a different perspective.

| Time | Picture and action | Camera and cut |
|---|---|---|
| 0.0–0.4 | Close/medium profile of the runner noticing the Contrarian pickup. | Hold the face and silhouette stable. |
| 0.4–1.3 | A small knowing smile while the background's visual orientation changes in a controlled way. | Prefer a composited 2D background rotation around a fixed character over AI-generated body rotation. |
| 1.3–1.8 | Resolve to the game's upside-down orientation and clean Contrarian title treatment. | Hand control back at an exact paused transition point. |

This effect is probably better implemented with existing game layers than a downloaded video: the current event already has a 0.7 s transition. Do not lengthen every pickup interruption. A brief supplied laugh may work here if it lands naturally. Pixel Adventure replaces all ordinary level music. Reduced motion uses the title and a dissolve, without camera roll.

## LR-IP-01 — The roadshow

**Story beat:** a modest investor jetpack confronts excessive market hype.

| Time | Picture and action | Camera and cut |
|---|---|---|
| 0.0–1.0 | Jetpack attaches convincingly to the runner's back; a small indicator activates. | Medium side view, mechanically clear attachment. |
| 1.0–2.8 | Gentle lift-off; the IPO Hype Machine's silhouette enters the background. | Follow the runner with a short upward move. |
| 2.8–4.0 | One elegant branching price trace appears as a warning motif, then the view resolves into the arena. | Finish before the first playable attack telegraph. |

Optional caption: **“Hype is temporary.”** Use the existing jetpack and boss as reference. No floating duplicate tie, unattached backpack or fire crossing the runner's body. The trace here is an illustrative motif; do not change the real game's attack timing or safe paths through the video.

## Delivery per approved scene

Supply a clean picture master, a browser-sized review/delivery clip, optional mixed-audio version, separate sound stems, poster, exact first/last frames, 6–12-frame contact sheet, shot settings and a populated manifest. Record which selected-runner variant each file depicts. A clip is not approved merely because its first frame looks good.
