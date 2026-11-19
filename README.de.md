# VietAR Packs

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [Español](README.es.md) · [Português](README.pt.md) · **Deutsch** · [Magyar](README.hu.md)

Version: 0.2.1 · Letzte Aktualisierung: 2026-11-20

🌐 https://vietar-packs.chiuta.ro

> Regionale Artenpakete für VietAR: Namen, Fotos und Laute lokaler Tiere und Pflanzen.

Trade-free: kein Tracking, keine Werbung, keine Konten, funktioniert offline.

## Status

Alpha, nutzbar: die einzige `index.html` durchstöbert, importiert, prüft und erstellt regionale Artenpakete: Namen in mehreren Sprachen, eine Giftigkeitsangabe, gefährliche Doppelgänger, Fotos mit Lizenz und Links zu Lauten von xeno-canto. Sie enthält fünf eingebaute Startpakete mit insgesamt 71 Arten (Rumänien: 19 Pflanzen und Pilze, 17 Vögel und 15 Säugetiere; Bulgarien und Moldau: je dieselben 10 verbreiteten Arten, als Gerüste). Jedes eingebaute Paket ist ein Entwurf oder ein Gerüst: Namen und Hinweise wurden mit einem KI-Assistenten geschrieben und nur teilweise geprüft, weder Fachleute für Biologie oder Pilzkunde noch Muttersprachler haben sie durchgesehen, und sie enthalten noch keine Fotos und keine Links zu Lauten. Die Seite bestimmt keine Arten und ist kein Bestimmungsbuch: die Angabe „Nicht als giftig markiert“ heißt nie, dass man etwas gefahrlos essen oder berühren kann. Die VietAR-App kann diese Pakete noch nicht importieren.

## Was es kann

- „Stöbern“: Wähle ein Paket, suche nach einem Namen in einer beliebigen Sprache oder nach dem lateinischen Namen (Groß- und Kleinschreibung und Akzente spielen keine Rolle), filtere nach Gruppe und Giftigkeitsangabe und öffne eine Art: ihre Namen (in der Sprache der Seite, mit Englisch als Rückfall), Giftigkeitsangabe und -hinweis, Hinweise, Quelle, die Arten, mit denen sie oft verwechselt wird (jede ein Link), Fotos und Links zu Lauten. Ein roter Sicherheitskasten bleibt in jedem Reiter sichtbar und sagt, was die Seite nicht ist.
- „Pakete“: die eingebauten Pakete und die, die du importierst (JSON einfügen oder eine Datei wählen; höchstens 12 auf einmal), jedes mit Region, Version, Lizenz, Urhebern, einem ehrlichen Statusabzeichen („Gerüst“, „Entwurf“, „Geprüft“) und der Artenzahl je Gruppe; lade jedes Paket herunter oder entferne die importierten. Ein Paket wird vollständig geprüft, bevor es hinzugefügt wird: Stimmt etwas nicht, wird nichts importiert und du siehst, was zu korrigieren ist.
- „Erstellen“: Erstelle ein Paket für eine Schulklasse, einen Naturverein oder eine Region: Fülle das Paket aus, füge die Arten einzeln hinzu (bis zu 400), verknüpfe Doppelgänger in beide Richtungen, prüfe das Paket mit denselben Regeln wie das Repository und lade die Datei herunter. Der Entwurf bleibt in diesem Browser, während du arbeitest. Ein hier erstelltes Paket kann nie als geprüft markiert werden; Fotos und Laute kommen über das JSON der Art dazu.
- „Anleitung“: wie man die Seite benutzt, und ein Beispiel für eine Art mit einem Foto und einem Laut.
- Format: eine JSON-Datei je Art in `data/species/`, ein Manifest je Paket in `data/packs/`, zusammengesetzt zu vollständigen Paketen (Format `vietar-pack`) in `data/dist/`; beschrieben durch `schema.json` und `pack.schema.json` und erklärt in `docs/pack-format.md`.
- Werkzeuge für Mitwirkende: `scripts/pack.mjs` (baut die Pakete und zerlegt ein heruntergeladenes in Dateien), `scripts/validate.py`, `scripts/optimize.py` (ein Foto als WebP von höchstens 640 px, ohne Metadaten), `scripts/check_licences.mjs` (Fotolizenzen, online mit `--online`). Die Oberfläche gibt es in acht Sprachen; sie lässt sich mit der Tastatur und mit einem Screenreader bedienen.
- Als App installierbar und nach dem ersten Besuch offline verfügbar, wenn sie über HTTPS ausgeliefert wird (ein Service Worker behält die Seite; sonst wird nichts gespeichert oder gesendet). Aus einer heruntergeladenen Datei geöffnet, funktioniert sie genauso, ohne Installation.

## Wie es funktioniert

- Eine Artendatei und ein Manifest (die Liste der Art-IDs und ihre Anzahl) werden zu einem vollständigen Paket: `node scripts/pack.mjs` schreibt es nach `data/dist/<id>.json`. Die Seite bettet `data/dist/` ein; was du durchstöberst, ist also genau das, was du herunterlädst.
- `schema.json` und `pack.schema.json` beschreiben die Dateien; `scripts/validate.py` wendet sie an, dazu die Regeln, die ein Schema nicht ausdrücken kann: Dateiname, ID und lateinischer Name stimmen überein, die Gruppe passt zum Reich, Pflanzen und Pilze geben an, ob sie giftig sind, eine giftige Art hat einen Giftigkeitshinweis, Doppelgänger verweisen aufeinander, Fotos bleiben unter 3 MB, ein geprüftes Paket nennt Prüfer und Datum. `src/engine.mjs` wendet dieselben Regeln in der Seite an; die Tests vergleichen beide.
- Sicher von Grund auf: Text aus einem Paket wird immer als Text angezeigt, nie als HTML; Links öffnen nur `https://`-Adressen; die Seite stellt keine Netzwerkanfrage (Fotos sind eingebettet, Laute sind Links, die xeno-canto.org in einem neuen Tab öffnen); ein importiertes Paket und der gespeicherte Zustand werden beim Laden der Seite erneut geprüft, ein beschädigter oder feindlicher wird also abgelehnt, nicht für wahr gehalten.
- `src/ui.js`, `src/i18n.mjs` und `src/app.css` sind die Oberfläche; `scripts/build.mjs` baut die einzige `index.html` aus `src/` und bettet die Pakete aus `data/dist/` ein; `node scripts/build.mjs --check` schlägt fehl, wenn die Seite veraltet ist.
- Tests: `npm test` (Engine, Parität mit dem Validator, Skripte, Lizenzprüfer, Foto-Optimierer, Dokumentation) und Browser-Tests im Hub (acht Sprachen, Barrierefreiheit, feindliche Importe, Grenzen, voller Speicher). Die Entwicklung braucht Node.js 24 oder neuer und Python 3 mit `jsonschema` (Pillow nur für den Foto-Optimierer); die Seite selbst braucht einen Browser, der ES2017 kennt.
- `manifest.webmanifest`, `sw.js` und die Symbole erzeugt `node scripts/build.mjs` über das gemeinsame Kit (Abschnitt `pwa` in `src/app.json`); `--check` prüft sie ebenfalls, und `npm test` stellt sicher, dass Manifest, Service-Worker-Version und CSP zur Seite passen.

## Ehrliche Grenzen

- Die eingebauten Pakete sind Entwürfe: Namen und Hinweise wurden mit einem KI-Assistenten aus allgemeinem Wissen geschrieben und nur teilweise anhand öffentlicher Seiten geprüft. Keine Biologin, kein Pilzkundler und keine Muttersprachlerin hat sie durchgesehen. Die Pakete für Bulgarien und Moldau sind Gerüste mit je 10 Arten.
- «Nicht als giftig markiert» heißt nur, dass niemand die Art in diesem Paket als giftig markiert hat. Es ist nie die Aussage, dass eine Pflanze oder ein Pilz essbar oder sicher ist, und die Pakete lehren nicht, Doppelgänger zu unterscheiden. Iss niemals eine wild wachsende Pflanze oder einen Pilz aufgrund dieser Seite.
- Die eingebauten Pakete enthalten keine Fotos und keine Laut-Links, weil Lizenzen und Aufnahmenummern offline nicht überprüft werden konnten. Das Format unterstützt beides, mit Autor, Lizenz und Quelle.
- Hier importierte Pakete werden nur in diesem Browser gespeichert; das Löschen der Websitedaten entfernt sie. Lade die herunter, die dir wichtig sind.
- Die VietAR-App kann diese Pakete noch nicht importieren. Vorerst werden die Pakete auf dieser Seite und von den Skripten im Repository gelesen und geprüft.
- Die Übersetzungen der Oberfläche wurden von einer Maschine geschrieben und nicht von Muttersprachlern geprüft. Namen und Hinweise zu den Arten erscheinen in der Sprache des Pakets, mit Englisch als Ersatz.

## In 5 Minuten mitmachen

1. Forke dieses Repository.
2. Erstelle oder erweitere ein Paket: Nutze auf der Seite den Reiter „Erstellen“ und lade die Datei herunter, oder schreibe Dateien `data/species/<lateinischer-name>.json` von Hand (siehe `docs/pack-format.md`).
3. Mache aus einem heruntergeladenen Paket Dateien mit `node scripts/pack.mjs --split vietar-pack-<id>.json`, oder trage die IDs der neuen Arten in das Manifest des Pakets in `data/packs/` ein.
4. Führe `node scripts/pack.mjs`, `python3 scripts/validate.py`, `npm test` und `node scripts/build.mjs` aus.
5. Öffne einen Pull Request — Datenbeiträge brauchen keine Programmierung. Gib für jeden Namen, Hinweis und jede Giftigkeitsangabe eine Quelle an und markiere ein Paket nie selbst als geprüft (siehe `docs/review-guide.md`).

## Gute erste Aufgaben

Siehe `ISSUES_GOOD_FIRST.md` für fertige Aufgaben.

## Lizenz

Code: MIT. Daten: Jedes Paket nennt seine eigene Lizenz (CC0-1.0, CC-BY-4.0 oder CC-BY-SA-4.0); die eingebauten Pakete stehen unter CC0-1.0. Fotos und Laute behalten ihre eigenen Lizenzen: Jedes nennt Urheber, Lizenz und Quelle. Beigesteuerte Daten: Quelle angeben; sie stehen unter der Lizenz des Pakets, dem sie sich anschließen.

## Unterstützung

Wenn dir das Projekt nützt, kannst du [mir einen Kaffee spendieren](https://buymeacoffee.com/echo.of.the.strings).
