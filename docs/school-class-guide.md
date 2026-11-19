# A school class makes a local pack · VietAR Packs

Version: 0.2.1 · Last updated: 2026-11-20 · [Română](school-class-guide.ro.md)

This guide is for a teacher or the leader of a nature club. A class makes a pack of the plants, animals and mushrooms of one place near the school (a schoolyard, a park, a stream), learns their names in several languages and learns why a pack is only as good as its sources. No coding is needed: one computer with a browser is enough.

**Safety first.** A pack is a list of names. It does not teach anyone to identify a plant or a mushroom, and nobody should taste, eat or handle a wild plant or mushroom because of it: many harmless-looking species have deadly look-alikes. A pack made by a class is a draft that no expert has checked.

## 1. Before the first lesson

- Choose the place and the size. Ten to thirty species is a good first pack; the creator accepts up to 400.
- Choose the pack id: a country code, a hyphen and a short name, in lower case, with letters and digits only (`ro-school-park`). It cannot be changed without making a new pack.
- Give roles: observers who write down only what they really saw, writers who fill in the page, checkers who look every name up in a book, and the teacher, who answers for the toxic flags together with an expert.
- Agree on the sources. A flora, a field guide or the page of a poison centre are sources to read, not texts to copy: the class writes its own notes and says where the facts come from.
- Protect the pupils. Put the name of the class or the school in the authors, not the full names of children, unless their parents agree. Add no photos of people and no location data.

## 2. The observation sheet

Print one sheet per species. The pupils fill it in outdoors and the writers copy it into the page:

```
Latin name:
Names (English, our language, others):
Plant, animal or mushroom?
Where and when we saw it:
Where the name comes from (book and page):
Toxic? Ask the teacher; write the source:
```

## 3. In the page, step by step

1. Open the page and the tab “Create”. Fill in “The pack”: the id, the title in English (and, if you wish, in your own language with its language code), the region (two capital letters, for example `RO`), the version, the licence and the authors. The status stays “Draft”: the creator cannot set “Reviewed”. The licence `CC0-1.0` lets anyone reuse the pack without conditions; `CC-BY-4.0` asks them to name the authors.
2. Add one species at a time under “Add or edit a species”: the Latin name (the page makes the id from it), the kingdom and the group, the names in the languages you know, and a source. Press “Add species”.
3. For plants and fungi you must answer “Toxic?”. Answer “No: not marked toxic” only when a reliable source says that the species is not known to be poisonous; even then the page will show “Not marked toxic”, which is not the same as edible. When nobody can tell, leave the species for later: a pack may hold only species whose flag someone could check.
4. For a species that is marked toxic, write the toxicity note: what the danger is, in your own words, from a reliable source.
5. Link look-alikes only with the help of the teacher or an expert, and only pairs that people really confuse. Under “Look-alikes” choose the two species, write a warning such as “The leaves can be mistaken for each other. Confusing them has caused serious poisonings.” and press “Link them”. The page saves the link on both species. Never write how to tell them apart.
6. Under “Check and download” fix every problem the page lists (each one says where it is), then press “Download the pack”. The file is called `vietar-pack-<id>.json`.
7. The draft is kept in this browser, on this computer, while you work. Download the pack at the end of every lesson. The creator cannot open a downloaded file again, so go on working on the same computer and browser, or hand the file to a maintainer (see section 6).
8. To use the pack in class, press “Add to my packs here”: it appears under the tab “Packs” and in “Browse”. On another computer, use the tab “Packs” → “Import” with the downloaded file.

## 4. Photos and sounds (optional)

- Use only photos the pupils took themselves of plants and animals (never of people), or photos in the public domain or under a licence listed in `docs/pack-format.md`. Name the author, the licence and the source of every photo.
- Make a photo small and free of location data with `python3 scripts/optimize.py` (older pupils or the teacher; see `docs/contributor-guide.md`), then add it through the box “This species as JSON (for photos and sounds)” and press “Apply JSON”.
- A sound is only a link to a recording on xeno-canto.org that someone has listened to, with the name of the recordist and the licence.

## 5. Have an expert look at it

Ask a biology teacher, a forester, a ranger of a nature reserve, a botanical or mycological society, or a poison centre to read the pack in the tab “Browse” and say what is wrong. Tell them plainly that it is a draft made by a class. Only a reviewer who has checked every species may mark a pack as reviewed, and not in the creator: see `docs/review-guide.md`.

## 6. Send it to the project (optional)

Open an issue with the template “New species, pack, photo or sound” and attach the downloaded file, or send a pull request. A maintainer checks the file, turns it into species files (`node scripts/pack.mjs --split`) and asks for a review before it can join the built-in packs. Until then your pack stays a draft and is used only by your class.

## 7. What to tell the pupils

- The pack lists names; it does not tell you what is safe.
- Never taste, pick to eat or handle a wild plant or a mushroom because of an app, a photo or a list. Ask an expert who can see the real plant.
- “Not marked toxic” means only that nobody marked it. It never means that it is safe to eat or to touch.
- A name in our own language is only as good as the book it came from. If two books disagree, write down both.

## 8. Limits of the creator

- One draft per browser; it is lost when the site data are cleared, and the page warns you when the browser has no room left.
- A draft holds at most 400 species and a species at most 8 look-alikes.
- A downloaded file cannot be opened again in the creator.
- Photos and sounds are added only through the JSON of a species.
- The interface translations were written by a machine and not reviewed by native speakers.
