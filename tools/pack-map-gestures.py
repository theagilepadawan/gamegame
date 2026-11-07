"""Register generated menu keyframes to the approved native map strips.

This is sprite-sheet packing only: uniform scale, transparent cell padding and
foot registration. The source artwork, faces and body parts are not retouched.
Run manually with Pillow; a normal game build uses the checked-in WebP strips.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
folder = root / "assets/map-gestures-v117"
source = Image.open(folder / "atlas-native.png").convert("RGBA")
assert source.size == (1536, 1024)

for row, name in enumerate(("nicolai", "trond")):
    # Every cell in a row shares the same scale and origin. Do not independently
    # center frame bounds: moving the arm must never shift the whole character.
    top, bottom = ((12, 479), (11, 489))[row]
    scale = 402 / (bottom - top)
    width, height = round(384 * scale), round(512 * scale)
    left, y = round(192 - 192 * scale), round(413 - bottom * scale)
    strip = Image.new("RGBA", (384 * 3, 420))
    for column in range(3):
        cell = source.crop((384 * column, 512 * row, 384 * (column + 1), 512 * (row + 1)))
        cell = cell.resize((width, height), Image.Resampling.LANCZOS)
        strip.alpha_composite(cell, (384 * column + left, y))
    # Discard only invisible RGB; alpha and every visible pixel are retained.
    strip.putdata([(r, g, b, a) if a else (0, 0, 0, 0) for r, g, b, a in strip.getdata()])
    strip.save(folder / f"{name}.webp", lossless=True, method=6)
    print(name, strip.size, (folder / f"{name}.webp").stat().st_size)
