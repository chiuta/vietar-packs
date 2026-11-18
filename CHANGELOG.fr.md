# Journal des modifications

[English](CHANGELOG.md) · [Română](CHANGELOG.ro.md) · **Français** · [Italiano](CHANGELOG.it.md) · [Español](CHANGELOG.es.md) · [Português](CHANGELOG.pt.md) · [Deutsch](CHANGELOG.de.md) · [Magyar](CHANGELOG.hu.md)

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · [SemVer](https://semver.org/).

## [Non publié]

### Ajouté
- `scripts/check_licences.mjs --api URL` : un autre point d'accès MediaWiki à la place de Commons ; le test CLI « sans réseau » utilise désormais un port local fermé et ne dépend donc plus de l'accès à Internet de la machine.

## [0.2.0] - 2026-11-17

### Ajouté
- La page : les onglets « Parcourir », « Paquets », « Créer » et « Guide » en huit langues, avec un encadré rouge de sécurité toujours visible, des raccourcis clavier et la prise en charge des lecteurs d’écran.
- Le visualiseur : recherche dans n’importe quelle langue (majuscules et accents ignorés), filtres par groupe et par indicateur de toxicité, fiches d’espèces avec noms, indicateur et note de toxicité, notes, source, sosies (sous forme de liens), photos et liens vers des sons ; « Non signalée toxique » n’apparaît jamais en vert et s’accompagne toujours d’un avertissement.
- Paquets : import (collé ou fichier, vérifié en entier avant tout ajout), téléchargement, suppression et remplacement par identifiant ; nombre d’espèces par groupe ; badges d’état honnêtes (« Squelette », « Brouillon », « Relu ») avec leur signification.
- Le créateur : un formulaire de paquet, un formulaire d’espèce avec noms en plusieurs langues, indicateur et notes de toxicité, sosies reliés dans les deux sens, un éditeur JSON pour les photos et les sons, une vérification, un téléchargement et un brouillon conservé dans le navigateur (avec un avertissement quand le navigateur manque de place).
- Le format des paquets : `schema.json` (une espèce), `pack.schema.json` (un manifeste), paquets assemblés dans `data/dist/` (format `vietar-pack`, version 1) et `data/dist/example.json` comme exemple de format.
- Cinq paquets de départ intégrés, avec 71 espèces : Roumanie (19 plantes et champignons, 17 oiseaux, 15 mammifères) et squelettes pour la Bulgarie et la Moldavie (les mêmes 10 espèces chacun) ; des brouillons rédigés avec un assistant IA et vérifiés en partie seulement, sans photos ni liens vers des sons.
- `scripts/pack.mjs` (assemblage, `--check`, `--split`), `scripts/validate.py` (les mêmes règles que la page, pour chaque fichier et chaque paquet assemblé), `scripts/optimize.py` (photos) et `scripts/check_licences.mjs` (licence et auteur des photos ; `--online` interroge Wikimedia Commons).
- Guides en anglais et en roumain : `docs/pack-format.md`, `docs/school-class-guide.md`, `docs/contributor-guide.md` et `docs/review-guide.md`.
- `src/` et `scripts/build.mjs` : l’unique `index.html` est désormais construit à partir des sources, avec les paquets de `data/dist/` embarqués, et `--check` le vérifie.
- Tests : `npm test` et tests de navigateur dans le hub.
- ISSUES_GOOD_FIRST et CODE_OF_CONDUCT traduits dans les huit langues.
- README en anglais, roumain, français, italien, espagnol, portugais, allemand et hongrois : sections d’état et de périmètre prévu (dérivées de `ISSUES_GOOD_FIRST.md`).
- Installable (PWA) : `manifest.webmanifest`, `sw.js` et les icônes sont générés par le kit commun (`fff-kit/pwa`) ; la page fonctionne hors ligne après la première visite en HTTPS.

### Modifié
- Le workflow tourne sur Ubuntu 26.04 et Node.js 26, et lance la vérification des paquets, le validateur, les tests et la vérification de la construction.
- Les données sont désormais un fichier par espèce et un manifeste par paquet (`data/species/`, `data/packs/`), assemblés dans `data/dist/` ; `data/species/example.json` est remplacé par `data/dist/example.json`, et `scripts/validate.py`, les étapes du README et les modèles ont changé en conséquence.
- La liste des « good first issues » contient maintenant ce qui reste à faire (plus d’espèces, relecture par des spécialistes, photos, sons, traductions) ; la spécification du format, le champ des sosies, l’optimiseur de photos, le vérificateur de licences et le guide pour les classes, qu’elle énumérait avant, existent.

## [0.1.0] - 2026-11-13

### Ajouté
- Squelette initial : structure, schéma de données ou premiers exemples, guides de contribution en huit langues.
