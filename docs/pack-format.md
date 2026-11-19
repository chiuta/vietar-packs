# The pack format · VietAR Packs

Version: 0.2.1 · Last updated: 2026-11-20 · [Română](pack-format.ro.md)

A pack is one JSON file with the species of a region: names in several languages, a toxic flag, dangerous look-alikes and, when the licence allows it, photos and links to sounds. This guide lists every field and every limit. `schema.json` and `pack.schema.json` are the exact rules; `scripts/validate.py` and the page apply them, and `data/dist/example.json` shows every field in one file.

## 1. Three kinds of file

| File | What it is | Rules |
| --- | --- | --- |
| `data/species/<id>.json` | one species, named after its id | `schema.json` |
| `data/packs/<id>.json` | the manifest of a pack: title, region, version, licence, status and the ids of its species | `pack.schema.json` |
| `data/dist/<id>.json` | the built pack: the manifest and the species in one file (format `vietar-pack`, version 1) | both schemas and the rules of section 7 |

`node scripts/pack.mjs` builds `data/dist/` from the other two; `node scripts/pack.mjs --check` fails when it is out of date. The page imports and downloads the built pack: a file downloaded from the tab “Create” or “Packs” is what you send for review, and `node scripts/pack.mjs --split vietar-pack-<id>.json` turns it back into species files and a manifest.

## 2. A species

```json
{
  "id": "colchicum-autumnale",
  "latin": "Colchicum autumnale",
  "kingdom": "plantae",
  "group": "herb",
  "names": { "en": "Meadow saffron", "ro": "Brândușă de toamnă", "de": "Herbstzeitlose" },
  "toxic": true,
  "toxic_note": { "en": "Very poisonous: contains colchicine. Eating any part can be fatal." },
  "notes": { "en": "Flowers in autumn; the leaves appear in spring." },
  "source": "Own notes, checked against a public flora",
  "look_alike": [
    { "id": "allium-ursinum", "note": { "en": "The leaves can be mistaken for each other. Confusing them has caused serious poisonings." } }
  ]
}
```

| Field | Needed | What it holds |
| --- | --- | --- |
| `id` | yes | the Latin name in lower case with hyphens (`Lynx lynx` is `lynx-lynx`), 3 to 80 characters; it is also the name of the file |
| `latin` | yes | the genus with a capital letter, then the species and, if you need it, a subspecies or variety: `Lynx lynx`; 5 to 80 characters |
| `kingdom` | yes | `animalia`, `plantae` or `fungi` |
| `group` | yes | animals: `mammal`, `bird`, `reptile`, `amphibian`, `fish`, `invertebrate` or `other`; plants: `tree`, `shrub`, `herb` or `other`; fungi: `fungus` or `other` |
| `names` | yes | language code (two or three lower-case letters) → name, at most 80 characters each; `en` is required; at most 24 languages |
| `toxic` | plants and fungi | `true` or `false`; animals may leave it out (the page says “No toxic flag given”) |
| `toxic_note` | when `toxic` is `true` (and only then) | language → text, at most 300 characters each: what the danger is |
| `notes` | no | language → text, at most 600 characters each; line breaks are allowed here and nowhere else |
| `source` | no | where the facts come from, at most 200 characters |
| `look_alike` | no | at most 8 entries `{ "id": …, "note": language → warning, at most 300 characters each }` |
| `photos` | no | at most 6 photos, see section 3 |
| `audio` | no | at most 6 sounds, see section 3 |

Rules that a schema cannot say, checked by the page and by `scripts/validate.py`:

- `toxic: false` only means that nobody marked the species as toxic. The page never shows it as green or as safe, and always adds a warning.
- A look-alike must be in the same pack and must list this species back, and nothing lists itself or lists the same species twice. The note says that they are confused and that the confusion is dangerous, never how to tell them apart.
- Texts have no control characters, no characters that change the direction of the text and no spaces at the start or the end. `<` and `&` are allowed and always shown as text, never as HTML.

## 3. Photos and sounds

```json
{
  "photos": [
    {
      "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNQ6lYCAAGiANAIO/QDAAAAAElFTkSuQmCC",
      "alt": { "en": "A grey stone on a path" },
      "author": "Example Author",
      "licence": "CC-BY-4.0",
      "source_url": "https://commons.wikimedia.org/wiki/File:Example.png",
      "commons_file": "File:Example.png"
    }
  ],
  "audio": [
    {
      "url": "https://xeno-canto.org/123456",
      "recordist": "Example Recordist",
      "licence": "CC-BY-4.0",
      "note": { "en": "Song, spring morning" }
    }
  ]
}
```

| Field | Needed | What it holds |
| --- | --- | --- |
| `photos[].data` | yes | the image itself as a data URI: `data:image/webp;base64,…` (or `jpeg`, `png`), at most 120,000 characters |
| `photos[].alt` | yes | language → what the picture shows, at most 200 characters each |
| `photos[].author` | yes | the author, at most 120 characters |
| `photos[].licence` | yes | `CC0-1.0`, `CC-BY-4.0`, `CC-BY-SA-4.0`, `CC-BY-3.0`, `CC-BY-SA-3.0` or `PDM-1.0` |
| `photos[].source_url` | no | an `https://` address of the source, at most 300 characters |
| `photos[].commons_file` | no | the file on Wikimedia Commons (`File:Name.jpg`): `scripts/check_licences.mjs --online` compares the licence and the author with Commons |
| `audio[].url` | yes | `https://xeno-canto.org/` and the number of the recording |
| `audio[].recordist` | yes | the person who recorded it, at most 120 characters |
| `audio[].licence` | yes | `CC0-1.0` or a Creative Commons licence as xeno-canto writes it (for example `CC-BY-NC-SA-4.0`) |
| `audio[].note` | no | language → text, at most 200 characters each |

The photos of one pack add up to at most 3,000,000 characters (about 3 MB). The page loads nothing from the network and plays no sound itself: photos are inside the file, and each sound is a link that opens xeno-canto.org in a new tab. Prepare a photo with `python3 scripts/optimize.py` (see `docs/contributor-guide.md`).

## 4. A pack manifest

```json
{
  "id": "xx-garden",
  "title": { "en": "A school garden", "ro": "Grădina școlii" },
  "description": { "en": "Plants and animals of one school garden. Draft: no expert has checked it." },
  "region": "XX",
  "version": "0.1.0",
  "updated": "2026-11-17",
  "licence": "CC0-1.0",
  "status": "draft",
  "authors": ["Class 5B"],
  "species": ["lynx-lynx", "allium-ursinum"],
  "count": 2
}
```

| Field | Needed | What it holds |
| --- | --- | --- |
| `id` | yes | a country code, a hyphen and a short name, in lower case (`ro-mammals`), 5 to 40 characters; it is also the name of the file |
| `title` | yes | language → title, at most 100 characters each; `en` is required |
| `description` | no | language → text, at most 300 characters each |
| `region` | yes | two capital letters (`RO`) |
| `version` | yes | three numbers separated by dots (`0.1.0`) |
| `updated` | yes | a real date, `YYYY-MM-DD` |
| `licence` | yes | `CC0-1.0`, `CC-BY-4.0` or `CC-BY-SA-4.0` |
| `status` | yes | `skeleton`, `draft` or `reviewed` (section 5) |
| `reviewed_by`, `reviewed_on` | when `status` is `reviewed` | who reviewed it (at most 120 characters) and the date |
| `authors` | no | at most 10 names of at most 80 characters each: a class or a club name is enough |
| `species` | yes | 1 to 2,000 species ids, without repeats |
| `count` | yes | the number of species, equal to the length of `species` |

## 5. Status

- `skeleton` (“Skeleton”): only a few species, there to show the format. Names are unchecked.
- `draft` (“Draft”): written with care or with an AI assistant and checked only in part. No expert has reviewed it. A pack made on the page, and a pack that someone sends, starts here.
- `reviewed` (“Reviewed”): a named reviewer says that they checked every species on the given date (see `docs/review-guide.md`). A review is still not a guarantee, and the page says so. The creator on the page can never set it.

## 6. A complete pack

This is what the page imports and downloads: the manifest fields, `format` and `format_version`, and the species themselves instead of their ids. It is a pack of two species that are confused with each other, so both list the other one:

```json
{
  "format": "vietar-pack",
  "format_version": 1,
  "id": "xx-garden",
  "title": { "en": "A school garden", "ro": "Grădina școlii" },
  "region": "XX",
  "version": "0.1.0",
  "updated": "2026-11-17",
  "licence": "CC0-1.0",
  "status": "draft",
  "authors": ["Class 5B"],
  "count": 2,
  "species": [
    {
      "id": "allium-ursinum",
      "latin": "Allium ursinum",
      "kingdom": "plantae",
      "group": "herb",
      "names": { "en": "Ramsons (wild garlic)", "ro": "Leurdă" },
      "toxic": false,
      "look_alike": [
        { "id": "colchicum-autumnale", "note": { "en": "The leaves can be mistaken for each other. Confusing them has caused serious poisonings." } }
      ]
    },
    {
      "id": "colchicum-autumnale",
      "latin": "Colchicum autumnale",
      "kingdom": "plantae",
      "group": "herb",
      "names": { "en": "Meadow saffron", "ro": "Brândușă de toamnă" },
      "toxic": true,
      "toxic_note": { "en": "Very poisonous: contains colchicine. Eating any part can be fatal." },
      "look_alike": [
        { "id": "allium-ursinum", "note": { "en": "The leaves can be mistaken for each other. Confusing them has caused serious poisonings." } }
      ]
    }
  ]
}
```

To try a pack on the page, use the tab “Packs” → “Import”: paste the JSON or choose the file. The whole pack is checked first; if anything is wrong, nothing is imported and the page lists what to fix.

## 7. Limits and problems

The page keeps these limits:

- an imported text of at most 6,000,000 characters (about 6 MB);
- imported packs of at most 4,000,000 characters in all in the browser, and at most 12 packs;
- a pack of 1 to 2,000 species, and a draft in the tab “Create” of at most 400 species;
- photos of at most 3,000,000 characters in a pack;
- a list that shows 24 species at a time.

The page and the scripts report a problem by a code. The first table holds the codes that both report, with the message of the page; the second one holds the codes that only the scripts report.

| Code | Message of the page |
| --- | --- |
| `type` | wrong kind of value |
| `missing` | required field is missing |
| `extra` | unknown field |
| `length` | too short, too long, or the wrong number of items |
| `pattern` | does not have the required form |
| `enum` | not one of the allowed values |
| `text` | contains forbidden characters, or spaces at the ends |
| `date` | not a real date (use YYYY-MM-DD) |
| `id_slug` | the id must be the Latin name in lower case with hyphens |
| `group_kingdom` | this group does not belong to this kingdom |
| `toxic_required` | plants and fungi must say whether they are toxic |
| `toxic_note_required` | a species marked toxic needs a toxicity note |
| `toxic_note_unused` | a toxicity note is only allowed on a species marked toxic |
| `look_self` | a species cannot be its own look-alike |
| `look_dup` | the same look-alike is listed twice |
| `look_unknown` | the look-alike is not in this pack |
| `look_asym` | the look-alike does not list this species back |
| `dup_species` | the same species appears twice |
| `count_mismatch` | the count does not match the number of species |
| `review_missing` | a reviewed pack needs the reviewer and the review date |
| `photo_budget` | the photos are too big together (limit 3 MB) |
| `format` | not a vietar-pack file (wrong format or version) |
| `species_unknown` | the species is not in the list |

| Code | Only the scripts report it |
| --- | --- |
| `json` | the file is not valid JSON |
| `schema` | the file does not follow the schema (`scripts/validate.py` says where) |
| `file_name` | the name of the file is not its id |
| `species_orphan` | a species file is in no pack |
| `dist_missing` | a pack has no built file in `data/dist/` |
| `dist_stale` | a built file differs from what `node scripts/pack.mjs` would write, or has no manifest |
