# Midtown gift reveal

The user supplied this four-second, 30 fps silent video. Its encoded upper
190 pixels contain a black band and watermark. The runtime copy crops those
rows, retaining all 1280 horizontal pixels and all 121 frames. No extra action,
audio or facial pixels have been invented; the original band already obscures
the top of the figures. `midtown-gift-native.mp4` is the untouched source.

Since v1.20, Midtown completion opens Story results first. The film plays only
when pressing “Next: Central Park,” with the separate quiet piano cue in
`assets/cutscenes-v120/`. Direct Park selection bypasses it. Skip, hidden-tab
pause/resume, media error fallback and cancellation are implemented in
`scripts/chapter-cinematics.js`.
