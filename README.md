# VietAR Packs

**English** · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Version: 0.2.0 · Last updated: 2026-11-17

🌐 https://vietar-packs.chiuta.ro

> Regional species packs for VietAR: names, photos and sounds of local wildlife and plants.

Trade-free: no tracking, no ads, no accounts, works offline.

## Status

Alpha, usable: the single `index.html` browses, imports, checks and creates regional species packs: names in several languages, a toxic flag, dangerous look-alikes, licensed photos and links to xeno-canto sounds. It holds five built-in starter packs with 71 species in all (Romania: 19 plants and fungi, 17 birds and 15 mammals; Bulgaria and Moldova: the same 10 widespread species each, as skeletons). Every built-in pack is a draft or a skeleton: names and notes were written with an AI assistant and checked only in part, no biologist, mycologist or native speaker has reviewed them, and they contain no photos and no sound links yet. The page identifies nothing and is not a field guide: the label “Not marked toxic” never means safe to eat or touch. The VietAR app cannot import these packs yet.

## What it does

- “Browse”: choose a pack, search by a name in any language or by the Latin name (capitals and accents do not matter), filter by group and by toxic flag, and open a species: its names (in the language of the page, with English as the fallback), toxic flag and toxicity note, notes, source, the species it is often confused with (each one a link), photos and sound links. A red safety box stays visible on every tab and says what the page is not.
- “Packs”: the built-in packs and the ones you import (paste the JSON or choose a file; at most 12 at a time), each with its region, version, licence, authors, an honest status badge (“Skeleton”, “Draft”, “Reviewed”) and counts by group; download any pack or remove the ones you imported. A pack is checked completely before it is added: if anything is wrong, nothing is imported and you see what to fix.
- “Create”: make a pack for a school class, a nature club or a region: fill in the pack, add species one by one (up to 400), link look-alikes in both directions, check the pack with the same rules as the repository and download the file. The draft is kept in this browser while you work. A pack made here is never marked as reviewed; photos and sounds are added through the JSON of the species.
- “Guide”: how to use the page, and an example of a species with a photo and a sound.
- Format: one JSON file per species in `data/species/`, one manifest per pack in `data/packs/`, built into complete packs (format `vietar-pack`) in `data/dist/`; described by `schema.json` and `pack.schema.json` and explained in `docs/pack-format.md`.
- Tools for contributors: `scripts/pack.mjs` (builds the packs and splits a downloaded one into files), `scripts/validate.py`, `scripts/optimize.py` (a photo to WebP of at most 640 px, without metadata), `scripts/check_licences.mjs` (photo licences, online with `--online`). The interface is in eight languages and works with the keyboard and with a screen reader.
- Installable as an app and available offline after the first visit when served over HTTPS (a service worker keeps the page; nothing else is stored or sent). Opened from a downloaded file it works the same, without installation.

## How it works

- A species file and a manifest (the list of species ids and their count) become a complete pack: `node scripts/pack.mjs` writes it to `data/dist/<id>.json`. The page embeds `data/dist/`, so what you browse is exactly what you download.
- `schema.json` and `pack.schema.json` describe the files; `scripts/validate.py` applies them and the rules a schema cannot say: the file name, the id and the Latin name agree, the group fits the kingdom, plants and fungi say whether they are toxic, a toxic species has a toxicity note, look-alikes point back at each other, photos stay within 3 MB, a reviewed pack names the reviewer and the date. `src/engine.mjs` applies the same rules in the page; the tests compare the two.
- Safe by construction: text from a pack is always shown as text, never as HTML; links open only `https://` addresses; the page makes no network request (photos are embedded, sounds are links that open xeno-canto.org in a new tab); an imported pack and the saved state are checked again when the page loads, so a damaged or hostile one is refused, not trusted.
- `src/ui.js`, `src/i18n.mjs` and `src/app.css` are the interface; `scripts/build.mjs` builds the single `index.html` from `src/` and embeds the packs of `data/dist/`; `node scripts/build.mjs --check` fails when the page is out of date.
- Tests: `npm test` (engine, validator parity, scripts, licence checker, photo optimiser, documentation) and browser tests in the hub (eight languages, accessibility, hostile imports, limits, full storage). Development needs Node.js 24 or newer and Python 3 with `jsonschema` (Pillow only for the photo optimiser); the page itself needs a browser that knows ES2017.
- `manifest.webmanifest`, `sw.js` and the icons are produced by `node scripts/build.mjs` through the shared kit (`pwa` in `src/app.json`); `--check` also verifies them, and `npm test` checks that the manifest, the service worker version and the CSP match the page.

## Honest limits

- The built-in packs are drafts: names and notes were written with an AI assistant from general knowledge and checked only in part against public pages. No biologist, mycologist or native speaker has reviewed them. The Bulgarian and Moldovan packs are skeletons of 10 species each.
- «Not marked toxic» means only that nobody marked the species as toxic in this pack. It is never a statement that a plant or mushroom is edible or safe, and the packs do not teach how to tell look-alikes apart. Never eat a wild plant or mushroom because of this page.
- The built-in packs contain no photos and no sound links, because licences and recording numbers could not be verified offline. The format supports both, with author, licence and source.
- Packs imported here are stored in this browser only; clearing site data removes them. Download the ones you care about.
- The VietAR app cannot import these packs yet. For now the packs are read and checked on this page and by the scripts in the repository.
- The interface translations were written by a machine and have not been reviewed by native speakers. Species names and notes appear in the language of the pack, with English as the fallback.

## Contribute in 5 minutes

1. Fork this repository.
2. Make or extend a pack: on the page use the tab “Create” and download the file, or write `data/species/<latin-name>.json` files by hand (see `docs/pack-format.md`).
3. Turn a downloaded pack into files with `node scripts/pack.mjs --split vietar-pack-<id>.json`, or list the new species ids in the manifest of the pack in `data/packs/`.
4. Run `node scripts/pack.mjs`, `python3 scripts/validate.py`, `npm test` and `node scripts/build.mjs`.
5. Open a pull request — data contributions need no coding. Give a source for every name, note and toxic flag, and never mark a pack as reviewed yourself (see `docs/review-guide.md`).

## Good first issues

See `ISSUES_GOOD_FIRST.md` for ready-made tasks.

## License

Code: MIT. Data: every pack states its own licence (CC0-1.0, CC-BY-4.0 or CC-BY-SA-4.0); the built-in packs are CC0-1.0. Photos and sounds keep their own licences: each one names its author, licence and source. Contributed data: state its source; it is released under the licence of the pack it joins.

## Support

If this project is useful, you can [buy me a coffee](https://buymeacoffee.com/echo.of.the.strings).

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

Add yourself with `@all-contributors please add @you for data` in your pull request.
