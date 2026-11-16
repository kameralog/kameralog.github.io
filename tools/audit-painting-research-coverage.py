import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

BASE = Path("editorial/painting")
REPORT = Path("reports/painting-research-coverage.json")


def build():
    inputs = {}

    def read(path):
        raw = path.read_bytes()
        inputs[path.as_posix()] = hashlib.sha256(raw).hexdigest()
        return json.loads(raw)

    manifest = read(BASE / "manifest.json")
    research = read(BASE / "research/manifest.json")
    summary = read(BASE / "summary.json")
    if manifest.get("schemaVersion") != 1 or research.get("schemaVersion") != 1:
        raise ValueError("Unsupported manifest schema")
    indexes = manifest["indexes"]
    packages = research["packages"]
    if len(indexes) != len(set(indexes)) or len(packages) != len(set(packages)):
        raise ValueError("Duplicate manifest paths")
    catalogue = []
    for filename in indexes:
        if not re.fullmatch(r"index-[0-9]+\.json", filename):
            raise ValueError("Invalid catalogue index path")
        rows = read(BASE / filename)
        if not isinstance(rows, list):
            raise ValueError("Invalid catalogue index")
        catalogue.extend(rows)
    by_id = {}
    for row in catalogue:
        ident = row.get("id")
        if not isinstance(ident, str) or not re.fullmatch(r"[A-Za-z0-9_-]+", ident):
            raise ValueError("Invalid artist ID")
        if ident in by_id or not row.get("name"):
            raise ValueError("Duplicate or unnamed catalogue artist: " + ident)
        if row.get("path") != "records/" + ident + ".json":
            raise ValueError("Unexpected record path: " + ident)
        by_id[ident] = row
    if len(catalogue) != manifest["count"]:
        raise ValueError("Catalogue count mismatch")
    connected = set()
    reserved = set()
    for filename in packages:
        if not re.fullmatch(r"batch-[A-Za-z0-9_-]+\.json", filename):
            raise ValueError("Invalid research package path")
    extra_files = sorted(p.name for p in (BASE / "research").glob("batch-*.json") if p.name not in packages)
    for filename in list(packages) + extra_files:
        pack = read(BASE / "research" / filename)
        if pack.get("schemaVersion") != 1 or not isinstance(pack.get("artists"), list):
            raise ValueError("Invalid research package: " + filename)
        target = connected if filename in packages else reserved
        for artist in pack["artists"]:
            ident = artist.get("id")
            if ident not in by_id:
                raise ValueError("Unknown research ID: " + str(ident))
            if ident in connected or ident in reserved:
                raise ValueError("Duplicate research ID: " + ident)
            if not artist.get("synopsis") or not isinstance(artist.get("directions"), list) or not isinstance(artist.get("sources"), list):
                raise ValueError("Incomplete research dossier: " + ident)
            target.add(ident)
    if summary["researchDossiersAvailable"] != len(connected):
        raise ValueError("Available dossier count mismatch")
    excluded = connected | reserved
    available = [row for row in catalogue if row["id"] not in excluded]
    next_fifty = available[:50]
    for row in next_fifty:
        record = read(BASE / row["path"])
        if record.get("id") != row["id"]:
            raise ValueError("Record ID mismatch: " + row["id"])
    commit = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
    return {
        "schemaVersion": 1,
        "sourceCommit": commit,
        "catalogueCount": len(catalogue),
        "connectedPackageCount": len(packages),
        "connectedDossierCount": len(connected),
        "connectedIds": sorted(connected),
        "unconnectedPackageFiles": extra_files,
        "unconnectedIds": sorted(reserved),
        "remainingCount": len(available),
        "next50": next_fifty,
        "inputSHA256": inputs,
        "verificationScope": "ID, path, structure and count checks only; not historical, visual or rights verification"
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    report = build()
    if args.write:
        REPORT.parent.mkdir(parents=True, exist_ok=True)
        REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: report[key] for key in ("sourceCommit", "catalogueCount", "connectedDossierCount", "remainingCount", "next50")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
