# Contributing — VietAR Packs

**English** · [Română](CONTRIBUTING.ro.md) · [Français](CONTRIBUTING.fr.md) · [Italiano](CONTRIBUTING.it.md) · [Español](CONTRIBUTING.es.md) · [Português](CONTRIBUTING.pt.md) · [Deutsch](CONTRIBUTING.de.md) · [Magyar](CONTRIBUTING.hu.md)

Version: 0.2.0 · Last updated: 2026-11-17

1. Fork this repository.
2. Make or extend a pack: on the page use the tab “Create” and download the file, or write `data/species/<latin-name>.json` files by hand (see `docs/pack-format.md`).
3. Turn a downloaded pack into files with `node scripts/pack.mjs --split vietar-pack-<id>.json`, or list the new species ids in the manifest of the pack in `data/packs/`.
4. Run `node scripts/pack.mjs`, `python3 scripts/validate.py`, `npm test` and `node scripts/build.mjs`.
5. Open a pull request — data contributions need no coding. Give a source for every name, note and toxic flag, and never mark a pack as reviewed yourself (see `docs/review-guide.md`).

## Rules

- One species = one file in `data/species/`, named after its id (the Latin name in lower case with hyphens).
- Always cite a source.
- Contribute only material you may legally share (no copied copyrighted text).
- Be kind: see the Code of Conduct.

## Adding species and packs

1. Start from a source you may use: your own knowledge and observations, or public pages whose licence allows reuse (write down the address and the date). Do not copy text from field guides, apps or websites unless the licence allows it: write the note in your own words and say so in `source`.
2. Write a name only in a language you know or can check with a native speaker or a reliable dictionary. English is required; the page shows the language of the reader first and English as the fallback.
3. For plants and fungi `toxic` is required. Say `true` when any part of the species is known to be poisonous, and write a toxicity note that says what the danger is. `false` only means that nobody marked the species as toxic here: it never means edible. When in doubt, ask a local expert before you write `false`.
4. List a dangerous pair of look-alikes on both species, with a warning note such as “The leaves can be mistaken for each other; confusing them has caused serious poisonings”. Say that they are confused, never how to tell them apart: a wrong tip can kill.
5. Photos: your own, public-domain or with a licence listed in `docs/pack-format.md`, each with its author, licence and a link to its source; reduce them with `python3 scripts/optimize.py` (WebP, at most 640 px, no location data) and check Wikimedia Commons photos with `node scripts/check_licences.mjs --online`. Sounds: only links to xeno-canto.org that you listened to, with the recordist and the licence.
6. A new pack is a `draft` (or a `skeleton` when it only shows the format). Only a reviewer who has checked every species may set `reviewed`, with their name and the date: see `docs/review-guide.md`.
7. More: `docs/contributor-guide.md` (commands, files, checks), `docs/school-class-guide.md` (a class or a club makes a pack) and `docs/pack-format.md` (every field and limit).
