# VietAR Packs

[English](README.md) · [Română](README.ro.md) · **Français** · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Version : 0.2.1 · Dernière mise à jour : 2026-11-20

🌐 https://vietar-packs.chiuta.ro

> Paquets régionaux d'espèces pour VietAR : noms, photos et sons de la faune et de la flore locales.

Trade-free : sans suivi, sans publicité, sans compte, fonctionne hors ligne.

## État

Alpha, utilisable : l’unique `index.html` parcourt, importe, vérifie et crée des paquets régionaux d’espèces : noms en plusieurs langues, un indicateur de toxicité, des sosies dangereux, des photos sous licence et des liens vers des sons de xeno-canto. Il contient cinq paquets de départ intégrés, avec 71 espèces au total (Roumanie : 19 plantes et champignons, 17 oiseaux et 15 mammifères ; Bulgarie et Moldavie : les mêmes 10 espèces répandues chacune, en squelettes). Chaque paquet intégré est un brouillon ou un squelette : les noms et les notes ont été rédigés avec un assistant IA et vérifiés en partie seulement, aucun biologiste, mycologue ni locuteur natif ne les a relus, et ils ne contiennent encore ni photos ni liens vers des sons. La page n’identifie rien et n’est pas un guide de terrain : la mention « Non signalée toxique » ne veut jamais dire qu’on peut manger ou toucher sans danger. L’application VietAR ne peut pas encore importer ces paquets.

## Ce que fait l’application

- « Parcourir » : choisissez un paquet, cherchez par un nom dans n’importe quelle langue ou par le nom latin (majuscules et accents sans importance), filtrez par groupe et par indicateur de toxicité, puis ouvrez une espèce : ses noms (dans la langue de la page, avec l’anglais en repli), l’indicateur et la note de toxicité, les notes, la source, les espèces avec lesquelles on la confond souvent (chacune est un lien), les photos et les liens vers des sons. Un encadré rouge de sécurité reste visible dans chaque onglet et dit ce que la page n’est pas.
- « Paquets » : les paquets intégrés et ceux que vous importez (collez le JSON ou choisissez un fichier ; 12 au plus à la fois), chacun avec sa région, sa version, sa licence, ses auteurs, un badge d’état honnête (« Squelette », « Brouillon », « Relu ») et le nombre d’espèces par groupe ; téléchargez n’importe quel paquet ou supprimez ceux que vous avez importés. Un paquet est vérifié en entier avant d’être ajouté : si quelque chose cloche, rien n’est importé et vous voyez ce qu’il faut corriger.
- « Créer » : composez un paquet pour une classe, un club nature ou une région : remplissez le paquet, ajoutez les espèces une à une (jusqu’à 400), reliez les sosies dans les deux sens, vérifiez le paquet avec les mêmes règles que le dépôt et téléchargez le fichier. Le brouillon reste dans ce navigateur pendant que vous travaillez. Un paquet fait ici ne peut jamais être marqué comme relu ; les photos et les sons s’ajoutent par le JSON de l’espèce.
- « Guide » : comment utiliser la page, et un exemple d’espèce avec une photo et un son.
- Format : un fichier JSON par espèce dans `data/species/`, un manifeste par paquet dans `data/packs/`, assemblés en paquets complets (format `vietar-pack`) dans `data/dist/` ; décrits par `schema.json` et `pack.schema.json` et expliqués dans `docs/pack-format.md`.
- Outils pour les contributeurs : `scripts/pack.mjs` (assemble les paquets et découpe en fichiers un paquet téléchargé), `scripts/validate.py`, `scripts/optimize.py` (une photo en WebP de 640 px au plus, sans métadonnées), `scripts/check_licences.mjs` (licences des photos, en ligne avec `--online`). L’interface existe en huit langues et se manie au clavier et avec un lecteur d’écran.
- Installable comme une application et disponible hors ligne après la première visite lorsqu’elle est servie en HTTPS (un service worker conserve la page ; rien d’autre n’est stocké ni envoyé). Ouverte depuis un fichier téléchargé, elle fonctionne de la même manière, sans installation.

## Comment ça marche

- Un fichier d’espèce et un manifeste (la liste des identifiants d’espèces et leur nombre) deviennent un paquet complet : `node scripts/pack.mjs` l’écrit dans `data/dist/<id>.json`. La page embarque `data/dist/` : ce que vous parcourez est exactement ce que vous téléchargez.
- `schema.json` et `pack.schema.json` décrivent les fichiers ; `scripts/validate.py` les applique, avec les règles qu’un schéma ne peut pas dire : le nom du fichier, l’identifiant et le nom latin concordent, le groupe correspond au règne, les plantes et les champignons disent s’ils sont toxiques, une espèce toxique a une note de toxicité, les sosies se désignent mutuellement, les photos tiennent en 3 Mo, un paquet relu nomme son relecteur et la date. `src/engine.mjs` applique les mêmes règles dans la page ; les tests comparent les deux.
- Sûre par construction : le texte d’un paquet s’affiche toujours comme du texte, jamais comme du HTML ; les liens n’ouvrent que des adresses `https://` ; la page ne fait aucune requête réseau (les photos sont intégrées, les sons sont des liens qui ouvrent xeno-canto.org dans un nouvel onglet) ; un paquet importé et l’état enregistré sont revérifiés au chargement de la page, donc un état abîmé ou hostile est refusé, non cru.
- `src/ui.js`, `src/i18n.mjs` et `src/app.css` forment l’interface ; `scripts/build.mjs` construit l’unique `index.html` à partir de `src/` et embarque les paquets de `data/dist/` ; `node scripts/build.mjs --check` échoue si la page n’est plus à jour.
- Tests : `npm test` (moteur, parité avec le validateur, scripts, vérificateur de licences, optimiseur de photos, documentation) et tests de navigateur dans le hub (huit langues, accessibilité, imports hostiles, limites, stockage plein). Le développement demande Node.js 24 ou plus récent et Python 3 avec `jsonschema` (Pillow seulement pour l’optimiseur de photos) ; la page elle-même demande un navigateur qui connaît ES2017.
- `manifest.webmanifest`, `sw.js` et les icônes sont produits par `node scripts/build.mjs` via le kit commun (section `pwa` de `src/app.json`) ; `--check` les vérifie aussi, et `npm test` contrôle que le manifeste, la version du service worker et la CSP correspondent à la page.

## Limites honnêtes

- Les paquets intégrés sont des brouillons : noms et notes ont été rédigés avec un assistant IA à partir de connaissances générales et vérifiés en partie seulement sur des pages publiques. Aucun biologiste, mycologue ni locuteur natif ne les a relus. Les paquets bulgare et moldave sont des squelettes de 10 espèces chacun.
- « Non signalée toxique » signifie seulement que personne n’a marqué l’espèce comme toxique dans ce paquet. Ce n’est jamais l’affirmation qu’une plante ou un champignon est comestible ou sans danger, et les paquets n’apprennent pas à distinguer les sosies. Ne mangez jamais une plante ou un champignon sauvage à cause de cette page.
- Les paquets intégrés ne contiennent ni photos ni liens sonores, car les licences et les numéros d’enregistrement n’ont pas pu être vérifiés hors ligne. Le format accepte les deux, avec auteur, licence et source.
- Les paquets importés ici ne sont conservés que dans ce navigateur ; effacer les données du site les supprime. Téléchargez ceux auxquels vous tenez.
- L’application VietAR ne peut pas encore importer ces paquets. Pour l’instant, les paquets sont lus et vérifiés sur cette page et par les scripts du dépôt.
- Les traductions de l’interface ont été écrites par une machine et n’ont pas été relues par des locuteurs natifs. Les noms et notes des espèces s’affichent dans la langue du paquet, avec l’anglais en repli.

## Contribuer en 5 minutes

1. Faites un fork de ce dépôt.
2. Créez ou complétez un paquet : dans la page, utilisez l’onglet « Créer » et téléchargez le fichier, ou écrivez à la main des fichiers `data/species/<nom-latin>.json` (voir `docs/pack-format.md`).
3. Transformez un paquet téléchargé en fichiers avec `node scripts/pack.mjs --split vietar-pack-<id>.json`, ou ajoutez les identifiants des nouvelles espèces au manifeste du paquet dans `data/packs/`.
4. Lancez `node scripts/pack.mjs`, `python3 scripts/validate.py`, `npm test` et `node scripts/build.mjs`.
5. Ouvrez une pull request — les contributions de données n’exigent pas de programmer. Donnez une source pour chaque nom, chaque note et chaque indicateur de toxicité, et ne marquez jamais vous-même un paquet comme relu (voir `docs/review-guide.md`).

## Bonnes premières tâches

Voir `ISSUES_GOOD_FIRST.md` pour des tâches toutes prêtes.

## Licence

Code : MIT. Données : chaque paquet indique sa propre licence (CC0-1.0, CC-BY-4.0 ou CC-BY-SA-4.0) ; les paquets intégrés sont sous CC0-1.0. Les photos et les sons gardent leur propre licence : chacun nomme son auteur, sa licence et sa source. Données contribuées : indiquez la source ; elles sont publiées sous la licence du paquet auquel elles s’ajoutent.

## Soutien

Si ce projet vous est utile, vous pouvez [m'offrir un café](https://buymeacoffee.com/echo.of.the.strings).
