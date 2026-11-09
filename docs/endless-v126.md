# Endless challenge rhythm and entrance depth — version 1.26

Nicolai's existing rear-view entrance stays opaque through the run and turn.
Once he is inside the subway or 505, opacity gently decreases to 76% as he
recedes. The contact shadow follows the same attenuation. Native keyframes,
foot placement, perspective and foreground door occlusion remain intact.

Endless starts at 340 world pixels/second and adds 3 pixels/second each second:
520 after one minute, 700 after two, 880 after three. Acceleration does not taper
or reach a ceiling. The IPO arena still pauses street progress and resumes at
the same street speed. Story speed and physics are unchanged.

The seeded director now has eighteen section families. Four new families mix
mandatory slide passages, hurdles, varied gaps and landing/recovery windows:
Duck the Guidance, Hurdle Rates, Cross Examination, and Hold & Release.
They unlock gradually from 12–45 seconds; seeded ordering, timing and widths
vary. A challenge is scheduled roughly every three to five sections, while
ordinary terrain, alternate platforms, springs and optional events continue.

The slide passages are solid overhanging market terminals. Their brass lower
edge follows the actual terrain with a 96-pixel clearance. Standing and jumping
collide with the visible structure; sliding clears it. Native painted plaques
keep their aspect ratio. Overlapping platforms and hazards are excluded from
these passages. The vector housing stays crisp at the canvas resolution.

The pace clock and its inverse use the same constant-acceleration formula.
Generation lookahead grows with speed; section layout is independent of display
width, rewards and frame timing. As requested, uncapped acceleration eventually
shortens the visible reaction window. This is intentional Endless difficulty;
there is no camera zoom or added camera movement to compensate.
