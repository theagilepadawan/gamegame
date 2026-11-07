# Chapter launch gestures

The generated native 1536 × 1024 RGBA sheet was made using the exact approved
384 × 420 idle crops from `assets/map-characters-v20/` as image references.
Top row: Nicolai. Bottom row: Trond. Costume, likeness, view and planted feet
follow those references. Four cells per row; only the first three are used.
The fourth lowering pose is deliberately unused, per the user's direction.

Runtime strips have three 384 × 420 transparent cells: prepare, raise, thumbs-up.
`tools/pack-map-gestures.py` applies one common scale and origin to the entire row
and registers the shoes to y=413. No independent frame centering or part swaps.
The native generated source remains here for future work.

Map browsing uses the existing seven-cell idle/run strips. Confirming Play
finishes any current trip, raises the thumb over 250 ms, holds until two seconds,
then starts the chapter. There is no lowering animation or repeating loop.
Reduced motion and unavailable gesture art start the chapter immediately.
Escape, a changed course/runner/mode, or a hidden tab cancels a pending launch.
