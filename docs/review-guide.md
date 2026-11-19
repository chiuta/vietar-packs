# Review guide · VietAR Packs

Version: 0.2.1 · Last updated: 2026-11-20 · [Română](review-guide.ro.md)

This guide is for the person who reviews a pack so that it can be marked “Reviewed”, and for anyone who wants to know what that word promises. The built-in packs are drafts today: no expert has reviewed them, and this guide is how that changes.

## 1. What “Reviewed” means

A pack marked `reviewed` says that a named person with the right knowledge checked every species of the pack, on a given date, against reliable sources, and fixed or removed what was wrong. The page then shows who reviewed it and when, and adds that a review is still not a guarantee.

It does not mean that the pack is complete, that it can identify anything, or that the species marked “Not marked toxic” are safe to eat or to touch. It never replaces a local expert who holds the real plant or mushroom in their hands.

## 2. Who can review

- Plants and trees: a botanist, a forester or someone who works with the flora of the region.
- Fungi: a mycologist or an experienced member of a mycological society. The toxic flags and the look-alikes of fungi need a second person too, because a mistake can be fatal.
- Animals: a zoologist, an ornithologist or a ranger.
- Names in a language: a native speaker can review the names of that language, but not the toxic flags.
- Toxic flags and toxicity notes: a person with expertise in toxicology or in the group, or the published information of a poison centre.

Nobody reviews their own work: the person who wrote a species cannot be the only person who checks it.

## 3. What to check in every species

1. The Latin name is valid and current (check a recognised checklist or flora and write down which one), and the kingdom and the group are right.
2. Every name is a name that people really use for this species in that language. A name that belongs to another species is removed.
3. The toxic flag. `true` only when a reliable source says so. `false` only when a reliable source says that the species is not known to be poisonous, and ask yourself whether a reader could take it for “safe”. No plant and no fungus is left without a flag.
4. The toxicity note says what the danger is (which part, which effect) and neither exaggerates nor plays it down.
5. The look-alikes. Are the well-known dangerous pairs listed, on both species? Does every note warn without teaching how to tell the two apart?
6. The notes and the source: the facts are right, the sources are named, and no text is copied from a source that does not allow it.
7. Each photo shows this species, and its author, licence and source are right (`node scripts/check_licences.mjs --online` for Commons photos). No people, no location data.
8. Each sound is a recording of this species (listen to it), and the recordist and the licence match xeno-canto.

## 4. What to check in the pack

The title, the region, the description (it must not promise more than the pack holds), the licence (the data may be shared under it), the authors, the version and the count. A pack holds no species that nobody could check: remove it, or leave the pack as a draft.

## 5. The record

Write the record in the pull request; the template has the same fields:

```
Reviewer: <name>, <expertise>, <institution or club>
Pack: <pack id>, version <x.y.z>
Species checked: <N> of <N>, one by one
Sources: <flora, checklist, poison centre, dictionary …>
Toxic flags and look-alikes: checked by <name>, expertise <…>
Differences found and fixed: <none | list>
Not checked: <…>
```

Then set in the manifest of the pack: `status` to `reviewed`, `reviewed_by` to the name and the expertise (at most 120 characters), `reviewed_on` to the date, a new `version` and `updated`. The page and `scripts/validate.py` refuse a `reviewed` pack without the reviewer and the date.

## 6. After the review

A review covers the species and the texts as they were on that date. If anyone changes a species of the pack later (a name, a flag, a note, a look-alike, a photo), or adds one, the pack goes back to `draft` until a reviewer has checked the change. The page cannot tell what changed since the review, so the people who maintain the pack keep this rule. Review a pack again when the sources change and, in any case, every few years: names and notes can become wrong.

## 7. If you find a danger

If you find a wrong toxic flag or a missing dangerous look-alike, tell the maintainers at once with an issue titled “Safety: …”, before you finish the rest of the review. A pack with a known wrong flag is set back to `draft` until it is fixed.
