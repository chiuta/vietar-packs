# Mitmachen — VietAR Packs

[English](CONTRIBUTING.md) · [Română](CONTRIBUTING.ro.md) · [Français](CONTRIBUTING.fr.md) · [Italiano](CONTRIBUTING.it.md) · [Español](CONTRIBUTING.es.md) · [Português](CONTRIBUTING.pt.md) · **Deutsch** · [Magyar](CONTRIBUTING.hu.md)

Version: 0.2.0 · Letzte Aktualisierung: 2026-11-17

1. Forke dieses Repository.
2. Erstelle oder erweitere ein Paket: Nutze auf der Seite den Reiter „Erstellen“ und lade die Datei herunter, oder schreibe Dateien `data/species/<lateinischer-name>.json` von Hand (siehe `docs/pack-format.md`).
3. Mache aus einem heruntergeladenen Paket Dateien mit `node scripts/pack.mjs --split vietar-pack-<id>.json`, oder trage die IDs der neuen Arten in das Manifest des Pakets in `data/packs/` ein.
4. Führe `node scripts/pack.mjs`, `python3 scripts/validate.py`, `npm test` und `node scripts/build.mjs` aus.
5. Öffne einen Pull Request — Datenbeiträge brauchen keine Programmierung. Gib für jeden Namen, Hinweis und jede Giftigkeitsangabe eine Quelle an und markiere ein Paket nie selbst als geprüft (siehe `docs/review-guide.md`).

## Regeln

- Eine Art = eine Datei in `data/species/`, benannt nach ihrer ID (dem lateinischen Namen in Kleinbuchstaben mit Bindestrichen).
- Gib immer eine Quelle an.
- Steuere nur Material bei, das du rechtmäßig teilen darfst (keine kopierten geschützten Texte).
- Sei freundlich: siehe Verhaltenskodex.

## Arten und Pakete hinzufügen

1. Gehe von einer Quelle aus, die du nutzen darfst: deinem eigenen Wissen und deinen Beobachtungen oder öffentlichen Seiten, deren Lizenz die Weiterverwendung erlaubt (notiere Adresse und Datum). Kopiere keinen Text aus Bestimmungsbüchern, Apps oder Websites, es sei denn, die Lizenz erlaubt es: Schreibe den Hinweis mit eigenen Worten und sage das in `source`.
2. Schreibe einen Namen nur in einer Sprache, die du kennst oder mit Menschen, die sie als Muttersprache sprechen, oder einem verlässlichen Wörterbuch prüfen kannst. Englisch ist Pflicht; die Seite zeigt zuerst die Sprache der Lesenden und Englisch als Rückfall.
3. Bei Pflanzen und Pilzen ist `toxic` Pflicht. Schreibe `true`, wenn bekannt ist, dass irgendein Teil der Art giftig ist, und schreibe einen Giftigkeitshinweis, der sagt, worin die Gefahr besteht. `false` heißt nur, dass hier niemand die Art als giftig markiert hat: Es heißt nie essbar. Im Zweifel frage vor dem Schreiben von `false` eine örtliche Fachperson.
4. Trage ein gefährliches Doppelgängerpaar bei beiden Arten ein, mit einem Warnhinweis wie „Die Blätter können verwechselt werden; die Verwechslung hat schwere Vergiftungen verursacht“. Sage, dass sie verwechselt werden, nie, wie man sie unterscheidet: Ein falscher Tipp kann tödlich sein.
5. Fotos: eigene, gemeinfreie oder mit einer Lizenz aus der Liste in `docs/pack-format.md`, jedes mit Urheber, Lizenz und einem Link zur Quelle; verkleinere sie mit `python3 scripts/optimize.py` (WebP, höchstens 640 px, ohne Ortsdaten) und prüfe Fotos von Wikimedia Commons mit `node scripts/check_licences.mjs --online`. Laute: nur Links zu xeno-canto.org, die du dir angehört hast, mit Aufnehmendem und Lizenz.
6. Ein neues Paket ist ein `draft` (oder ein `skeleton`, wenn es nur das Format zeigt). Nur wer jede Art geprüft hat, darf `reviewed` setzen, mit Namen und Datum: siehe `docs/review-guide.md`.
7. Mehr: `docs/contributor-guide.md` (Befehle, Dateien, Prüfungen), `docs/school-class-guide.md` (eine Klasse oder ein Verein erstellt ein Paket) und `docs/pack-format.md` (jedes Feld und jede Grenze).
