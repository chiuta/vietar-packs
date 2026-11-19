# Contribuer — VietAR Packs

[English](CONTRIBUTING.md) · [Română](CONTRIBUTING.ro.md) · **Français** · [Italiano](CONTRIBUTING.it.md) · [Español](CONTRIBUTING.es.md) · [Português](CONTRIBUTING.pt.md) · [Deutsch](CONTRIBUTING.de.md) · [Magyar](CONTRIBUTING.hu.md)

Version : 0.2.1 · Dernière mise à jour : 2026-11-20

1. Faites un fork de ce dépôt.
2. Créez ou complétez un paquet : dans la page, utilisez l’onglet « Créer » et téléchargez le fichier, ou écrivez à la main des fichiers `data/species/<nom-latin>.json` (voir `docs/pack-format.md`).
3. Transformez un paquet téléchargé en fichiers avec `node scripts/pack.mjs --split vietar-pack-<id>.json`, ou ajoutez les identifiants des nouvelles espèces au manifeste du paquet dans `data/packs/`.
4. Lancez `node scripts/pack.mjs`, `python3 scripts/validate.py`, `npm test` et `node scripts/build.mjs`.
5. Ouvrez une pull request — les contributions de données n’exigent pas de programmer. Donnez une source pour chaque nom, chaque note et chaque indicateur de toxicité, et ne marquez jamais vous-même un paquet comme relu (voir `docs/review-guide.md`).

## Règles

- Une espèce = un fichier dans `data/species/`, nommé d’après son identifiant (le nom latin en minuscules avec des tirets).
- Citez toujours une source.
- Ne contribuez qu'avec du matériel que vous pouvez légalement partager (pas de texte protégé copié).
- Soyez bienveillant : voir le Code de conduite.

## Ajouter des espèces et des paquets

1. Partez d’une source que vous avez le droit d’utiliser : vos propres connaissances et observations, ou des pages publiques dont la licence autorise la réutilisation (notez l’adresse et la date). Ne copiez pas de texte de guides de terrain, d’applications ou de sites, sauf si la licence l’autorise : rédigez la note avec vos mots et dites-le dans `source`.
2. N’écrivez un nom que dans une langue que vous connaissez ou que vous pouvez vérifier avec un locuteur natif ou un dictionnaire fiable. L’anglais est obligatoire ; la page montre d’abord la langue du lecteur et l’anglais en repli.
3. Pour les plantes et les champignons, `toxic` est obligatoire. Écrivez `true` quand une partie de l’espèce est connue pour être vénéneuse, et rédigez une note de toxicité qui dit quel est le danger. `false` signifie seulement que personne n’a marqué l’espèce comme toxique ici : cela ne veut jamais dire comestible. Dans le doute, demandez à un spécialiste local avant d’écrire `false`.
4. Indiquez une paire dangereuse de sosies sur les deux espèces, avec une note d’avertissement du genre « Les feuilles peuvent être confondues ; cette confusion a causé de graves intoxications ». Dites qu’elles se confondent, jamais comment les distinguer : un mauvais conseil peut tuer.
5. Photos : les vôtres, du domaine public ou sous une licence de la liste de `docs/pack-format.md`, chacune avec son auteur, sa licence et un lien vers sa source ; réduisez-les avec `python3 scripts/optimize.py` (WebP, 640 px au plus, sans données de lieu) et vérifiez les photos de Wikimedia Commons avec `node scripts/check_licences.mjs --online`. Sons : uniquement des liens vers xeno-canto.org que vous avez écoutés, avec l’enregistreur et la licence.
6. Un nouveau paquet est un `draft` (ou un `skeleton` quand il ne fait que montrer le format). Seul un relecteur qui a vérifié chaque espèce peut mettre `reviewed`, avec son nom et la date : voir `docs/review-guide.md`.
7. Pour aller plus loin : `docs/contributor-guide.md` (commandes, fichiers, vérifications), `docs/school-class-guide.md` (une classe ou un club crée un paquet) et `docs/pack-format.md` (chaque champ et chaque limite).
