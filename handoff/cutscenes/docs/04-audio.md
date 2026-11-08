# Sound and edit notes

The audio sources are stored byte for byte in `game/assets/` and linked from `references/audio/INDEX.md`, without duplicate MP3 copies. The following durations were measured with `ffprobe`; they are source-file durations, not proposed cutscene edit lengths.

| Track reference (audio index) | Runtime source | Duration | Channels / rate | Current role |
|---|---|---:|---|---|
| `01-opening-theme.mp3` | `game/assets/original-37.mp3` | 156.360 s | Stereo / 48 kHz | Opening/main music |
| `02-midtown-theme.mp3` | `game/assets/original-19.mp3` | 169.200 s | Stereo / 48 kHz | Midtown chapter music |
| `03-central-park-theme.mp3` | `game/assets/original-20.mp3` | 162.720 s | Stereo / 48 kHz | Central Park chapter music |
| `04-nicolai-laugh.mp3` | `game/assets/original-38.mp3` | 1.176 s | Mono / 48 kHz | User-supplied Nicolai laugh |
| `05-contrarian-pixel-adventure.mp3` | `game/assets/original-39.mp3` | 64.848 s | Stereo / 48 kHz | Exclusive Contrarian event music |
| `06-title-mellow-lounge.mp3` | `game/assets/audio/title-mellow-lounge.mp3` | 72.912 s | Stereo / 48 kHz | Title screen: Why talking to people is a superpower x Mellow Lounge |

The main soundtrack is displayed as **Downtown Good Company**, with the original composer credit **radicalTomography** retained (source recording: **Extended 16-Bit Bitcrushed**). The Contrarian display title is **Good ol’ Company** (source recording: **Pixel Adventure**). The user earlier supplied a legacy In Good Company tune, but the latest game uses the files above. A separate clean legacy recording is not included in this handoff; do not substitute an assumed version.

## Recommended treatment

Keep cinematic sound sparse: a restrained city/lake bed, one or two clear physical sounds and a musical phrase from the correct chapter. Do not compose a second busy soundtrack on top of gameplay music. The laugh is a real short recording; use its existing timing and character rather than synthesizing dialogue or stretching it into a different performance.

| Scene | Suggested sound |
|---|---|
| LR-OP-01 | Quiet city ambience, cuff/footstep detail, a short phrase of the opening theme. |
| LR-MT-01 | Soft street/leaf movement with a clean handoff into Midtown music. |
| LR-SH-01 | Sparse box/lace/footstep detail if that staging is chosen; hand off from Midtown to Park music once. No invented spoken greeting. |
| LR-PK-01 | Light water and leaves; Park music enters gently. |
| LR-OF-01 | Subtle lobby/door ambience; a warm wordless greeting requires no invented voice. |
| LR-CT-01 | Optional supplied laugh plus the entrance of Pixel Adventure. Ordinary chapter music stops. |
| LR-IP-01 | A small indicator sound and controlled jetpack thrust; leave space for the boss's playable cues. |

Edit on a meaningful musical boundary after listening to the actual source. Do not choose an arbitrary timestamp from the filename or this brief. Export clean video, a review mix and separate music/SFX/voice stems so the game can honor the player's volume and mute settings.

For production delivery, 48 kHz WAV stems are a practical default. A review mix around −16 LUFS integrated with true peaks at or below −1 dBTP is a starting target, not a reason to overcompress a very short quiet scene. Compare perceived volume with the game at its default 72% music / 75% effects settings. Preserve headroom for UI and transition sounds.

## Runtime behavior to preserve

`game/scripts/engine.js` contains audio manager class `ko`, instantiated as `SA`. `scripts/chapter-progression.js` selects each chapter's main track. `SA.startMusic('contrarian')` pauses the ordinary track and gives the event exclusive ownership. `SA.endMusic(...)` returns control afterward. `SA.pause()` pauses music and stops active short clips.

The eventual cutscene player needs one explicit audio owner. Snapshot the active music choice and playback position before taking over, stop overlapping playback, and restore the intended track only once after completion or Skip. Honor the existing mute and volume settings. Test user-gesture playback restrictions on real mobile browsers; a rejected `video.play()` promise must lead to a usable poster/Continue path, not a stuck screen.

Keep captions and audio cues in an editable cue sheet. Do not attribute newly written lines to real colleagues. If the user supplies additional recorded lines, retain their original meaning and document the source file and selected time range.


## Confirmed display titles (version 1.14)

Use the names supplied by the user, without replacing the recordings:
- Midtown: **Good Company Never Dies** (original-19.mp3).
- Central Park: **Diversified Ballad** (original-20.mp3).
- Contrarian: **Good ol’ Company** (original-39.mp3, the Pixel Adventure source recording).
- Opening Bell/Endless: **Downtown Good Company**, radicalTomography (original source: Extended 16-Bit Bitcrushed).

The compact in-game now-playing label appears for five seconds on an audible
title/run/results page or soundtrack change. The title-screen song is displayed
as **Why talking to people is a superpower x Mellow Lounge** (version 1.17),
with the full name wrapping on phones. The title recording loops at 0.72 gain
relative to the chapter music and enters over 500 ms. It stops before a run;
the normal chapter and exclusive Contrarian soundtrack logic still applies.

## Title send-off cue (version 1.18)

The user plans to supply a short voice clip for the title character's launch
gesture. No such clip has been added yet. `longrun:launch-cue` dispatches
`{runner, duration:2000}` on confirmation. Add the eventual recording through the
existing mixer, preserving mute, cancellation and exclusive scene playback.
The title song continues during the gesture and switches when the chapter starts.
