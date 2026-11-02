# Nicolai sprite fidelity study

**Decision:** the user preferred the existing Nicolai sprite and current game style. This direction is archived and must not be integrated. A later Trond likeness pass should retain the current style and use the new reference photos the user intends to supply.

[Download the standalone comparison and its sources](../release/Nicolai-Sprite-Fidelity-Lab.zip?raw=1).

This is an isolated animation study, not a production sprite replacement. It compares the current runner with a cartoon treatment based on the final approved Nicolai waving widget. Controls include two candidate variants, equal cycle speed, frame stepping, backgrounds, registration guides, gameplay size and a 2× view.

The illustrated style is substantially closer to the widget. Reusing one generated head gives a pixel-identical aligned face region across eight poses. However, the torso narrows at passing poses, near/far leg alternation remains ambiguous, and stance-foot travel needs work. These findings explain the experiment; they are not a plan to replace the current sprites.

The native generated sheets are 1536×1024. The 2048×1024 packed atlas provides registration space; it does not add generated detail. The ZIP contains the standalone HTML, original generated sheets, reference artwork, prompts, packing/measurement scripts, browser verification and the detailed report. Derived per-frame images can be regenerated from the included sources.

Browser checks passed for playback, wrapping, variant selection, frame controls, reduced-motion startup, desktop/mobile layouts and embedded artwork. These checks establish a usable review tool, not finished gait quality. The game’s live runner art and animations are untouched by this study.
