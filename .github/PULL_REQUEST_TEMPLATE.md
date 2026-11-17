## What does this change?

- [ ] `node scripts/pack.mjs --check` and `python3 scripts/validate.py` pass (the second needs `pip install jsonschema`)
- [ ] `npm test` passes
- [ ] `node scripts/build.mjs` was run and `index.html` is committed (`node scripts/build.mjs --check` passes)
- [ ] I cited a source for every name, note and toxic flag
- [ ] I may legally share this material (my own work, public domain or an open licence); every photo and sound names its author, licence and source, and `node scripts/check_licences.mjs` passes
- [ ] Every species marked toxic has a toxicity note, every dangerous look-alike pair is listed on both species, and no note teaches how to tell look-alikes apart
- [ ] New or changed packs stay `draft` or `skeleton`; I did not set `reviewed` myself
- [ ] A pack set to `reviewed` carries the record described in section 5 of `docs/review-guide.md` (below)

### Record of the review (only when a pack is set to `reviewed`)

```
Reviewer: <name>, <expertise>, <institution or club>
Pack: <pack id>, version <x.y.z>
Species checked: <N> of <N>, one by one
Sources: <flora, checklist, poison centre, dictionary …>
Toxic flags and look-alikes: checked by <name>, expertise <…>
Differences found and fixed: <none | list>
Not checked: <…>
```
