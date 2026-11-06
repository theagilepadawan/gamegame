#!/usr/bin/env python3
"""Package the built standalone game and refresh checksums for this release.

Run `npm run build` and the applicable browser checks first. This command does
not build or alter the HTML. Run again with --checksums-only after producing
the matching cutscene handoff and previews.
"""
from pathlib import Path
import argparse
import hashlib
import json
import re
import zipfile


ROOT = Path(__file__).resolve().parents[1]
RELEASE = ROOT / "release"
HTML = RELEASE / "The-Long-Run-NBIM.html"
ARCHIVE = RELEASE / "The-Long-Run-NBIM.zip"
HANDOFF = RELEASE / "The-Long-Run-Cutscene-Handoff.zip"
# A fixed timestamp and file mode make identical inputs produce identical ZIPs.
ZIP_DATE = (2020, 1, 1, 0, 0, 0)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def file_digest(path):
    checksum = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            checksum.update(chunk)
    return checksum.hexdigest()


def source_input_manifest(source_root):
    """Fingerprint build inputs, excluding packaging-only docs and metadata."""
    source_root = Path(source_root)
    # Match build.mjs: archived experiments are not runtime dependencies.
    scripts = [source_root / path for path in re.findall(
        r'<script\b[^>]*\bsrc="(scripts/[^"]+)"', (source_root / "index.html").read_text())]
    documents = [source_root / "index.html", source_root / "game.css", *scripts]
    source_text = "\n".join(path.read_text() for path in documents)
    runtime = set(re.findall(r"assets/[A-Za-z0-9_./-]+\.(?:webp|png|svg|avif|mp3|m4a|webm|woff2?)", source_text))
    assets = runtime | {item["path"] for item in json.loads((source_root / "assets-manifest.json").read_text())}
    # The source atlas accompanies the runtime sprites in the editable handoff.
    for folder in {Path(relative).parent for relative in runtime}:
        atlas = folder / "atlas-native.png"
        if (source_root / atlas).is_file():
            assets.add(atlas.as_posix())
    paths = {"build.mjs", "index.html", "game.css", "assets-manifest.json", *assets,
             *(path.relative_to(source_root).as_posix() for path in scripts)}
    return [{"path": relative, "bytes": (source_root / relative).stat().st_size,
             "sha256": file_digest(source_root / relative)} for relative in sorted(paths)]


def input_manifest_digest(inputs):
    return digest(json.dumps(inputs, sort_keys=True, separators=(",", ":")).encode("utf-8"))


def verify_handoff_manifest(archive, folder):
    """Check every stored file without extracting or executing archive content."""
    prefix = folder + "/"
    names = archive.namelist()
    if len(names) != len(set(names)) or any(not name.startswith(prefix) for name in names):
        raise ValueError("Handoff has duplicate entries or unexpected archive roots")
    manifest_name = prefix + "FILES-SHA256.json"
    manifest = json.loads(archive.read(manifest_name))
    if not isinstance(manifest, list):
        raise ValueError("Handoff file manifest must be a list")
    expected = {manifest_name}
    for item in manifest:
        relative = item.get("path", "")
        if not isinstance(relative, str) or not relative or relative.startswith("/") or "\\" in relative or ".." in relative.split("/"):
            raise ValueError("Handoff manifest contains an unsafe path")
        name = prefix + relative
        if name in expected:
            raise ValueError("Handoff manifest repeats a path")
        expected.add(name)
        data = archive.read(name)
        if len(data) != item.get("bytes") or digest(data) != item.get("sha256"):
            raise ValueError(f"Handoff manifest mismatch: {relative}")
    if expected != set(names):
        raise ValueError("Handoff file manifest does not describe the complete archive")


def verify_game(html, version):
    with zipfile.ZipFile(ARCHIVE) as archive:
        if set(archive.namelist()) != {HTML.name, "READ-ME.txt"}:
            raise ValueError("Playable ZIP has unexpected contents")
        corrupt = archive.testzip()
        if corrupt is not None:
            raise ValueError(f"Playable ZIP failed CRC verification: {corrupt}")
        if archive.read(HTML.name) != html:
            raise ValueError("Playable ZIP HTML differs from the current build")
        expected_heading = f"THE LONG RUN - NBIM ARCADE - VERSION {version}\n"
        if not archive.read("READ-ME.txt").decode("utf-8").startswith(expected_heading):
            raise ValueError("Playable ZIP README does not match package.json version")


def package_game(html, version):
    readme = f"""THE LONG RUN - NBIM ARCADE - VERSION {version}

Unzip this folder, then open {HTML.name} in a current browser.
The HTML includes the game code, artwork, fonts and music. No installation
or build step is needed to play it. For an intranet or website, upload the
HTML as a normal static page.

Story follows Opening Bell, Midtown and Central Park. Endless offers seeded
courses and unlocks after finishing all three Story chapters. Story has no
scoreboard. Chapter progress and Endless scores are saved by the browser.

Source and maintenance instructions:
https://github.com/theagilepadawan/gamegame
""".encode("utf-8")
    temporary = ARCHIVE.with_suffix(".zip.tmp")
    try:
        with zipfile.ZipFile(temporary, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
            for name, data in [(HTML.name, html), ("READ-ME.txt", readme)]:
                entry = zipfile.ZipInfo(name, date_time=ZIP_DATE)
                entry.create_system = 3
                entry.compress_type = zipfile.ZIP_DEFLATED
                entry.external_attr = 0o100644 << 16
                archive.writestr(entry, data, compresslevel=9)
        # Verify the new file before replacing the previous deliverable.
        with zipfile.ZipFile(temporary) as archive:
            corrupt = archive.testzip()
            if corrupt is not None or archive.read(HTML.name) != html:
                raise ValueError("New playable ZIP failed CRC or HTML identity verification")
        temporary.replace(ARCHIVE)
    finally:
        temporary.unlink(missing_ok=True)


def current_handoff(version, html_hash):
    if not HANDOFF.is_file():
        return False
    with zipfile.ZipFile(HANDOFF) as archive:
        candidates = [name for name in archive.namelist() if name.endswith("/HANDOFF-METADATA.json")]
        if len(candidates) != 1:
            return False
        metadata = json.loads(archive.read(candidates[0]))
        if metadata.get("gameVersion") != version or metadata.get("playableSha256") != html_hash:
            return False
        folder = candidates[0].rsplit("/", 1)[0]
        playable_name = f"{folder}/playable/{HTML.name}"
        included = metadata.get("playableIncluded", True)
        if not isinstance(included, bool):
            raise ValueError("Handoff playableIncluded must be a boolean")
        if included:
            if digest(archive.read(playable_name)) != html_hash:
                raise ValueError("Current handoff metadata does not match its playable HTML")
        else:
            if playable_name in archive.namelist():
                raise ValueError("Source-only handoff unexpectedly contains compiled HTML")
            proof = metadata.get("sourceRebuild", {})
            if proof.get("verified") is not True or proof.get("sha256") != html_hash or proof.get("bytes") != HTML.stat().st_size:
                raise ValueError("Source-only handoff has no matching verified rebuild")
            inputs = proof.get("inputs")
            if not isinstance(inputs, list) or input_manifest_digest(inputs) != proof.get("inputManifestSha256"):
                raise ValueError("Source-only handoff rebuild input manifest is invalid")
            current_inputs = source_input_manifest(ROOT)
            if inputs != current_inputs:
                return False
            # The package creator has rebuilt these exact inputs. Compare them
            # against both the current workspace and stored bytes; a metadata
            # hash claim alone cannot make an unrelated source archive current.
            for item in current_inputs:
                data = archive.read(f"{folder}/game/{item['path']}")
                if len(data) != item["bytes"] or digest(data) != item["sha256"]:
                    raise ValueError(f"Source-only handoff build input mismatch: {item['path']}")
            package = json.loads(archive.read(f"{folder}/game/package.json"))
            if package.get("version") != version:
                raise ValueError("Source-only handoff package version does not match")
            instructions = archive.read(f"{folder}/playable/BUILD-AND-PLAY.md").decode("utf-8")
            if html_hash not in instructions:
                raise ValueError("Source-only handoff instructions lack the expected HTML hash")
            verify_handoff_manifest(archive, folder)
        return True


def write_checksums(version, html_hash):
    files = [HTML, ARCHIVE]
    files.extend(path for name in ["The-Long-Run-Asset-Choices.zip", "City-Asset-Choices.png", "Park-Asset-Choices.png"]
                 if (path := RELEASE / name).is_file())
    omitted = []
    if current_handoff(version, html_hash):
        files.append(HANDOFF)
    elif HANDOFF.exists():
        omitted.append(f"{HANDOFF.name}: does not match this version and HTML")
    major, minor = version.split(".")[:2]
    tag = re.compile(rf"-v{re.escape(major + minor)}-")
    preview_extensions = {".png", ".webp", ".jpg", ".jpeg", ".gif", ".mp4", ".webm"}
    files.extend(sorted(path for path in RELEASE.iterdir()
                        if path.is_file() and tag.search(path.stem)
                        and path.suffix.lower() in preview_extensions))
    lines = [f"{file_digest(path)}  {path.name}\n" for path in files]
    (RELEASE / "SHA256SUMS.txt").write_text("".join(lines), encoding="utf-8")
    return files, omitted


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--checksums-only", action="store_true",
                        help="Verify the existing game ZIP and refresh this version's checksums")
    args = parser.parse_args()
    version = json.loads((ROOT / "package.json").read_text())["version"]
    if not re.fullmatch(r"\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?", version):
        raise ValueError("package.json needs a semantic version")
    if not HTML.is_file():
        raise FileNotFoundError("Build release/The-Long-Run-NBIM.html before packaging")
    html = HTML.read_bytes()
    if not args.checksums_only:
        package_game(html, version)
    verify_game(html, version)
    html_hash = digest(html)
    files, omitted = write_checksums(version, html_hash)
    print(json.dumps({"version": version, "archive": str(ARCHIVE),
                      "bytes": ARCHIVE.stat().st_size, "sha256": file_digest(ARCHIVE),
                      "htmlBytes": len(html), "htmlSha256": html_hash,
                      "crcVerified": True, "htmlByteIdentical": True,
                      "checksums": [path.name for path in files], "omitted": omitted}, indent=2))


if __name__ == "__main__":
    main()
