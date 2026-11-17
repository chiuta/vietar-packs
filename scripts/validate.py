#!/usr/bin/env python3
"""Validate the data of VietAR Packs.

  python3 scripts/validate.py            check data/species, data/packs and data/dist
  python3 scripts/validate.py --json     machine-readable output (used by the tests)
  python3 scripts/validate.py --root DIR check another checkout (used by the tests)

What is checked
  data/species/<id>.json   one species, against schema.json, plus the rules a schema cannot say:
                           the file name and id equal the Latin name, the group fits the kingdom,
                           plants and fungi say toxic true/false, a toxic species has a toxic_note,
                           look-alike lists have no repeats and no self reference
  data/packs/<id>.json     one manifest, against pack.schema.json: real dates, a reviewed pack names who
                           reviewed it, species ids are unique, count equals the number of species
  every pack as a whole    each species exists, look-alike targets are in the same pack and point back
                           (the warning must show from both sides), photos stay within the size budget
  data/dist/<id>.json      the built pack equals what node scripts/pack.mjs would write (example.json is an example)
  every species file is listed in at least one pack

The page (src/engine.mjs) applies the same rules; test/validator-parity.test.mjs compares the two.
"""
import datetime
import json
import pathlib
import re
import sys

from jsonschema import Draft7Validator

PHOTO_BUDGET = 3000000
GROUPS = {
    "animalia": ["mammal", "bird", "reptile", "amphibian", "fish", "invertebrate", "other"],
    "plantae": ["tree", "shrub", "herb", "other"],
    "fungi": ["fungus", "other"],
}
PACK_ORDER = ["id", "title", "description", "region", "version", "updated", "licence", "status", "reviewed_by", "reviewed_on", "authors", "count"]


def fix_patterns(node):
    """Python's $ also matches before a final newline; \\Z does not (like JavaScript)."""
    if isinstance(node, dict):
        for key, value in list(node.items()):
            if key == "pattern" and isinstance(value, str):
                node[key] = value.replace("$", "\\Z")
            else:
                fix_patterns(value)
    elif isinstance(node, list):
        for item in node:
            fix_patterns(item)
    return node


def is_space(c):
    return c in (32, 160, 0x1680, 0x202F, 0x205F, 0x3000) or 0x2000 <= c <= 0x200A


def bad_char(c):
    return (c < 32 or 0x7F <= c <= 0x9F or 0x200B <= c <= 0x200F or c in (0x2028, 0x2029, 0xFEFF)
            or 0x202A <= c <= 0x202E or 0x2060 <= c <= 0x2064 or 0x2066 <= c <= 0x2069)


def text_bad(s, multi):
    if not s:
        return False
    for ch in s:
        c = ord(ch)
        if 0xD800 <= c <= 0xDFFF:
            return True
        if bad_char(c) and not (multi and c == 10):
            return True
    a, b = ord(s[0]), ord(s[-1])
    return is_space(a) or is_space(b) or (multi and (a == 10 or b == 10))


def text_pass(value, path, out):
    if isinstance(value, str):
        if re.match(r"^photos\[[0-9]+\]\.data$", path):
            return
        if text_bad(value, path.startswith("notes.")):
            out.append(("text", path))
    elif isinstance(value, list):
        for i, item in enumerate(value):
            text_pass(item, "%s[%d]" % (path, i), out)
    elif isinstance(value, dict):
        for key, item in value.items():
            text_pass(item, key if not path else path + "." + key, out)


def date_ok(s):
    m = re.match(r"^([0-9]{4})-([0-9]{2})-([0-9]{2})\Z", str(s))
    if not m or int(m.group(1)) < 1000:
        return False
    try:
        datetime.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
    except ValueError:
        return False
    return True


def loc(error):
    parts = []
    for p in error.absolute_path:
        parts.append("[%d]" % p if isinstance(p, int) else ("." + p if parts else p))
    return "".join(parts)


class Checker:
    def __init__(self, root):
        self.root = pathlib.Path(root)
        species_schema = fix_patterns(json.loads((self.root / "schema.json").read_text(encoding="utf-8")))
        pack_schema = fix_patterns(json.loads((self.root / "pack.schema.json").read_text(encoding="utf-8")))
        self.species_v = Draft7Validator(species_schema)
        self.pack_v = Draft7Validator(pack_schema)
        self.id_v = Draft7Validator(species_schema["definitions"]["speciesId"])
        self.problems = []
        self.files = 0

    def add(self, file, code, path=""):
        self.problems.append({"file": file, "code": code, "path": path})

    def load(self, f):
        rel = f.relative_to(self.root).as_posix()
        self.files += 1
        try:
            return rel, json.loads(f.read_text(encoding="utf-8"))
        except (ValueError, OSError):
            self.add(rel, "json")
            return rel, None

    def species_problems(self, sp):
        out = [("schema", loc(e)) for e in self.species_v.iter_errors(sp)]
        text_pass(sp, "", out)
        if out:
            return out
        if sp["id"] != sp["latin"].lower().replace(" ", "-"):
            out.append(("id_slug", "id"))
        if sp["group"] not in GROUPS[sp["kingdom"]]:
            out.append(("group_kingdom", "group"))
        if sp["kingdom"] != "animalia" and "toxic" not in sp:
            out.append(("toxic_required", "toxic"))
        if sp.get("toxic") is True and "toxic_note" not in sp:
            out.append(("toxic_note_required", "toxic_note"))
        if "toxic_note" in sp and sp.get("toxic") is not True:
            out.append(("toxic_note_unused", "toxic_note"))
        seen = set()
        for i, item in enumerate(sp.get("look_alike", [])):
            if item["id"] == sp["id"]:
                out.append(("look_self", "look_alike[%d].id" % i))
            elif item["id"] in seen:
                out.append(("look_dup", "look_alike[%d].id" % i))
            seen.add(item["id"])
        return out

    def manifest_problems(self, m):
        out = [("schema", loc(e)) for e in self.pack_v.iter_errors(m)]
        if isinstance(m, dict) and isinstance(m.get("species"), list):
            for i, item in enumerate(m["species"]):
                if not isinstance(item, str) or any(True for _ in self.id_v.iter_errors(item)):
                    out.append(("schema", "species[%d]" % i))
        text_pass(m, "", out)
        if out:
            return out
        if not date_ok(m["updated"]):
            out.append(("date", "updated"))
        if "reviewed_on" in m and not date_ok(m["reviewed_on"]):
            out.append(("date", "reviewed_on"))
        if m["status"] == "reviewed":
            for key in ("reviewed_by", "reviewed_on"):
                if key not in m:
                    out.append(("review_missing", key))
        if len(set(m["species"])) != len(m["species"]):
            out.append(("dup_species", "species"))
        if m["count"] != len(m["species"]):
            out.append(("count_mismatch", "count"))
        return out

    def run(self):
        species, invalid, manifests, where = {}, set(), [], {}
        for f in sorted((self.root / "data/species").glob("*.json")):
            rel, sp = self.load(f)
            if sp is None:
                continue
            if not isinstance(sp, dict):
                self.add(rel, "schema")
                continue
            bad = self.species_problems(sp)
            for code, path in bad:
                self.add(rel, code, path)
            if isinstance(sp.get("id"), str) and f.name != sp["id"] + ".json":
                self.add(rel, "file_name", "id")
            if bad:
                if isinstance(sp.get("id"), str):
                    invalid.add(sp["id"])
            else:
                species[sp["id"]] = sp
                where[sp["id"]] = rel
        for f in sorted((self.root / "data/packs").glob("*.json")):
            rel, m = self.load(f)
            if m is None:
                continue
            bad = self.manifest_problems(m)
            for code, path in bad:
                self.add(rel, code, path)
            if isinstance(m, dict) and isinstance(m.get("id"), str) and f.name != m["id"] + ".json":
                self.add(rel, "file_name", "id")
            if not bad:
                manifests.append((rel, m))
        used, built_ids = set(), set()
        for rel, m in manifests:
            used.update(m["species"])
            members, ok = [], True
            for i, sid in enumerate(m["species"]):
                if sid in species:
                    members.append(species[sid])
                elif sid not in invalid:
                    self.add(rel, "species_unknown", "species[%d]" % i)
                    ok = False
                else:
                    ok = False
            if not ok:
                continue
            by = {s["id"]: s for s in members}
            budget = 0
            for j, s in enumerate(members):
                for x, item in enumerate(s.get("look_alike", [])):
                    target = by.get(item["id"])
                    loc = "species[%d].look_alike[%d].id" % (j, x)
                    if target is None:
                        self.add(rel, "look_unknown", loc)
                    elif not any(b["id"] == s["id"] for b in target.get("look_alike", [])):
                        self.add(rel, "look_asym", loc)
                budget += sum(len(p["data"]) for p in s.get("photos", []))
            if budget > PHOTO_BUDGET:
                self.add(rel, "photo_budget", "species")
            built = {"format": "vietar-pack", "format_version": 1}
            for key in PACK_ORDER:
                if key in m:
                    built[key] = m[key]
            built["species"] = members
            dist = self.root / "data/dist" / (m["id"] + ".json")
            built_ids.add(dist.name)
            drel = dist.relative_to(self.root).as_posix()
            if not dist.exists():
                self.add(drel, "dist_missing")
            else:
                _, cur = self.load(dist)
                if cur is not None and cur != built:
                    self.add(drel, "dist_stale")
        for sid in sorted(species):
            if sid not in used:
                self.add(where[sid], "species_orphan")
        for f in sorted((self.root / "data/dist").glob("*.json")):
            if f.name != "example.json" and f.name not in built_ids:
                self.add(f.relative_to(self.root).as_posix(), "dist_stale")
        return self.problems


def main(argv):
    root = pathlib.Path(__file__).resolve().parent.parent
    as_json = "--json" in argv
    if "--root" in argv:
        root = pathlib.Path(argv[argv.index("--root") + 1])
    checker = Checker(root)
    problems = checker.run()
    if as_json:
        print(json.dumps({"files": checker.files, "problems": problems}, ensure_ascii=False))
    else:
        for p in problems:
            print("%s: %s%s" % (p["file"], p["code"], " (%s)" % p["path"] if p["path"] else ""))
        print("%d file(s) checked, %d problem(s)." % (checker.files, len(problems)))
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
