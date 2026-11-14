# VietAR Packs

[English](README.md) · [Română](README.ro.md) · **Français** · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

Version : 0.1.0 · Dernière mise à jour : 2026-11-14

🌐 https://vietar-packs.chiuta.ro

> Paquets régionaux d'espèces pour VietAR : noms, photos et sons de la faune et de la flore locales.

Trade-free : sans suivi, sans publicité, sans compte, fonctionne hors ligne.

## État

Alpha : le dépôt contient la structure, le schéma de données ou les premiers exemples et les guides de contribution. Le périmètre ci-dessous est le plan, pas ce qui fonctionne aujourd’hui.

## Périmètre prévu

- Une spécification du format de paquet : un manifeste `pack.json` avec région, version et nombre d’espèces.
- Des paquets d’espèces pour la Roumanie : environ 30 mammifères des Carpates avec noms en en/ro/hu/de, environ 50 oiseaux communs avec liens audio (Xeno-canto, CC-BY) et environ 40 plantes et champignons sauvages avec un indicateur `toxic`.
- Des squelettes de paquets pour la Bulgarie et la Moldavie, avec 20 espèces chacun.
- Un champ `look-alike` reliant les paires d’espèces dangereuses.
- Des outils : un vérificateur de licences photo via l’API Wikimedia Commons, un optimiseur d’images (WebP, 640 px max) et un guide pour qu’une classe ajoute un paquet local.

Rien de tout cela n’est encore implémenté : chaque point est une tâche prête dans `ISSUES_GOOD_FIRST.md`.

## Contribuer en 5 minutes

1. Forkez ce dépôt.
2. Copiez `data/species/example.json` dans `data/species/` et modifiez-le.
3. Lancez `python scripts/validate.py`.
4. Ouvrez une pull request — aucune programmation n'est nécessaire pour les données.

## Bonnes premières tâches

Voir `ISSUES_GOOD_FIRST.md` pour des tâches toutes prêtes.

## Licence

Code : MIT. Données contribuées : indiquez la source ; elles sont publiées sous la même licence sauf mention contraire.

## Soutien

Si ce projet vous est utile, vous pouvez [m'offrir un café](https://buymeacoffee.com/echo.of.the.strings).
