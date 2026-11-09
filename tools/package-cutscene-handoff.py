#!/usr/bin/env python3
"""Build the cutscene-agent handoff from the current, tested game source.

Requires Node.js 20+, Python 3 and Pillow. Run npm run build / npm test first.
This exports unaltered source art and extracts native atlas cells; it does not
generate art. A verified source-only fallback preserves native assets when
duplicating the compiled HTML would exceed the archive size limit.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import hashlib
import importlib.util
import json
import re
import shutil
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / 'review' / 'cutscene-handoff' / 'The-Long-Run-Cutscene-Handoff'
OUT = ROOT / 'release' / 'The-Long-Run-Cutscene-Handoff.zip'
MAX_ARCHIVE_BYTES = 100 * 1024 * 1024


def sha(path):
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def copy(src, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)


def verify_source_rebuild(game, playable):
    spec = importlib.util.spec_from_file_location('nbim_game_package', ROOT / 'tools' / 'package-game.py')
    helpers = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(helpers)
    inputs = helpers.source_input_manifest(game)
    assert inputs == helpers.source_input_manifest(ROOT), 'Packaged build inputs differ from the current source'
    with tempfile.TemporaryDirectory(prefix='nbim-handoff-rebuild-', dir=ROOT / 'review') as temporary:
        rebuilt = Path(temporary) / playable.name
        subprocess.run(['node', str(game / 'build.mjs'), str(rebuilt)], cwd=game,
                       check=True, capture_output=True, text=True)
        assert rebuilt.stat().st_size == playable.stat().st_size and sha(rebuilt) == sha(playable), \
            'Packaged editable source does not reproduce the current standalone HTML'
    return {'verified': True, 'command': ['node', 'build.mjs', '<standalone-output>'],
            'bytes': playable.stat().st_size, 'sha256': sha(playable),
            'inputManifestSha256': helpers.input_manifest_digest(inputs), 'inputs': inputs}


def write_metadata_and_manifest(stage, metadata):
    (stage / 'HANDOFF-METADATA.json').write_text(json.dumps(metadata, indent=2) + '\n')
    manifest = [{'path': str(path.relative_to(stage)), 'bytes': path.stat().st_size, 'sha256': sha(path)}
                for path in sorted(stage.rglob('*')) if path.is_file() and path != stage / 'FILES-SHA256.json']
    (stage / 'FILES-SHA256.json').write_text(json.dumps(manifest, indent=2) + '\n')
    return manifest


def write_archive(stage, output):
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in sorted(stage.rglob('*')):
            if not path.is_file():
                continue
            entry = zipfile.ZipInfo(str(path.relative_to(stage.parent)), date_time=(2026, 11, 6, 0, 0, 0))
            entry.create_system = 3
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, path.read_bytes(), compresslevel=9)


def source_only_instructions(metadata):
    expected = metadata['expectedStandalone']
    return f'''# Build and play this complete source handoff

This ZIP contains all editable source, native artwork, tests, audio and production
references. The duplicate compiled HTML was omitted to keep the archive below
100 MiB while retaining the full native asset quality. The separately delivered
`The-Long-Run-NBIM.zip` contains the ready-to-play HTML.

## Recreate the exact standalone game

Install Node.js 20 or newer if needed. No npm install or network access is needed
for this build. From the handoff's `game/` directory, run:

```sh
node build.mjs ../playable/{expected['filename']}
```

The packaging process ran this build from the staged source and verified its
output against the current release. Expected output:

- Version: `{metadata['gameVersion']}`
- File: `{expected['filename']}`
- Bytes: `{expected['bytes']}`
- SHA-256: `{expected['sha256']}`

The same hash is recorded in `EXPECTED-STANDALONE-SHA256.txt`. After building,
run `shasum -a 256 -c EXPECTED-STANDALONE-SHA256.txt` from `playable/`, or compare
the output of PowerShell `Get-FileHash -Algorithm SHA256` with the hash above.

Open the generated HTML in a current browser. To play directly from the editable
source instead, run `node serve.mjs` inside `game/` and open the printed local URL.
Browser tests use Playwright and require the separate test dependency setup;
playing or building the game does not.

`HANDOFF-METADATA.json` records `playableIncluded: false`, the verified rebuild
and every build-input hash. `FILES-SHA256.json` covers all files in this ZIP.
'''


def finalize_handoff(stage, output, metadata, max_archive_bytes=MAX_ARCHIVE_BYTES):
    proof = metadata.get('sourceRebuild', {})
    assert proof.get('verified') is True and proof.get('sha256') == metadata['playableSha256'], \
        'Verify the staged-source rebuild before packaging a handoff'
    output.parent.mkdir(exist_ok=True)
    temporary = output.with_suffix('.zip.tmp')
    try:
        manifest = write_metadata_and_manifest(stage, metadata)
        write_archive(stage, temporary)
        full_archive_bytes = temporary.stat().st_size
        if full_archive_bytes >= max_archive_bytes:
            expected = metadata['expectedStandalone']
            (stage / 'playable' / expected['filename']).unlink()
            metadata['playableIncluded'] = False
            metadata['archiveMode'] = 'source-only'
            metadata['included'] = [item for item in metadata['included'] if item != 'Self-contained playable HTML']
            metadata['included'].append('Verified source build reproducing the standalone HTML byte for byte')
            metadata['notIncluded'].append('Duplicate compiled HTML; recreate it with playable/BUILD-AND-PLAY.md or use the separate playable ZIP')
            (stage / 'playable' / 'BUILD-AND-PLAY.md').write_text(source_only_instructions(metadata))
            (stage / 'playable' / 'EXPECTED-STANDALONE-SHA256.txt').write_text(
                f"{expected['sha256']}  {expected['filename']}\n")
            manifest = write_metadata_and_manifest(stage, metadata)
            write_archive(stage, temporary)
        assert temporary.stat().st_size < max_archive_bytes, \
            'Complete source handoff exceeds the archive cap; retain native assets and review redundant reference copies'
        with zipfile.ZipFile(temporary) as archive:
            assert archive.testzip() is None
            for item in manifest:
                data = archive.read(stage.name + '/' + item['path'])
                assert len(data) == item['bytes'] and hashlib.sha256(data).hexdigest() == item['sha256'], item['path']
        temporary.replace(output)
        return {'archive': str(output), 'bytes': output.stat().st_size, 'sha256': sha(output),
                'files': len(manifest) + 1, 'folder': str(stage),
                'playableIncluded': metadata['playableIncluded'], 'fullArchiveBytes': full_archive_bytes,
                'sourceRebuildVerified': True, 'standaloneSha256': metadata['playableSha256']}
    finally:
        temporary.unlink(missing_ok=True)


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
copy(ROOT / 'tools' / 'package-game.py', game / 'tools' / 'package-game.py')
copy(ROOT / 'tools' / 'render-gift-cue.py', game / 'tools' / 'render-gift-cue.py')

# Keep all forty baseline files for hash tests, plus current runtime art only.
# The rejected alternate Park and discarded sprite experiments are not shipped.
active_scripts = [ROOT / path for path in re.findall(
    r'<script\b[^>]*\bsrc="(scripts/[^"]+)"', (ROOT / 'index.html').read_text())]
active_styles = [ROOT / path for path in re.findall(
    r'<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"', (ROOT / 'index.html').read_text())]
for style in active_styles:
    copy(style, game / style.relative_to(ROOT))
source_text = '\n'.join(p.read_text() for p in [ROOT / 'index.html', *active_styles, *active_scripts])
runtime_used = set(re.findall(r'assets/[A-Za-z0-9_./-]+\.(?:webp|png|svg|avif|mp3|m4a|mp4|webm|woff2?)', source_text))
used = runtime_used.copy()
baseline = json.loads((ROOT / 'assets-manifest.json').read_text())
used.update(a['path'] for a in baseline)
for relative in sorted(used):
    copy(ROOT / relative, game / relative)
# Package metadata only for active runtime directories. This naturally excludes
# retired city-block, venue-island and prop variants as art direction evolves.
active_folders = sorted({Path(relative).parent for relative in runtime_used if Path(relative).parent != Path('assets')})
for relative_folder in active_folders:
    folder_root = ROOT / relative_folder
    for p in folder_root.glob('*.json'):
        data = json.loads(p.read_text())
        if isinstance(data, dict):
            if data.get('asset') and data['asset'] not in runtime_used:
                continue
            for field in ['files', 'assets']:
                rows = data.get(field)
                # Only trim manifests whose entries explicitly name runtime
                # asset paths. Artist provenance may instead use filenames or
                # source-image records; retain that metadata without guessing.
                if isinstance(rows, list) and rows and all(
                    isinstance(item, dict) and isinstance(item.get('path'), str)
                    and item['path'].startswith('assets/') for item in rows
                ):
                    data[field] = [item for item in rows if item['path'] in runtime_used
                                   or item['path'].endswith(('-native.png', '-native.mp4', '-native.mp3'))]
            if any(isinstance(data.get(field), list) and not data[field] for field in ['files', 'assets']):
                continue
        target = game / relative_folder / p.name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(data, indent=2) + '\n')
    # Native atlas accompanies extracted runtime cells for art production. It is
    # source material, not another runtime asset or a claim of higher resolution.
    for native in [*folder_root.glob('*-native.png'), *folder_root.glob('*-native.mp4'), *folder_root.glob('*-native.mp3')]:
        copy(native, game / relative_folder / native.name)
    # The chapter-map strips have native crop/frame registration notes. Keep
    # the active asset's authoring notes with its bytes for the next agent.
    notes = folder_root / 'README.md'
    if notes.is_file():
        copy(notes, game / relative_folder / notes.name)

playable = ROOT / 'release' / 'The-Long-Run-NBIM.html'
assert playable.is_file(), 'Build the release HTML first'
source_rebuild = verify_source_rebuild(game, playable)
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

# Native city tiles already live in game/assets. Index those exact files rather
# than duplicating the much larger location set or reducing its pixel density.
location_sources = {
    'assets/original-33.webp': 'Central Park — approved Bow Bridge',
    'assets/scenery/park-1.webp': 'Central Park — approved Ramble',
    'assets/scenery/park-2.webp': 'Central Park — approved Bethesda',
}
location_labels = {
    'lower-manhattan.webp': 'Downtown — original warm composition with corrected skyline',
    'opening-west.webp': 'Downtown — original Tribeca approach',
    'opening-bridge.webp': 'Downtown — original painted bridge and promenade',
    'opening-2.webp': 'Downtown — Seaport street hosting Kabin',
    'opening-3.webp': 'Downtown — Battery street hosting LEI',
    'opening-battery-loop.webp': 'Downtown — anonymous Endless continuation',
    'downtown-01.webp': 'Downtown — One World Trade Center',
    'downtown-02.webp': 'Downtown — Wall Street',
    'downtown-03.webp': 'Downtown — bounded harbor and Brooklyn Bridge',
    'downtown-05.webp': 'Downtown — Kabin',
    'downtown-11.webp': 'Downtown — LEI',
    'midtown-01.webp': 'Midtown — Chrysler Building',
    'midtown-02.webp': 'Midtown — Empire State Building',
    'midtown-03.webp': 'Midtown — Bryant Park / library',
    'midtown-05.webp': 'Midtown — JOJU',
    'midtown-08.webp': "Midtown — Omar's",
    'midtown-11.webp': "Midtown — Uncle Gussy's",
    'midtown-14.webp': 'Midtown — complete 505 Fifth glass entrance',
    'skyline.webp': 'Midtown — original golden skyline, lossless master',
    'restaurant-street.webp': 'Midtown — warm ordinary restaurant street',
    'bryant-park.webp': 'Midtown — original Bryant Park and library, lossless master',
    'fifth-avenue.webp': 'Midtown — original glass-office street, lossless master',
    'dry-city-atmosphere.webp': 'Midtown — archived separate skyline atmosphere',
    'landmark-panorama.webp': 'Midtown — unique Empire State / Chrysler vista',
    'glass-canyon.webp': 'Midtown — archived glass-office frontage',
    'library-frontage.webp': 'Midtown — archived library frontage',
    'city-plane-tree.webp': 'Midtown — native street-tree transition',
    'stone-foundation.webp': 'City terrain — current native stone foundation',
}
for relative in sorted(runtime_used):
    if relative.startswith(('assets/art-v2/', 'assets/midtown-v15/', 'assets/midtown-v16/', 'assets/venue-details-v111/', 'assets/downtown-v112/', 'assets/midtown-v113/', 'assets/scenery/opening-')):
        location_sources[relative] = location_labels.get(Path(relative).name, Path(relative).stem)
assert any(path.startswith('assets/venue-details-v111/') for path in location_sources), 'Current venue detail art is not referenced by the runtime'
locations = refs / 'locations'
locations.mkdir(parents=True, exist_ok=True)
location_manifest = []
location_index = [
    '# Native location references', '',
    'Open these exact files in the editable game tree. Each native image is stored once; no reduced substitute is used here.', '',
    'The runtime manifests and storefront metadata define course order, alignment and venue spacing. Gameplay captures show their final composition.', '',
    'Downtown uses the complete warm paintings and camera from the actual supplied HTML; its former global river/cutout composition is removed. Midtown restores its original complete warm paintings with fixed vertical framing. Five native venue-detail crops belong inside their street façades with no independent camera. The full 505 office and host belong exclusively to the foreground finish.', '',
    '| Location | Native pixels | Source |', '|---|---:|---|',
]
for relative, label in location_sources.items():
    assert relative in used, f'Location source is missing from the packaged game: {relative}'
    with Image.open(ROOT / relative) as source:
        width, height = source.size
    item = {'label': label, 'path': 'game/' + relative, 'nativeWidth': width,
            'nativeHeight': height, 'sha256': sha(ROOT / relative),
            'role': 'Exact native production image; linked from the index, not resized or duplicated'}
    location_manifest.append(item)
    location_index.append(f'| {label} | {width}×{height} | [{Path(relative).name}](../../game/{relative}) |')
(locations / 'INDEX.md').write_text('\n'.join(location_index) + '\n')
(locations / 'location-manifest.json').write_text(json.dumps(location_manifest, indent=2) + '\n')
if (ROOT / 'assets' / 'office-host-v14').exists():
    shutil.copytree(ROOT / 'assets' / 'office-host-v14', refs / 'office-host')
host_master = Path('/workspace/generated_images/exec-d6fba899-76fc-43ae-86e9-cdc4f41b5e25.png')
if host_master.exists():
    copy(host_master, refs / 'office-host' / 'host-native-source.png')

# Use current Downtown/Midtown release captures. Park retains its unchanged art.
# All required files must exist; do not silently substitute a previous city view.
captures = {
    'downtown-gameplay.png': 'release/Opening-v124-obstacles.png',
    'central-park-gameplay.png': 'release/Park-v124-obstacles.png',
    'midtown-gameplay.png': 'release/Midtown-v124-obstacles.png',
    'opening-call.png': 'release/Opening-v125-comms.png',
    'opening-call-nicolai.png': 'release/Opening-v125-translation.png',
    'opening-gdl-connection.png': 'release/Opening-v125-gdl.png',
    'endless-ipo-encounter.png': 'release/Endless-v125-ipo.png',
    'midtown-gift-film.png': 'release/Midtown-v120-gift.png',
    'finance-guidance-gameplay.png': 'release/Props-v124-collection.png',
    'chapter-map-and-title-sendoff.png': 'release/Nicolai-v123-title-sendoff.png',
    'opening-finish-entrance.png': 'release/Opening-v122-boarding.png',
    'park-ledge-challenge.png': 'release/Park-v124-ledge.png',
    'midtown-route-challenge.png': 'release/Midtown-v124-route.png',
    'midtown-finish-entrance.png': 'release/Midtown-v122-entrance.png',
    'park-finish-entrance.png': 'release/Park-v118-entrance.png',
    'midtown-finish-mobile.png': 'release/Midtown-v122-mobile-entrance.png',
}
stage_notes = list(STAGE.glob('*.md')) + list(STAGE.glob('*.json')) + list((STAGE / 'docs').glob('*.md'))
for name, relative in captures.items():
    p = ROOT / relative
    assert p.is_file(), f'Missing current release capture: {relative}'
    if p.suffix.lower() == '.png':
        # Lossless reference encoding saves archive space, with no reduction
        # in pixel dimensions or decoded quality. Native game masters stay intact.
        target = refs / 'gameplay' / Path(name).with_suffix('.webp')
        target.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(p) as source:
            source.save(target, 'WEBP', lossless=True, exact=True, method=6)
            with Image.open(target) as encoded:
                assert source.size == encoded.size
                assert source.convert('RGBA').tobytes() == encoded.convert('RGBA').tobytes()
        # Keep the shipped reference links in step with the lossless encoding.
        for note in stage_notes:
            contents = note.read_text()
            updated = contents.replace(name, target.name)
            if updated != contents:
                note.write_text(updated)
    else:
        copy(p, refs / 'gameplay' / name)

# Optional recordings duplicate animations already available in the complete
# source. Link their immutable release bytes, preserving all native art and
# the actual in-game film inside this archive instead of reducing either.
motion_revision = '99df76e9292e7d04f571f5da957101b55d48ce14'
motion_notes = ['# Optional motion recordings', '',
    'The complete animations, native keyframes and renderer are included in game/.',
    'These two earlier reference recordings are linked separately to keep the source handoff below 100 MiB.',
    'The supplied in-game gift film and its native source remain inside this ZIP.', '',
    '| Recording | Bytes | SHA-256 |', '|---|---:|---|']
for name in ['Nicolai-v121-boarding.mp4', 'Nicolai-v122-office-entry.mp4']:
    p = ROOT / 'release' / name
    assert p.is_file(), f'Missing motion reference: {name}'
    url = f'https://github.com/theagilepadawan/gamegame/raw/{motion_revision}/release/{name}'
    motion_notes.append(f'| [{name}]({url}) | {p.stat().st_size} | `{sha(p)}` |')
(refs / 'gameplay' / 'MOTION-REFERENCES.md').write_text('\n'.join(motion_notes) + '\n')

audio = {
    '01-opening-theme.mp3': 'original-37.mp3',
    '06-title-mellow-lounge.mp3': 'audio/title-mellow-lounge.mp3',
    '07-gift-piano.mp3': 'cutscenes-v120/a-change-of-pace.mp3',
    '08-central-park-alert.mp3': 'story-v121/central-park-alert.mp3',
    '09-gdl-ring.mp3': 'briefing-v125/gdl-ring.mp3',
    '02-midtown-theme.mp3': 'original-19.mp3',
    '03-central-park-theme.mp3': 'original-20.mp3',
    '04-nicolai-laugh.mp3': 'original-38.mp3',
    '05-contrarian-pixel-adventure.mp3': 'original-39.mp3',
}
audio_index = ['# Native audio sources', '',
    'Each original is stored once in game/assets, byte-for-byte. Open the linked source; no recompression or removal.', '',
    '| Track reference | Source | SHA-256 |', '|---|---|---|']
for name, original in audio.items():
    original_path = ROOT / 'assets' / original
    audio_index.append(f'| {name} | [{original}](../../game/assets/{original}) | `{sha(original_path)}` |')
(refs / 'audio').mkdir(parents=True, exist_ok=True)
(refs / 'audio' / 'INDEX.md').write_text('\n'.join(audio_index) + '\n')

(refs / 'extraction-manifest.json').write_text(json.dumps(frames, indent=2) + '\n')
metadata = {
    'gameVersion': json.loads((ROOT / 'package.json').read_text())['version'],
    'sourceBranch': subprocess.check_output(['git', 'branch', '--show-current'], cwd=ROOT, text=True).strip(),
    'repository': 'https://github.com/theagilepadawan/gamegame',
    'sourceSnapshot': 'The exact packaged game/ tree; individual file hashes in FILES-SHA256.json',
    'playableSha256': sha(playable),
    'playableIncluded': True,
    'archiveMode': 'source-and-playable',
    'expectedStandalone': {'filename': playable.name, 'bytes': playable.stat().st_size, 'sha256': sha(playable)},
    'sourceRebuild': source_rebuild,
    'runtimeAssetCount': len(runtime_used),
    'packagedAssetCountIncludingBaseline': len(used),
    'included': ['Current editable game source', 'Self-contained playable HTML', 'Native production sprites, detailed city tiles and current prop atlas',
                 'Restored warm Midtown lossless paintings, native finance-obstacle atlas, stone material, chapter-map runner strips and authoring notes',
                 'Location index linking to exact native game assets without duplicate city-art copies',
                 'Nine runtime audio sources, including the mixed GDL ring, plus untouched supplied ring recordings, indexed without duplicate files',
                 'User-supplied cropped Midtown gift MP4 plus unmodified native source and provenance',
                 'Grete/Nicolai opening call and reaction, native portrait and rear-view boarding atlases, and the 6-train portal',
                 'Lossless WebP gameplay references, decoded-pixel checked against the original captures',
                 'Cutscene production brief, shot slate, prompts and integration notes'],
    'notIncluded': ['No separate intro-reference video supplied yet', 'No Runway credentials or plugin installation',
                    'Two optional earlier animation recordings are linked with hashes in references/gameplay/MOTION-REFERENCES.md; their native keyframes and full implementation are included',
                    'Original inline office/host reference photographs were not exposed as downloadable local files',
                    'No rejected cartoon runner study, alternate Park artwork, retired city-block/venue-island art, low-detail v1.8 city sheets or superseded prop variants'],
}
print(json.dumps(finalize_handoff(STAGE, OUT, metadata), indent=2))
