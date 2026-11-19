# Contributor guide · VietAR Packs

Version: 0.2.1 · Last updated: 2026-11-20 · [Română](contributor-guide.ro.md)

This guide is for people who add or correct species, packs, photos or sounds in the repository. A class or a club that only wants to make a pack on the page can start with `docs/school-class-guide.md`. The exact format is in `docs/pack-format.md`; how a pack becomes “Reviewed” is in `docs/review-guide.md`.

## 1. What you need

- Node.js 24 or newer and Python 3 with `jsonschema` (`pip install jsonschema`). Pillow (`pip install pillow`) is needed only for `scripts/optimize.py`. The project has no other dependencies and no `npm install`.
- A fork of the repository, cloned to your computer, and a text editor: species files are plain JSON.

## 2. What is where

| Path | What it holds |
| --- | --- |
| `data/species/` | one JSON file per species, named after its id |
| `data/packs/` | one manifest per pack: title, region, version, licence, status and the ids of its species |
| `data/dist/` | the built packs, written by `node scripts/pack.mjs` and never edited by hand; `example.json` shows the format |
| `schema.json`, `pack.schema.json` | the rules of a species and of a pack |
| `src/` | the page: `engine.mjs` (rules and logic), `ui.js`, `i18n.mjs`, `app.css` and `app.json` |
| `scripts/` | `pack.mjs`, `validate.py`, `optimize.py`, `check_licences.mjs` and `build.mjs` |
| `index.html` | the built page, made by `node scripts/build.mjs` and never edited by hand |
| `test/` | the tests, run by `npm test` |
| `docs/` | these guides |

## 3. Add or change a species

1. Write or edit `data/species/<id>.json`: the id is the Latin name in lower case with hyphens, and `docs/pack-format.md` lists every field. Cite your source in `source`.
2. Put the id in `species` of the manifest of every pack that should hold it (`data/packs/<pack-id>.json`), raise `count`, set `updated` and raise `version` (the middle number for a new species, the last one for a correction).
3. If the species has a dangerous look-alike, list each one on the other, in the same pack, with a warning note. Never explain how to tell them apart.
4. Run these commands. They rebuild `data/dist/`, check every file, run the tests and rebuild the page:

```
node scripts/pack.mjs
python3 scripts/validate.py
npm test
node scripts/build.mjs
```

A species file that is in no pack is an error: every species belongs to at least one pack.

## 4. Start a new pack

Write the manifest `data/packs/<pack-id>.json` (section 4 of `docs/pack-format.md`), list the ids of its species, set `status` to `draft` (or `skeleton`) and run the four commands above. The page embeds every pack of `data/dist/`, so the new pack appears in the tab “Packs” after the build. A new pack is never `reviewed`: see `docs/review-guide.md`.

## 5. Take a pack made on the page

A file downloaded from the tab “Create” or “Packs” becomes species files and a manifest with:

```
node scripts/pack.mjs --split vietar-pack-<id>.json
```

The command checks the pack first and writes nothing if it has problems. It does not overwrite a file that exists and differs: it lists those files, and `--force` overwrites them. Then run the four commands of section 3, read every name and flag before you open a pull request, and keep `status` at `draft`.

## 6. Photos

Use only your own photos, public-domain photos and photos under a licence listed in `docs/pack-format.md`. Prepare each one with:

```
python3 scripts/optimize.py lynx.jpg --author "Name Surname" --licence CC-BY-4.0 --source-url "https://commons.wikimedia.org/wiki/File:Lynx_lynx.jpg" --commons-file "File:Lynx_lynx.jpg" --alt "A lynx on a rock" --lang en
```

The script makes the picture at most 640 pixels wide or high, removes the metadata (place, date, camera), saves it as WebP (JPEG when WebP is not available) and prints one photo entry in JSON, to add to the `photos` list of the species; if the result is over 120,000 characters it lowers the quality and, if needed, the size, step by step. Then check the licences:

```
node scripts/check_licences.mjs
node scripts/check_licences.mjs --online
```

The first command works without a network: every photo must have an allowed licence, an author and a source link. The second asks Wikimedia Commons about every photo that has a `commons_file` and compares the licence and the author. It is the only place where the project uses the network, and only when you ask for it. A photo from another source cannot be checked by a script: whoever adds it answers for it.

## 7. Sounds

A sound is a link `https://xeno-canto.org/<number>` to a recording that you have listened to, with the recordist and the licence as xeno-canto states them. The page never plays it and never loads it. The numbers cannot be verified offline, so each one is checked by listening.

## 8. Before you open a pull request

```
node scripts/pack.mjs --check
python3 scripts/validate.py
npm test
node scripts/build.mjs --check
node scripts/check_licences.mjs
```

`npm run check` runs the first, the second and the fourth. The pull request template lists what to tick, and the same checks run on GitHub for every push.

## 9. How the page, the scripts and the tests agree

`src/engine.mjs` (used by the page and by `scripts/pack.mjs`) and `scripts/validate.py` apply the same rules in two languages; `test/validator-parity.test.mjs` compares them case by case, so a rule changed in one place and not in the other fails the tests. `node scripts/build.mjs --check` fails when `index.html` is older than `src/` or `data/dist/`. The browser tests in the hub open the page in eight languages and try hostile files, full storage and long texts.

## 10. A mistake in the data

If a toxic flag is wrong or a dangerous look-alike is missing, open an issue at once with the title “Safety: …” and say what is wrong and how you know. Such an issue comes before every other one. Fix it in a pull request that changes the species file, raises the version of every pack that holds it and, if a pack was `reviewed`, sets its status back to `draft` until a reviewer has checked the change.
