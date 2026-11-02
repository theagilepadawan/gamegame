#!/usr/bin/env python3
"""Build the cutscene-agent handoff from the current, tested game source.

Requires Python 3 and Pillow. Run npm run build / npm test first. This exports
unaltered source art and extracts native atlas cells; it does not generate art.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import hashlib
import json
import re
import shutil
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / 'review' / 'cutscene-handoff' / 'The-Long-Run-Cutscene-Handoff'
OUT = ROOT / 'release' / 'The-Long-Run-Cutscene-Handoff.zip'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def copy(src, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)


if STAGE.exists():
    shutil.rmtree(STAGE)
STAGE.mkdir(parents=True)
docs = ROOT / 'handoff' / 'cutscenes'
assert (docs / 'START-HERE.md').is_file(), 'Handoff documentation is incomplete'
verification = (ROOT / 'docs' / 'verification.md').read_text()
version_tag = '.'.join(json.loads((ROOT / 'package.json').read_text())['version'].split('.')[:2])
assert version_tag in verification.splitlines()[0], 'Update the release verification before packaging'
shutil.copytree(docs, STAGE, dirs_exist_ok=True)

game = STAGE / 'game'
for name in ['index.html', 'game.css', 'build.mjs', 'serve.mjs', 'package.json',
             'package-lock.json', 'assets-manifest.json', 'BASELINE.json', 'README.md', '.gitignore']:
    copy(ROOT / name, game / name)
for name in ['scripts', 'tests', 'docs']:
    shutil.copytree(ROOT / name, game / name)

# Keep all forty baseline files for hash tests, plus current runtime art only.
# The rejected alternate Park and discarded sprite experiments are not shipped.
source_text = '\n'.join(p.read_text() for p in [ROOT / 'index.html', ROOT / 'game.css', *sorted((ROOT / 'scripts').glob('*.js'))])
runtime_used = set(re.findall(r'assets/[A-Za-z0-9_./-]+\.(?:webp|png|svg|avif|mp3|m4a|webm|woff2?)', source_text))
used = runtime_used.copy()
baseline = json.loads((ROOT / 'assets-manifest.json').read_text())
used.update(a['path'] for a in baseline)
for relative in sorted(used):
    copy(ROOT / relative, game / relative)
native_manifest = json.loads((ROOT / 'assets/art-v2/native-manifest.json').read_text())
native_manifest['files'] = [item for item in native_manifest['files'] if item['path'] in used]
native_manifest['handoffScope'] = 'Only current runtime city art is included; the rejected v1.3 Park rows are omitted.'
(game / 'assets/art-v2/native-manifest.json').write_text(json.dumps(native_manifest, indent=2) + '\n')
for folder in ['props-v14', 'office-host-v14']:
    if (ROOT / 'assets' / folder).exists():
        for p in (ROOT / 'assets' / folder).glob('*.json'):
            copy(p, game / 'assets' / folder / p.name)
if (ROOT / 'art' / 'props-v14' / 'generated-atlas-native.png').exists():
    copy(ROOT / 'art' / 'props-v14' / 'generated-atlas-native.png',
         game / 'art' / 'props-v14' / 'generated-atlas-native.png')

playable = ROOT / 'release' / 'The-Long-Run-NBIM.html'
assert playable.is_file(), 'Build the release HTML first'
copy(playable, STAGE / 'playable' / playable.name)

refs = STAGE / 'references'
frames = []


def extract(actor, asset, frame, name, cell=(512, 512), columns=4):
    source = ROOT / 'assets' / asset
    image = Image.open(source).convert('RGBA')
    x, y = frame % columns * cell[0], frame // columns * cell[1]
    tile = image.crop((x, y, x + cell[0], y + cell[1]))
    relative = f'characters/{actor}-{name}.png'
    target = refs / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    tile.save(target)
    frames.append({'path': 'references/' + relative, 'source': 'game/assets/' + asset,
                   'sourceSha256': sha(source), 'cell': [x, y, *cell],
                   'role': 'Exact native production sprite cell; no repainting or enlargement'})


for actor, atlas in [('nicolai', 'original-27.webp'), ('trond', 'original-29.webp')]:
    for frame, name in [(0, 'run'), (6, 'idle'), (8, 'jump')]:
        extract(actor, atlas, frame, name)
extract('nicolai', 'original-27.webp', 10, 'slide')
extract('nicolai', 'original-28.webp', 2, 'somersault')
extract('trond', 'original-31.webp', 1, 'bellyslide', (640, 512))
extract('trond', 'original-31.webp', 4, 'ball', (640, 512))

board = Image.new('RGB', (1440, 800), '#102039')
draw = ImageDraw.Draw(board)
draw.text((24, 16), 'PRODUCTION SPRITES — extracted unchanged from the game atlases', fill='#f5f2eb')
for i, item in enumerate(frames):
    tile = Image.open(STAGE / item['path']).convert('RGBA')
    # Contact-sheet thumbnails only. Original-size cells accompany this sheet.
    tile.thumbnail((260, 325), Image.Resampling.LANCZOS)
    col, row = i % 5, i // 5
    x, y = col * 288 + (288 - tile.width) // 2, 55 + row * 370
    board.paste(tile, (x, y), tile)
    draw.text((col * 288 + 16, y + 330), Path(item['path']).stem, fill='#c3e9ee')
board.save(refs / 'production-character-board.jpg', quality=94)

aliases = {
    'central-park-approved-bow-bridge.webp': 'assets/original-33.webp',
    'central-park-approved-ramble.webp': 'assets/scenery/park-1.webp',
    'central-park-approved-bethesda.webp': 'assets/scenery/park-2.webp',
    'downtown-one-world-trade-center.webp': 'assets/art-v2/downtown-wtc.webp',
    'downtown-complete-brooklyn-bridge.webp': 'assets/art-v2/downtown-bridge-wide.webp',
    'downtown-wall-street.webp': 'assets/art-v2/downtown-wallstreet.webp',
    'midtown-505-blue-glass-entrance.webp': 'assets/art-v2/midtown-fifth.webp',
    'midtown-bryant-garden.webp': 'assets/art-v2/midtown-garden.webp',
}
for name, relative in aliases.items():
    copy(ROOT / relative, refs / 'locations' / name)
office_master = Path('/workspace/generated_images/exec-2c3023a6-67fb-460a-9e29-f1555fa8c5d9.png')
if office_master.exists():
    copy(office_master, refs / 'locations' / 'midtown-505-native-source.png')
if (ROOT / 'assets' / 'office-host-v14').exists():
    shutil.copytree(ROOT / 'assets' / 'office-host-v14', refs / 'office-host')
host_master = Path('/workspace/generated_images/exec-d6fba899-76fc-43ae-86e9-cdc4f41b5e25.png')
if host_master.exists():
    copy(host_master, refs / 'office-host' / 'host-native-source.png')

# Reuse evidence from the exact release browser checks, not old version images.
captures = {
    'downtown-gameplay.png': 'review/art-direction/opening-start.png',
    'central-park-gameplay.png': 'review/art-direction/park-start.png',
    'midtown-gameplay.png': 'review/art-direction/midtown-start.png',
    'office-gameplay.png': 'review/office-host-v14/desktop-office.png',
    'downtown-bridge-gameplay.png': 'review/downtown/bridge-readable-1440.png',
}
for name, relative in captures.items():
    p = ROOT / relative
    assert p.is_file(), f'Missing current release capture: {relative}'
    copy(p, refs / 'gameplay' / name)

audio = {
    '01-opening-theme.mp3': 'original-37.mp3',
    '02-midtown-theme.mp3': 'original-19.mp3',
    '03-central-park-theme.mp3': 'original-20.mp3',
    '04-nicolai-laugh.mp3': 'original-38.mp3',
    '05-contrarian-pixel-adventure.mp3': 'original-39.mp3',
}
for name, original in audio.items():
    copy(ROOT / 'assets' / original, refs / 'audio' / name)

(refs / 'extraction-manifest.json').write_text(json.dumps(frames, indent=2) + '\n')
metadata = {
    'gameVersion': json.loads((ROOT / 'package.json').read_text())['version'],
    'sourceBranch': subprocess.check_output(['git', 'branch', '--show-current'], cwd=ROOT, text=True).strip(),
    'repository': 'https://github.com/theagilepadawan/gamegame',
    'sourceSnapshot': 'The exact packaged game/ tree; individual file hashes in FILES-SHA256.json',
    'playableSha256': sha(playable),
    'runtimeAssetCount': len(runtime_used),
    'packagedAssetCountIncludingBaseline': len(used),
    'included': ['Current editable game source', 'Self-contained playable HTML', 'Native production sprites and location art',
                 'Five game audio sources', 'Cutscene production brief, shot slate, prompts and integration notes'],
    'notIncluded': ['No generated cutscene videos', 'No Runway credentials or plugin installation',
                    'Original inline office/host reference photographs were not exposed as downloadable local files',
                    'No rejected cartoon runner study or rejected v1.3 Park artwork'],
}
(STAGE / 'HANDOFF-METADATA.json').write_text(json.dumps(metadata, indent=2) + '\n')
manifest = [{
    'path': str(p.relative_to(STAGE)), 'bytes': p.stat().st_size, 'sha256': sha(p)
} for p in sorted(STAGE.rglob('*')) if p.is_file()]
(STAGE / 'FILES-SHA256.json').write_text(json.dumps(manifest, indent=2) + '\n')

OUT.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for p in sorted(STAGE.rglob('*')):
        if p.is_file():
            name = str(p.relative_to(STAGE.parent))
            entry = zipfile.ZipInfo(name, date_time=(2026, 11, 2, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o644 << 16
            archive.writestr(entry, p.read_bytes(), compresslevel=9)
with zipfile.ZipFile(OUT) as archive:
    assert archive.testzip() is None
    for item in manifest:
        data = archive.read(STAGE.name + '/' + item['path'])
        assert hashlib.sha256(data).hexdigest() == item['sha256'], item['path']
print(json.dumps({'archive': str(OUT), 'bytes': OUT.stat().st_size, 'sha256': sha(OUT),
                  'files': len(manifest) + 1, 'folder': str(STAGE)}, indent=2))
