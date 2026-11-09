# Central Park reaction cue

The user supplied `3.mp3` for Nicolai's reaction to Grete moving the meeting to
Central Park. `central-park-alert-native.mp3` preserves that upload byte for
byte. Its encoded duration is 2.011429 seconds. The runtime file removes only
the initial 0.400 seconds of digital silence, using FFmpeg `atrim=start=0.4`
and `asetpts=PTS-STARTPTS`, encoded as 256 kbps MP3 / 44.1 kHz / stereo. Runtime
encoded duration is 1.619592 seconds. Pitch, speed and musical content are kept.

The gold-and-ivory vector exclamation appears above Nicolai 850 ms into the
first Grete line, timed to the audible cue. A quick Continue triggers the cue
immediately. It plays once per call, through the existing effects mixer and
mute/volume controls, briefly ducking the title music. The 1700 ms visual has a
190 ms entrance and a restrained fade; reduced motion removes its movement.

Skip/cancel stops the cue. Hidden tabs pause the visual and audio together,
then resume the same position. The approved portrait art and six dialogue
lines are unchanged. `provenance.json` records processing and both file hashes.
