# VietAR Packs

**English** · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Version: 0.1.0 · Last updated: 2026-11-14

🌐 https://vietar-packs.chiuta.ro

> Regional species packs for VietAR: names, photos and sounds of local wildlife and plants.

Trade-free: no tracking, no ads, no accounts, works offline.

## Status

Alpha: the repository holds the structure, the data schema or the first examples and the contribution guides. The scope below is the plan, not what works today.

## Planned scope

- A pack format specification: a `pack.json` manifest with region, version and count.
- Species packs for Romania: about 30 mammals of the Carpathians with names in en/ro/hu/de, about 50 common birds with audio links (Xeno-canto, CC-BY), and about 40 wild plants and mushrooms with a `toxic` flag.
- Pack skeletons for Bulgaria and Moldova with 20 species each.
- A `look-alike` field linking dangerous species pairs.
- Tooling: a photo licence checker against the Wikimedia Commons API, an image optimiser (WebP, max 640 px) and a guide for a school class to add a local pack.

None of this is implemented yet: each item is a ready-made task in `ISSUES_GOOD_FIRST.md`.

## Contribute in 5 minutes

1. Fork this repository.
2. Copy `data/species/example.json` into `data/species/` and edit it.
3. Run `python scripts/validate.py`.
4. Open a pull request — data contributions need no coding.

## Good first issues

See `ISSUES_GOOD_FIRST.md` for ready-made tasks.

## License

Code: MIT. Contributed data: state its source; it is released under the same licence unless the file says otherwise.

## Support

If this project is useful, you can [buy me a coffee](https://buymeacoffee.com/echo.of.the.strings).

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

Add yourself with `@all-contributors please add @you for data` in your pull request.
