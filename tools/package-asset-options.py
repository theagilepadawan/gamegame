#!/usr/bin/env python3
"""Package the separate, unselected art directions. No runtime art is changed."""
from pathlib import Path
import hashlib,json,zipfile
root=Path(__file__).resolve().parents[1]
folder=root/'asset-options'
readme='''THE LONG RUN — ASSET CHOICES

Open index.html in your browser. It works offline.
A is the actual older artwork. B–E are new alternatives.
Choose one city direction and one park direction, or describe a mix.
Use Copy my choices and paste the result into the chat; selections do not
change the playable game. All proposed art is outside the runtime.

The PNG contact sheets show the same comparison without opening a webpage.
Native PNG atlases and lossless sprite crops are in art/. These are proposals,
not final collision registrations; the gameplay previews illustrate scale.
Only benches and branches are proposed for Park. Its scenery is untouched.
'''
(folder/'READ-ME.txt').write_text(readme)
files=[p for p in sorted(folder.rglob('*')) if p.is_file()]
archive=root/'release/The-Long-Run-Asset-Choices.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in files:
  entry=zipfile.ZipInfo('The-Long-Run-Asset-Choices/'+p.relative_to(folder).as_posix(),date_time=(2020,1,1,0,0,0));entry.compress_type=zipfile.ZIP_DEFLATED;entry.external_attr=0o100644<<16;z.writestr(entry,p.read_bytes())
 for name in ['City-Asset-Choices.png','Park-Asset-Choices.png']:
  entry=zipfile.ZipInfo('The-Long-Run-Asset-Choices/'+name,date_time=(2020,1,1,0,0,0));entry.compress_type=zipfile.ZIP_DEFLATED;entry.external_attr=0o100644<<16;z.writestr(entry,(root/'release'/name).read_bytes())
with zipfile.ZipFile(archive) as z:assert z.testzip() is None
print(json.dumps({'file':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest()}))
