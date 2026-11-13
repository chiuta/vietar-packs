#!/usr/bin/env python3
"""Validate every JSON file under the data directory against schema.json."""
import json, sys, pathlib
from jsonschema import Draft7Validator

root = pathlib.Path(__file__).resolve().parent.parent
schema = json.loads((root / "schema.json").read_text(encoding="utf-8"))
data_dir = root / sys.argv[1] if len(sys.argv) > 1 else root / "data"
validator = Draft7Validator(schema)
bad = 0
files = sorted(data_dir.rglob("*.json"))
for f in files:
    doc = json.loads(f.read_text(encoding="utf-8"))
    for err in validator.iter_errors(doc):
        bad += 1
        path = "/".join(map(str, err.absolute_path)) or "(root)"
        print(f"{f.relative_to(root)}: {path}: {err.message}")
print(f"{len(files)} file(s) checked, {bad} problem(s).")
sys.exit(1 if bad else 0)
