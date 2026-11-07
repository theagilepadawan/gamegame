# A little Manhattan

Original SVG illustration for the chapter picker. ViewBox: 860 × 240. It is a
schematic south-to-north journey, with north toward the right, not a street map.
The harbour, Hudson River, East River and district order anchor the geography.

Landmarks: Liberty Island, One World Trade Center, Wall Street's colonnaded
exchange, Brooklyn Bridge, Empire State Building, Chrysler Building, Grand
Central Terminal, Central Park's lake, Bow Bridge and Belvedere Castle.

The SVG is stationary. The live route and accessible chapter buttons are in
index.html; both use the existing three destination coordinates. The approved
runner strips are unchanged. scripts/chapter-menu.js owns finite travel motion;
reduced motion settles directly at the chosen destination.

No fonts, linked images, filters, external libraries or continuous artwork
animations are required. build.mjs embeds the SVG in the standalone HTML.
