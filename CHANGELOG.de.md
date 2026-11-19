# Änderungsprotokoll

[English](CHANGELOG.md) · [Română](CHANGELOG.ro.md) · [Français](CHANGELOG.fr.md) · [Italiano](CHANGELOG.it.md) · [Español](CHANGELOG.es.md) · [Português](CHANGELOG.pt.md) · **Deutsch** · [Magyar](CHANGELOG.hu.md)

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · [SemVer](https://semver.org/).

## [Unveröffentlicht]

## [0.2.1] - 2026-11-20

### Hinzugefügt
- `scripts/check_licences.mjs --api URL`: ein anderer MediaWiki-Endpunkt statt Commons; der CLI-Test „ohne Netz“ nutzt jetzt einen geschlossenen lokalen Port und hängt nicht mehr davon ab, ob der Rechner Internetzugang hat.

### Geändert
- fff-kit 1.8.1: Blockiert der Browser den Speicher oder fehlt er (`localStorage`/`sessionStorage` lösen einen Fehler aus oder fehlen), startet die Seite mit einem temporären Arbeitsspeicher, statt anzuhalten; die Daten bleiben nach dem Schließen der Seite nicht erhalten.
- fff-kit 1.8.1: Die Hilfe, die kleine Bedienelemente auf 44 px vergrößert, misst jetzt auch die Breite des Seitenkörpers und des übergeordneten Elements; eine Schaltflächenreihe kann den Bildschirm also nicht mehr verlassen (die Gruppe bleibt unverändert, wenn die Vergrößerung sie zu breit machen würde).

## [0.2.0] - 2026-11-17

### Hinzugefügt
- Die Seite: die Reiter „Stöbern“, „Pakete“, „Erstellen“ und „Anleitung“ in acht Sprachen, mit einem roten Sicherheitskasten, der immer sichtbar bleibt, Tastaturkürzeln und Unterstützung für Screenreader.
- Der Betrachter: Suche in jeder Sprache (Groß- und Kleinschreibung und Akzente ignoriert), Filter nach Gruppe und Giftigkeitsangabe, Artenseiten mit Namen, Giftigkeitsangabe und -hinweis, Hinweisen, Quelle, Doppelgängern (als Links), Fotos und Links zu Lauten; „Nicht als giftig markiert“ erscheint nie in Grün und trägt immer eine Warnung.
- Pakete: Import (eingefügt oder aus einer Datei, vollständig geprüft, bevor etwas hinzugefügt wird), Download, Entfernen und Ersetzen nach ID; Artenzahl je Gruppe; ehrliche Statusabzeichen („Gerüst“, „Entwurf“, „Geprüft“) mit ihrer jeweiligen Bedeutung.
- Der Ersteller: ein Paketformular, ein Artenformular mit Namen in mehreren Sprachen, Giftigkeitsangabe und Hinweisen, in beide Richtungen verknüpfte Doppelgänger, ein JSON-Editor für Fotos und Laute, eine Prüfung, ein Download und ein im Browser gespeicherter Entwurf (mit einer Warnung, wenn der Browser keinen Platz mehr hat).
- Das Paketformat: `schema.json` (eine Art), `pack.schema.json` (ein Manifest), zusammengesetzte Pakete in `data/dist/` (Format `vietar-pack`, Version 1) und `data/dist/example.json` als Formatbeispiel.
- Fünf eingebaute Startpakete mit 71 Arten: Rumänien (19 Pflanzen und Pilze, 17 Vögel, 15 Säugetiere) und Gerüste für Bulgarien und Moldau (je dieselben 10 Arten); mit einem KI-Assistenten geschriebene und nur teilweise geprüfte Entwürfe, ohne Fotos und ohne Links zu Lauten.
- `scripts/pack.mjs` (Zusammenbau, `--check`, `--split`), `scripts/validate.py` (dieselben Regeln wie die Seite, für jede Datei und jedes zusammengesetzte Paket), `scripts/optimize.py` (Fotos) und `scripts/check_licences.mjs` (Lizenz und Urheber der Fotos; `--online` fragt Wikimedia Commons).
- Anleitungen auf Englisch und Rumänisch: `docs/pack-format.md`, `docs/school-class-guide.md`, `docs/contributor-guide.md` und `docs/review-guide.md`.
- `src/` und `scripts/build.mjs`: Die einzige `index.html` wird jetzt aus den Quellen gebaut, mit den eingebetteten Paketen aus `data/dist/`, und `--check` prüft sie.
- Tests: `npm test` und Browser-Tests im Hub.
- ISSUES_GOOD_FIRST und CODE_OF_CONDUCT in alle acht Sprachen übersetzt.
- README auf Englisch, Rumänisch, Französisch, Italienisch, Spanisch, Portugiesisch, Deutsch und Ungarisch: Abschnitte zu Status und geplantem Umfang (abgeleitet aus `ISSUES_GOOD_FIRST.md`).
- Installierbar (PWA): `manifest.webmanifest`, `sw.js` und die Symbole werden vom gemeinsamen Kit (`fff-kit/pwa`) erzeugt; die Seite funktioniert nach dem ersten Besuch über HTTPS offline.

### Geändert
- Der Workflow läuft auf Ubuntu 26.04 und Node.js 26 und führt die Paketprüfung, den Validator, die Tests und die Build-Prüfung aus.
- Die Daten sind jetzt eine Datei je Art und ein Manifest je Paket (`data/species/`, `data/packs/`), zusammengesetzt in `data/dist/`; `data/species/example.json` wird durch `data/dist/example.json` ersetzt, und `scripts/validate.py`, die README-Schritte und die Vorlagen haben sich entsprechend geändert.
- Die „Good first issues“-Liste enthält jetzt, was noch zu tun ist (mehr Arten, Prüfung durch Fachleute, Fotos, Laute, Übersetzungen); die Formatspezifikation, das Doppelgänger-Feld, der Foto-Optimierer, der Lizenzprüfer und die Anleitung für Klassen, die sie vorher aufführte, gibt es.

## [0.1.0] - 2026-11-13

### Hinzugefügt
- Erstes Gerüst: Struktur, Datenschema oder erste Beispiele, Beitragsanleitungen in acht Sprachen.
