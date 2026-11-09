# A change of pace

An original four-second D-major piano miniature for the gift film between
Midtown results and Central Park. No voice, existing song or video audio is
sampled. The phrase is rendered by `tools/render-gift-cue.py`, using FluidSynth
and the system TimGM6mb acoustic piano instrument. The soundfont is not bundled.

Instrument attribution: TimGM6mb, Tim Brechbill (2004), additions by David
Bolton (2010), supplied by the system `timgm6mb-soundfont` package (GPL-2).
The score and export metadata are retained in `provenance.json`.

Delivery: stereo MP3, 48 kHz, 256 kbps, 4.128 seconds including encoder padding.
The phrase has a short fade-in, warm filtering, light reverb and a final fade
from 3.30 to 4.02 seconds. It plays at 0.82 relative gain under the existing
music-volume control. It replaces other music, pauses with the video when
hidden, and stops on ending, Skip, cancellation or decoder failure. Central
Park then selects its own soundtrack. The source movie remains silent and
unchanged in `assets/cutscenes-v119/`.
