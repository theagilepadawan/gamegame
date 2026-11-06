# Sound and edit notes

The reference audio is copied byte for byte from the current game. The following durations were measured with `ffprobe`; they are source-file durations, not proposed cutscene edit lengths.

| Handoff reference | Runtime source | Duration | Channels / rate | Current role |
|---|---|---:|---|---|
| `references/audio/01-opening-theme.mp3` | `game/assets/original-37.mp3` | 156.360 s | Stereo / 48 kHz | Opening/main music |
| `references/audio/02-midtown-theme.mp3` | `game/assets/original-19.mp3` | 169.200 s | Stereo / 48 kHz | Midtown chapter music |
| `references/audio/03-central-park-theme.mp3` | `game/assets/original-20.mp3` | 162.720 s | Stereo / 48 kHz | Central Park chapter music |
| `references/audio/04-nicolai-laugh.mp3` | `game/assets/original-38.mp3` | 1.176 s | Mono / 48 kHz | User-supplied Nicolai laugh |
| `references/audio/05-contrarian-pixel-adventure.mp3` | `game/assets/original-39.mp3` | 64.848 s | Stereo / 48 kHz | Exclusive Contrarian event music |

The game credits the main soundtrack as **Extended 16-Bit Bitcrushed — radicalTomography**, and the Contrarian recording as **Pixel Adventure**. The user earlier supplied a legacy In Good Company tune, but the latest game uses the files above. A separate clean legacy recording is not included in this handoff; do not substitute an assumed version.

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
- Opening Bell/Endless: **Extended 16-Bit Bitcrushed**, radicalTomography.

The compact in-game now-playing label appears for five seconds on an audible
run/results page or soundtrack change. Audio settings carry the same titles.
